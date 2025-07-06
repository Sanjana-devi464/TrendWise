import Link from 'next/link';
import { FileX, Home, Search, TrendingUp, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/5 to-yellow-400/5 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="relative text-center max-w-2xl mx-auto">
        
        {/* 404 Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="p-6 bg-white rounded-full shadow-2xl">
              <FileX className="h-24 w-24 text-gray-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
        </div>
        
        {/* 404 Text */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold mb-4">
            <span className="gradient-text">404</span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            The page you&apos;re looking for seems to have wandered off into the digital wilderness. 
            But don&apos;t worry, we&apos;ll help you find your way back!
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="btn-primary text-lg px-8 py-4"
          >
            <Home className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          
          <Link
            href="/articles"
            className="btn-secondary text-lg px-8 py-4"
          >
            <Search className="h-5 w-5 mr-2" />
            Browse Articles
          </Link>
        </div>
        
        {/* Popular Links */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Popular Pages
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/"
              className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gray-50 transition-all duration-200 group shadow-sm"
            >
              <span className="font-medium text-gray-900">Home</span>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>
            <Link
              href="/articles"
              className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gray-50 transition-all duration-200 group shadow-sm"
            >
              <span className="font-medium text-gray-900">Articles</span>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>
            <Link
              href="/trends"
              className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gray-50 transition-all duration-200 group shadow-sm"
            >
              <span className="font-medium text-gray-900">Trending Topics</span>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-gray-50 transition-all duration-200 group shadow-sm"
            >
              <span className="font-medium text-gray-900">Sign In</span>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>
        
        {/* Fun message */}
        <div className="mt-8 text-sm text-gray-500">
          <p>Lost? That&apos;s okay! Even the best explorers sometimes take a wrong turn. 🧭</p>
        </div>
        
      </div>
    </div>
  );
}