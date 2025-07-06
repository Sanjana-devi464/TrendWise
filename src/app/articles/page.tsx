import { Metadata } from 'next';
import ArticleGrid from '@/components/ArticleGrid';
import SearchBar from '@/components/SearchBar';
import CategoryFilter from '@/components/CategoryFilter';
import { BookOpen, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Articles - TrendWise',
  description: 'Browse all articles on TrendWise. Discover AI-generated content on trending topics in technology, business, and more.',
};

interface ArticlesPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { search, category } = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
            Discover
            <span className="block gradient-text">Amazing Articles</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
            Explore our collection of AI-generated articles covering the latest trends in technology, business, science, and more
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mt-8 animate-fade-in-delay-2">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">1000+</div>
              <div className="text-gray-600">Articles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">50+</div>
              <div className="text-gray-600">Topics Daily</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">24/7</div>
              <div className="text-gray-600">Updates</div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="mb-8 animate-fade-in-delay">
          <SearchBar initialValue={search} />
        </div>

        {/* Category Filter */}
        <div className="animate-fade-in-delay-2">
          <CategoryFilter selectedCategory={category} />
        </div>

        {/* Results Summary */}
        {(search || category) && (
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              {search && category && category !== 'all' 
                ? `Showing results for "${search}" in ${category}`
                : search 
                ? `Showing results for "${search}"`
                : category !== 'all' 
                ? `Showing ${category} articles`
                : 'Showing all articles'
              }
            </div>
          </div>
        )}

        {/* Articles Grid */}
        <div className="animate-fade-in-scale">
          <ArticleGrid 
            search={search}
            category={category}
            limit={12}
          />
        </div>
      </div>
    </div>
  );
}
