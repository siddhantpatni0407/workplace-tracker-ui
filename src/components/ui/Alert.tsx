import React from 'react';

interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
  showIcon?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  message,
  onClose,
  className,
  showIcon = true
}) => {
  const getAlertClass = () => {
    switch (variant) {
      case 'success':
        return 'alert-success';
      case 'error':
        return 'alert-danger';
      case 'warning':
        return 'alert-warning';
      case 'info':
      default:
        return 'alert-info';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return 'bi-check-circle-fill';
      case 'error':
        return 'bi-exclamation-triangle-fill';
      case 'warning':
        return 'bi-exclamation-triangle-fill';
      case 'info':
      default:
        return 'bi-info-circle-fill';
    }
  };

  const baseClass = 'alert';
  const variantClass = getAlertClass();
  const dismissibleClass = onClose ? 'alert-dismissible' : '';
  
  const finalClassName = [
    baseClass,
    variantClass,
    dismissibleClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={finalClassName} role="alert">
      <div className="d-flex align-items-start">
        {showIcon && (
          <i 
            className={`${getIcon()} me-2 flex-shrink-0`} 
            style={{ fontSize: '1.1em' }}
            aria-hidden="true"
          />
        )}
        <div className="flex-grow-1">
          {title && (
            <h6 className="alert-heading mb-1">{title}</h6>
          )}
          <div className={title ? 'mb-0' : ''}>{message}</div>
        </div>
        {onClose && (
          <button
            type="button"
            className="btn-close flex-shrink-0"
            aria-label="Close"
            onClick={onClose}
          />
        )}
      </div>
    </div>
  );
};

export default Alert;
