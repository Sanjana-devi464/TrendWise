import { useState, useCallback } from 'react';

interface UseErrorBoundaryOptions {
  onError?: (error: Error, errorInfo: any) => void;
  isolate?: boolean;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export function useErrorBoundary(options: UseErrorBoundaryOptions = {}) {
  const [state, setState] = useState<ErrorBoundaryState>({
    hasError: false,
  });

  const resetError = useCallback(() => {
    setState({ hasError: false, error: undefined, errorInfo: undefined });
  }, []);

  const captureError = useCallback((error: Error, errorInfo?: any) => {
    setState({
      hasError: true,
      error,
      errorInfo,
    });

    if (options.onError) {
      options.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', error, errorInfo);
    }
  }, [options]);

  return {
    ...state,
    resetError,
    captureError,
  };
}

// Hook to handle async errors in components
export function useAsyncError() {
  const [, setError] = useState<Error | null>(null);

  const throwError = useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);

  return throwError;
}

// Hook to handle error reporting
export function useErrorReporting() {
  const reportError = useCallback((error: Error, context?: Record<string, any>) => {
    // In production, you would send this to an error reporting service
    // like Sentry, LogRocket, or Bugsnag
    console.error('Error reported:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    });

    // Example: Send to error reporting service
    // if (process.env.NODE_ENV === 'production') {
    //   // Sentry.captureException(error, { extra: context });
    // }
  }, []);

  return { reportError };
}

// Hook to handle network errors specifically
export function useNetworkError() {
  const [isOffline, setIsOffline] = useState(
    typeof window !== 'undefined' ? !window.navigator.onLine : false
  );

  const handleNetworkError = useCallback((error: Error) => {
    if (error.message.includes('fetch') || error.message.includes('Network')) {
      setIsOffline(true);
    }
    return error;
  }, []);

  // Listen for online/offline events
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => setIsOffline(false));
    window.addEventListener('offline', () => setIsOffline(true));
  }

  return {
    isOffline,
    handleNetworkError,
  };
}
