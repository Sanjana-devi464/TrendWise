// Client-side cache utilities for invalidating server-side cache

export const cacheUtils = {
  // Clear server-side cache for articles
  clearArticlesCache: async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/cache?type=articles', {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear articles cache');
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing articles cache:', error);
      return false;
    }
  },

  // Clear all server-side cache
  clearAllCache: async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/cache?type=all', {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear all cache');
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing all cache:', error);
      return false;
    }
  },

  // Get cache statistics
  getCacheStats: async (): Promise<any> => {
    try {
      const response = await fetch('/api/cache', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to get cache stats');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  },

  // Fetch articles with force refresh option
  fetchArticlesWithRefresh: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    forceRefresh?: boolean;
  } = {}): Promise<any> => {
    try {
      const searchParams = new URLSearchParams();
      
      if (params.page) searchParams.set('page', params.page.toString());
      if (params.limit) searchParams.set('limit', params.limit.toString());
      if (params.category) searchParams.set('category', params.category);
      if (params.search) searchParams.set('search', params.search);
      if (params.forceRefresh) searchParams.set('forceRefresh', 'true');
      
      const response = await fetch(`/api/articles?${searchParams.toString()}`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching articles:', error);
      return null;
    }
  }
};
