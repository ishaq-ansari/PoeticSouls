import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, MessageSquare, Share2, Bookmark, Send, X } from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Poem = Database['public']['Tables']['poems']['Row'] & {
  author: Profile;
  tags: { id: string; name: string }[];
};
type Comment = Database['public']['Tables']['comments']['Row'] & {
  author: Profile;
  replies?: (Comment & { author: Profile })[];
};

const PoemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [poem, setPoem] = useState<Poem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  
  useEffect(() => {
    const fetchPoemDetails = async () => {
      if (!id) return;
      
      setIsLoading(true);
      
      try {
        // Fetch poem with author and tags
        const { data: poemData, error: poemError } = await supabase
          .from('poems')
          .select(`
            *,
            author:profiles(*),
            tags:poem_tags(tag_id(id, name))
          `)
          .eq('id', id)
          .single();
        
        if (poemError) throw poemError;
        
        setPoem(poemData as unknown as Poem);
        
        // Fetch comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('comments')
          .select(`
            *,
            author:profiles(*)
          `)
          .eq('poem_id', id)
          .is('parent_id', null)
          .order('created_at', { ascending: true });
        
        if (commentsError) throw commentsError;
        
        // Fetch replies for each comment
        const commentsWithReplies = await Promise.all(
          commentsData.map(async (comment) => {
            const { data: replies, error: repliesError } = await supabase
              .from('comments')
              .select(`
                *,
                author:profiles(*)
              `)
              .eq('parent_id', comment.id)
              .order('created_at', { ascending: true });
            
            if (repliesError) throw repliesError;
            
            return {
              ...comment,
              replies: replies as unknown as (Comment & { author: Profile })[],
            };
          })
        );
        
        setComments(commentsWithReplies as unknown as Comment[]);
        
        // Check if user has liked or bookmarked the poem
        if (user) {
          const { data: likeData } = await supabase
            .from('likes')
            .select('*')
            .eq('poem_id', id)
            .eq('user_id', user.id)
            .single();
          
          setIsLiked(!!likeData);
          
          const { data: bookmarkData } = await supabase
            .from('bookmarks')
            .select('*')
            .eq('poem_id', id)
            .eq('user_id', user.id)
            .single();
          
          setIsBookmarked(!!bookmarkData);
        }
      } catch (error) {
        console.error('Error fetching poem details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPoemDetails();
  }, [id, user]);
  
  const handleLike = async () => {
    if (!user || !poem) return;
    
    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('poem_id', poem.id)
          .eq('user_id', user.id);
        
        await supabase
          .from('poems')
          .update({ likes_count: poem.likes_count - 1 })
          .eq('id', poem.id);
        
        setPoem({ ...poem, likes_count: poem.likes_count - 1 });
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            poem_id: poem.id,
            user_id: user.id,
            created_at: new Date().toISOString(),
          });
        
        await supabase
          .from('poems')
          .update({ likes_count: poem.likes_count + 1 })
          .eq('id', poem.id);
        
        setPoem({ ...poem, likes_count: poem.likes_count + 1 });
      }
      
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error liking/unliking poem:', error);
    }
  };
  
  const handleBookmark = async () => {
    if (!user || !poem) return;
    
    try {
      if (isBookmarked) {
        // Remove bookmark
        await supabase
          .from('bookmarks')
          .delete()
          .eq('poem_id', poem.id)
          .eq('user_id', user.id);
      } else {
        // Add bookmark
        await supabase
          .from('bookmarks')
          .insert({
            poem_id: poem.id,
            user_id: user.id,
            created_at: new Date().toISOString(),
          });
      }
      
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error bookmarking/unbookmarking poem:', error);
    }
  };
  
  const handleComment = async () => {
    if (!user || !poem || !commentText.trim()) return;
    
    try {
      const newComment = {
        poem_id: poem.id,
        user_id: user.id,
        content: commentText.trim(),
        created_at: new Date().toISOString(),
        parent_id: replyTo ? replyTo.id : null,
      };
      
      const { data, error } = await supabase
        .from('comments')
        .insert(newComment)
        .select(`
          *,
          author:profiles(*)
        `)
        .single();
      
      if (error) throw error;
      
      // Update comments count
      await supabase
        .from('poems')
        .update({ comments_count: poem.comments_count + 1 })
        .eq('id', poem.id);
      
      setPoem({ ...poem, comments_count: poem.comments_count + 1 });
      
      // Add the new comment to the list
      if (replyTo) {
        // Add reply to the parent comment
        setComments(
          comments.map((comment) => {
            if (comment.id === replyTo.id) {
              return {
                ...comment,
                replies: [...(comment.replies || []), data as unknown as Comment & { author: Profile }],
              };
            }
            return comment;
          })
        );
        setReplyTo(null);
      } else {
        // Add new top-level comment
        setComments([...comments, { ...data, replies: [] } as unknown as Comment]);
      }
      
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  
  const handleReply = (commentId: string, username: string) => {
    setReplyTo({ id: commentId, username });
    // Focus the comment input
    document.getElementById('comment-input')?.focus();
  };
  
  const cancelReply = () => {
    setReplyTo(null);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (!poem) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-serif font-bold mb-4">Poem not found</h2>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="card p-8 mb-8">
        <h1 className="text-3xl font-serif font-bold mb-4">{poem.title}</h1>
        
        <div className="flex items-center mb-6">
          <Link to={`/profile/${poem.author.id}`} className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 mr-3">
              {poem.author.avatar_url ? (
                <img
                  src={poem.author.avatar_url}
                  alt={poem.author.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                poem.author.username.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="font-medium">{poem.author.display_name || poem.author.username}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(poem.created_at).toLocaleDateString()}
              </div>
            </div>
          </Link>
        </div>
        
        <div className="whitespace-pre-line mb-6 font-serif text-lg leading-relaxed">
          {poem.content}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
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
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-600">
          <div className="flex items-center space-x-6">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-600 dark:text-gray-400'}`}
            >
              <Heart size={20} className={isLiked ? 'fill-current' : ''} />
              <span>{poem.likes_count}</span>
            </button>
            
            <button 
              onClick={() => document.getElementById('comment-input')?.focus()}
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-400"
            >
              <MessageSquare size={20} />
              <span>{poem.comments_count}</span>
            </button>
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
      
      <div className="card p-8">
        <h2 className="text-xl font-serif font-bold mb-6">Comments ({poem.comments_count})</h2>
        
        {user ? (
          <div className="mb-8">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 mr-3">
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  user.email?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                {replyTo && (
                  <div className="bg-gray-100 dark:bg-dark-600 p-2 rounded-md mb-2 text-sm flex justify-between items-center">
                    <span>
                      Replying to <span className="font-medium">@{replyTo.username}</span>
                    </span>
                    <button 
                      onClick={cancelReply}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                <div className="flex">
                  <input
                    id="comment-input"
                    type="text"
                    className="input flex-1"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleComment();
                      }
                    }}
                  />
                  <button
                    onClick={handleComment}
                    className="ml-2 p-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600"
                    disabled={!commentText.trim()}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-gray-100 dark:bg-dark-700 rounded-md text-center">
            <p className="mb-2">Sign in to join the conversation</p>
            <Link to="/signin" className="btn btn-primary">
              Sign In
            </Link>
          </div>
        )}
        
        {comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 dark:border-dark-600 pb-4 mb-4 last:border-0">
                <div className="flex items-start">
                  <Link to={`/profile/${comment.author.id}`} className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 mr-3">
                    {comment.author.avatar_url ? (
                      <img
                        src={comment.author.avatar_url}
                        alt={comment.author.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      comment.author.username.charAt(0).toUpperCase()
                    )}
                  </Link>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link to={`/profile/${comment.author.id}`} className="font-medium">
                          {comment.author.display_name || comment.author.username}
                        </Link>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {user && (
                        <button
                          onClick={() => handleReply(comment.id, comment.author.username)}
                          className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          Reply
                        </button>
                      )}
                    </div>
                    <p className="mt-1">{comment.content}</p>
                  </div>
                </div>
                
                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-12 mt-4 space-y-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start">
                        <Link to={`/profile/${reply.author.id}`} className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300 mr-3">
                          {reply.author.avatar_url ? (
                            <img
                              src={reply.author.avatar_url}
                              alt={reply.author.username}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            reply.author.username.charAt(0).toUpperCase()
                          )}
                        </Link>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <Link to={`/profile/${reply.author.id}`} className="font-medium">
                                {reply.author.display_name || reply.author.username}
                              </Link>
                              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                                {new Date(reply.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {user && (
                              <button
                                onClick={() => handleReply(comment.id, reply.author.username)}
                                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                Reply
                              </button>
                            )}
                          </div>
                          <p className="mt-1">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoemDetailPage;