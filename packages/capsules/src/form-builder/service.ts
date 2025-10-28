import type {
  FormBuilderConfig,
  FormBuilderStats,
  FormField,
  Form,
  FormValues,
  FormErrors,
} from './types';
import { createAdapter, FormAdapter } from './adapters';
import { DEFAULT_CONFIG, INITIAL_STATS } from './constants';
import { FormBuilderError, FormBuilderErrorType } from './errors';
import { generateFieldId } from './utils';

export class FormBuilderService {
  private adapter: FormAdapter | null = null;
  private config: FormBuilderConfig;
  private stats: FormBuilderStats = { ...INITIAL_STATS };
  private initialized = false;
  private forms: Map<string, Form> = new Map();

  constructor(config: FormBuilderConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.adapter = createAdapter();
      this.initialized = true;

      if (this.config.debug) {
        console.log('[FormBuilder] Initialized');
      }
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  createForm(options: { fields: FormField[] }): Form {
    if (!this.initialized || !this.adapter) {
      throw new FormBuilderError(
        FormBuilderErrorType.INVALID_CONFIG,
        'FormBuilder service not initialized'
      );
    }

    const formId = generateFieldId();

    // Normalize fields to ensure validation rules are set
    const normalizedFields = options.fields.map(field => this.normalizeField(field));

    const values = this.adapter.getDefaultValues(normalizedFields);

    const form: Form = {
      fields: normalizedFields,
      values,
      errors: {},
      touched: {},
      isValid: true,
      isSubmitting: false,
    };

    this.forms.set(formId, form);
    this.stats.totalForms++;
    this.stats.totalFields += normalizedFields.length;

    if (this.config.debug) {
      console.log('[FormBuilder] Created form with', normalizedFields.length, 'fields');
    }

    return this.createFormAPI(formId, form);
  }

  private normalizeField(field: FormField): FormField {
    // If validation is already set, return as-is
    if (field.validation) {
      return field;
    }

    // Build validation rules from field properties
    const rules: any[] = [];
    const validation: any = { rules };

    // Add required rule
    if (field.required) {
      rules.push('required');
    }

    // Add email validation for email type
    if (field.type === 'email') {
      rules.push('email');
    }

    // Add min/max validation
    if (field.min !== undefined) {
      rules.push('min');
      validation.min = field.min;
    }

    if (field.max !== undefined) {
      rules.push('max');
      validation.max = field.max;
    }

    // Return field with validation if any rules were added
    if (rules.length > 0) {
      return { ...field, validation };
    }

    return field;
  }

  private createFormAPI(_formId: string, form: Form): Form & {
    setFieldValue: (name: string, value: any) => void;
    setFieldTouched: (name: string, touched: boolean) => void;
    validate: () => boolean;
    reset: () => void;
    getValues: () => FormValues;
    getErrors: () => FormErrors;
    getFields: () => FormField[];
    getValue: (name: string) => any;
    setValue: (name: string, value: any) => void;
    addField: (field: FormField) => void;
    removeField: (name: string) => void;
    submit: () => boolean;
    onSubmit: (handler: (values: FormValues) => void | Promise<void>) => void;
  } {
    const self = this;

    return {
      ...form,

      setFieldValue(name: string, value: any) {
        form.values[name] = value;

        if (self.config.validateOnChange) {
          self.validateForm(form);
        }

        if (self.config.debug) {
          console.log(`[FormBuilder] Field '${name}' set to:`, value);
        }
      },

      setFieldTouched(name: string, touched: boolean) {
        form.touched[name] = touched;

        if (touched && self.config.validateOnBlur) {
          self.validateForm(form);
        }
      },

      validate() {
        return self.validateForm(form);
      },

      reset() {
        if (!self.adapter) return;
        form.values = self.adapter.getDefaultValues(form.fields);
        form.errors = {};
        form.touched = {};
        form.isValid = true;
        form.isSubmitting = false;

        if (self.config.debug) {
          console.log('[FormBuilder] Form reset');
        }
      },

      getValues() {
        return { ...form.values };
      },

      getErrors() {
        return { ...form.errors };
      },

      getFields() {
        return [...form.fields];
      },

      getValue(name: string) {
        return form.values[name];
      },

      setValue(name: string, value: any) {
        this.setFieldValue(name, value);
      },

      addField(field: FormField) {
        form.fields.push(field);
        self.stats.totalFields++;
        if (self.config.debug) {
          console.log(`[FormBuilder] Field '${field.name}' added`);
        }
      },

      removeField(name: string) {
        const index = form.fields.findIndex((f) => f.name === name);
        if (index !== -1) {
          form.fields.splice(index, 1);
          delete form.values[name];
          delete form.errors[name];
          delete form.touched[name];
          self.stats.totalFields--;
          if (self.config.debug) {
            console.log(`[FormBuilder] Field '${name}' removed`);
          }
        }
      },

      submit() {
        // Trigger validation and call the registered submit handler if valid
        if (self.config.validateOnSubmit) {
          const isValid = self.validateForm(form);
          if (!isValid) return false;
        }

        // Call the registered submit handler if it exists
        if ((form as any)._submitHandler) {
          form.isSubmitting = true;
          self.stats.submissions++;
          try {
            const result = (form as any)._submitHandler(form.values);
            // Handle async handlers
            if (result && typeof result.then === 'function') {
              result.then(() => {
                form.isSubmitting = false;
              }).catch((error: any) => {
                form.isSubmitting = false;
                self.stats.errors++;
                throw new FormBuilderError(
                  FormBuilderErrorType.SUBMISSION_FAILED,
                  `Form submission failed: ${error}`
                );
              });
            } else {
              form.isSubmitting = false;
            }
            if (self.config.debug) {
              console.log('[FormBuilder] Form submitted successfully');
            }
          } catch (error) {
            form.isSubmitting = false;
            self.stats.errors++;
            throw new FormBuilderError(
              FormBuilderErrorType.SUBMISSION_FAILED,
              `Form submission failed: ${error}`
            );
          }
        }

        return true;
      },

      onSubmit(handler: (values: FormValues) => void | Promise<void>) {
        // Store the handler to be called by submit()
        (form as any)._submitHandler = handler;
      },
    };
  }

  private validateForm(form: Form): boolean {
    if (!this.adapter) return false;

    this.stats.totalValidations++;
    const errors = this.adapter.validate(form.fields, form.values);

    form.errors = errors;
    form.isValid = Object.keys(errors).length === 0;

    if (!form.isValid) {
      this.stats.validationErrors += Object.keys(errors).length;
    }

    if (this.config.debug) {
      console.log('[FormBuilder] Validation result:', form.isValid, errors);
    }

    return form.isValid;
  }

  getStats(): FormBuilderStats {
    return { ...this.stats };
  }

  getConfig(): FormBuilderConfig {
    return { ...this.config };
  }

  async cleanup(): Promise<void> {
    if (this.config.debug) {
      console.log('[FormBuilder] Cleaning up service');
    }

    this.forms.clear();
    this.adapter = null;
    this.initialized = false;
  }
}

export async function createFormBuilderService(
  config: FormBuilderConfig
): Promise<FormBuilderService> {
  const service = new FormBuilderService(config);
  await service.initialize();
  return service;
}
