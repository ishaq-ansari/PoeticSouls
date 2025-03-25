import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, Share2, Bookmark } from 'lucide-react';
import { useAuthStore, usePoemStore } from '../lib/store';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Poem = Database['public']['Tables']['poems']['Row'] & {
  author: Profile;
  tags: { id: string; name: string }[];
};

interface PoemCardProps {
  poem: Poem;
  showFullContent?: boolean;
}

const PoemCard: React.FC<PoemCardProps> = ({ poem, showFullContent = false }) => {
  const { user } = useAuthStore();
  const { likePoem, bookmarkPoem } = usePoemStore();
  const [isLiked, setIsLiked] = React.useState(false);
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  // In a real app, we would check if the user has liked or bookmarked the poem
  React.useEffect(() => {
    const checkInteractions = async () => {
      if (!user) return;
      
      // Check if liked
      const { data: likeData } = await supabase
        .from('likes')
        .select('*')
        .eq('poem_id', poem.id)
        .eq('user_id', user.id)
        .single();
      
      setIsLiked(!!likeData);
      
      // Check if bookmarked
      const { data: bookmarkData } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('poem_id', poem.id)
        .eq('user_id', user.id)
        .single();
      
      setIsBookmarked(!!bookmarkData);
    };
    
    checkInteractions();
  }, [poem.id, user]);

  const handleLike = () => {
    if (!user) {
      // Redirect to sign in
      return;
    }
    
    likePoem(poem.id);
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    if (!user) {
      // Redirect to sign in
      return;
    }
    
    bookmarkPoem(poem.id);
    setIsBookmarked(!isBookmarked);
  };

  // Format the poem content for display
  const formatContent = (content: string) => {
    if (showFullContent) {
      return content;
    }
    
    // For card view, show only first few lines
    const lines = content.split('\n');
    const previewLines = lines.slice(0, 2);
    return previewLines.join('\n') + (lines.length > 2 ? '...' : '');
  };

  return (
    <div className="card p-6 mb-6">
      <Link to={`/poem/${poem.id}`}>
        <h2 className="text-2xl font-serif font-bold mb-2">{poem.title}</h2>
      </Link>
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        by{' '}
        <Link to={`/profile/${poem.author.id}`} className="hover:text-primary-600 dark:hover:text-primary-400">
          {poem.author.display_name || poem.author.username}
        </Link>
      </div>
      
      <div className="whitespace-pre-line mb-4 font-serif text-lg">
        {formatContent(poem.content)}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {poem.tags.map((tag) => (
          <Link 
            key={tag.id} 
            to={`/tag/${tag.tag_id.name}`}
            className="tag"
          >
            #{tag.tag_id.name}
          </Link>
        ))}
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-dark-600">
        <div className="flex items-center space-x-6">
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <Heart size={20} className={isLiked ? 'fill-current' : ''} />
            <span>{poem.likes_count}</span>
          </button>
          
          <Link 
            to={`/poem/${poem.id}`}
            className="flex items-center space-x-1 text-gray-600 dark:text-gray-400"
          >
            <MessageSquare size={20} />
            <span>{poem.comments_count}</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleBookmark}
            className={`${isBookmarked ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
          
          <button className="text-gray-600 dark:text-gray-400">
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PoemCard;