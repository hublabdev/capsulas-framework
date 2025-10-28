export enum FormBuilderErrorType {
  INVALID_FIELD = 'INVALID_FIELD',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  FIELD_NOT_FOUND = 'FIELD_NOT_FOUND',
  INVALID_VALUE = 'INVALID_VALUE',
  SUBMISSION_FAILED = 'SUBMISSION_FAILED',
  INVALID_FORM = 'INVALID_FORM',
  DUPLICATE_FIELD = 'DUPLICATE_FIELD',
  INVALID_CONFIG = 'INVALID_CONFIG',
}

export class FormBuilderError extends Error {
  constructor(
    public type: FormBuilderErrorType,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'FormBuilderError';
  }
}