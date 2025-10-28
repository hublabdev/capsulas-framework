export enum I18nErrorType {
  INVALID_LOCALE = 'INVALID_LOCALE',
  MISSING_TRANSLATION = 'MISSING_TRANSLATION',
  TRANSLATION_LOAD_FAILED = 'TRANSLATION_LOAD_FAILED',
  INVALID_KEY = 'INVALID_KEY',
  INVALID_CONFIG = 'INVALID_CONFIG',
  INTERPOLATION_FAILED = 'INTERPOLATION_FAILED',
  PLURAL_FAILED = 'PLURAL_FAILED',
  FORMAT_FAILED = 'FORMAT_FAILED',
}

export class I18nError extends Error {
  constructor(
    public type: I18nErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'I18nError';
  }
}