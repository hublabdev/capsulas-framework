/**
 * Validator Capsule - Types
 */

export type ValidationRule =
  | 'required' | 'email' | 'url' | 'numeric' | 'alpha' | 'alphanumeric'
  | 'min' | 'max' | 'minLength' | 'maxLength' | 'pattern' | 'enum'
  | 'custom';

export interface ValidationSchema {
  [field: string]: FieldValidation;
}

export interface FieldValidation {
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
  rules?: ValidationRuleConfig[];
  required?: boolean;
  default?: any;
  transform?: (value: any) => any;
  nested?: ValidationSchema;
}

export interface ValidationRuleConfig {
  rule: ValidationRule;
  value?: any;
  message?: string;
  validator?: (value: any) => boolean | Promise<boolean>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  data?: any;
}

export interface ValidationError {
  field: string;
  rule: string;
  message: string;
  value?: any;
}

export interface ValidatorConfig {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  messages?: Record<string, string>;
}

export interface ValidationStats {
  totalValidations: number;
  passed: number;
  failed: number;
  averageTime: number;
}
