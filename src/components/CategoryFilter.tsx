'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Tag } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory?: string;
}

const categories = [
  { value: 'all', label: 'All Categories', icon: Filter },
  { value: 'Technology', label: 'Technology', color: 'from-blue-500 to-cyan-500' },
  { value: 'Business', label: 'Business', color: 'from-green-500 to-emerald-500' },
  { value: 'Science', label: 'Science', color: 'from-purple-500 to-violet-500' },
  { value: 'Health', label: 'Health', color: 'from-red-500 to-pink-500' },
  { value: 'Entertainment', label: 'Entertainment', color: 'from-yellow-500 to-orange-500' },
  { value: 'Sports', label: 'Sports', color: 'from-indigo-500 to-blue-500' },
  { value: 'Politics', label: 'Politics', color: 'from-gray-500 to-slate-500' },
  { value: 'General', label: 'General', color: 'from-teal-500 to-cyan-500' },
];

export default function CategoryFilter({ selectedCategory = 'all' }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams);
    
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    
    // Reset to first page when changing category
    params.delete('page');
    
    router.push(`/articles?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Filter by Category</h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.value;
          const Icon = category.icon || Tag;
          
          return (
            <button
              key={category.value}
              onClick={() => handleCategoryChange(category.value)}
              className={`
                relative flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group
                ${isSelected
                  ? `bg-gradient-to-r ${category.color || 'from-blue-500 to-blue-600'} text-white shadow-lg transform scale-105`
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md hover:scale-105 border border-gray-200'
                }
              `}
            >
              {category.value !== 'all' && (
                <div className={`
                  w-2 h-2 rounded-full mr-2 
                  ${isSelected 
                    ? 'bg-white/80' 
                    : `bg-gradient-to-r ${category.color || 'from-gray-400 to-gray-500'}`
                  }
                `} />
              )}
              {category.value === 'all' && (
                <Icon className={`w-4 h-4 mr-2 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
              )}
              <span className="truncate">{category.label}</span>
              
              {isSelected && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-transparent pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
