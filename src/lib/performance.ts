// Performance monitoring utility for TrendWise
// This utility helps track Core Web Vitals and other performance metrics

import React from 'react';

// Extend window object for gtag
declare global {
  interface Window {
    gtag?: (command: string, action: string, parameters?: any) => void;
  }
}

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export interface CustomMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  imageLoadTime: number;
  interactionDelay: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private customMetrics: Partial<CustomMetrics> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers() {
    // Performance Observer for various metrics
    if ('PerformanceObserver' in window) {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
        this.metrics.lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // FID Observer
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      this.observers.push(fidObserver);

      // CLS Observer
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cls = clsValue;
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);
    }

    // FCP from Navigation Timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime;
      }
    }
  }

  // Measure API response time
  public measureApiCall<T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> {
    const startTime = performance.now();
    
    return apiCall().then(
      (result) => {
        const duration = performance.now() - startTime;
        this.customMetrics.apiResponseTime = duration;
        
        // Send to analytics if available
        this.sendMetric('api_response_time', duration, { endpoint });
        return result;
      },
      (error) => {
        const duration = performance.now() - startTime;
        this.sendMetric('api_error_time', duration, { endpoint, error: error.message });
        throw error;
      }
    );
  }

  // Measure image load time
  public measureImageLoad(imageElement: HTMLImageElement): void {
    const startTime = performance.now();
    
    const handleLoad = () => {
      const duration = performance.now() - startTime;
      this.customMetrics.imageLoadTime = duration;
      this.sendMetric('image_load_time', duration, { src: imageElement.src });
      
      imageElement.removeEventListener('load', handleLoad);
      imageElement.removeEventListener('error', handleError);
    };
    
    const handleError = () => {
      const duration = performance.now() - startTime;
      this.sendMetric('image_error_time', duration, { src: imageElement.src });
      
      imageElement.removeEventListener('load', handleLoad);
      imageElement.removeEventListener('error', handleError);
    };
    
    imageElement.addEventListener('load', handleLoad);
    imageElement.addEventListener('error', handleError);
  }

  // Get current metrics
  public getMetrics(): PerformanceMetrics & CustomMetrics {
    return {
      ...this.metrics,
      ...this.customMetrics,
    } as PerformanceMetrics & CustomMetrics;
  }

  // Send metric to analytics service
  private sendMetric(name: string, value: number, labels: Record<string, any> = {}) {
    // In production, send to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance Metric: ${name}`, {
        value: Math.round(value),
        labels,
        timestamp: new Date().toISOString(),
      });
    }

    // Example: Send to Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: Math.round(value),
        ...labels,
      });
    }

    // Example: Send to custom analytics endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'performance',
          metric: name,
          value: Math.round(value),
          labels,
          timestamp: Date.now(),
          url: typeof window !== 'undefined' ? window.location.href : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        }),
      }).catch(() => {
        // Silently fail analytics
      });
    }
  }

  // Report Core Web Vitals
  public reportWebVitals() {
    const metrics = this.getMetrics();
    
    // Grade each metric
    const grades = {
      fcp: metrics.fcp <= 1800 ? 'good' : metrics.fcp <= 3000 ? 'needs-improvement' : 'poor',
      lcp: metrics.lcp <= 2500 ? 'good' : metrics.lcp <= 4000 ? 'needs-improvement' : 'poor',
      fid: metrics.fid <= 100 ? 'good' : metrics.fid <= 300 ? 'needs-improvement' : 'poor',
      cls: metrics.cls <= 0.1 ? 'good' : metrics.cls <= 0.25 ? 'needs-improvement' : 'poor',
    };

    console.group('🚀 Core Web Vitals Report');
    console.log(`FCP: ${metrics.fcp?.toFixed(2)}ms (${grades.fcp})`);
    console.log(`LCP: ${metrics.lcp?.toFixed(2)}ms (${grades.lcp})`);
    console.log(`FID: ${metrics.fid?.toFixed(2)}ms (${grades.fid})`);
    console.log(`CLS: ${metrics.cls?.toFixed(3)} (${grades.cls})`);
    console.groupEnd();

    // Send overall score
    const overallScore = Object.values(grades).filter(grade => grade === 'good').length / 4;
    this.sendMetric('core_web_vitals_score', overallScore * 100);

    return { metrics, grades, overallScore };
  }

  // Clean up observers
  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = getPerformanceMonitor();
  
  return {
    measureApiCall: monitor.measureApiCall.bind(monitor),
    measureImageLoad: monitor.measureImageLoad.bind(monitor),
    getMetrics: monitor.getMetrics.bind(monitor),
    reportWebVitals: monitor.reportWebVitals.bind(monitor),
  };
}

// Utility function to measure component render time
export function measureRender<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>,
  componentName: string
): React.ComponentType<T> {
  return function MeasuredComponent(props: T) {
    const monitor = getPerformanceMonitor();
    
    React.useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const duration = performance.now() - startTime;
        monitor.measureApiCall(
          () => Promise.resolve(duration),
          `component_render_${componentName}`
        );
      };
    }, []);
    
    return React.createElement(WrappedComponent, props);
  };
}

// Debounce function for search and other inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Cache management
export class CacheManager {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }
}

// Create a global cache instance
export const globalCache = new CacheManager();

// Preload critical resources
export function preloadResource(href: string, as: string, type?: string): void {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  
  document.head.appendChild(link);
}

// Auto-initialize performance monitoring in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  getPerformanceMonitor();
  
  // Report Web Vitals after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      getPerformanceMonitor().reportWebVitals();
    }, 1000);
  });
}
