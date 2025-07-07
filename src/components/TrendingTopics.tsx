'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useSession } from 'next-auth/react';
import { Sparkles, Activity, Hash, Globe, Loader2, Zap, ArrowRight } from 'lucide-react';

interface TrendingTopic {
  title: string;
  keywords: string[];
  category: string;
  source: string;
  trendScore: number;
}

interface TrendingTopicsProps {
  limit?: number;
  source?: 'google' | 'twitter' | 'all';
  showGenerateButton?: boolean;
}

function TrendingTopics({ 
  limit = 10, 
  source = 'all', 
  showGenerateButton = true 
}: TrendingTopicsProps) {
  const [trends, setTrends] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<'google' | 'twitter' | 'all'>(source);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const { data: session } = useSession();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    setLastUpdated(new Date().toLocaleTimeString());
  }, []);

  const fetchTrends = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append('source', selectedSource);
      params.append('limit', limit.toString());

      console.log(`Fetching trends: source=${selectedSource}, limit=${limit}`);

      const response = await fetch(`/api/trends?${params}`, {
        cache: 'no-store' // Always fetch fresh data
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'API returned error status');
      }
      
      setTrends(data.trends || []);
      setLastUpdated(new Date().toLocaleTimeString());
      console.log(`Successfully loaded ${data.trends?.length || 0} trends`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching trends:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSource, limit]);

  useEffect(() => {
    if (!mounted) return; // Prevent SSR issues
    
    fetchTrends();
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(fetchTrends, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchTrends, mounted]);

  const generateArticle = async (trend: TrendingTopic) => {
    if (!session?.user) {
      alert('Please sign in to generate articles');
      return;
    }

    const trendId = `${trend.title}-${trend.source}`;
    setGeneratingId(trendId);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trend: trend,
          autoPublish: true
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate article');
      }

      // Show success message
      alert(`Article "${data.article.title}" generated successfully!`);
      
      // Optionally redirect to the article
      if (data.article.slug) {
        window.open(`/article/${data.article.slug}`, '_blank');
      }

    } catch (error) {
      console.error('Error generating article:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate article');
    } finally {
      setGeneratingId(null);
    }
  };

  const getTrendScoreColor = (score: number) => {
    if (score >= 80) return 'from-red-500 to-pink-500 text-white';
    if (score >= 60) return 'from-orange-500 to-yellow-500 text-white';
    if (score >= 40) return 'from-blue-500 to-cyan-500 text-white';
    return 'from-green-500 to-teal-500 text-white';
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'google':
        return <Globe className="h-4 w-4" />;
      case 'twitter':
        return <Hash className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getCategoryGradient = (category: string) => {
    const gradients = [
      'from-purple-500 to-indigo-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-teal-500',
      'from-yellow-500 to-orange-500',
      'from-red-500 to-pink-500',
      'from-indigo-500 to-purple-500',
    ];
    const hash = category.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 justify-center">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-12 w-32 bg-gray-200 rounded-full animate-pulse"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="card-modern animate-pulse">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="flex space-x-2 mb-4">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="glass rounded-2xl p-8 max-w-lg mx-auto">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Trends</h3>
          <div className="text-gray-600 mb-4">
            <p className="mb-2">{error}</p>
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mb-4">
              <p><strong>Troubleshooting:</strong></p>
              <ul className="text-left list-disc list-inside space-y-1">
                <li>Check your internet connection</li>
                <li>Verify API keys are configured in .env.local</li>
                <li>Check browser console for detailed errors</li>
                <li>Fallback trends should load automatically</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchTrends}
              className="btn-primary"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Source Filter */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => setSelectedSource('all')}
          className={`px-6 py-3 rounded-full font-medium transition-all ${
            selectedSource === 'all'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Activity className="h-4 w-4 inline-block mr-2" />
          All Sources
        </button>
        <button
          onClick={() => setSelectedSource('google')}
          className={`px-6 py-3 rounded-full font-medium transition-all ${
            selectedSource === 'google'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Globe className="h-4 w-4 inline-block mr-2" />
          Google Trends
        </button>
        <button
          onClick={() => setSelectedSource('twitter')}
          className={`px-6 py-3 rounded-full font-medium transition-all ${
            selectedSource === 'twitter'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Hash className="h-4 w-4 inline-block mr-2" />
          Social Media
        </button>
        <button
          onClick={fetchTrends}
          disabled={loading}
          className="px-6 py-3 rounded-full font-medium bg-green-600 text-white hover:bg-green-700 transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 inline-block mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 inline-block mr-2" />
          )}
          Refresh
        </button>
      </div>

      {/* Status Indicator */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-gray-200">
          <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
          <span className="text-sm text-gray-600">
            {loading ? 'Loading trends...' : `${trends.length} trends loaded`}
          </span>
          {lastUpdated && (
            <>
              <span className="text-gray-400">•</span>
              <span className="text-xs text-gray-500">Updated {lastUpdated}</span>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : trends.length === 0 ? (
        <div className="text-center py-12">
          <div className="glass rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Trends Found</h3>
            <p className="text-gray-600">
              No trending topics available for the selected source. Try refreshing or selecting a different source.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trends.map((trend, index) => {
            const trendId = `${trend.title}-${trend.source}`;
            const isGenerating = generatingId === trendId;
            
            return (
              <div
                key={trendId}
                className="card-modern hover:scale-105 transition-all duration-300 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      {getSourceIcon(trend.source)}
                      <span className="capitalize font-medium">{trend.source}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getTrendScoreColor(trend.trendScore)}`}>
                      {trend.trendScore}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {trend.title}
                  </h3>

                  {/* Category */}
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getCategoryGradient(trend.category)}`}>
                      {trend.category}
                    </span>
                  </div>

                  {/* Keywords */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {trend.keywords.slice(0, 3).map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        #{keyword}
                      </span>
                    ))}
                    {trend.keywords.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        +{trend.keywords.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Generate Button */}
                  {showGenerateButton && mounted && (
                    <button
                      onClick={() => generateArticle(trend)}
                      disabled={isGenerating || !session?.user}
                      className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Article...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                          Generate Article
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  )}

                  {mounted && !session?.user && showGenerateButton && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Sign in to generate articles
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Last Updated */}
      {mounted && (
        <div className="text-center text-sm text-gray-500">
          <p>
            Last updated: {lastUpdated} | 
            Auto-refreshes every 5 minutes
          </p>
        </div>
      )}
    </div>
  );
}

export default memo(TrendingTopics);
