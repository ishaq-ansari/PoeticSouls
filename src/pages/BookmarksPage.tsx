import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import PoemCard from '../components/PoemCard';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Poem = Database['public']['Tables']['poems']['Row'] & {
  author: Profile;
  tags: { id: string; name: string }[];
};

const BookmarksPage: React.FC = () => {
  const { user } = useAuthStore();
  const [bookmarkedPoems, setBookmarkedPoems] = useState<Poem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchBookmarkedPoems = async () => {
      // Check if user exists before accessing user.id
      if (!user || !user.id) {
        navigate('/signin');
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Get bookmarked poem IDs
        const { data: bookmarks, error: bookmarksError } = await supabase
          .from('bookmarks')
          .select('poem_id')
          .eq('user_id', user.id);
        
        if (bookmarksError) throw bookmarksError;
        
        if (bookmarks.length === 0) {
          setBookmarkedPoems([]);
          setIsLoading(false);
          return;
        }
        
        // Get the actual poems
        const poemIds = bookmarks.map((bookmark) => bookmark.poem_id);
        
        const { data: poems, error: poemsError } = await supabase
          .from('poems')
          .select(`
            *,
            author:profiles(*),
            tags:poem_tags(tag_id(id, name))
          `)
          .in('id', poemIds)
          .eq('is_published', true);
        
        if (poemsError) throw poemsError;
        
        setBookmarkedPoems(poems as unknown as Poem[]);
      } catch (error) {
        console.error('Error fetching bookmarked poems:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookmarkedPoems();
  }, [user, navigate]);
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-serif font-bold mb-4">Sign in to view your bookmarks</h2>
        <Link to="/signin" className="btn btn-primary">
          Sign In
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Bookmark size={24} className="text-primary-600 dark:text-primary-400 mr-2" />
        <h1 className="text-2xl font-serif font-bold">Bookmarked Poems</h1>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : bookmarkedPoems.length > 0 ? (
        <div>
          {bookmarkedPoems.map((poem) => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 card">
          <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't bookmarked any poems yet</p>
          <Link to="/" className="btn btn-primary">
            Explore Poems
          </Link>
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;