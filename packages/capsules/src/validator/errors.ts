/**
 * Validator Capsule - Errors
 */

export enum ValidatorErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SCHEMA_ERROR = 'SCHEMA_ERROR',
  TYPE_ERROR = 'TYPE_ERROR',
  REQUIRED_ERROR = 'REQUIRED_ERROR',
  FORMAT_ERROR = 'FORMAT_ERROR',
  RANGE_ERROR = 'RANGE_ERROR',
  PATTERN_ERROR = 'PATTERN_ERROR',
  CUSTOM_ERROR = 'CUSTOM_ERROR',
}

export class ValidatorError extends Error {
  constructor(
    message: string,
    public readonly type: ValidatorErrorType,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'ValidatorError';
  }
}

export class ValidationFailedError extends ValidatorError {
  constructor(message: string, details?: any) {
    super(message, ValidatorErrorType.VALIDATION_ERROR, details);
    this.name = 'ValidationFailedError';
  }
}

export class SchemaError extends ValidatorError {
  constructor(message: string, details?: any) {
    super(message, ValidatorErrorType.SCHEMA_ERROR, details);
    this.name = 'SchemaError';
  }
}

export class TypeMismatchError extends ValidatorError {
  constructor(message: string, details?: any) {
    super(message, ValidatorErrorType.TYPE_ERROR, details);
    this.name = 'TypeMismatchError';
  }
}

export class RequiredFieldError extends ValidatorError {
  constructor(message: string, details?: any) {
    super(message, ValidatorErrorType.REQUIRED_ERROR, details);
    this.name = 'RequiredFieldError';
  }
}

export class FormatError extends ValidatorError {
  constructor(message: string, details?: any) {
    super(message, ValidatorErrorType.FORMAT_ERROR, details);
    this.name = 'FormatError';
  }
}

export class RangeError extends ValidatorError {
  constructor(message: string, details?: any) {
    super(message, ValidatorErrorType.RANGE_ERROR, details);
    this.name = 'RangeError';
  }
}

export class PatternError extends ValidatorError {
  constructor(message: string, details?: any) {
    super(message, ValidatorErrorType.PATTERN_ERROR, details);
    this.name = 'PatternError';
  }
}

export class CustomValidationError extends ValidatorError {
  constructor(message: string, details?: any) {
    super(message, ValidatorErrorType.CUSTOM_ERROR, details);
    this.name = 'CustomValidationError';
  }
}
