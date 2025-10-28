/**
 * Validator Capsule - Constants
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const URL_REGEX = /^https?:\/\/.+/;
export const NUMERIC_REGEX = /^-?\d+\.?\d*$/;
export const ALPHA_REGEX = /^[a-zA-Z]+$/;
export const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9]+$/;

export const DEFAULT_MESSAGES = {
  required: 'This field is required',
  email: 'Invalid email format',
  url: 'Invalid URL format',
  numeric: 'Must be a number',
  alpha: 'Must contain only letters',
  alphanumeric: 'Must contain only letters and numbers',
  min: 'Value must be at least {value}',
  max: 'Value must be at most {value}',
  minLength: 'Must be at least {value} characters',
  maxLength: 'Must be at most {value} characters',
  pattern: 'Invalid format',
  enum: 'Must be one of: {value}',
};

export const INITIAL_STATS = {
  totalValidations: 0,
  passed: 0,
  failed: 0,
  averageTime: 0,
};
