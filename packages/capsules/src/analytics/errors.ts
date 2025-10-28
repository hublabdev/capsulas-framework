/**
 * Analytics Capsule - Error Definitions
 *
 * Comprehensive error handling for analytics operations
 */

/**
 * Analytics error types enum
 */
export enum AnalyticsErrorType {
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  TRACKING_ERROR = 'TRACKING_ERROR',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  INVALID_EVENT_ERROR = 'INVALID_EVENT_ERROR',
  INVALID_USER_ERROR = 'INVALID_USER_ERROR',
  SESSION_ERROR = 'SESSION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  QUEUE_FULL_ERROR = 'QUEUE_FULL_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  ADAPTER_ERROR = 'ADAPTER_ERROR',
}

/**
 * Base analytics error class
 */
export class AnalyticsError extends Error {
  constructor(
    message: string,
    public readonly type: AnalyticsErrorType,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'AnalyticsError';
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      details: this.details,
      stack: this.stack,
    };
  }
}

/**
 * Initialization error
 * Thrown when analytics service fails to initialize
 */
export class AnalyticsInitializationError extends AnalyticsError {
  constructor(message: string, details?: any) {
    super(message, AnalyticsErrorType.INITIALIZATION_ERROR, details);
    this.name = 'AnalyticsInitializationError';
  }
}

/**
 * Tracking error
 * Thrown when event tracking fails
 */
export class AnalyticsTrackingError extends AnalyticsError {
  constructor(message: string, details?: any) {
    super(message, AnalyticsErrorType.TRACKING_ERROR, details);
    this.name = 'AnalyticsTrackingError';
  }
}

/**
 * Provider error
 * Thrown when analytics provider encounters an error
 */
export class AnalyticsProviderError extends AnalyticsError {
  constructor(provider: string, message: string, details?: any) {
    super(`${provider} error: ${message}`, AnalyticsErrorType.PROVIDER_ERROR, {
      ...details,
      provider,
    });
    this.name = 'AnalyticsProviderError';
  }
}

/**
 * Invalid event error
 * Thrown when event data is invalid
 */
export class AnalyticsInvalidEventError extends AnalyticsError {
  constructor(eventName: string, reason: string, details?: any) {
    super(`Invalid event '${eventName}': ${reason}`, AnalyticsErrorType.INVALID_EVENT_ERROR, {
      ...details,
      eventName,
      reason,
    });
    this.name = 'AnalyticsInvalidEventError';
  }
}

/**
 * Invalid user error
 * Thrown when user data is invalid
 */
export class AnalyticsInvalidUserError extends AnalyticsError {
  constructor(reason: string, details?: any) {
    super(`Invalid user data: ${reason}`, AnalyticsErrorType.INVALID_USER_ERROR, {
      ...details,
      reason,
    });
    this.name = 'AnalyticsInvalidUserError';
  }
}

/**
 * Session error
 * Thrown when session management fails
 */
export class AnalyticsSessionError extends AnalyticsError {
  constructor(message: string, details?: any) {
    super(message, AnalyticsErrorType.SESSION_ERROR, details);
    this.name = 'AnalyticsSessionError';
  }
}

/**
 * Network error
 * Thrown when network request fails
 */
export class AnalyticsNetworkError extends AnalyticsError {
  constructor(message: string, details?: any) {
    super(message, AnalyticsErrorType.NETWORK_ERROR, details);
    this.name = 'AnalyticsNetworkError';
  }
}

/**
 * Rate limit error
 * Thrown when rate limit is exceeded
 */
export class AnalyticsRateLimitError extends AnalyticsError {
  constructor(message: string, details?: any) {
    super(message, AnalyticsErrorType.RATE_LIMIT_ERROR, details);
    this.name = 'AnalyticsRateLimitError';
  }
}

/**
 * Queue full error
 * Thrown when offline queue reaches maximum size
 */
