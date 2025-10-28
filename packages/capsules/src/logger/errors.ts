/**
 * Logger Capsule - Errors
 *
 * Custom error types for logging operations
 */

// ============================================================================
// ERROR TYPES ENUM
// ============================================================================

export enum LoggerErrorType {
  TRANSPORT_ERROR = 'TRANSPORT_ERROR',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  BUFFER_OVERFLOW = 'BUFFER_OVERFLOW',
  INVALID_FORMAT = 'INVALID_FORMAT',
  INVALID_LEVEL = 'INVALID_LEVEL',
  ROTATION_ERROR = 'ROTATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
}

// ============================================================================
// BASE LOGGER ERROR
// ============================================================================

/**
 * Base error class for all logger errors
 */
export class LoggerError extends Error {
  public readonly type: LoggerErrorType;
  public readonly transportName?: string;
  public readonly originalError?: any;
  public readonly timestamp: number;

  constructor(
    type: LoggerErrorType,
    message: string,
    transportName?: string,
    originalError?: any
  ) {
    super(message);
    this.name = 'LoggerError';
    this.type = type;
    this.transportName = transportName;
    this.originalError = originalError;
    this.timestamp = Date.now();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LoggerError);
    }
  }

  toJSON(): Record<string, any> {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      transportName: this.transportName,
      timestamp: this.timestamp,
      stack: this.stack,
      originalError: this.originalError?.message || this.originalError,
    };
  }
}

// ============================================================================
// SPECIFIC ERROR CLASSES
// ============================================================================

/**
 * Transport error
 */
export class TransportError extends LoggerError {
  constructor(message: string, transportName?: string, originalError?: any) {
    super(LoggerErrorType.TRANSPORT_ERROR, message, transportName, originalError);
    this.name = 'TransportError';
  }
}

/**
 * File write error
 */
export class FileWriteError extends LoggerError {
  public readonly filename?: string;

  constructor(message: string, filename?: string, originalError?: any) {
    super(LoggerErrorType.FILE_WRITE_ERROR, message, undefined, originalError);
    this.name = 'FileWriteError';
    this.filename = filename;
  }
}

/**
 * Network error (for HTTP transport)
 */
export class NetworkError extends LoggerError {
  public readonly url?: string;
  public readonly statusCode?: number;

  constructor(message: string, url?: string, statusCode?: number, originalError?: any) {
    super(LoggerErrorType.NETWORK_ERROR, message, undefined, originalError);
    this.name = 'NetworkError';
    this.url = url;
    this.statusCode = statusCode;
  }
}

/**
 * Buffer overflow error
 */
export class BufferOverflowError extends LoggerError {
  public readonly bufferSize: number;

  constructor(message: string, bufferSize: number) {
    super(LoggerErrorType.BUFFER_OVERFLOW, message);
    this.name = 'BufferOverflowError';
    this.bufferSize = bufferSize;
  }
}

/**
 * Invalid format error
 */
export class InvalidFormatError extends LoggerError {
  public readonly format?: string;

  constructor(message: string, format?: string) {
    super(LoggerErrorType.INVALID_FORMAT, message);
    this.name = 'InvalidFormatError';
    this.format = format;
  }
}

/**
 * Invalid log level error
 */
export class InvalidLevelError extends LoggerError {
  public readonly level?: string;

  constructor(message: string, level?: string) {
    super(LoggerErrorType.INVALID_LEVEL, message);
    this.name = 'InvalidLevelError';
    this.level = level;
  }
}

/**
 * File rotation error
 */
export class RotationError extends LoggerError {
  public readonly filename?: string;

  constructor(message: string, filename?: string, originalError?: any) {
    super(LoggerErrorType.ROTATION_ERROR, message, undefined, originalError);
    this.name = 'RotationError';
    this.filename = filename;
  }
}

/**
 * Permission error
 */
export class PermissionError extends LoggerError {
  public readonly path?: string;

  constructor(message: string, path?: string, originalError?: any) {
    super(LoggerErrorType.PERMISSION_ERROR, message, undefined, originalError);
    this.name = 'PermissionError';
    this.path = path;
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends LoggerError {
  public readonly configKey?: string;

  constructor(message: string, configKey?: string) {
    super(LoggerErrorType.CONFIGURATION_ERROR, message);
    this.name = 'ConfigurationError';
    this.configKey = configKey;
  }
}

/**
 * Initialization error
 */
export class InitializationError extends LoggerError {
  constructor(message: string, originalError?: any) {
    super(LoggerErrorType.INITIALIZATION_ERROR, message, undefined, originalError);
    this.name = 'InitializationError';
  }
}

// ============================================================================
// ERROR UTILITIES
// ============================================================================

/**
 * Check if error is a logger error
 */
export function isLoggerError(error: any): error is LoggerError {
  return error instanceof LoggerError;
}

/**
 * Check if error is a specific type
 */
export function isErrorType(error: any, type: LoggerErrorType): boolean {
  return isLoggerError(error) && error.type === type;
}

/**
 * Parse Node.js file system errors
 */
export function parseFileSystemError(error: any, filename?: string): LoggerError {
  const code = error.code || error.errno;

  switch (code) {
    case 'ENOENT':
      return new FileWriteError(`File or directory not found: ${filename}`, filename, error);

    case 'EACCES':
    case 'EPERM':
      return new PermissionError(
        `Permission denied: ${filename}`,
        filename,
        error
      );

    case 'ENOSPC':
      return new FileWriteError(`No space left on device: ${filename}`, filename, error);

    case 'EMFILE':
    case 'ENFILE':
      return new FileWriteError('Too many open files', filename, error);

    default:
      return new FileWriteError(
        `File system error: ${error.message}`,
        filename,
        error
      );
  }
}

/**
 * Parse HTTP/network errors
 */
export function parseNetworkError(error: any, url?: string): LoggerError {
  if (error.response) {
    return new NetworkError(
      `HTTP ${error.response.status}: ${error.response.statusText}`,
      url,
      error.response.status,
      error
    );
  }

  if (error.code === 'ECONNREFUSED') {
    return new NetworkError('Connection refused', url, undefined, error);
  }

  if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
    return new NetworkError('Request timeout', url, undefined, error);
  }

  if (error.code === 'ENOTFOUND') {
    return new NetworkError('Host not found', url, undefined, error);
  }

  return new NetworkError(error.message || 'Network error', url, undefined, error);
}

/**
 * Wrap async logger operations with error handling
 */
export async function wrapLoggerOperation<T>(
  operation: () => Promise<T>,
  errorType: LoggerErrorType,
  context?: string
): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (isLoggerError(error)) {
      throw error;
    }

    const message = context
      ? `${context}: ${error.message || 'Unknown error'}`
      : error.message || 'Unknown error';

    throw new LoggerError(errorType, message, undefined, error);
  }
}

/**
 * Safe error serialization (handles circular references)
 */
export function serializeError(error: any): Record<string, any> {
  if (!error) return {};

  const serialized: Record<string, any> = {
    message: error.message,
    name: error.name,
  };

  if (error.stack) {
    serialized.stack = error.stack;
  }

  if (error.code) {
    serialized.code = error.code;
  }

  if (isLoggerError(error)) {
    serialized.type = error.type;
    serialized.timestamp = error.timestamp;
  }

  // Add custom properties
  const customKeys = Object.keys(error).filter(
    key => !['message', 'name', 'stack', 'code'].includes(key)
  );

  for (const key of customKeys) {
    try {
      serialized[key] = error[key];
    } catch {
      // Skip properties that can't be serialized
    }
  }

  return serialized;
}
