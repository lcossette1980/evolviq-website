import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Log to error reporting service in production
    this.logErrorToService(error, errorInfo);

    this.setState({
      error,
      errorInfo
    });
  }

  logErrorToService = (error, errorInfo) => {
    // In production, you would send this to an error reporting service
    // like Sentry, LogRocket, or Bugsnag
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      props: this.props
    };

    // For now, we'll just log it
    console.error('Error Report:', errorReport);
    
    // TODO: Implement actual error reporting service
    // Example: Sentry.captureException(error, { extra: errorReport });
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, level = 'component' } = this.props;
      
      // Use custom fallback if provided
      if (Fallback) {
        return <Fallback 
          error={this.state.error} 
          onRetry={this.handleRetry}
          retryCount={this.state.retryCount}
        />;
      }

      // Default error UI based on error level
      if (level === 'page') {
        return (
          <div className="min-h-screen bg-bone flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-charcoal mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. Don't worry, our team has been notified.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-chestnut text-white px-4 py-2 rounded-lg hover:bg-chestnut/90 transition-colors flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {this.state.error?.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        );
      }

      // Component-level error UI
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Component Error
              </h3>
              <p className="text-sm text-red-700 mt-1">
                This component encountered an error and couldn't render properly.
              </p>
              <button
                onClick={this.handleRetry}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for manual error reporting
export const useErrorHandler = () => {
  const handleError = React.useCallback((error, errorInfo = {}) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Manual error report:', error, errorInfo);
    }

    // Report to error service
    const errorReport = {
      message: error.message || String(error),
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      ...errorInfo
    };

    console.error('Error Report:', errorReport);
    // TODO: Send to error reporting service
  }, []);

  return { reportError: handleError };
};

export default ErrorBoundary;