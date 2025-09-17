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
  leftIcon?: string; // Add new prop for left icon
  rightIcon?: string; // Add new prop for right icon
  hideLabel?: boolean; // Option to hide label but keep accessibility
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
      inputClassName,
      containerClassName,
      type = 'text',
      leftIcon,
      rightIcon,
      hideLabel = false,
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
        {label && !hideLabel && (
          <label htmlFor={inputId} className="form-label">
            {label}
            {isRequired && <span className="text-danger ms-1">*</span>}
          </label>
        )}
        {label && hideLabel && (
          <label htmlFor={inputId} className="visually-hidden">
            {label}
            {isRequired && <span>(required)</span>}
          </label>
        )}
        
        <div className={(isPasswordType || leftIcon || rightIcon) ? 'input-group' : ''}>
          {leftIcon && (
            <span className="input-group-text">
              <i className={`bi ${leftIcon}`} />
            </span>
          )}
          
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
          
          {rightIcon && !showPasswordToggle && (
            <span className="input-group-text">
              <i className={`bi ${rightIcon}`} />
            </span>
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
