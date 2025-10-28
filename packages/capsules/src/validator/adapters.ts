/**
 * Validator Capsule - Adapters
 */

import type { ValidationSchema, FieldValidation, ValidationRuleConfig, ValidationError as VError } from './types';
import { isEmail, isUrl, isNumeric, isAlpha, isAlphanumeric, matchesPattern, isInRange } from './utils';
import { DEFAULT_MESSAGES } from './constants';

export class ValidationAdapter {
  async validateField(field: string, value: any, validation: FieldValidation): Promise<VError[]> {
    const errors: VError[] = [];

    if (validation.required && (value === undefined || value === null || value === '')) {
      errors.push({
        field,
        rule: 'required',
        message: DEFAULT_MESSAGES.required,
        value,
      });
      return errors;
    }

    if (validation.rules) {
      for (const ruleConfig of validation.rules) {
        const error = await this.validateRule(field, value, ruleConfig);
        if (error) errors.push(error);
      }
    }

    return errors;
  }

  private async validateRule(field: string, value: any, config: ValidationRuleConfig): Promise<VError | null> {
    const { rule, value: ruleValue, message, validator } = config;

    let isValid = true;
    let defaultMessage = '';

    switch (rule) {
      case 'email':
        isValid = isEmail(value);
        defaultMessage = DEFAULT_MESSAGES.email;
        break;
      case 'url':
        isValid = isUrl(value);
        defaultMessage = DEFAULT_MESSAGES.url;
        break;
      case 'numeric':
        isValid = isNumeric(value);
        defaultMessage = DEFAULT_MESSAGES.numeric;
        break;
      case 'alpha':
        isValid = isAlpha(value);
        defaultMessage = DEFAULT_MESSAGES.alpha;
        break;
      case 'alphanumeric':
        isValid = isAlphanumeric(value);
        defaultMessage = DEFAULT_MESSAGES.alphanumeric;
        break;
      case 'pattern':
        isValid = matchesPattern(value, ruleValue);
        defaultMessage = DEFAULT_MESSAGES.pattern;
        break;
      case 'min':
        isValid = isInRange(Number(value), ruleValue, undefined);
        defaultMessage = DEFAULT_MESSAGES.min.replace('{value}', ruleValue);
        break;
      case 'max':
        isValid = isInRange(Number(value), undefined, ruleValue);
        defaultMessage = DEFAULT_MESSAGES.max.replace('{value}', ruleValue);
        break;
      case 'custom':
        isValid = validator ? await validator(value) : true;
        defaultMessage = 'Custom validation failed';
        break;
    }

    if (!isValid) {
      return {
        field,
        rule,
        message: message || defaultMessage,
        value,
      };
    }

    return null;
  }
}
