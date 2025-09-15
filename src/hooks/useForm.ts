// src/hooks/useForm.ts
import { useState, useCallback, useMemo } from 'react';
import { FormState, FormErrors, FormValidationRule } from '../models';

export interface UseFormConfig<T> {
  initialValues: T;
  validationRules?: Partial<Record<keyof T, FormValidationRule[]>>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (values: T) => Promise<void> | void;
}

export interface UseFormReturn<T> {
  values: T;
  errors: FormErrors;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  setErrors: (errors: FormErrors) => void;
  clearErrors: () => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
  validateField: (field: keyof T, value: any) => string | null;
  validateForm: () => boolean;
  handleSubmit: (event?: React.FormEvent) => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for form state management and validation
 */
export const useForm = <T extends Record<string, any>>(
  config: UseFormConfig<T>
): UseFormReturn<T> => {
  const { 
    initialValues, 
    validationRules = {}, 
    validateOnChange = false, 
    validateOnBlur = true,
    onSubmit 
  } = config;

  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {} as Record<keyof T, boolean>,
    isSubmitting: false,
    isValid: true,
    isDirty: false
  });

  // Validation function for a single field
  const validateField = useCallback((field: keyof T, value: any): string | null => {
    const fieldRules = (validationRules as any)[field] as FormValidationRule[] | undefined;
    if (!fieldRules) return null;

    for (const rule of fieldRules) {
      switch (rule.type) {
        case 'required':
          if (!value || (typeof value === 'string' && !value.trim())) {
            return rule.message;
          }
          break;
        case 'minLength':
          if (typeof value === 'string' && value.length < rule.value) {
            return rule.message;
          }
          break;
        case 'maxLength':
          if (typeof value === 'string' && value.length > rule.value) {
            return rule.message;
          }
          break;
        case 'min':
          if (typeof value === 'number' && value < rule.value) {
            return rule.message;
          }
          break;
        case 'max':
          if (typeof value === 'number' && value > rule.value) {
            return rule.message;
          }
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (typeof value === 'string' && !emailRegex.test(value)) {
            return rule.message;
          }
          break;
        case 'pattern':
          if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
            return rule.message;
          }
          break;
        default:
          break;
      }
    }
    return null;
  }, [validationRules]);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(formState.values).forEach((field) => {
      const error = validateField(field as keyof T, formState.values[field as keyof T]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setFormState(prev => ({
      ...prev,
      errors: newErrors,
      isValid
    }));

    return isValid;
  }, [formState.values, validateField]);

  // Memoized computed values
  const isDirty = useMemo(() => {
    return JSON.stringify(formState.values) !== JSON.stringify(initialValues);
  }, [formState.values, initialValues]);

  const isValid = useMemo(() => {
    return Object.keys(formState.errors).length === 0;
  }, [formState.errors]);

  // Set single field value
  const setValue = useCallback((field: keyof T, value: any) => {
    setFormState(prev => {
      const newValues = { ...prev.values, [field]: value };
      const newErrors = { ...prev.errors };

      // Validate on change if enabled
      if (validateOnChange) {
        const error = validateField(field, value);
        if (error) {
          newErrors[field as string] = error;
        } else {
          delete newErrors[field as string];
        }
      }

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        isDirty: JSON.stringify(newValues) !== JSON.stringify(initialValues)
      };
    });
  }, [validateField, validateOnChange, initialValues]);

  // Set multiple field values
  const setValues = useCallback((values: Partial<T>) => {
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, ...values },
      isDirty: JSON.stringify({ ...prev.values, ...values }) !== JSON.stringify(initialValues)
    }));
  }, [initialValues]);

  // Set field error
  const setError = useCallback((field: keyof T, error: string) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field as string]: error }
    }));
  }, []);

  // Set multiple errors
  const setErrors = useCallback((errors: FormErrors) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, ...errors }
    }));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      errors: {}
    }));
  }, []);

  // Set field touched state
  const setTouched = useCallback((field: keyof T, touched = true) => {
    setFormState(prev => {
      const newTouched = { ...prev.touched, [field]: touched };
      let newErrors = { ...prev.errors };

      // Validate on blur if enabled and field is being touched
      if (validateOnBlur && touched) {
        const error = validateField(field, prev.values[field]);
        if (error) {
          newErrors[field as string] = error;
        } else {
          delete newErrors[field as string];
        }
      }

      return {
        ...prev,
        touched: newTouched,
        errors: newErrors
      };
    });
  }, [validateField, validateOnBlur]);

  // Handle form submission
  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    if (!validateForm() || !onSubmit) {
      return;
    }

    setFormState(prev => ({ ...prev, isSubmitting: true }));

    try {
      await onSubmit(formState.values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [validateForm, onSubmit, formState.values]);

  // Reset form to initial state
  const reset = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {} as Record<keyof T, boolean>,
      isSubmitting: false,
      isValid: true,
      isDirty: false
    });
  }, [initialValues]);

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isSubmitting: formState.isSubmitting,
    isValid,
    isDirty,
    setValue,
    setValues,
    setError,
    setErrors,
    clearErrors,
    setTouched,
    validateField,
    validateForm,
    handleSubmit,
    reset
  };
};