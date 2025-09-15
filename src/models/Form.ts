// src/models/Form.ts

// Generic form field configuration
export interface FormField<T = any> {
  name: string;
  label: string;
  type: FormFieldType;
  value: T;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  validation?: FormValidationRule[];
  options?: SelectOption[];
  min?: number | string;
  max?: number | string;
  step?: number;
  rows?: number;
  cols?: number;
  accept?: string; // for file inputs
  multiple?: boolean;
  className?: string;
  helpText?: string;
}

// Form field types
export type FormFieldType = 
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'month'
  | 'week'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'hidden';

// Select option for dropdowns and radio buttons
export interface SelectOption<T = any> {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;
}

// Form validation rules
export interface FormValidationRule {
  type: ValidationType;
  value?: any;
  message: string;
}

// Validation types
export type ValidationType = 
  | 'required'
  | 'minLength'
  | 'maxLength'
  | 'min'
  | 'max'
  | 'pattern'
  | 'email'
  | 'url'
  | 'date'
  | 'custom';

// Form validation errors
export interface FormErrors {
  [fieldName: string]: string | string[];
}

// Form state
export interface FormState<T = Record<string, any>> {
  values: T;
  errors: FormErrors;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

// Form configuration
export interface FormConfig<T = Record<string, any>> {
  fields: FormField[];
  initialValues: T;
  validationSchema?: any; // Yup schema or similar
  onSubmit: (values: T) => Promise<void> | void;
  onReset?: () => void;
  submitLabel?: string;
  resetLabel?: string;
  showReset?: boolean;
  autoFocus?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// Form actions
export type FormAction<T = any> = 
  | { type: 'SET_VALUE'; field: keyof T; value: any }
  | { type: 'SET_VALUES'; values: Partial<T> }
  | { type: 'SET_ERROR'; field: keyof T; error: string }
  | { type: 'SET_ERRORS'; errors: FormErrors }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_TOUCHED'; field: keyof T }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'RESET' };

// Commonly used form data types
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupFormData {
  name: string;
  email: string;
  mobileNumber: string;
  password: string;
  confirmPassword: string;
  role: string;
  terms?: boolean;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}