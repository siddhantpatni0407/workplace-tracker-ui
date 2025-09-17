import React, { forwardRef } from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  showPasswordToggle?: boolean;
  onTogglePassword?: () => void;
  inputClassName?: string;
  containerClassName?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      isRequired = false,
      showPasswordToggle = false,
      onTogglePassword,
      className,
      inputClassName,
      containerClassName,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const inputId = props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;
    const isPasswordType = type === 'password' || (showPasswordToggle && type === 'text');

    const baseInputClass = 'form-control';
    const errorClass = hasError ? 'is-invalid' : '';
    const finalInputClass = [baseInputClass, errorClass, inputClassName].filter(Boolean).join(' ');

    return (
      <div className={`mb-3 ${containerClassName || ''}`}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {isRequired && <span className="text-danger ms-1">*</span>}
          </label>
        )}
        
        <div className={isPasswordType ? 'input-group' : ''}>
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={finalInputClass}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-help` : undefined
            }
            {...props}
          />
          
          {showPasswordToggle && onTogglePassword && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onTogglePassword}
              aria-label={type === 'password' ? 'Show password' : 'Hide password'}
            >
              <i
                className={`bi ${type === 'password' ? 'bi-eye' : 'bi-eye-slash'}`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        {error && (
          <div id={`${inputId}-error`} className="invalid-feedback d-block">
            {error}
          </div>
        )}
        
        {helperText && !error && (
          <div id={`${inputId}-help`} className="form-text">
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
