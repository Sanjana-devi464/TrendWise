'use client';

import React from 'react';
import { AlertTriangle, RefreshCw, Home, Wifi, WifiOff } from 'lucide-react';

interface SmartErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: (string | number)[];
  isolate?: boolean;
}

interface SmartErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  isNetworkError?: boolean;
  isChunkError?: boolean;
  retryCount: number;
}

export class SmartErrorBoundary extends React.Component<
  SmartErrorBoundaryProps,
  SmartErrorBoundaryState
> {
  private resetTimeoutId: number | null = null;
  private maxRetries = 3;

  constructor(props: SmartErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<SmartErrorBoundaryState> {
    // Analyze error type
    const isNetworkError = error.message.includes('fetch') || 
                          error.message.includes('Network') ||
                          error.message.includes('Failed to fetch');
    
    const isChunkError = error.message.includes('ChunkLoadError') ||
                        error.message.includes('Loading chunk') ||
                        error.message.includes('Loading CSS chunk');

    return {
      hasError: true,
      error,
      isNetworkError,
      isChunkError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Smart Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-retry for certain error types
    if (this.shouldAutoRetry(error) && this.state.retryCount < this.maxRetries) {
      this.scheduleRetry();
    }
  }

  componentDidUpdate(prevProps: SmartErrorBoundaryProps) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;
    
    if (hasError && resetKeys) {
      const prevResetKeys = prevProps.resetKeys || [];
      const hasResetKeyChanged = resetKeys.some((key, index) => 
        prevResetKeys[index] !== key
      );
      
      if (hasResetKeyChanged) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private shouldAutoRetry(error: Error): boolean {
    return this.state.isChunkError || this.state.isNetworkError || false;
  }

  private scheduleRetry() {
    this.resetTimeoutId = window.setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
      }));
    }, 2000 * (this.state.retryCount + 1)); // Exponential backoff
  }

  private resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
    });
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private getErrorMessage(): string {
    const { error, isNetworkError, isChunkError } = this.state;

    if (isNetworkError) {
      return 'Network connection issue. Please check your internet connection and try again.';
    }

    if (isChunkError) {
      return 'Failed to load application resources. This might be due to a recent update.';
    }

    return error?.message || 'An unexpected error occurred.';
  }

  private getErrorActions() {
    const { isNetworkError, isChunkError } = this.state;

    const actions = [
      {
        label: 'Try Again',
        icon: RefreshCw,
        onClick: this.handleRetry,
        primary: true,
      },
    ];

    if (isChunkError) {
      actions.push({
        label: 'Reload Page',
        icon: RefreshCw,
        onClick: this.handleReload,
        primary: false,
      });
    }

    if (isNetworkError) {
      actions.push({
        label: 'Check Connection',
        icon: navigator.onLine ? Wifi : WifiOff,
        onClick: () => {
          if (typeof window !== 'undefined') {
            window.open('https://www.google.com', '_blank');
          }
        },
        primary: false,
      });
    }

    actions.push({
      label: 'Go Home',
      icon: Home,
      onClick: () => {
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      },
      primary: false,
    });

    return actions;
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.getErrorMessage();
      const actions = this.getErrorActions();

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-12 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-6">
                {errorMessage}
              </p>
              
              {this.state.retryCount > 0 && this.state.retryCount < this.maxRetries && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Retrying automatically... (Attempt {this.state.retryCount + 1} of {this.maxRetries})
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`inline-flex items-center px-6 py-3 font-medium rounded-lg transition-colors ${
                      action.primary
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    }`}
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </button>
                ))}
              </div>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                    <div className="font-bold mb-2">Error Message:</div>
                    <div className="mb-4 text-red-600">{this.state.error?.message}</div>
                    
                    <div className="font-bold mb-2">Error Type:</div>
                    <div className="mb-4 text-gray-700">
                      {this.state.isNetworkError && 'Network Error'}
                      {this.state.isChunkError && 'Chunk Load Error'}
                      {!this.state.isNetworkError && !this.state.isChunkError && 'Runtime Error'}
                    </div>
                    
                    <div className="font-bold mb-2">Stack Trace:</div>
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                      {this.state.error?.stack}
                    </pre>
                    
                    {this.state.errorInfo && (
                      <>
                        <div className="font-bold mb-2 mt-4">Component Stack:</div>
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SmartErrorBoundary;
