export type FieldType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'time' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'file';
export type ValidationRule = 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';

export interface FormBuilderConfig {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  debug?: boolean;
}

export interface FormField {
  name: string;
  type: FieldType;
  label?: string;
  placeholder?: string;
  defaultValue?: any;
  validation?: FieldValidation;
  options?: FormFieldOption[];
  disabled?: boolean;
  required?: boolean;
  min?: number;
  max?: number;
}

export interface FormFieldOption {
  label: string;
  value: any;
}

export interface FieldValidation {
  rules: ValidationRule[];
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface FormValues {
  [key: string]: any;
}

export interface FormErrors {
  [key: string]: string;
}

export interface Form {
  fields: FormField[];
  values: FormValues;
  errors: FormErrors;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

export interface FormBuilderStats {
  totalForms: number;
  totalFields: number;
  totalValidations: number;
  validationErrors: number;
  submissions: number;
  errors: number;
}