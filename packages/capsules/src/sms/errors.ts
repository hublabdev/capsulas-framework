export class SMSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SMSError';
  }
}

export class SMSProviderError extends SMSError {
  constructor(provider: string, message: string) {
    super(`${provider}: ${message}`);
    this.name = 'SMSProviderError';
  }
}

export class SMSValidationError extends SMSError {
  constructor(field: string, message: string) {
    super(`Validation error on ${field}: ${message}`);
    this.name = 'SMSValidationError';
  }
}
