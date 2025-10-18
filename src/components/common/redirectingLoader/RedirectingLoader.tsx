/**
 * RedirectingLoader Component
 * 
 * A sophisticated loading screen that displays during user authentication and redirection.
 * Features role-based messaging, animated progress indicators, and multi-step loading visualization.
 * Supports internationalization and provides contextual feedback based on user roles.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { UserRole } from '../../../enums';
import { useTranslation } from '../../../hooks/useTranslation';
import './redirecting-loader.css';

interface RedirectingLoaderProps {
  /** Custom message to display, overrides role-based messaging */
  message?: string;
  /** User role for contextual messaging and styling */
  role?: UserRole | string;
  /** Whether to show animated progress bar */
  showProgress?: boolean;
  /** Duration of the loading animation in milliseconds */
  duration?: number;
}

/**
 * Returns Bootstrap icon class for the specified user role
 * Used in the role badge display
 */
const getPlatformRoleIcon = (role: string): string => {
  switch (role) {
    case 'PLATFORM_ADMIN':
      return 'shield-check';
    case 'SUPER_ADMIN':
      return 'star-fill';
    case 'ADMIN':
      return 'shield-check';
    case 'MANAGER':
      return 'people-fill';
    case 'USER':
      return 'person-circle';
    default:
      return 'person-circle';
  }
};

/**
 * Returns human-readable display text for the specified user role
 * Used in the role badge and messaging
 */
const getPlatformRoleDisplay = (role: string): string => {
  switch (role) {
    case 'PLATFORM_ADMIN':
      return 'PLATFORM USER';
    case 'SUPER_ADMIN':
      return 'SUPER ADMIN';
    case 'ADMIN':
      return 'ADMIN';
    case 'MANAGER':
      return 'MANAGER';
    case 'USER':
      return 'USER';
    default:
      return 'USER';
  }
};

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
    // Determine the role to use - prioritize prop, then context, then default
    const targetRole = role || user?.role || 'USER';
    
    // Set appropriate message based on role or use custom message
    if (message) {
      // Custom message provided - use as-is
      setCurrentMessage(message);
    } else {
      // Generate role-specific redirection message using translations
      const roleKey = String(targetRole).toUpperCase();
      switch (roleKey) {
        case 'PLATFORM_USER':
        case 'PLATFORM_ADMIN':
          setCurrentMessage(t('loading.redirecting.platformDashboard'));
          break;
        case 'SUPER_ADMIN':
          setCurrentMessage(t('loading.redirecting.superAdminDashboard'));
          break;
        case 'ADMIN':
          setCurrentMessage(t('loading.redirecting.adminDashboard'));
          break;
        case 'USER':
        default:
          setCurrentMessage(t('loading.redirecting.userDashboard'));
          break;
      }
    }
  }, [message, role, user?.role, t]);

  /**
   * Logout timeout handler - prevents users from getting stuck on logout screen
   * Automatically redirects after a buffer period to ensure logout completes
   */
  useEffect(() => {
    if (message && (message.toLowerCase().includes('logout') || message.toLowerCase().includes('logging out'))) {
      const timeoutId = setTimeout(() => {
        // Redirect to appropriate homepage based on user role
        if (role === 'PLATFORM_ADMIN') {
          window.location.href = '/platform-home';
        } else {
          window.location.href = '/';
        }
      }, duration + 200); // Add 200ms buffer
      
      return () => clearTimeout(timeoutId);
    }
  }, [message, role, duration]);

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
    const roleKey = String(targetRole).toUpperCase();
    
    // Check if this is a logout scenario
    if (currentMessage.toLowerCase().includes('logout') || currentMessage.toLowerCase().includes('logging out')) {
      return [
        { text: t('loading.steps.signingOut'), delay: 0 },
        { text: t('loading.steps.clearingSession'), delay: 250 },
        { text: t('loading.steps.redirectingLogin'), delay: 500 }
      ];
    }
    
    // Determine preparation message based on specific role
    let preparingStep = '';
    switch (roleKey) {
      case 'PLATFORM_USER':
      case 'PLATFORM_ADMIN':
        preparingStep = t('loading.steps.preparingPlatform');
        break;
      case 'SUPER_ADMIN':
        preparingStep = t('loading.steps.preparingSuperAdmin');
        break;
      case 'ADMIN':
        preparingStep = t('loading.steps.preparingAdmin');
        break;
      case 'USER':
      default:
        preparingStep = t('loading.steps.preparingUser');
        break;
    }
    
    return [
      { text: t('loading.steps.authenticating'), delay: 0 },
      { text: t('loading.steps.loadingProfile'), delay: 800 },
      { text: preparingStep, delay: 1600 },
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
          <div className={`role-badge ${String(role || user?.role || 'USER').toLowerCase().replace('_', '-')}`}>
            <i className={`bi bi-${getPlatformRoleIcon(String(role || user?.role || 'USER').toUpperCase())}`}></i>
            <span>{getPlatformRoleDisplay(String(role || user?.role || 'USER').toUpperCase())}</span>
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