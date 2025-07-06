// Performance monitoring utilities for TrendWise
'use client';

export interface PerformanceMetrics {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export interface PageLoadMetrics {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observer: PerformanceObserver | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObserver();
      this.monitorPageLoad();
    }
  }

  private initializeObserver() {
    if (!window.PerformanceObserver) return;

    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.processEntry(entry);
      }
    });

    // Observe different types of performance entries
    try {
      // Core Web Vitals
      this.observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observer.observe({ type: 'first-input', buffered: true });
      this.observer.observe({ type: 'layout-shift', buffered: true });
      
      // Navigation timing
      this.observer.observe({ type: 'navigation', buffered: true });
      
      // Resource timing
      this.observer.observe({ type: 'resource', buffered: true });
      
      // Long tasks
      this.observer.observe({ type: 'longtask', buffered: true });
    } catch (e) {
      console.warn('Some performance observers are not supported:', e);
    }
  }

  private processEntry(entry: PerformanceEntry) {
    switch (entry.entryType) {
      case 'largest-contentful-paint':
        this.recordMetric('LCP', entry.startTime, this.getLCPRating(entry.startTime));
        break;
      
      case 'first-input':
        const fidEntry = entry as PerformanceEventTiming;
        const fid = fidEntry.processingStart - fidEntry.startTime;
        this.recordMetric('FID', fid, this.getFIDRating(fid));
        break;
      
      case 'layout-shift':
        const clsEntry = entry as LayoutShift;
        if (!clsEntry.hadRecentInput) {
          this.recordMetric('CLS', clsEntry.value, this.getCLSRating(clsEntry.value));
        }
        break;
      
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        this.recordMetric('TTFB', navEntry.responseStart - navEntry.requestStart, 
          this.getTTFBRating(navEntry.responseStart - navEntry.requestStart));
        break;
      
      case 'longtask':
        this.recordMetric('Long Task', entry.duration, 'poor');
        break;
    }
  }

  private recordMetric(name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor') {
    const metric: PerformanceMetrics = {
      name,
      value,
      rating,
      timestamp: Date.now()
    };
    
    this.metrics.push(metric);
    
    // Send to analytics if configured
    this.sendToAnalytics(metric);
  }

  private monitorPageLoad() {
    // Monitor First Contentful Paint
    const paintObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('FCP', entry.startTime, this.getFCPRating(entry.startTime));
        }
      }
    });

    try {
      paintObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {
      console.warn('Paint observer not supported:', e);
    }

    // Monitor resource loading
    window.addEventListener('load', () => {
      this.calculateCumulativeLayoutShift();
      this.measureResourceTimings();
    });
  }

  private calculateCumulativeLayoutShift() {
    let clsValue = 0;
    const clsEntries = performance.getEntriesByType('layout-shift') as LayoutShift[];
    
    for (const entry of clsEntries) {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    }
    
    this.recordMetric('CLS', clsValue, this.getCLSRating(clsValue));
  }

  private measureResourceTimings() {
    const resources = performance.getEntriesByType('resource');
    const slowResources = resources.filter(resource => resource.duration > 1000);
    
    if (slowResources.length > 0) {
      this.recordMetric('Slow Resources', slowResources.length, 'needs-improvement');
    }
  }

  // Rating functions based on Core Web Vitals thresholds
  private getFCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 1800) return 'good';
    if (value <= 3000) return 'needs-improvement';
    return 'poor';
  }

  private getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 2500) return 'good';
    if (value <= 4000) return 'needs-improvement';
    return 'poor';
  }

  private getFIDRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }

  private getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }

  private getTTFBRating(value: number): 'good' | 'needs-improvement' | 'poor' {
    if (value <= 800) return 'good';
    if (value <= 1800) return 'needs-improvement';
    return 'poor';
  }

  private sendToAnalytics(metric: PerformanceMetrics) {
    // Send to analytics service (Google Analytics 4, etc.)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'web_vital', {
        event_category: 'Web Vitals',
        event_label: metric.name,
        value: Math.round(metric.value),
        custom_map: { metric_rating: metric.rating }
      });
    }

    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance Metric: ${metric.name}`, {
        value: metric.value,
        rating: metric.rating,
        timestamp: new Date(metric.timestamp)
      });
    }
  }

  // Public methods
  public getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }

  public getLatestMetrics(): Partial<PageLoadMetrics> {
    const latest: Partial<PageLoadMetrics> = {};
    
    ['FCP', 'LCP', 'FID', 'CLS', 'TTFB'].forEach(metricName => {
      const metric = this.metrics
        .filter(m => m.name === metricName)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      
      if (metric) {
        latest[metricName as keyof PageLoadMetrics] = metric.value;
      }
    });
    
    return latest;
  }

  public measureCustomMetric(name: string, startTime: number, endTime: number = performance.now()) {
    const duration = endTime - startTime;
    const rating = duration <= 1000 ? 'good' : duration <= 2500 ? 'needs-improvement' : 'poor';
    this.recordMetric(name, duration, rating);
  }

  public startMeasurement(name: string): () => void {
    const startTime = performance.now();
    return () => {
      this.measureCustomMetric(name, startTime);
    };
  }

  public disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions
export const measureAsync = async <T>(
  name: string,
  asyncFunction: () => Promise<T>
): Promise<T> => {
  const endMeasurement = performanceMonitor.startMeasurement(name);
  try {
    const result = await asyncFunction();
    endMeasurement();
    return result;
  } catch (error) {
    endMeasurement();
    throw error;
  }
};

export const measureSync = <T>(
  name: string,
  syncFunction: () => T
): T => {
  const endMeasurement = performanceMonitor.startMeasurement(name);
  try {
    const result = syncFunction();
    endMeasurement();
    return result;
  } catch (error) {
    endMeasurement();
    throw error;
  }
};

// React hook for performance monitoring
export const usePerformanceMonitor = () => {
  return {
    metrics: performanceMonitor.getMetrics(),
    latestMetrics: performanceMonitor.getLatestMetrics(),
    measureAsync,
    measureSync,
    startMeasurement: performanceMonitor.startMeasurement.bind(performanceMonitor),
  };
};

// Layout Shift interface (not available in standard lib)
interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}
