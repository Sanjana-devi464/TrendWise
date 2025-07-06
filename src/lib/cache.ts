import { LRUCache } from 'lru-cache';

// Create different cache instances for different types of data
const articleCache = new LRUCache<string, any>({
  max: 500, // Maximum number of items
  ttl: 1000 * 60 * 15, // 15 minutes TTL
  updateAgeOnGet: true,
  updateAgeOnHas: true,
});

const trendCache = new LRUCache<string, any>({
  max: 100,
  ttl: 1000 * 60 * 30, // 30 minutes TTL for trends
  updateAgeOnGet: true,
  updateAgeOnHas: true,
});

const userCache = new LRUCache<string, any>({
  max: 1000,
  ttl: 1000 * 60 * 60, // 1 hour TTL for user data
  updateAgeOnGet: true,
  updateAgeOnHas: true,
});

const imageCache = new LRUCache<string, any>({
  max: 200,
  ttl: 1000 * 60 * 60 * 24, // 24 hours TTL for image data
  updateAgeOnGet: true,
  updateAgeOnHas: true,
});

export const cache = {
  articles: articleCache,
  trends: trendCache,
  users: userCache,
  images: imageCache,
};

// Cache invalidation events
export const CACHE_EVENTS = {
  ARTICLE_DELETED: 'article:deleted',
  ARTICLE_UPDATED: 'article:updated',
  ARTICLE_CREATED: 'article:created',
  CACHE_INVALIDATED: 'cache:invalidated',
};

// Helper functions for cache operations
export const cacheHelpers = {
  // Generate cache key with parameters
  generateKey: (prefix: string, params: Record<string, any>): string => {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${prefix}:${sortedParams}`;
  },

  // Cached fetch wrapper
  cachedFetch: async <T>(
    cacheInstance: LRUCache<string, any>,
    key: string,
    fetchFn: () => Promise<T>,
    options?: { forceRefresh?: boolean }
  ): Promise<T> => {
    // Check if we should force refresh
    if (options?.forceRefresh) {
      const result = await fetchFn();
      cacheInstance.set(key, result);
      return result;
    }

    // Try to get from cache first
    const cached = cacheInstance.get(key);
    if (cached !== undefined) {
      return cached;
    }

    // Fetch and cache the result
    const result = await fetchFn();
    cacheInstance.set(key, result);
    return result;
  },

  // Clear specific cache
  clearCache: (type: 'articles' | 'trends' | 'users' | 'images' | 'all') => {
    if (type === 'all') {
      articleCache.clear();
      trendCache.clear();
      userCache.clear();
      imageCache.clear();
    } else {
      cache[type].clear();
    }
  },

  // Client-side cache invalidation using localStorage and storage events
  invalidateClientCache: (type: 'articles' | 'trends' | 'users' | 'images' | 'all', data?: any) => {
    if (typeof window !== 'undefined') {
      // Clear the in-memory cache
      cacheHelpers.clearCache(type);
      
      // Trigger storage event to notify other tabs/components
      const event = {
        type: CACHE_EVENTS.CACHE_INVALIDATED,
        cacheType: type,
        timestamp: Date.now(),
        data,
      };
      
      localStorage.setItem('cache-invalidation', JSON.stringify(event));
      
      // Dispatch custom event for same-tab components
      window.dispatchEvent(new CustomEvent('cache-invalidated', { 
        detail: event 
      }));
    }
  },

  // Set up cache invalidation listener
  setupCacheInvalidationListener: (callback: (event: any) => void) => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'cache-invalidation' && e.newValue) {
          try {
            const event = JSON.parse(e.newValue);
            callback(event);
          } catch (error) {
            console.error('Error parsing cache invalidation event:', error);
          }
        }
      };

      const handleCustomEvent = (e: Event) => {
        try {
          callback((e as CustomEvent).detail);
        } catch (error) {
          console.error('Error handling custom cache event:', error);
        }
      };

      // Add event listeners with error handling
      try {
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('cache-invalidated', handleCustomEvent);
      } catch (error) {
        console.error('Error adding event listeners:', error);
      }

      // Return cleanup function
      return () => {
        try {
          window.removeEventListener('storage', handleStorageChange);
          window.removeEventListener('cache-invalidated', handleCustomEvent);
        } catch (error) {
          console.error('Error removing event listeners:', error);
        }
      };
    }
    
    // Return empty cleanup function for server-side
    return () => {};
  },

  // Get cache stats
  getCacheStats: () => {
    return {
      articles: {
        size: articleCache.size,
        calculatedSize: articleCache.calculatedSize,
      },
      trends: {
        size: trendCache.size,
        calculatedSize: trendCache.calculatedSize,
      },
      users: {
        size: userCache.size,
        calculatedSize: userCache.calculatedSize,
      },
      images: {
        size: imageCache.size,
        calculatedSize: imageCache.calculatedSize,
      },
    };
  },
};

// Export individual caches for direct access
export { articleCache, trendCache, userCache, imageCache };
