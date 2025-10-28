/**
 * Queue Capsule - Errors
 */

export enum QueueErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  JOB_ERROR = 'JOB_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  STALLED_ERROR = 'STALLED_ERROR',
  RETRY_ERROR = 'RETRY_ERROR',
  PROCESSOR_ERROR = 'PROCESSOR_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
}

export class QueueError extends Error {
  constructor(
    message: string,
    public readonly type: QueueErrorType,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'QueueError';
  }
}

export class QueueConnectionError extends QueueError {
  constructor(message: string, details?: any) {
    super(message, QueueErrorType.CONNECTION_ERROR, details);
    this.name = 'QueueConnectionError';
  }
}

export class QueueJobError extends QueueError {
  constructor(message: string, details?: any) {
    super(message, QueueErrorType.JOB_ERROR, details);
    this.name = 'QueueJobError';
  }
}

export class QueueTimeoutError extends QueueError {
  constructor(message: string, details?: any) {
    super(message, QueueErrorType.TIMEOUT_ERROR, details);
    this.name = 'QueueTimeoutError';
  }
}

export class QueueStalledError extends QueueError {
  constructor(message: string, details?: any) {
    super(message, QueueErrorType.STALLED_ERROR, details);
    this.name = 'QueueStalledError';
  }
}

export class QueueRetryError extends QueueError {
  constructor(message: string, details?: any) {
    super(message, QueueErrorType.RETRY_ERROR, details);
    this.name = 'QueueRetryError';
  }
}

export class QueueProcessorError extends QueueError {
  constructor(message: string, details?: any) {
    super(message, QueueErrorType.PROCESSOR_ERROR, details);
    this.name = 'QueueProcessorError';
  }
}

export class QueueValidationError extends QueueError {
  constructor(message: string, details?: any) {
    super(message, QueueErrorType.VALIDATION_ERROR, details);
    this.name = 'QueueValidationError';
  }
}

export class QueueRateLimitError extends QueueError {
  constructor(message: string, details?: any) {
    super(message, QueueErrorType.RATE_LIMIT_ERROR, details);
    this.name = 'QueueRateLimitError';
  }
}
