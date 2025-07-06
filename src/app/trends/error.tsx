'use client';

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, TrendingUp } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TrendsError({ error, reset }: ErrorProps) {
  React.useEffect(() => {
    console.error('Trends page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Failed to Load Trends
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't load the trending topics. This might be due to an issue with the trending data service or network connectivity.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </button>
            
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
            
            <Link
              href="/articles"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              View Articles
            </Link>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error Details (Development)
              </summary>
              <div className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                <div className="font-bold mb-2">Error Message:</div>
                <div className="mb-4 text-red-600">{error.message}</div>
                
                <div className="font-bold mb-2">Stack Trace:</div>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                  {error.stack}
                </pre>
                
                {error.digest && (
                  <>
                    <div className="font-bold mb-2 mt-4">Error Digest:</div>
                    <div className="text-xs text-gray-700">{error.digest}</div>
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
