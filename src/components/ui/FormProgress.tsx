import React from 'react';

interface FormProgressProps {
  steps: { 
    id: string; 
    label: string; 
    completed: boolean;
  }[];
  currentStep?: string;
  showLabels?: boolean;
}

const FormProgress: React.FC<FormProgressProps> = ({
  steps,
  currentStep,
  showLabels = false
}) => {
  const totalSteps = steps.length;
  const completedSteps = steps.filter(step => step.completed).length;
  const percentComplete = Math.round((completedSteps / totalSteps) * 100);
  
  return (
    <div className="form-progress mb-4">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="small fw-bold">Completion</span>
        <span className="small text-primary fw-bold">{percentComplete}%</span>
      </div>
      <div className="progress" style={{ height: '8px' }}>
        <div 
          className="progress-bar bg-primary" 
          role="progressbar" 
          style={{ width: `${percentComplete}%` }} 
          aria-valuenow={percentComplete} 
          aria-valuemin={0} 
          aria-valuemax={100}
        ></div>
      </div>
      
      {showLabels && (
        <div className="d-flex justify-content-between mt-2">
          {steps.map(step => (
            <div 
              key={step.id} 
              className={`small ${step.completed ? 'text-success fw-bold' : 'text-muted'} ${
                currentStep === step.id ? 'text-primary fw-bold' : ''
              }`}
              style={{ flex: '1', textAlign: 'center', fontSize: '0.75rem' }}
            >
              {step.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormProgress;