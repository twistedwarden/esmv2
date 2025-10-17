/**
 * Centralized Logging Configuration
 * Console logging for development, structured for production
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: any;
}

class Logger {
  private currentLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.currentLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private formatMessage(entry: LogEntry): string {
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const levelName = levelNames[entry.level];
    const timestamp = entry.timestamp;
    const context = entry.context ? `[${entry.context}]` : '';
    const data = entry.data ? ` ${JSON.stringify(entry.data)}` : '';
    
    return `${timestamp} [${levelName}]${context} ${entry.message}${data}`;
  }

  private log(level: LogLevel, message: string, context?: string, data?: any): void {
    if (level < this.currentLevel) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      data
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
    }

    // In production, you might want to send logs to a service
    if (!this.isDevelopment && level >= LogLevel.ERROR) {
      this.sendToLogService(entry);
    }
  }

  private sendToLogService(entry: LogEntry): void {
    // Implement log service integration here
    // For example: send to Sentry, LogRocket, or your own logging service
    console.log('Would send to log service:', entry);
  }

  debug(message: string, context?: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  info(message: string, context?: string, data?: any): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  warn(message: string, context?: string, data?: any): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  error(message: string, context?: string, data?: any): void {
    this.log(LogLevel.ERROR, message, context, data);
  }

  setLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  // API-specific logging helpers
  apiRequest(method: string, url: string, data?: any): void {
    this.debug(`API Request: ${method} ${url}`, 'API', data);
  }

  apiResponse(method: string, url: string, status: number, data?: any): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, `API Response: ${method} ${url} - ${status}`, 'API', data);
  }

  apiError(method: string, url: string, error: Error): void {
    this.error(`API Error: ${method} ${url}`, 'API', {
      message: error.message,
      stack: error.stack
    });
  }

  // Authentication logging
  authEvent(event: string, data?: any): void {
    this.info(`Auth Event: ${event}`, 'AUTH', data);
  }

  // User action logging
  userAction(action: string, data?: any): void {
    this.debug(`User Action: ${action}`, 'USER', data);
  }

  // Performance logging
  performance(operation: string, duration: number, data?: any): void {
    this.info(`Performance: ${operation} took ${duration}ms`, 'PERF', data);
  }
}

// Create singleton instance
export const logger = new Logger();

// Export convenience functions
export const debug = logger.debug.bind(logger);
export const info = logger.info.bind(logger);
export const warn = logger.warn.bind(logger);
export const error = logger.error.bind(logger);

// Export API logging functions
export const logApiRequest = logger.apiRequest.bind(logger);
export const logApiResponse = logger.apiResponse.bind(logger);
export const logApiError = logger.apiError.bind(logger);

// Export other logging functions
export const logAuthEvent = logger.authEvent.bind(logger);
export const logUserAction = logger.userAction.bind(logger);
export const logPerformance = logger.performance.bind(logger);
