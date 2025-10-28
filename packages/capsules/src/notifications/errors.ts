/**
 * Notifications Capsule - Errors
 */

export enum NotificationErrorType {
  SEND_ERROR = 'SEND_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  INVALID_RECIPIENT_ERROR = 'INVALID_RECIPIENT_ERROR',
  ATTACHMENT_ERROR = 'ATTACHMENT_ERROR',
}

export class NotificationError extends Error {
  constructor(
    message: string,
    public readonly type: NotificationErrorType,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'NotificationError';
  }
}

export class NotificationSendError extends NotificationError {
  constructor(message: string, details?: any) {
    super(message, NotificationErrorType.SEND_ERROR, details);
    this.name = 'NotificationSendError';
  }
}

export class NotificationValidationError extends NotificationError {
  constructor(message: string, details?: any) {
    super(message, NotificationErrorType.VALIDATION_ERROR, details);
    this.name = 'NotificationValidationError';
  }
}

export class NotificationConfigError extends NotificationError {
  constructor(message: string, details?: any) {
    super(message, NotificationErrorType.CONFIG_ERROR, details);
    this.name = 'NotificationConfigError';
  }
}

export class NotificationProviderError extends NotificationError {
  constructor(message: string, details?: any) {
    super(message, NotificationErrorType.PROVIDER_ERROR, details);
    this.name = 'NotificationProviderError';
  }
}

export class NotificationAuthError extends NotificationError {
  constructor(message: string, details?: any) {
    super(message, NotificationErrorType.AUTH_ERROR, details);
    this.name = 'NotificationAuthError';
  }
}

export class NotificationRateLimitError extends NotificationError {
  constructor(message: string, details?: any) {
    super(message, NotificationErrorType.RATE_LIMIT_ERROR, details);
    this.name = 'NotificationRateLimitError';
  }
}

export class NotificationNetworkError extends NotificationError {
  constructor(message: string, details?: any) {
    super(message, NotificationErrorType.NETWORK_ERROR, details);
    this.name = 'NotificationNetworkError';
  }
}

export class NotificationTimeoutError extends NotificationError {
  constructor(message: string, details?: any) {
    super(message, NotificationErrorType.TIMEOUT_ERROR, details);
    this.name = 'NotificationTimeoutError';
  }
}

export class NotificationInvalidRecipientError extends NotificationError {
  constructor(message: string, details?: any) {
    super(message, NotificationErrorType.INVALID_RECIPIENT_ERROR, details);
    this.name = 'NotificationInvalidRecipientError';
  }
}

export class NotificationAttachmentError extends NotificationError {
  constructor(message: string, details?: any) {
    super(message, NotificationErrorType.ATTACHMENT_ERROR, details);
    this.name = 'NotificationAttachmentError';
  }
}
