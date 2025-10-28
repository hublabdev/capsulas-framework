/**
 * AI Chat Capsule - Errors
 */

export enum AIChatErrorType {
  API_ERROR = 'API_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  TOKEN_LIMIT_ERROR = 'TOKEN_LIMIT_ERROR',
  MODEL_ERROR = 'MODEL_ERROR',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
}

export class AIChatError extends Error {
  constructor(
    message: string,
    public readonly type: AIChatErrorType,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'AIChatError';
  }
}

export class AIAPIError extends AIChatError {
  constructor(message: string, details?: any) {
    super(message, AIChatErrorType.API_ERROR, details);
    this.name = 'AIAPIError';
  }
}

export class AIAuthError extends AIChatError {
  constructor(message: string, details?: any) {
    super(message, AIChatErrorType.AUTH_ERROR, details);
    this.name = 'AIAuthError';
  }
}

export class AIRateLimitError extends AIChatError {
  constructor(message: string, details?: any) {
    super(message, AIChatErrorType.RATE_LIMIT_ERROR, details);
    this.name = 'AIRateLimitError';
  }
}

export class AIInvalidRequestError extends AIChatError {
  constructor(message: string, details?: any) {
    super(message, AIChatErrorType.INVALID_REQUEST, details);
    this.name = 'AIInvalidRequestError';
  }
}

export class AITimeoutError extends AIChatError {
  constructor(message: string, details?: any) {
    super(message, AIChatErrorType.TIMEOUT_ERROR, details);
    this.name = 'AITimeoutError';
  }
}

export class AITokenLimitError extends AIChatError {
  constructor(message: string, details?: any) {
    super(message, AIChatErrorType.TOKEN_LIMIT_ERROR, details);
    this.name = 'AITokenLimitError';
  }
}

export class AIModelError extends AIChatError {
  constructor(message: string, details?: any) {
    super(message, AIChatErrorType.MODEL_ERROR, details);
    this.name = 'AIModelError';
  }
}

export class AIProviderError extends AIChatError {
  constructor(message: string, details?: any) {
    super(message, AIChatErrorType.PROVIDER_ERROR, details);
    this.name = 'AIProviderError';
  }
}
