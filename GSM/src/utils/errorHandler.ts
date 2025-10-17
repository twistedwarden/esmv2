/**
 * Centralized Error Handling and Logging
 */

import { logger } from '../config/logger';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp?: string;
  additionalData?: any;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly context: ErrorContext;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    context: ErrorContext = {},
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.context = context;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

export class ApiError extends AppError {
  public readonly status: number;
  public readonly endpoint: string;

  constructor(
    message: string,
    status: number,
    endpoint: string,
    context: ErrorContext = {}
  ) {
    super(message, 'API_ERROR', context, true);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
  }
}

export class ValidationError extends AppError {
  public readonly field: string;
  public readonly value: any;

  constructor(
    message: string,
    field: string,
    value: any,
    context: ErrorContext = {}
  ) {
    super(message, 'VALIDATION_ERROR', context, true);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

export class NetworkError extends AppError {
  public readonly originalError: Error;

  constructor(
    message: string,
    originalError: Error,
    context: ErrorContext = {}
  ) {
    super(message, 'NETWORK_ERROR', context, true);
    this.name = 'NetworkError';
    this.originalError = originalError;
  }
}

// Error handler class
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorListeners: Array<(error: AppError) => void> = [];

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public addErrorListener(listener: (error: AppError) => void): void {
    this.errorListeners.push(listener);
  }

  public removeErrorListener(listener: (error: AppError) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  public handleError(error: Error | AppError, context: ErrorContext = {}): void {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else {
      appError = new AppError(
        error.message,
        'UNKNOWN_ERROR',
        context,
        false
      );
    }

    // Log the error
    this.logError(appError);

    // Notify listeners
    this.errorListeners.forEach(listener => {
      try {
        listener(appError);
      } catch (listenerError) {
        logger.error('Error in error listener', 'ERROR_HANDLER', {
          originalError: appError.message,
          listenerError: listenerError.message
        });
      }
    });
  }

  private logError(error: AppError): void {
    const logData = {
      code: error.code,
      message: error.message,
      stack: error.stack,
      context: error.context,
      isOperational: error.isOperational,
      timestamp: new Date().toISOString()
    };

    if (error instanceof ApiError) {
      logger.error(`API Error: ${error.status} ${error.endpoint}`, 'API', logData);
    } else if (error instanceof ValidationError) {
      logger.warn(`Validation Error: ${error.field}`, 'VALIDATION', logData);
    } else if (error instanceof NetworkError) {
      logger.error(`Network Error: ${error.message}`, 'NETWORK', logData);
    } else {
      logger.error(`Application Error: ${error.message}`, 'APP', logData);
    }
  }

  public createApiError(
    message: string,
    status: number,
    endpoint: string,
    context: ErrorContext = {}
  ): ApiError {
    return new ApiError(message, status, endpoint, context);
  }

  public createValidationError(
    message: string,
    field: string,
    value: any,
    context: ErrorContext = {}
  ): ValidationError {
    return new ValidationError(message, field, value, context);
  }

  public createNetworkError(
    message: string,
    originalError: Error,
    context: ErrorContext = {}
  ): NetworkError {
    return new NetworkError(message, originalError, context);
  }
}

// Global error handler instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions
export const handleError = errorHandler.handleError.bind(errorHandler);
export const createApiError = errorHandler.createApiError.bind(errorHandler);
export const createValidationError = errorHandler.createValidationError.bind(errorHandler);
export const createNetworkError = errorHandler.createNetworkError.bind(errorHandler);

// Global error handlers
export function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled Promise Rejection', 'GLOBAL', {
      reason: event.reason,
      promise: event.promise
    });
    
    errorHandler.handleError(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      { action: 'unhandledrejection' }
    );
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    logger.error('Uncaught Error', 'GLOBAL', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    });
    
    errorHandler.handleError(
      event.error || new Error(event.message),
      {
        action: 'uncaught',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    );
  });
}

// API error handling utilities
export async function handleApiResponse<T>(
  response: Response,
  endpoint: string
): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorData: any = null;

    try {
      errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // If response is not JSON, use the default error message
    }

    const apiError = createApiError(
      errorMessage,
      response.status,
      endpoint,
      { additionalData: errorData }
    );

    throw apiError;
  }

  try {
    return await response.json();
  } catch (error) {
    throw createApiError(
      'Invalid JSON response',
      response.status,
      endpoint,
      { originalError: error }
    );
  }
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^09[0-9]{9}$/;
  return phoneRegex.test(phone);
}
