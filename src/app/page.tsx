import Link from "next/link";
import { ArrowRight, TrendingUp, Zap, Users, Brain, Globe, Rocket, Star } from "lucide-react";
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Lazy load components that are below the fold
const ArticleGrid = dynamic(() => import("@/components/ArticleGrid"), {
  loading: () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
        ))}
      </div>
    </div>
  )
});

const TrendingTopics = dynamic(() => import("@/components/TrendingTopics"), {
  loading: () => (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
        ))}
      </div>
    </div>
  )
});

// Metadata for better SEO and performance
export const metadata = {
  title: 'TrendWise - AI-Powered Trending Topics & Articles',
  description: 'Discover the latest trending topics and AI-generated articles with TrendWise. Stay informed with cutting-edge content.',
  openGraph: {
    title: 'TrendWise - AI-Powered Trending Topics & Articles',
    description: 'Discover the latest trending topics and AI-generated articles with TrendWise. Stay informed with cutting-edge content.',
    type: 'website',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Modern gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '1.5s'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 animate-fade-in">
              Your AI Companion To
              <span className="block gradient-text">
                Stay In Trends
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
              Discover trending topics and AI-generated articles that keep you informed about the latest developments in technology, business, and beyond.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-delay-2">
              <Link href="/articles" className="btn-primary text-lg px-8 py-4">
                Explore Articles
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/trends" className="btn-secondary text-lg px-8 py-4">
                View Trending Topics
                <TrendingUp className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-6 animate-fade-in-delay">
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Articles Generated</div>
            </div>
            <div className="glass rounded-2xl p-6 animate-fade-in-delay" style={{animationDelay: '0.3s'}}>
              <div className="text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600">Topics Covered Daily</div>
            </div>
            <div className="glass rounded-2xl p-6 animate-fade-in-delay" style={{animationDelay: '0.6s'}}>
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Real-time Updates</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              The Results Speak For
              <span className="gradient-text block">Themselves</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Our AI-powered platform delivers the most relevant and timely content, helping you stay ahead in your field
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card-modern p-8 text-center card-hover">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                AI-Powered Intelligence
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced AI analyzes trending topics and generates comprehensive, SEO-optimized articles in real-time.
              </p>
            </div>

            <div className="card-modern p-8 text-center card-hover">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl mb-6">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Real-Time Trends
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Stay updated with the latest trending topics from Google Trends and social media platforms.
              </p>
            </div>

            <div className="card-modern p-8 text-center card-hover">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mb-6">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Global Coverage
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Access trending topics and insights from around the world, covering multiple languages and regions.
              </p>
            </div>

            <div className="card-modern p-8 text-center card-hover">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Lightning Fast
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant access to trending topics and generated articles with our optimized infrastructure.
              </p>
            </div>

            <div className="card-modern p-8 text-center card-hover">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-2xl mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Community Driven
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Join discussions, share insights, and engage with a community of forward-thinking individuals.
              </p>
            </div>

            <div className="card-modern p-8 text-center card-hover">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl mb-6">
                <Rocket className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                SEO Optimized
              </h3>
              <p className="text-gray-600 leading-relaxed">
                All content is automatically optimized for search engines to maximize reach and visibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Topics Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-600 to-teal-600 text-white text-sm font-medium mb-6">
              <TrendingUp className="h-4 w-4 mr-2" />
              Live Trending Topics
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              What's <span className="gradient-text">Trending Now</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI continuously monitors trending topics across the web and generates 
              comprehensive articles that keep you informed about the latest developments.
            </p>
          </div>
          
          <Suspense fallback={
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
                ))}
              </div>
            </div>
          }>
            <TrendingTopics limit={6} showGenerateButton={false} />
          </Suspense>
          
          <div className="text-center mt-12">
            <Link href="/trends" className="btn-secondary text-lg px-8 py-4">
              View All Trends
              <TrendingUp className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium mb-6">
              <Brain className="h-4 w-4 mr-2" />
              AI-Generated Content
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Latest <span className="gradient-text">Articles</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover our latest AI-generated articles covering trending topics, 
              technology insights, and industry developments.
            </p>
          </div>
          
          <Suspense fallback={
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
                ))}
              </div>
            </div>
          }>
            <ArticleGrid limit={6} />
          </Suspense>
          
          <div className="text-center mt-12">
            <Link href="/articles" className="btn-primary text-lg px-8 py-4">
              View All Articles
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Star className="h-8 w-8 text-yellow-400 mr-2" />
            <Star className="h-8 w-8 text-yellow-400 mr-2" />
            <Star className="h-8 w-8 text-yellow-400 mr-2" />
            <Star className="h-8 w-8 text-yellow-400 mr-2" />
            <Star className="h-8 w-8 text-yellow-400" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Stay Ahead of the Curve?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of readers who trust TrendWise for the latest insights and trending topics in their industry.
          </p>
          <Link href="/articles" className="inline-flex items-center px-10 py-5 bg-white text-blue-600 font-bold rounded-2xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-xl hover:shadow-2xl text-lg">
            Start Reading Today
            <ArrowRight className="ml-3 h-6 w-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
