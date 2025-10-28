import type { FormField, FormValues, FormErrors } from './types';
import { validateField } from './utils';

export class FormAdapter {
  validate(fields: FormField[], values: FormValues): FormErrors {
    const errors: FormErrors = {};

    for (const field of fields) {
      const value = values[field.name];
      const error = validateField(field, value);

      if (error) {
        errors[field.name] = error;
      }
    }

    return errors;
  }

  getDefaultValues(fields: FormField[]): FormValues {
    const values: FormValues = {};

    for (const field of fields) {
      values[field.name] = field.defaultValue ?? this.getDefaultValueForType(field.type);
    }

    return values;
  }

  private getDefaultValueForType(type: string): any {
    switch (type) {
      case 'checkbox':
        return false;
      case 'number':
        return 0;
      default:
        return '';
    }
  }
}

export function createAdapter(): FormAdapter {
  return new FormAdapter();
}
