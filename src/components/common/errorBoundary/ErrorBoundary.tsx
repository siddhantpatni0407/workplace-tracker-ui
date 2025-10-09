// src/components/common/errorBoundary/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorHandler } from '../../../utils/errorHandling/errorHandler';
import { ErrorType, ERROR_MESSAGES } from '../../../utils/errorHandling/errorTypes';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorInfo = ErrorHandler.processError(this.state.error);
      const errorConfig = ERROR_MESSAGES[errorInfo.type] || ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR];

      return (
        <div className="error-boundary">
          <div className="container mt-5">
            <div className="row justify-content-center">
              <div className="col-md-6">
                <div className="card border-danger">
                  <div className="card-header bg-danger text-white">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      {errorConfig.title}
                    </h5>
                  </div>
                  <div className="card-body text-center">
                    <p className="card-text mb-3">{errorConfig.message}</p>
                    
                    {process.env.NODE_ENV === 'development' && (
                      <details className="mt-3">
                        <summary className="text-muted">Technical Details (Development Mode)</summary>
                        <pre className="text-start mt-2 p-2 bg-light rounded">
                          <small>
                            <strong>Error:</strong> {this.state.error?.message}
                            {'\n'}
                            <strong>Stack:</strong> {this.state.error?.stack}
                            {this.state.errorInfo && (
                              <>
                                {'\n'}
                                <strong>Component Stack:</strong> {this.state.errorInfo.componentStack}
                              </>
                            )}
                          </small>
                        </pre>
                      </details>
                    )}
                    
                    <div className="mt-4">
                      <button 
                        className="btn btn-primary me-2" 
                        onClick={this.handleRetry}
                      >
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        {errorConfig.actionText}
                      </button>
                      <button 
                        className="btn btn-outline-secondary" 
                        onClick={() => window.location.reload()}
                      >
                        <i className="bi bi-arrow-repeat me-1"></i>
                        Refresh Page
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}