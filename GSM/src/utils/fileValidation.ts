/**
 * File validation utilities for document uploads
 * Provides client-side security checks before server upload
 */

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export interface FileValidationOptions {
  maxSizeMB: number;
  allowedTypes: string[];
  checkSignature: boolean;
  checkPDFSafety: boolean;
}

const DEFAULT_OPTIONS: FileValidationOptions = {
  maxSizeMB: 10,
  allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  checkSignature: true,
  checkPDFSafety: true
};

/**
 * Validate file signature matches extension
 */
export const validateFileSignature = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Check file signatures
      const signature = Array.from(uint8Array.slice(0, 8))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join(' ').toUpperCase();
      
      const fileName = file.name.toLowerCase();
      const mimeType = file.type.toLowerCase();
      
      let isValid = false;
      
      // PDF signature: %PDF-
      if (mimeType === 'application/pdf' || fileName.endsWith('.pdf')) {
        const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));
        isValid = pdfHeader === '%PDF';
      }
      // PNG signature: 89 50 4E 47
      else if (mimeType === 'image/png' || fileName.endsWith('.png')) {
        isValid = signature.startsWith('89 50 4E 47');
      }
      // JPEG signature: FF D8 FF
      else if (mimeType === 'image/jpeg' || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
        isValid = signature.startsWith('FF D8 FF');
      }
      // For other types, assume valid if MIME type matches
      else {
        isValid = true;
      }
      
      resolve(isValid);
    };
    reader.readAsArrayBuffer(file.slice(0, 8));
  });
};

/**
 * Check PDF for suspicious content
 */
export const validatePDFSafety = async (file: File): Promise<boolean> => {
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return true; // Not a PDF, skip check
  }
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Convert to string for pattern matching
      const content = new TextDecoder('latin1').decode(uint8Array);
      
      // Check for suspicious PDF patterns
      const suspiciousPatterns = [
        '/Launch',           // Auto-launch actions
        '/JavaScript',       // JavaScript execution
        '/EmbeddedFile',     // Embedded files
        '/OpenAction',       // Auto-open actions
        '/JS',              // JavaScript
        '/AcroForm',        // Forms with potential scripts
        '/XFA'              // XFA forms (can contain scripts)
      ];
      
      const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
        content.includes(pattern)
      );
      
      resolve(!hasSuspiciousContent);
    };
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Validate MIME type
 */
export const validateMimeType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Comprehensive file validation
 */
export const validateUploadFile = async (
  file: File, 
  options: Partial<FileValidationOptions> = {}
): Promise<FileValidationResult> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const warnings: string[] = [];
  
  // Check file size
  if (!validateFileSize(file, opts.maxSizeMB)) {
    return {
      isValid: false,
      error: `File size exceeds ${opts.maxSizeMB}MB limit`
    };
  }
  
  // Check MIME type
  if (!validateMimeType(file, opts.allowedTypes)) {
    return {
      isValid: false,
      error: `File type not allowed. Accepted types: ${opts.allowedTypes.join(', ')}`
    };
  }
  
  // Check file signature if enabled
  if (opts.checkSignature) {
    const signatureValid = await validateFileSignature(file);
    if (!signatureValid) {
      return {
        isValid: false,
        error: 'File signature does not match file extension. File may be corrupted or malicious.'
      };
    }
  }
  
  // Check PDF safety if enabled
  if (opts.checkPDFSafety) {
    const pdfSafe = await validatePDFSafety(file);
    if (!pdfSafe) {
      return {
        isValid: false,
        error: 'PDF contains potentially unsafe content (scripts, embedded files, or auto-launch actions)'
      };
    }
  }
  
  // Additional warnings
  if (file.size > 5 * 1024 * 1024) { // 5MB
    warnings.push('Large file detected. Upload may take longer.');
  }
  
  if (file.type === 'application/pdf' && file.size < 1024) { // 1KB
    warnings.push('PDF file is very small. Please verify it contains the expected content.');
  }
  
  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  };
};

/**
 * Get file type icon
 */
export const getFileTypeIcon = (file: File): string => {
  const mimeType = file.type.toLowerCase();
  
  if (mimeType === 'application/pdf') return '📄';
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  
  return '📎';
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
