import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Calendar, Sparkles } from 'lucide-react';
import CategoryTabs from '../components/CategoryTabs';
import PoemCard from '../components/PoemCard';
import { usePoemStore } from '../lib/store';

const categories = [
  { name: 'Feed', path: '/' },
  { name: 'Trending', path: '/trending' },
  { name: 'Challenges', path: '/challenges' },
  { name: 'My Poems', path: '/my-poems' },
];

const HomePage: React.FC = () => {
  const { poems, fetchPoems, isLoading } = usePoemStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchPoems();
  }, [fetchPoems]);
  
  // Mock data for featured sections
  const featuredChallenge = {
    id: 'challenge-1',
    title: 'Echoes of Solitude',
    description: 'Write a poem that explores the beauty found in moments of solitude and self-reflection.',
    endDate: '2025-05-15',
    participants: 127,
  };
  
  const popularTags = [
    { id: 'tag-1', name: 'love', count: 342 },
    { id: 'tag-2', name: 'nature', count: 256 },
    { id: 'tag-3', name: 'reflection', count: 189 },
    { id: 'tag-4', name: 'melancholy', count: 145 },
    { id: 'tag-5', name: 'hope', count: 132 },
  ];
  
  return (
    <div>
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search poems, tags, or poets..."
            className="input pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
      </div>
      
      <CategoryTabs categories={categories} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-serif font-bold mb-6">Recent Poems</h2>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          ) : poems.length > 0 ? (
            <div>
              {poems.map((poem) => (
                <PoemCard key={poem.id} poem={poem} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 card">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No poems found</p>
              <Link to="/write" className="btn btn-primary">
                Write the first poem
              </Link>
            </div>
          )}
        </div>
        
        <div>
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif font-bold">Featured Challenge</h3>
              <Calendar size={20} className="text-primary-600 dark:text-primary-400" />
            </div>
            
            <h4 className="text-lg font-medium mb-2">{featuredChallenge.title}</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{featuredChallenge.description}</p>
            
            <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
              <span>Ends: {new Date(featuredChallenge.endDate).toLocaleDateString()}</span>
              <span>{featuredChallenge.participants} participants</span>
            </div>
            
            <Link to={`/challenge/${featuredChallenge.id}`} className="btn btn-primary w-full">
              Join Challenge
            </Link>
          </div>
          
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif font-bold">Trending Tags</h3>
              <TrendingUp size={20} className="text-primary-600 dark:text-primary-400" />
            </div>
            
            <div className="space-y-3">
              {popularTags.map((tag) => (
                <Link 
                  key={tag.id}
                  to={`/tag/${tag.name}`}
                  className="flex justify-between items-center p-2 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-md"
                >
                  <span className="tag">#{tag.name}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{tag.count} poems</span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif font-bold">Discover</h3>
              <Sparkles size={20} className="text-primary-600 dark:text-primary-400" />
            </div>
            
            <Link to="/random" className="btn btn-outline w-full mb-3">
              Random Poem
            </Link>
            
            <Link to="/poets" className="btn btn-outline w-full">
              Explore Poets
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;