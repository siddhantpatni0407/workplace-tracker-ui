import React from 'react';

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface PasswordRequirementsProps {
  password: string;
  className?: string;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  password,
  className = ''
}) => {
  // Define requirements with validation functions
  const requirements: PasswordRequirement[] = [
    { 
      label: 'At least 8 characters', 
      met: password.length >= 8
    },
    { 
      label: 'At least one lowercase letter (a-z)', 
      met: /[a-z]/.test(password) 
    },
    { 
      label: 'At least one uppercase letter (A-Z)', 
      met: /[A-Z]/.test(password) 
    },
    { 
      label: 'At least one number (0-9)', 
      met: /\d/.test(password) 
    },
    { 
      label: 'At least one special character (@$!%*?&)', 
      met: /[@$!%*?&]/.test(password) 
    }
  ];

  // Only show requirements once the user starts typing a password
  if (!password) {
    return null;
  }

  return (
    <div className={`password-requirements ${className}`}>
      <div className="small mb-2 text-muted">Password must include:</div>
      <div className="requirements-list">
        {requirements.map((req, index) => (
          <div 
            key={index}
            className={`requirement d-flex align-items-center mb-1 ${req.met ? 'text-success' : 'text-muted'}`}
          >
            <i className={`bi ${req.met ? 'bi-check-circle-fill' : 'bi-circle'} me-2`} />
            <small>{req.label}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordRequirements;