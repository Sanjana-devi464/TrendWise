'use client';

import { useState, memo, useCallback } from 'react';
import Image from 'next/image';
import { cache, cacheHelpers } from '@/lib/cache';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  quality?: number;
  loading?: 'lazy' | 'eager';
  [key: string]: any; // Allow additional props
}

function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  fill = false,
  quality = 85,
  loading = 'lazy',
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Cache key for this image
  const cacheKey = cacheHelpers.generateKey('image-status', { src, width, height });

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    // Cache successful loads
    cache.images.set(cacheKey, { loaded: true, timestamp: Date.now() });
  }, [cacheKey]);

  const handleError = useCallback(() => {
    console.error('Image failed to load:', src);
    setIsLoading(false);
    setHasError(true);
    // Cache failed loads to prevent retry attempts
    cache.images.set(cacheKey, { loaded: false, error: true, timestamp: Date.now() });
  }, [cacheKey, src]);

  // Generate optimized placeholder with better SVG
  const generatePlaceholder = useCallback((w: number, h: number) => {
    return `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" aria-label="${alt}">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Loading...</text>
      </svg>`
    ).toString('base64')}`;
  }, [alt]);

  // Default placeholder image
  const placeholderSrc = width && height 
    ? `/api/placeholder/${width}x${height}`
    : '/api/placeholder/400x300';

  if (hasError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center text-gray-500 ${className}`}
        style={{ width, height }}
      >
        <span className="text-sm">Image not available</span>
      </div>
    );
  }

  const imageProps = {
    src: src || placeholderSrc,
    alt,
    className: `transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`,
    onLoad: handleLoad,
    onError: handleError,
    priority,
    quality,
    sizes,
    placeholder,
    blurDataURL,
    ...props,
  };

  if (fill) {
    return (
      <div className="relative overflow-hidden">
        <Image
          {...imageProps}
          fill
          style={{ objectFit: 'cover' }}
        />
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <Image
        {...imageProps}
        width={width}
        height={height}
        loading={loading}
        placeholder={placeholder}
        blurDataURL={blurDataURL || (width && height ? generatePlaceholder(width, height) : undefined)}
      />
      {isLoading && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          style={{ width, height }}
        />
      )}
    </div>
  );
}

export default memo(OptimizedImage);
