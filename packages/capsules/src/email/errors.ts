/**
 * Email Capsule - Errors
 */

export enum EmailErrorType {
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  SEND_ERROR = 'SEND_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TEMPLATE_ERROR = 'TEMPLATE_ERROR',
  ATTACHMENT_ERROR = 'ATTACHMENT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
}

export class EmailError extends Error {
  constructor(
    message: string,
    public readonly type: EmailErrorType,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'EmailError';
  }
}

export class EmailConnectionError extends EmailError {
  constructor(message: string, details?: any) {
    super(message, EmailErrorType.CONNECTION_ERROR, details);
    this.name = 'EmailConnectionError';
  }
}

export class EmailAuthError extends EmailError {
  constructor(message: string, details?: any) {
    super(message, EmailErrorType.AUTH_ERROR, details);
    this.name = 'EmailAuthError';
  }
}

export class EmailSendError extends EmailError {
  constructor(message: string, details?: any) {
    super(message, EmailErrorType.SEND_ERROR, details);
    this.name = 'EmailSendError';
  }
}

export class EmailValidationError extends EmailError {
  constructor(message: string, details?: any) {
    super(message, EmailErrorType.VALIDATION_ERROR, details);
    this.name = 'EmailValidationError';
  }
}

export class EmailTemplateError extends EmailError {
  constructor(message: string, details?: any) {
    super(message, EmailErrorType.TEMPLATE_ERROR, details);
    this.name = 'EmailTemplateError';
  }
}

export class EmailAttachmentError extends EmailError {
  constructor(message: string, details?: any) {
    super(message, EmailErrorType.ATTACHMENT_ERROR, details);
    this.name = 'EmailAttachmentError';
  }
}

export class EmailRateLimitError extends EmailError {
  constructor(message: string, details?: any) {
    super(message, EmailErrorType.RATE_LIMIT_ERROR, details);
    this.name = 'EmailRateLimitError';
  }
}

export class EmailProviderError extends EmailError {
  constructor(message: string, details?: any) {
    super(message, EmailErrorType.PROVIDER_ERROR, details);
    this.name = 'EmailProviderError';
  }
}

export class EmailTimeoutError extends EmailError {
  constructor(message: string, details?: any) {
    super(message, EmailErrorType.TIMEOUT_ERROR, details);
    this.name = 'EmailTimeoutError';
  }
}
