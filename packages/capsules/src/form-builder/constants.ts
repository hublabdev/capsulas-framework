import type { FormBuilderConfig, FormBuilderStats } from './types';

export const DEFAULT_CONFIG: Partial<FormBuilderConfig> = {
  validateOnChange: false,
  validateOnBlur: true,
  validateOnSubmit: true,
  debug: false,
};

export const INITIAL_STATS: FormBuilderStats = {
  totalForms: 0,
  totalFields: 0,
  totalValidations: 0,
  validationErrors: 0,
  submissions: 0,
  errors: 0,
};
