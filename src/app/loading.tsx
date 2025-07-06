import { TrendingUp, Sparkles } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="relative mb-8">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-600 mx-auto opacity-75"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <TrendingUp className="h-8 w-8 text-blue-600 animate-pulse" />
          </div>
        </div>
        
        {/* Brand */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold gradient-text mb-2">TrendWise</h1>
          <p className="text-gray-600">Loading amazing content...</p>
        </div>
        
        {/* Loading dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Sparkles className="absolute top-1/4 left-1/4 h-6 w-6 text-blue-300 animate-pulse opacity-60" />
          <Sparkles className="absolute top-3/4 right-1/4 h-4 w-4 text-purple-300 animate-pulse opacity-40" style={{animationDelay: '1s'}} />
          <Sparkles className="absolute top-1/2 right-1/3 h-5 w-5 text-indigo-300 animate-pulse opacity-50" style={{animationDelay: '2s'}} />
        </div>
      </div>
    </div>
  );
}
