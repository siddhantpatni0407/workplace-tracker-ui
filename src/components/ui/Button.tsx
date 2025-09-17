import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'outline-primary' | 'outline-secondary' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: string;
  rightIcon?: string;
  fullWidth?: boolean;
  compact?: boolean; // For more compact padding
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText = 'Loading...',
  leftIcon,
  rightIcon,
  fullWidth = false,
  compact = false,
  className,
  disabled,
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  
  // Enhanced size handling
  const getSizeClass = () => {
    switch (size) {
      case 'xs': return 'btn-xs';
      case 'sm': return 'btn-sm';
      case 'md': return ''; // Default Bootstrap size
      case 'lg': return 'btn-lg';
      case 'xl': return 'btn-xl';
      default: return '';
    }
  };
  
  const sizeClass = getSizeClass();
  const fullWidthClass = fullWidth ? 'w-100' : '';
  const compactClass = compact ? 'btn-compact' : '';
  const disabledState = disabled || isLoading;

  const finalClassName = [
    baseClass,
    variantClass,
    sizeClass,
    fullWidthClass,
    compactClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={finalClassName}
      disabled={disabledState}
      {...props}
    >
      {isLoading ? (
        <>
          <span
            className="spinner-border spinner-border-sm me-2"
            role="status"
            aria-hidden="true"
          />
          {loadingText}
        </>
      ) : (
        <>
          {leftIcon && (
            <i className={`${leftIcon} me-2`} aria-hidden="true" />
          )}
          {children}
          {rightIcon && (
            <i className={`${rightIcon} ms-2`} aria-hidden="true" />
          )}
        </>
      )}
    </button>
  );
};

export default Button;
