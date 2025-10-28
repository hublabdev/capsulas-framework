export enum StateErrorType {
  INVALID_PATH = 'INVALID_PATH',
  INVALID_VALUE = 'INVALID_VALUE',
  LISTENER_ERROR = 'LISTENER_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR',
  SELECTOR_ERROR = 'SELECTOR_ERROR',
  MIDDLEWARE_ERROR = 'MIDDLEWARE_ERROR',
  IMMUTABILITY_VIOLATED = 'IMMUTABILITY_VIOLATED',
}

export class StateError extends Error {
  constructor(
    public type: StateErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'StateError';
  }
}