'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { cacheHelpers } from '@/lib/cache';
import { cacheUtils } from '@/lib/cache-utils';
import {
  TrendingUp,
  Zap,
  Globe,
  Hash,
  Activity,
  Loader2,
  CheckCircle,
  AlertCircle,
  Eye,
  Calendar,
  BarChart3,
  Sparkles,
  Brain,
  RefreshCw,
  MessageSquare,
  FileText,
  Check,
  X,
  Trash2,
  User,
  Clock,
  Database
} from 'lucide-react';

interface TrendingTopic {
  id?: string;
  title: string;
  keywords: string[];
  category: string;
  source: string;
  trendScore: number;
}

interface GeneratedArticle {
  id: string;
  title: string;
  slug: string;
  publishedAt: string;
  trending: {
    source: string;
    trendScore: number;
  };
}

interface Comment {
  _id: string;
  content: string;
  userName: string;
  userEmail: string;
  userImage?: string;
  createdAt: string;
  isApproved: boolean;
  articleId: {
    _id: string;
    title: string;
    slug: string;
  };
}

interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  readingTime: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  views: number;
  trending: {
    trendScore: number;
  };
}

type AdminView = 'dashboard' | 'comments' | 'articles' | 'trends';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [trends, setTrends] = useState<TrendingTopic[]>([]);
  const [recentArticles, setRecentArticles] = useState<GeneratedArticle[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingIds, setGeneratingIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({ 
    articles: { total: 0, published: 0, drafts: 0 }, 
    comments: { total: 0, pending: 0, approved: 0 },
    trends: 0 
  });
  const [userRole, setUserRole] = useState<string>('user');
  const [setupLoading, setSetupLoading] = useState(false);
  const [commentFilters, setCommentFilters] = useState({
    status: 'all',
    page: 1
  });
  const [articleFilters, setArticleFilters] = useState({
    search: '',
    category: '',
    published: 'all',
    page: 1
  });
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [cacheLoading, setCacheLoading] = useState(false);

  // Check user role on mount
  useEffect(() => {
    if (session?.user) {
      setUserRole(session.user.role || 'user');
    }
  }, [session]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    // SECURITY CHECK: Verify user email matches admin email
    const ADMIN_EMAIL = 'sanjanade464@gmail.com';
    const userEmail = session.user.email?.toLowerCase().trim();
    const adminEmail = ADMIN_EMAIL.toLowerCase().trim();
    const hasAdminRole = session.user.role === 'admin';
    
    // Only allow access if user is the exact admin email OR has admin role
    if (userEmail !== adminEmail && !hasAdminRole) {
      console.log('❌ Unauthorized access attempt:', {
        userEmail,
        adminEmail,
        hasAdminRole
      });
      router.push('/');
      return;
    }

    console.log('✅ Admin access verified for:', userEmail);
  }, [session, status, router]);

  // Setup admin access
  const setupAdmin = async () => {
    console.log('🚀 Starting admin setup...');
    setSetupLoading(true);
    try {
      console.log('📡 Making request to /api/admin/setup');
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📨 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to setup admin`);
      }

      console.log('✅ Admin setup successful!');
      
      // Update the local user role state to admin immediately
      setUserRole('admin');
      
      // Show success message
      alert('Admin access granted successfully! Refreshing session...');
      
      // Force refresh the session by getting a new session
      setTimeout(async () => {
        try {
          const newSession = await getSession();
          console.log('🔄 New session after admin setup:', newSession);
        } catch (sessionError) {
          console.error('Error refreshing session:', sessionError);
        }
        // Redirect to admin page to ensure fresh load
        if (typeof window !== 'undefined') {
          window.location.href = '/admin';
        }
      }, 1000);
    } catch (error) {
      console.error('💥 Error setting up admin:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to setup admin access';
      alert(`Setup failed: ${errorMessage}\n\nPlease check the browser console for more details.`);
    } finally {
      setSetupLoading(false);
    }
  };

  // Fetch data
  useEffect(() => {
    if (session?.user) {
      fetchDashboardData();
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      if (currentView === 'comments') {
        fetchComments();
      } else if (currentView === 'articles') {
        fetchArticles();
      }
    }
  }, [currentView, commentFilters, articleFilters, session]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [trendsRes, articlesRes] = await Promise.all([
        fetch('/api/trends?limit=20'),
        fetch('/api/generate')
      ]);

      if (trendsRes.ok) {
        const trendsData = await trendsRes.json();
        setTrends(trendsData.trends || []);
      }

      if (articlesRes.ok) {
        const articlesData = await articlesRes.json();
        setRecentArticles(articlesData.recentGenerations || []);
      }

      // Fetch admin stats if user is admin
      if (session?.user?.role === 'admin') {
        const [commentsStatsRes, articlesStatsRes] = await Promise.all([
          fetch('/api/admin/comments?limit=1'),
          fetch('/api/admin/articles?limit=1')
        ]);

        let commentStats = { pending: 0, approved: 0, total: 0 };
        let articleStats = { published: 0, drafts: 0, total: 0 };

        if (commentsStatsRes.ok) {
          const commentsData = await commentsStatsRes.json();
          commentStats = commentsData.stats;
        }

        if (articlesStatsRes.ok) {
          const articlesData = await articlesStatsRes.json();
          articleStats = articlesData.stats;
        }

        setStats({
          articles: articleStats,
          comments: commentStats,
          trends: trends.length
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: commentFilters.status,
        page: commentFilters.page.toString(),
        limit: '20'
      });
      
      const response = await fetch(`/api/admin/comments?${params}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
        setStats(prev => ({ ...prev, comments: data.stats }));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: articleFilters.page.toString(),
        limit: '20'
      });
      
      if (articleFilters.search) params.append('search', articleFilters.search);
      if (articleFilters.category) params.append('category', articleFilters.category);
      if (articleFilters.published !== 'all') params.append('published', articleFilters.published);
      
      const response = await fetch(`/api/admin/articles?${params}`);
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles);
        setStats(prev => ({ ...prev, articles: data.stats }));
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveComment = async (commentId: string) => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      });

      if (response.ok) {
        fetchComments();
        alert('Comment approved successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error approving comment:', error);
      alert('Failed to approve comment');
    }
  };

  const rejectComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to reject and delete this comment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' })
      });

      if (response.ok) {
        fetchComments();
        alert('Comment rejected and deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error rejecting comment:', error);
      alert('Failed to reject comment');
    }
  };

  const deleteArticle = async (articleId: string) => {
    if (!confirm('Are you sure you want to delete this article? This action cannot be undone and will also delete all associated comments.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (response.ok) {
        // Immediately update the UI by filtering out the deleted article
        setArticles(prev => prev.filter(article => article._id !== articleId));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          articles: {
            ...prev.articles,
            total: Math.max(0, prev.articles.total - 1),
            published: articles.find(a => a._id === articleId)?.isPublished 
              ? Math.max(0, prev.articles.published - 1) 
              : prev.articles.published,
            drafts: !articles.find(a => a._id === articleId)?.isPublished 
              ? Math.max(0, prev.articles.drafts - 1) 
              : prev.articles.drafts
          }
        }));
        
        // Trigger cache invalidation for immediate UI updates across the app
        cacheHelpers.invalidateClientCache('articles', { 
          action: 'delete', 
          articleId,
          timestamp: Date.now() 
        });
        
        alert('Article deleted successfully!');
        
        // Refresh the full list to ensure consistency
        setTimeout(() => fetchArticles(), 100);
      } else {
        throw new Error(data.error || 'Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete article';
      alert(`Delete failed: ${errorMessage}`);
      
      // Refresh the list in case of error
      fetchArticles();
    } finally {
      setLoading(false);
    }
  };

  // Generate unique ID for trends that don't have one
  const generateTrendId = useCallback((trend: TrendingTopic, index: number): string => {
    if (trend.id) return trend.id;
    
    // Create a more robust unique ID
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const titleSlug = trend.title
      .slice(0, 30)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return `trend-${trend.source}-${trend.category}-${index}-${titleSlug}-${timestamp}-${random}`;
  }, []);

  // Memoized trends with stable IDs
  const trendsWithIds = useMemo(() => {
    return trends.map((trend, index) => ({
      ...trend,
      uniqueId: generateTrendId(trend, index)
    }));
  }, [trends, generateTrendId]);

  const generateArticle = async (trend: TrendingTopic, uniqueId: string) => {
    setGeneratingIds(prev => new Set([...prev, uniqueId]));

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
        if (response.status === 401) {
          throw new Error('Please log in again - your session has expired');
        } else if (response.status === 403) {
          throw new Error('Admin access required - please contact an administrator');
        } else {
          throw new Error(data.error || 'Failed to generate article');
        }
      }

      fetchDashboardData();
      alert(`Article "${data.article.title}" generated successfully!`);
    } catch (error) {
      console.error('Error generating article:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate article');
    } finally {
      setGeneratingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(uniqueId);
        return newSet;
      });
    }
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

  const getTrendScoreColor = (score: number) => {
    if (score >= 80) return 'from-red-500 to-pink-500';
    if (score >= 60) return 'from-orange-500 to-yellow-500';
    if (score >= 40) return 'from-blue-500 to-cyan-500';
    return 'from-green-500 to-teal-500';
  };

  // Cache management functions
  const clearArticlesCache = async () => {
    setCacheLoading(true);
    try {
      const success = await cacheUtils.clearArticlesCache();
      if (success) {
        alert('Articles cache cleared successfully!');
        fetchDashboardData(); // Refresh data
      } else {
        alert('Failed to clear articles cache');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Failed to clear articles cache');
    } finally {
      setCacheLoading(false);
    }
  };

  const clearAllCache = async () => {
    setCacheLoading(true);
    try {
      const success = await cacheUtils.clearAllCache();
      if (success) {
        alert('All cache cleared successfully!');
        fetchDashboardData(); // Refresh data
      } else {
        alert('Failed to clear all cache');
      }
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Failed to clear all cache');
    } finally {
      setCacheLoading(false);
    }
  };

  const fetchCacheStats = async () => {
    try {
      const stats = await cacheUtils.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    }
  };

  // Load cache stats when component mounts
  useEffect(() => {
    fetchCacheStats();
  }, []);

  const renderNavigation = () => {
    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3, badge: undefined },
      { id: 'comments', label: 'Comments', icon: MessageSquare, badge: stats.comments.pending },
      { id: 'articles', label: 'Articles', icon: FileText, badge: undefined },
      { id: 'trends', label: 'Trends', icon: TrendingUp, badge: undefined }
    ];

    return (
      <div className="glass rounded-2xl p-2 mb-8">
        <div className="flex flex-wrap gap-2">
          {navItems.map((item, index) => (
            <button
              key={`nav-item-${item.id}-${index}`}
              onClick={() => setCurrentView(item.id as AdminView)}
              className={`flex items-center px-4 py-2 rounded-xl transition-all ${
                currentView === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white'
              }`}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
              {item.badge && item.badge > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderCommentManagement = () => (
    <div className="space-y-6">
      {/* Comment Filters */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Comment Management</h2>
          <div className="flex items-center space-x-4">
            <select
              value={commentFilters.status}
              onChange={(e) => setCommentFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Comments</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
            </select>
            <button
              onClick={fetchComments}
              className="btn-primary"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Comment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.comments.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Approved</p>
                <p className="text-2xl font-bold text-green-900">{stats.comments.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-900">{stats.comments.total}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="glass rounded-2xl p-6">
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment, commentIndex) => (
              <div
                key={`comment-${comment._id}-${commentIndex}`}
                className={`p-4 rounded-xl border-2 ${
                  comment.isApproved 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {comment.userImage ? (
                        <img 
                          src={comment.userImage} 
                          alt={comment.userName}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <User className="h-8 w-8 text-gray-400 bg-gray-100 rounded-full p-2" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{comment.userName}</p>
                        <p className="text-sm text-gray-500">{comment.userEmail}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        comment.isApproved 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {comment.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3 leading-relaxed">{comment.content}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>On: <a 
                        href={`/article/${comment.articleId.slug}`} 
                        target="_blank"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {comment.articleId.title}
                      </a></span>
                      <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!comment.isApproved && (
                      <button
                        onClick={() => approveComment(comment._id)}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => rejectComment(comment._id)}
                      className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="h-4 w-4 mr-1" />
                      {comment.isApproved ? 'Delete' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No comments found</p>
              <p className="text-sm">Comments will appear here when users leave them on articles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderArticleManagement = () => (
    <div className="space-y-6">
      {/* Article Filters */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Article Management</h2>
          <button
            onClick={fetchArticles}
            className="btn-primary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Article Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Published</p>
                <p className="text-2xl font-bold text-green-900">{stats.articles.published}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Drafts</p>
                <p className="text-2xl font-bold text-yellow-900">{stats.articles.drafts}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Total</p>
                <p className="text-2xl font-bold text-blue-900">{stats.articles.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search articles..."
              value={articleFilters.search}
              onChange={(e) => setArticleFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={articleFilters.published}
            onChange={(e) => setArticleFilters(prev => ({ ...prev, published: e.target.value, page: 1 }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Articles</option>
            <option value="true">Published</option>
            <option value="false">Drafts</option>
          </select>
        </div>
      </div>

      {/* Articles List */}
      <div className="glass rounded-2xl p-6">
        <div className="space-y-4">
          {articles.length > 0 ? (
            articles.map((article, articleIndex) => (
              <div
                key={`article-${article._id}-${articleIndex}`}
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{article.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        article.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-2">{article.excerpt}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {article.author}
                      </span>
                      <span className="flex items-center">
                        <Hash className="h-4 w-4 mr-1" />
                        {article.category}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {article.readingTime} min read
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(article.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {article.views || 0} views
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <a
                      href={`/article/${article.slug}`}
                      target="_blank"
                      className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </a>
                    <button
                      onClick={() => deleteArticle(article._id)}
                      className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No articles found</p>
              <p className="text-sm">Generated articles will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    const statsCards = [
      {
        id: 'total-articles',
        label: 'Total Articles',
        value: stats.articles.total,
        icon: BarChart3,
        gradient: 'from-blue-500 to-cyan-500'
      },
      {
        id: 'published-articles',
        label: 'Published Articles',
        value: stats.articles.published,
        icon: Zap,
        gradient: 'from-green-500 to-teal-500'
      },
      {
        id: 'pending-comments',
        label: 'Pending Comments',
        value: stats.comments.pending,
        icon: MessageSquare,
        gradient: 'from-purple-500 to-pink-500'
      },        {
        id: 'active-trends',
        label: 'Active Trends',
        value: trends.length,
        icon: TrendingUp,
        gradient: 'from-yellow-500 to-orange-500'
      }
    ];

    // Add cache management card
    const cacheManagementCard = {
      id: 'cache-management',
      label: 'Cache Management',
      icon: Database,
      gradient: 'from-indigo-500 to-purple-500'
    };

    return (
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {statsCards.map((card, cardIndex) => (
            <div key={`stats-card-${card.id}-${cardIndex}`} className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`p-3 bg-gradient-to-r ${card.gradient} rounded-xl`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cache Management Section */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 bg-gradient-to-r ${cacheManagementCard.gradient} rounded-xl`}>
                <cacheManagementCard.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cache Management</h3>
                <p className="text-sm text-gray-600">Monitor and manage server-side cache</p>
              </div>
            </div>
            <button
              onClick={fetchCacheStats}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={cacheLoading}
            >
              {cacheLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </button>
          </div>

          {cacheStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Articles Cache</p>
                <p className="text-xl font-bold text-gray-900">{cacheStats.stats?.articles?.size || 0}</p>
                <p className="text-xs text-gray-500">entries</p>
              </div>
              <div className="bg-white/50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Trends Cache</p>
                <p className="text-xl font-bold text-gray-900">{cacheStats.stats?.trends?.size || 0}</p>
                <p className="text-xs text-gray-500">entries</p>
              </div>
              <div className="bg-white/50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Users Cache</p>
                <p className="text-xl font-bold text-gray-900">{cacheStats.stats?.users?.size || 0}</p>
                <p className="text-xs text-gray-500">entries</p>
              </div>
              <div className="bg-white/50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Images Cache</p>
                <p className="text-xl font-bold text-gray-900">{cacheStats.stats?.images?.size || 0}</p>
                <p className="text-xs text-gray-500">entries</p>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={clearArticlesCache}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
              disabled={cacheLoading}
            >
              {cacheLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Clear Articles Cache
            </button>
            <button
              onClick={clearAllCache}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2"
              disabled={cacheLoading}
            >
              {cacheLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Clear All Cache
            </button>
          </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trending Topics */}
        <div className="lg:col-span-2">
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Trending Topics</h2>
              <div className="flex items-center text-sm text-gray-500">
                <Sparkles className="h-4 w-4 mr-1" />
                Live updates
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {trendsWithIds.length > 0 ? (
                trendsWithIds.map((trend, trendIndex) => {
                  const isGenerating = generatingIds.has(trend.uniqueId);

                  return (
                    <div
                      key={`trend-${trend.uniqueId}-${trendIndex}`}
                      className="p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getSourceIcon(trend.source)}
                            <span className="text-sm text-gray-500 capitalize">{trend.source}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getTrendScoreColor(trend.trendScore)}`}>
                              {trend.trendScore}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                            {trend.title}
                          </h3>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {trend.keywords.slice(0, 3).map((keyword, keywordIndex) => (
                              <span
                                key={`keyword-${trend.uniqueId}-${trendIndex}-${keywordIndex}-${keyword.replace(/\s+/g, '-')}`}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                #{keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => generateArticle(trend, trend.uniqueId)}
                          disabled={isGenerating}
                          className="ml-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Zap className="h-4 w-4 mr-1" />
                              Generate
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                  <p>No trending topics available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Articles */}
        <div>
          <div className="glass rounded-3xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Articles</h2>
            
            <div className="space-y-4">
              {recentArticles.length > 0 ? (
                recentArticles.map((article, recentIndex) => (
                  <div
                    key={`recent-article-${article.id}-${recentIndex}`}
                    className="p-4 bg-white rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {getSourceIcon(article.trending.source)}
                      <span className="text-sm text-gray-500 capitalize">
                        {article.trending.source}
                      </span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </div>
                      <a
                        href={`/article/${article.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No recent articles generated</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  // Show admin setup for non-admin users
  if (session.user.role !== 'admin' && userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="glass rounded-2xl p-8 text-center">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
            <p className="text-gray-600 mb-6">
              You need admin privileges to access the dashboard. Only the designated admin email can set up admin access.
            </p>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Current Role: <span className="font-semibold capitalize">{userRole}</span>
              </p>
              <p className="text-sm text-gray-500">
                Your Email: <span className="font-semibold">{session.user.email}</span>
              </p>
              {session.user.email?.toLowerCase().trim() === 'sanjanade464@gmail.com' ? (
                <button
                  onClick={setupAdmin}
                  disabled={setupLoading}
                  className="w-full btn-primary"
                >
                  {setupLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Setup Admin Access
                    </>
                  )}
                </button>
              ) : (
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-red-600">
                    Only the designated admin email (sanjanade464@gmail.com) can access this feature.
                  </p>
                </div>
              )}
              <button
                onClick={() => router.push('/')}
                className="w-full btn-secondary"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {session.user.name}! Manage your content and monitor activity.
              </p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="btn-secondary"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Navigation */}
        {renderNavigation()}

        {/* Content */}
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'comments' && renderCommentManagement()}
        {currentView === 'articles' && renderArticleManagement()}
        {currentView === 'trends' && renderDashboard()}
      </div>
    </div>
  );
}