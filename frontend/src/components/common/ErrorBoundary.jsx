// src/components/common/ErrorBoundary.jsx
import React from 'react';

/**
 * Enhanced Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error 
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('Application Error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // You can also log the error to an error reporting service here
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Check if custom fallback component is provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            resetErrorBoundary={this.resetErrorBoundary}
          />
        );
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-emerald-50/30 px-4">
          <div className="text-center max-w-lg">
            <div className="mb-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🚨</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We encountered an unexpected error. Please try refreshing the page.
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={this.resetErrorBoundary}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-3 px-6 rounded-xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 font-semibold shadow-lg"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
              >
                Refresh Page
              </button>
            </div>

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left bg-red-50 border border-red-200 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-semibold text-red-800 mb-2">
                  🔧 Error Details (Development)
                </summary>
                <div className="space-y-2">
                  <div>
                    <strong className="text-red-700">Error:</strong>
                    <pre className="text-xs bg-red-100 p-3 rounded text-red-700 overflow-auto mt-1">
                      {this.state.error.message}
                    </pre>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong className="text-red-700">Stack Trace:</strong>
                      <pre className="text-xs bg-red-100 p-3 rounded text-red-700 overflow-auto mt-1">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo && this.state.errorInfo.componentStack && (
                    <div>
                      <strong className="text-red-700">Component Stack:</strong>
                      <pre className="text-xs bg-red-100 p-3 rounded text-red-700 overflow-auto mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;