export class AnalyticsQueueFullError extends AnalyticsError {
  constructor(maxSize: number, details?: any) {
    super(`Event queue is full (max: ${maxSize})`, AnalyticsErrorType.QUEUE_FULL_ERROR, {
      ...details,
      maxSize,
    });
    this.name = 'AnalyticsQueueFullError';
  }
}

/**
 * Validation error
 * Thrown when data validation fails
 */
export class AnalyticsValidationError extends AnalyticsError {
  constructor(message: string, details?: any) {
    super(message, AnalyticsErrorType.VALIDATION_ERROR, details);
    this.name = 'AnalyticsValidationError';
  }
}

/**
 * Configuration error
 * Thrown when configuration is invalid
 */
export class AnalyticsConfigurationError extends AnalyticsError {
  constructor(message: string, details?: any) {
    super(message, AnalyticsErrorType.CONFIGURATION_ERROR, details);
    this.name = 'AnalyticsConfigurationError';
  }
}

/**
 * Adapter error
 * Thrown when analytics adapter encounters an error
 */
export class AnalyticsAdapterError extends AnalyticsError {
  constructor(message: string, details?: any) {
    super(message, AnalyticsErrorType.ADAPTER_ERROR, details);
    this.name = 'AnalyticsAdapterError';
  }
}

/**
 * Type guard to check if error is an AnalyticsError
 */
export function isAnalyticsError(error: any): error is AnalyticsError {
  return error instanceof AnalyticsError;
}

/**
 * Type guard for specific analytics error types
 */
export function isAnalyticsErrorType(error: any, type: AnalyticsErrorType): boolean {
  return isAnalyticsError(error) && error.type === type;
}

/**
 * Helper to create tracking error
 */
export function createTrackingError(message: string, originalError?: Error): AnalyticsTrackingError {
  return new AnalyticsTrackingError(message, {
    originalError: originalError?.message,
    stack: originalError?.stack,
  });
}

/**
 * Helper to create provider error
 */
export function createProviderError(provider: string, originalError?: Error): AnalyticsProviderError {
  return new AnalyticsProviderError(provider, originalError?.message || 'Unknown error', {
    originalError: originalError?.message,
    stack: originalError?.stack,
  });
}

/**
 * Helper to create invalid event error
 */
export function createInvalidEventError(eventName: string, reason: string): AnalyticsInvalidEventError {
  return new AnalyticsInvalidEventError(eventName, reason);
}

/**
 * Helper to create network error
 */
export function createNetworkError(message: string, originalError?: Error): AnalyticsNetworkError {
  return new AnalyticsNetworkError(message, {
    originalError: originalError?.message,
    stack: originalError?.stack,
  });
}

/**
 * Helper to create configuration error
 */
export function createConfigError(field: string, reason: string): AnalyticsConfigurationError {
  return new AnalyticsConfigurationError(`Invalid configuration for '${field}': ${reason}`, {
    field,
    reason,
  });
}

/**
 * Parse provider-specific errors and convert to AnalyticsError
 */
export function parseProviderError(provider: string, error: any): AnalyticsError {
  const message = error.message || 'Unknown provider error';

  // Network errors
  if (message.includes('ECONNREFUSED') || message.includes('network')) {
    return new AnalyticsNetworkError(`Failed to connect to ${provider}`, {
      originalError: error,
      provider,
    });
  }

  // Rate limit errors
  if (message.includes('rate limit') || message.includes('429')) {
    return new AnalyticsRateLimitError(`${provider} rate limit exceeded`, {
      originalError: error,
      provider,
    });
  }

  // Authentication errors
  if (message.includes('unauthorized') || message.includes('401') || message.includes('403')) {
    return new AnalyticsProviderError(provider, 'Authentication failed. Check your API key.', {
      originalError: error,
    });
  }

  // Generic provider error
  return new AnalyticsProviderError(provider, message, {
    originalError: error,
  });
}
