import { useState, useCallback } from 'react';
import { ValidationUtils } from '../utils';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  phone?: boolean;
  match?: string; // field name to match against
  custom?: (value: any, formData?: any) => string | null;
}

interface ValidationSchema {
  [key: string]: ValidationRule;
}

interface UseFormValidationReturn {
  errors: { [key: string]: string };
  validate: (field?: string) => boolean;
  clearError: (field: string) => void;
  clearAllErrors: () => void;
  setError: (field: string, message: string) => void;
  hasErrors: boolean;
}

export const useFormValidation = (
  formData: any,
  schema: ValidationSchema,
  messages?: { [key: string]: string }
): UseFormValidationReturn => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const getFieldValue = useCallback((field: string): any => {
    return field.split('.').reduce((obj, key) => obj?.[key], formData);
  }, [formData]);

  const validateField = useCallback((field: string, rule: ValidationRule): string | null => {
    const value = getFieldValue(field);
    const fieldLabel = field.charAt(0).toUpperCase() + field.slice(1);

    // Required validation
    if (rule.required) {
      if (value === null || value === undefined || value === '' || 
          (typeof value === 'string' && !value.trim())) {
        return messages?.[`${field}Required`] || `${fieldLabel} is required`;
      }
    }

    // If field is empty and not required, skip other validations
    if (!value && !rule.required) {
      return null;
    }

    // Minimum length validation
    if (rule.minLength && value.length < rule.minLength) {
      return messages?.[`${field}MinLength`] || 
             `${fieldLabel} must be at least ${rule.minLength} characters`;
    }

    // Maximum length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      return messages?.[`${field}MaxLength`] || 
             `${fieldLabel} must be no more than ${rule.maxLength} characters`;
    }

    // Email validation
    if (rule.email && !ValidationUtils.isValidEmail(value)) {
      return messages?.[`${field}Invalid`] || 'Enter a valid email address';
    }

    // Phone validation
    if (rule.phone && !ValidationUtils.isValidPhone(value)) {
      return messages?.[`${field}Invalid`] || 'Enter a valid phone number';
    }

    // Match validation (for password confirmation, etc.)
    if (rule.match) {
      const matchValue = getFieldValue(rule.match);
      if (value !== matchValue) {
        return messages?.[`${field}Match`] || 
               `${fieldLabel} does not match ${rule.match}`;
      }
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value, formData);
    }

    return null;
  }, [formData, getFieldValue, messages]);

  const validate = useCallback((field?: string): boolean => {
    if (field) {
      // Validate single field
      const rule = schema[field];
      if (rule) {
        const error = validateField(field, rule);
        setErrors(prev => ({
          ...prev,
          [field]: error || ''
        }));
        return !error;
      }
      return true;
    } else {
      // Validate all fields
      const newErrors: { [key: string]: string } = {};
      let isValid = true;

      Object.keys(schema).forEach(fieldName => {
        const rule = schema[fieldName];
        const error = validateField(fieldName, rule);
        if (error) {
          newErrors[fieldName] = error;
          isValid = false;
        }
      });

      setErrors(newErrors);
      return isValid;
    }
  }, [schema, validateField]);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setError = useCallback((field: string, message: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);

  const hasErrors = Object.keys(errors).some(key => errors[key]);

  return {
    errors,
    validate,
    clearError,
    clearAllErrors,
    setError,
    hasErrors
  };
};