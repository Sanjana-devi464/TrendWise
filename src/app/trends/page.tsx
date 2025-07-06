import { Metadata } from 'next';
import TrendingTopics from '@/components/TrendingTopics';
import { TrendingUp, Globe, Zap, Activity } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trending Topics - TrendWise',
  description: 'Discover the latest trending topics from Google Trends and Twitter. Stay updated with what\'s happening in the world.',
  keywords: 'trending topics, Google Trends, Twitter trends, viral content, hot topics',
};

export default function TrendsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-2xl">
                <TrendingUp className="h-16 w-16 text-white animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            What&apos;s
            <span className="block gradient-text">Trending Now</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
            Stay ahead of the curve with real-time trending topics from around the world. Discover what&apos;s capturing attention across the web.
          </p>
          
          {/* Live Stats */}
          <div className="flex justify-center gap-8 mt-8 animate-fade-in-delay-2">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-3xl font-bold text-red-500">
                <Activity className="h-8 w-8" />
                LIVE
              </div>
              <div className="text-gray-600">Real-time Data</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">50+</div>
              <div className="text-gray-600">Topics Updated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">Global</div>
              <div className="text-gray-600">Coverage</div>
            </div>
          </div>
        </div>

        {/* Enhanced Source Tabs */}
        <div className="mb-12 animate-fade-in-delay">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 max-w-2xl mx-auto">
            <div className="grid grid-cols-3 gap-2">
              <button className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-md font-semibold transition-all duration-200 transform hover:scale-105">
                <Globe className="h-5 w-5 mr-2" />
                All Sources
              </button>
              <button className="flex items-center justify-center px-6 py-4 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium group">
                <svg className="h-5 w-5 mr-2 group-hover:text-blue-500 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center px-6 py-4 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium group">
                <svg className="h-5 w-5 mr-2 group-hover:text-black transition-colors" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter
              </button>
            </div>
          </div>
        </div>

        {/* Real-time indicator */}
        <div className="text-center mb-8 animate-fade-in-delay-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Updated in real-time • Last refresh: just now
          </div>
        </div>

        {/* Trending Topics Grid */}
        <div className="animate-fade-in-scale">
          <TrendingTopics limit={20} />
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
            <Zap className="h-12 w-12 mx-auto mb-4 animate-bounce" />
            <h2 className="text-3xl font-bold mb-4">Stay Ahead of Trends</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Get instant notifications when new trending topics emerge in your areas of interest.
            </p>
            <button className="btn-primary !bg-white !text-blue-600 hover:!bg-gray-50">
              Enable Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
