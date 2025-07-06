'use client';

import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Eye, Tag, TrendingUp, ArrowRight } from 'lucide-react';
import { cache, cacheHelpers } from '@/lib/cache';

interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  tags: string[];
  publishedAt: string;
  readingTime: number;
  viewCount: number;
}

interface ArticleGridProps {
  limit?: number;
  category?: string;
  search?: string;
}

function ArticleGrid({ limit = 12, category, search }: ArticleGridProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Memoize cache key to prevent unnecessary recalculations
  const cacheKey = useMemo(() => {
    return cacheHelpers.generateKey('articles', { limit, category, search });
  }, [limit, category, search]);

  // Set up cache invalidation listener
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    try {
      cleanup = cacheHelpers.setupCacheInvalidationListener((event) => {
        if (event.cacheType === 'articles' || event.cacheType === 'all') {
          console.log('Cache invalidation detected, refreshing articles...');
          setRefreshTrigger(prev => prev + 1);
        }
      });
    } catch (error) {
      console.error('Error setting up cache invalidation listener:', error);
    }

    return () => {
      if (cleanup) {
        try {
          cleanup();
        } catch (error) {
          console.error('Error cleaning up cache invalidation listener:', error);
        }
      }
    };
  }, []);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use cached fetch helper with force refresh on cache invalidation
      const data = await cacheHelpers.cachedFetch(
        cache.articles,
        cacheKey,
        async () => {
          const params = new URLSearchParams();
          params.append('limit', limit.toString());
          
          if (category && category !== 'all') {
            params.append('category', category);
          }
          
          if (search) {
            params.append('search', search);
          }

          // Force refresh if cache was invalidated
          if (refreshTrigger > 0) {
            params.append('forceRefresh', 'true');
          }

          const response = await fetch(`/api/articles?${params}`, {
            headers: {
              'Cache-Control': refreshTrigger > 0 ? 'no-cache' : 'public, max-age=60',
            }
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch articles: ${response.status} ${response.statusText}`);
          }

          return await response.json();
        },
        { forceRefresh: refreshTrigger > 0 }
      );
      
      setArticles(data.articles || []);
    } catch (err) {
      console.error('Error fetching articles:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [cacheKey, category, search, limit, refreshTrigger]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {refreshTrigger > 0 && (
          <div className="col-span-full text-center py-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
              Refreshing articles...
            </div>
          </div>
        )}
        {[...Array(6)].map((_, index) => (
          <div key={index} className="card-modern animate-pulse">
            <div className="bg-gray-200 h-48 rounded-t-2xl mb-4"></div>
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex space-x-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="p-8 card-modern">
            <TrendingUp className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h3>
            <p className="text-gray-600 mb-6">Error loading articles: {error}</p>
            <button
              onClick={fetchArticles}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="p-8 card-modern">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Articles Found</h3>
            <p className="text-gray-600">Try adjusting your search or category filters.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {articles.map((article, index) => (
        <article key={article._id} className={`card-modern card-hover group animate-fade-in`} style={{animationDelay: `${index * 0.1}s`}}>
          <Link href={`/article/${article.slug}`}>
            <div className="relative overflow-hidden rounded-t-2xl">
              <Image
                src={article.featuredImage || '/api/placeholder/400/250'}
                alt={article.title}
                width={400}
                height={250}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                priority={index < 3} // Prioritize first 3 images for better LCP
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIGGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Rw="
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading={index < 3 ? "eager" : "lazy"} // Eager loading for above-the-fold images
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-900 rounded-full text-sm font-semibold shadow-lg">
                  {article.category}
                </span>
              </div>
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg">
                  <ArrowRight className="h-4 w-4 text-gray-900" />
                </div>
              </div>
            </div>
          </Link>
          
          <div className="p-6">
            <Link href={`/article/${article.slug}`}>
              <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2 group-hover:text-blue-600 leading-tight">
                {article.title}
              </h3>
            </Link>
            
            <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
              {article.excerpt}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center hover:text-blue-600 transition-colors">
                  <Calendar className="h-4 w-4 mr-1.5" />
                  {new Date(article.publishedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center hover:text-blue-600 transition-colors">
                  <Clock className="h-4 w-4 mr-1.5" />
                  {article.readingTime} min
                </div>
              </div>
              <div className="flex items-center hover:text-blue-600 transition-colors">
                <Eye className="h-4 w-4 mr-1.5" />
                {article.viewCount}
              </div>
            </div>
            
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 text-xs rounded-full border hover:bg-gray-200 transition-colors"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
                {article.tags.length > 2 && (
                  <span className="text-xs text-gray-500 py-1">
                    +{article.tags.length - 2} more
                  </span>
                )}
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export default memo(ArticleGrid);
