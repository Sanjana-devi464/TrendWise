'use client';

import { useState, useEffect } from 'react';

interface ImageDiagnosticProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageDiagnostic({ src, alt, className = '' }: ImageDiagnosticProps) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loadTime, setLoadTime] = useState<number>(0);

  useEffect(() => {
    const startTime = Date.now();
    setStatus('loading');
    setErrorMessage('');
    setLoadTime(0);

    const img = new Image();
    
    img.onload = () => {
      setStatus('success');
      setLoadTime(Date.now() - startTime);
    };
    
    img.onerror = (error) => {
      setStatus('error');
      setErrorMessage(`Failed to load image: ${error.toString()}`);
      setLoadTime(Date.now() - startTime);
    };
    
    img.src = src;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show diagnostic in production
  }

  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <div className="mb-2">
        <strong>Image Diagnostic</strong>
      </div>
      <div className="text-sm space-y-1">
        <div><strong>URL:</strong> {src}</div>
        <div><strong>Alt:</strong> {alt}</div>
        <div><strong>Status:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-xs ${
            status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
            status === 'success' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {status}
          </span>
        </div>
        {loadTime > 0 && (
          <div><strong>Load Time:</strong> {loadTime}ms</div>
        )}
        {errorMessage && (
          <div><strong>Error:</strong> <span className="text-red-600">{errorMessage}</span></div>
        )}
      </div>
    </div>
  );
}
