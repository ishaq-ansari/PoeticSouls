import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Search } from 'lucide-react';
import CategoryTabs from '../components/CategoryTabs';
import PoemCard from '../components/PoemCard';
import { usePoemStore } from '../lib/store';

const categories = [
  { name: 'Feed', path: '/' },
  { name: 'Trending', path: '/trending' },
  { name: 'Challenges', path: '/challenges' },
  { name: 'My Poems', path: '/my-poems' },
];

const TrendingPage: React.FC = () => {
  const { trendingPoems, fetchTrendingPoems, isLoading } = usePoemStore();
  
  useEffect(() => {
    fetchTrendingPoems();
  }, [fetchTrendingPoems]);
  
  return (
    <div>
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search poems, tags, or poets..."
            className="input pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>
      
      <CategoryTabs categories={categories} />
      
      <div className="flex items-center mb-6">
        <TrendingUp size={24} className="text-primary-600 dark:text-primary-400 mr-2" />
        <h1 className="text-2xl font-serif font-bold">Trending Poems</h1>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : trendingPoems.length > 0 ? (
        <div>
          {trendingPoems.map((poem) => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No trending poems found</p>
          <Link to="/write" className="btn btn-primary">
            Write a poem
          </Link>
        </div>
      )}
    </div>
  );
};

export default TrendingPage;