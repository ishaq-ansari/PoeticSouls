import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenSquare } from 'lucide-react';
import CategoryTabs from '../components/CategoryTabs';
import PoemCard from '../components/PoemCard';
import { useAuthStore, usePoemStore } from '../lib/store';

const categories = [
  { name: 'Feed', path: '/' },
  { name: 'Trending', path: '/trending' },
  { name: 'Challenges', path: '/challenges' },
  { name: 'My Poems', path: '/my-poems' },
];

const MyPoemsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { userPoems, fetchUserPoems, isLoading } = usePoemStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user && user.id) {
      fetchUserPoems(user.id);
    } else {
      navigate('/signin');
    }
  }, [user, fetchUserPoems, navigate]);
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-serif font-bold mb-4">Sign in to view your poems</h2>
        <Link to="/signin" className="btn btn-primary">
          Sign In
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <CategoryTabs categories={categories} />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif font-bold">My Poems</h1>
        <Link to="/write" className="btn btn-primary flex items-center space-x-2">
          <PenSquare size={18} />
          <span>Write New Poem</span>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : userPoems.length > 0 ? (
        <div>
          {userPoems.map((poem) => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't written any poems yet</p>
          <Link to="/write" className="btn btn-primary">
            Write your first poem
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyPoemsPage;