export enum ThemeErrorType {
  INVALID_MODE = 'INVALID_MODE',
  INVALID_COLOR_SCHEME = 'INVALID_COLOR_SCHEME',
  STORAGE_ERROR = 'STORAGE_ERROR',
  SYSTEM_PREFERENCE_ERROR = 'SYSTEM_PREFERENCE_ERROR',
  INVALID_COLORS = 'INVALID_COLORS',
  APPLY_FAILED = 'APPLY_FAILED',
  PERSIST_FAILED = 'PERSIST_FAILED',
  LOAD_FAILED = 'LOAD_FAILED',
}

export class ThemeError extends Error {
  constructor(
    public type: ThemeErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ThemeError';
  }
}