/**
 * Push Notifications Capsule - Errors
 */

export class PushNotificationsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PushNotificationsError';
  }
}

export class PushProviderError extends PushNotificationsError {
  constructor(provider: string, message: string) {
    super(`${provider} error: ${message}`);
    this.name = 'PushProviderError';
  }
}

export class PushValidationError extends PushNotificationsError {
  constructor(message: string) {
    super(`Validation error: ${message}`);
    this.name = 'PushValidationError';
  }
}

export class PushConfigurationError extends PushNotificationsError {
  constructor(message: string) {
    super(`Configuration error: ${message}`);
    this.name = 'PushConfigurationError';
  }
}
