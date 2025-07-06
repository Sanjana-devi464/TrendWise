'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface ArticleImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  style?: React.CSSProperties;
  article?: any; // Article data for AI image generation
  fallbackType?: 'featured' | 'media';
}

// Helper function to validate URLs
function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function ArticleImage({ 
  src, 
  alt, 
  fill, 
  width, 
  height, 
  className, 
  priority, 
  style,
  article,
  fallbackType = 'media'
}: ArticleImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  // Reset states when src changes
  useEffect(() => {
    setImageSrc(src);
    setHasError(false);
    setIsLoading(true);
    setGeneratingAI(false);
    setRetryCount(0);
    setFallbackUsed(false);
  }, [src]);

  const generateSmartFallback = (articleData: any, type: 'featured' | 'media') => {
    // Always return a valid fallback URL
    if (!articleData) {
      return type === 'featured' 
        ? '/api/placeholder/800x400'
        : '/api/placeholder/600x300';
    }

    try {
      const category = articleData.category?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'business';
      const title = articleData.title?.substring(0, 50) || 'Article';
      const dimensions = type === 'featured' ? '800x400' : '600x300';
      
      // Use internal placeholder API with better parameters
      return `/api/placeholder/${dimensions}?category=${category}&text=${encodeURIComponent(title)}`;
    } catch (error) {
      // Fallback to basic placeholder if anything goes wrong
      console.error('Error generating smart fallback:', error);
      return type === 'featured' 
        ? '/api/placeholder/800x400'
        : '/api/placeholder/600x300';
    }
  };

  const generateFallbackImage = async () => {
    if (!article || generatingAI) return;
    
    setGeneratingAI(true);
    
    try {
      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ article }),
      });

      if (response.ok) {
        const data = await response.json();
        const newImageSrc = fallbackType === 'featured' 
          ? data.featuredImage 
          : (data.mediaImages?.[0] || data.featuredImage);
        
        if (newImageSrc && newImageSrc !== imageSrc) {
          setImageSrc(newImageSrc);
          setHasError(false);
          setIsLoading(true);
        }
      }
    } catch (error) {
      console.error('Failed to generate AI image:', error);
      // Use enhanced fallbacks based on article content
      const fallbackUrl = generateSmartFallback(article, fallbackType);
      setImageSrc(fallbackUrl);
      setHasError(false);
      setIsLoading(true);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleError = () => {
    console.error('Image failed to load:', imageSrc);
    
    // Prevent infinite loops
    if (retryCount >= 2 || fallbackUsed) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    // Update retry count first
    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    
    // Use smart fallback immediately instead of trying AI generation
    const fallbackUrl = generateSmartFallback(article, fallbackType);
    if (fallbackUrl && fallbackUrl !== imageSrc) {
      console.log('Using fallback image:', fallbackUrl);
      setImageSrc(fallbackUrl);
      setFallbackUsed(true);
      setHasError(false);
      setIsLoading(true);
    } else {
      // If fallback generation fails, show error state
      setHasError(true);
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  // Wrap main logic in try-catch to prevent crashes
  try {
    // Don't render if src is invalid
    if (!src || !src.trim()) {
      // Use smart fallback for empty/invalid URLs
      const fallbackUrl = generateSmartFallback(article, fallbackType);
      
      return (
        <div className="relative">
          <Image
            src={fallbackUrl}
            alt={alt}
            fill={fill}
            width={!fill ? width : undefined}
            height={!fill ? height : undefined}
            className={`${className} transition-opacity duration-300`}
            priority={priority}
            style={style}
            onError={() => {
              // If even the fallback fails, show error state
              setHasError(true);
              setIsLoading(false);
            }}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      );
    }

    // Don't render anything if there's a persistent error and no fallback worked
    if (hasError && retryCount >= 2) {
      const placeholderHeight = fill ? '100%' : (height || 300);
      const placeholderWidth = fill ? '100%' : (width || 600);
      
      return (
        <div 
          className={`${className || ''} bg-gray-100 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded-lg`}
          style={{
            height: typeof placeholderHeight === 'number' ? `${placeholderHeight}px` : placeholderHeight,
            width: typeof placeholderWidth === 'number' ? `${placeholderWidth}px` : placeholderWidth,
            minHeight: fill ? '200px' : undefined,
            ...style
          }}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">📷</div>
            <div>Image unavailable</div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        <Image
          src={imageSrc}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          priority={priority}
          style={style}
          onError={handleError}
          onLoad={handleLoad}
          unoptimized={false} // Let Next.js handle optimization
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        
        {/* Loading indicator */}
        {(isLoading || generatingAI) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            {generatingAI && (
              <span className="ml-2 text-sm text-gray-600">Generating AI image...</span>
            )}
          </div>
        )}
        
        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && retryCount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Retry {retryCount}
          </div>
        )}
      </div>
    );
  } catch (error) {
    // Fallback render if main logic fails
    console.error('Error rendering ArticleImage:', error);
    
    const placeholderHeight = fill ? '100%' : (height || 300);
    const placeholderWidth = fill ? '100%' : (width || 600);
    
    return (
      <div 
        className={`${className || ''} bg-red-100 flex items-center justify-center text-red-400 text-sm border-2 border-dashed border-red-300 rounded-lg`}
        style={{
          height: typeof placeholderHeight === 'number' ? `${placeholderHeight}px` : placeholderHeight,
          width: typeof placeholderWidth === 'number' ? `${placeholderWidth}px` : placeholderWidth,
          minHeight: fill ? '200px' : undefined,
          ...style
        }}
      >
        <div className="text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <div>Image error</div>
        </div>
      </div>
    );
  }
}
