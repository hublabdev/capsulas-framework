/**
 * Storage Capsule - Errors
 */

export enum StorageErrorType {
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED',
  DELETE_FAILED = 'DELETE_FAILED',
  NOT_FOUND = 'NOT_FOUND',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_CONFIG = 'INVALID_CONFIG',
  FILE_SIZE_ERROR = 'FILE_SIZE_ERROR',
  MIME_TYPE_ERROR = 'MIME_TYPE_ERROR',
  BUCKET_ERROR = 'BUCKET_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export class StorageError extends Error {
  constructor(
    public type: StorageErrorType,
    message: string,
    public originalError?: Error,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'StorageError';
    Object.setPrototypeOf(this, StorageError.prototype);
  }
}

export function createUploadError(message: string, error?: Error): StorageError {
  return new StorageError(StorageErrorType.UPLOAD_FAILED, message, error);
}

export function createDownloadError(message: string, error?: Error): StorageError {
  return new StorageError(StorageErrorType.DOWNLOAD_FAILED, message, error);
}

export function createDeleteError(message: string, error?: Error): StorageError {
  return new StorageError(StorageErrorType.DELETE_FAILED, message, error);
}

export function createFileNotFoundError(key: string): StorageError {
  return new StorageError(
    StorageErrorType.NOT_FOUND,
    `File not found: ${key}`,
    undefined,
    { key }
  );
}

export function createPermissionDeniedError(message: string): StorageError {
  return new StorageError(StorageErrorType.PERMISSION_DENIED, message);
}

export function createQuotaExceededError(message: string): StorageError {
  return new StorageError(StorageErrorType.QUOTA_EXCEEDED, message);
}

export function createInvalidConfigError(message: string): StorageError {
  return new StorageError(StorageErrorType.INVALID_CONFIG, message);
}

export function createFileSizeError(size: number, maxSize: number): StorageError {
  return new StorageError(
    StorageErrorType.FILE_SIZE_ERROR,
    `File size ${size} exceeds maximum ${maxSize}`,
    undefined,
    { size, maxSize }
  );
}

export function createMimeTypeError(mimeType: string, allowed: string[]): StorageError {
  return new StorageError(
    StorageErrorType.MIME_TYPE_ERROR,
    `MIME type ${mimeType} not allowed`,
    undefined,
    { mimeType, allowed }
  );
}

export function createPermissionError(message: string): StorageError {
  return new StorageError(StorageErrorType.PERMISSION_DENIED, message);
}

export function createBucketError(message: string, bucket?: string): StorageError {
  return new StorageError(
    StorageErrorType.BUCKET_ERROR,
    message,
    undefined,
    { bucket }
  );
}

export function createNetworkError(message: string, error?: Error): StorageError {
  return new StorageError(StorageErrorType.NETWORK_ERROR, message, error);
}

export function createValidationError(message: string): StorageError {
  return new StorageError(StorageErrorType.VALIDATION_ERROR, message);
}
