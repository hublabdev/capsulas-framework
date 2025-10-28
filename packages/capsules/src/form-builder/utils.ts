import type { FormField, FieldValidation, ValidationRule } from './types';

export function validateField(field: FormField, value: any): string | null {
  if (!field.validation) return null;

  const { rules, message } = field.validation;

  for (const rule of rules) {
    const error = applyRule(rule, value, field.validation);
    if (error) {
      return message || error;
    }
  }

  return null;
}

function applyRule(rule: ValidationRule, value: any, validation: FieldValidation): string | null {
  switch (rule) {
    case 'required':
      if (value === null || value === undefined || value === '') {
        return 'This field is required';
      }
      break;

    case 'email':
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Invalid email address';
      }
      break;

    case 'min':
      if (validation.min !== undefined) {
        if (typeof value === 'string' && value.length < validation.min) {
          return `Minimum length is ${validation.min} characters`;
        }
        if (typeof value === 'number' && value < validation.min) {
          return `Minimum value is ${validation.min}`;
        }
      }
      break;

    case 'max':
      if (validation.max !== undefined) {
        if (typeof value === 'string' && value.length > validation.max) {
          return `Maximum length is ${validation.max} characters`;
        }
        if (typeof value === 'number' && value > validation.max) {
          return `Maximum value is ${validation.max}`;
        }
      }
      break;

    case 'pattern':
      if (validation.pattern && value && !validation.pattern.test(value)) {
        return 'Invalid format';
      }
      break;

    case 'custom':
      if (validation.custom) {
        const result = validation.custom(value);
        if (typeof result === 'string') {
          return result;
        }
        if (!result) {
          return 'Validation failed';
        }
      }
      break;
  }

  return null;
}

export function generateFieldId(): string {
  return `field_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
