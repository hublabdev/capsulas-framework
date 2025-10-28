/**
 * File Upload Capsule - Errors
 */

export enum FileUploadErrorType {
  UPLOAD_ERROR = 'UPLOAD_ERROR',
  FILE_TOO_LARGE_ERROR = 'FILE_TOO_LARGE_ERROR',
  INVALID_FILE_TYPE_ERROR = 'INVALID_FILE_TYPE_ERROR',
  INVALID_EXTENSION_ERROR = 'INVALID_EXTENSION_ERROR',
  TOO_MANY_FILES_ERROR = 'TOO_MANY_FILES_ERROR',
  CHUNK_ERROR = 'CHUNK_ERROR',
  THUMBNAIL_ERROR = 'THUMBNAIL_ERROR',
  VIRUS_DETECTED_ERROR = 'VIRUS_DETECTED_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export class FileUploadError extends Error {
  constructor(
    public type: FileUploadErrorType,
    message: string,
    public originalError?: Error,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'FileUploadError';
    Object.setPrototypeOf(this, FileUploadError.prototype);
  }
}

export function createUploadError(message: string, error?: Error): FileUploadError {
  return new FileUploadError(FileUploadErrorType.UPLOAD_ERROR, message, error);
}

export function createFileTooLargeError(size: number, maxSize: number): FileUploadError {
  return new FileUploadError(
    FileUploadErrorType.FILE_TOO_LARGE_ERROR,
    `File size ${size} exceeds maximum ${maxSize}`,
    undefined,
    { size, maxSize }
  );
}

export function createInvalidFileTypeError(mimeType: string, allowed: string[]): FileUploadError {
  return new FileUploadError(
    FileUploadErrorType.INVALID_FILE_TYPE_ERROR,
    `MIME type ${mimeType} is not allowed`,
    undefined,
    { mimeType, allowed }
  );
}

export function createInvalidExtensionError(extension: string, allowed: string[]): FileUploadError {
  return new FileUploadError(
    FileUploadErrorType.INVALID_EXTENSION_ERROR,
    `Extension ${extension} is not allowed`,
    undefined,
    { extension, allowed }
  );
}

export function createTooManyFilesError(count: number, maxFiles: number): FileUploadError {
  return new FileUploadError(
    FileUploadErrorType.TOO_MANY_FILES_ERROR,
    `Number of files ${count} exceeds maximum ${maxFiles}`,
    undefined,
    { count, maxFiles }
  );
}

export function createChunkError(message: string, chunkIndex?: number): FileUploadError {
  return new FileUploadError(
    FileUploadErrorType.CHUNK_ERROR,
    message,
    undefined,
    { chunkIndex }
  );
}

export function createThumbnailError(message: string, error?: Error): FileUploadError {
  return new FileUploadError(FileUploadErrorType.THUMBNAIL_ERROR, message, error);
}

export function createVirusDetectedError(filename: string): FileUploadError {
  return new FileUploadError(
    FileUploadErrorType.VIRUS_DETECTED_ERROR,
    `Virus detected in file: ${filename}`,
    undefined,
    { filename }
  );
}

export function createStorageError(message: string, error?: Error): FileUploadError {
  return new FileUploadError(FileUploadErrorType.STORAGE_ERROR, message, error);
}

export function createValidationError(message: string): FileUploadError {
  return new FileUploadError(FileUploadErrorType.VALIDATION_ERROR, message);
}
