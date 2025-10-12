// src/components/common/redirectingLoader/RedirectingLoader.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { UserRole } from '../../../enums';
import { useTranslation } from '../../../hooks/useTranslation';
import './redirecting-loader.css';

interface RedirectingLoaderProps {
  message?: string;
  role?: UserRole | string;
  showProgress?: boolean;
  duration?: number; // in milliseconds
}

const RedirectingLoader: React.FC<RedirectingLoaderProps> = ({
  message,
  role,
  showProgress = true,
  duration = 3000
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    // Determine the role to use
    const targetRole = role || user?.role || 'USER';
    
    // Set appropriate message based on role
    if (message) {
      setCurrentMessage(message);
    } else {
      const roleKey = String(targetRole).toUpperCase();
      if (roleKey === 'ADMIN') {
        setCurrentMessage(t('loading.redirecting.adminDashboard'));
      } else {
        setCurrentMessage(t('loading.redirecting.userDashboard'));
      }
    }
  }, [message, role, user?.role, t]);

  useEffect(() => {
    if (!showProgress) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / (duration / 50)); // Update every 50ms
      });
    }, 50);

    return () => clearInterval(interval);
  }, [showProgress, duration]);

  const getLoadingSteps = () => {
    const targetRole = role || user?.role || 'USER';
    const isAdmin = String(targetRole).toUpperCase() === 'ADMIN';
    
    // Check if this is a logout scenario
    if (currentMessage.toLowerCase().includes('logout') || currentMessage.toLowerCase().includes('logging out')) {
      return [
        { text: t('loading.steps.signingOut'), delay: 0 },
        { text: t('loading.steps.clearingSession'), delay: 600 },
        { text: t('loading.steps.redirectingLogin'), delay: 1200 }
      ];
    }
    
    return [
      { text: t('loading.steps.authenticating'), delay: 0 },
      { text: t('loading.steps.loadingProfile'), delay: 800 },
      { text: isAdmin ? t('loading.steps.preparingAdmin') : t('loading.steps.preparingUser'), delay: 1600 },
      { text: t('loading.steps.almostReady'), delay: 2400 }
    ];
  };

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const steps = getLoadingSteps();

  useEffect(() => {
    const timers = steps.map((step, index) => 
      setTimeout(() => setCurrentStepIndex(index), step.delay)
    );

    return () => timers.forEach(timer => clearTimeout(timer));
  }, [steps]);

  return (
    <div className="redirecting-loader">
      <div className="redirecting-loader-content">
        {/* Main Logo/Icon */}
        <div className="redirecting-loader-icon">
          <div className="workplace-logo">
            <div className="logo-circle">
              <i className="bi bi-building"></i>
            </div>
            <div className="logo-ripple"></div>
            <div className="logo-ripple delay-1"></div>
            <div className="logo-ripple delay-2"></div>
          </div>
        </div>

        {/* App Title */}
        <h2 className="redirecting-loader-title">
          {t('app.title') || 'Workplace Tracker'}
        </h2>

        {/* Main Message */}
        <div className="redirecting-loader-message">
          <div className="message-text">
            {currentMessage}
          </div>
          <div className="message-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>

        {/* Progress Bar */}
        {showProgress && (
          <div className="redirecting-loader-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {Math.round(progress)}%
            </div>
          </div>
        )}

        {/* Loading Steps */}
        <div className="redirecting-loader-steps">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`step-item ${index <= currentStepIndex ? 'active' : ''} ${index < currentStepIndex ? 'completed' : ''}`}
            >
              <div className="step-icon">
                {index < currentStepIndex ? (
                  <i className="bi bi-check-circle-fill"></i>
                ) : index === currentStepIndex ? (
                  <div className="spinner-border spinner-border-sm"></div>
                ) : (
                  <i className="bi bi-circle"></i>
                )}
              </div>
              <div className="step-text">{step.text}</div>
            </div>
          ))}
        </div>

        {/* Role Badge */}
        <div className="redirecting-loader-badge">
          <div className={`role-badge ${String(role || user?.role || 'USER').toLowerCase()}`}>
            <i className={`bi bi-${String(role || user?.role || 'USER').toUpperCase() === 'ADMIN' ? 'shield-check' : 'person-circle'}`}></i>
            <span>{String(role || user?.role || 'USER').toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Background Animation */}
      <div className="redirecting-loader-bg">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
        <div className="bg-circle circle-4"></div>
      </div>
    </div>
  );
};

export default RedirectingLoader;