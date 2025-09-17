// src/components/ui/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console or error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call the onError callback if provided
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private renderDefaultFallback() {
    const { error, errorInfo } = this.state;
    
    return (
      <div className="error-boundary-fallback min-vh-100 d-flex align-items-center justify-content-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card border-danger">
                <div className="card-header bg-danger text-white">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-exclamation-triangle me-2" />
                    Something went wrong
                  </h5>
                </div>
                <div className="card-body">
                  <p className="card-text">
                    An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
                  </p>
                  
                  {process.env.NODE_ENV === 'development' && error && (
                    <div className="mt-3">
                      <details className="error-details">
                        <summary className="text-muted small mb-2">
                          Error Details (Development Only)
                        </summary>
                        <div className="border rounded p-2 bg-light">
                          <strong>Error:</strong> {error.message}
                          <br />
                          <strong>Stack:</strong>
                          <pre className="small mt-1 mb-0">{error.stack}</pre>
                          {errorInfo && (
                            <>
                              <strong>Component Stack:</strong>
                              <pre className="small mt-1 mb-0">{errorInfo.componentStack}</pre>
                            </>
                          )}
                        </div>
                      </details>
                    </div>
                  )}
                  
                  <div className="mt-3 d-flex gap-2">
                    <button 
                      type="button" 
                      className="btn btn-primary"
                      onClick={this.handleRetry}
                    >
                      <i className="bi bi-arrow-clockwise me-1" />
                      Try Again
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={() => window.location.reload()}
                    >
                      <i className="bi bi-arrow-repeat me-1" />
                      Reload Page
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

  render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback && this.state.error && this.state.errorInfo) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }
      
      // Otherwise, render the default fallback
      return this.renderDefaultFallback();
    }

    return this.props.children;
  }
}

// Functional component wrapper for easier usage
interface AsyncErrorBoundaryProps extends Omit<ErrorBoundaryProps, 'fallback'> {
  fallback?: ReactNode;
}

export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({ 
  children, 
  fallback, 
  onError 
}) => {
  const customFallback = fallback ? () => fallback : undefined;
  
  return (
    <ErrorBoundary fallback={customFallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
