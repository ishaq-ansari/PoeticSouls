import React, { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  X,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

interface Comment {
  id: string;
  user_id?: string;
  profiles?: {
    display_name: string;
    avatar_url?: string;
  };
  content: string;
  created_at: string;
  
  // For backward compatibility with sample data
  author?: string;
  authorImage?: string;
  timestamp?: string;
}

interface PoemDetailModalProps {
  id?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  author?: string;
  authorId?: string;
  authorImage?: string;
  content?: string;
  hashtags?: string[];
  likes?: number;
  comments?: Comment[];
  isLoadingComments?: boolean;
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt?: string;
  onLike?: () => void;
  onBookmark?: () => void;
  onComment?: (content: string) => void;
  onShare?: () => void;
  onAuthorClick?: () => void;
}

const PoemDetailModal = ({
  id = "1",
  open = true,
  onOpenChange = () => {},
  title = "Whispers of Autumn",
  author = "Emily Frost",
  authorId = "",
  authorImage = "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
  content = "Crimson leaves dance in the wind,\nWhispering secrets of seasons past.\nGolden light filters through branches,\nPainting shadows on the forest floor.\n\nThe scent of earth and rain mingles,\nA sweet reminder of summer's farewell.\nFootsteps crunch on fallen memories,\nAs nature prepares for winter's embrace.",
  hashtags = ["nature", "autumn", "reflection"],
  likes = 42,
  comments = [],
  isLoadingComments = false,
  isLiked = false,
  isBookmarked = false,
  createdAt = "October 15, 2023",
  onLike = () => {},
  onBookmark = () => {},
  onComment = () => {},
  onShare = () => {},
  onAuthorClick = () => {},
}: PoemDetailModalProps) => {
  const { user, profile } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Sample fallback comments in case API returns empty
  const fallbackComments = [
    {
      id: "1",
      author: "Alex Rivera",
      authorImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      content: "This perfectly captures the essence of autumn. Beautiful imagery!",
      timestamp: "2 days ago",
    },
    {
      id: "2",
      author: "Jordan Lee",
      authorImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
      content: "The line about footsteps crunching on fallen memories really resonated with me.",
      timestamp: "1 day ago",
    },
    {
      id: "3",
      author: "Taylor Kim",
      authorImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor",
      content: "I love how you've captured both the visual and sensory experience of autumn.",
      timestamp: "12 hours ago",
    },
  ];
  
  // Format DB comments to display properly
  const formattedComments = comments && comments.length > 0
    ? comments.map(comment => ({
        id: comment.id,
        author: comment.profiles?.display_name || comment.author || "Unknown User",
        authorImage: comment.profiles?.avatar_url || comment.authorImage || 
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.profiles?.display_name || "User"}`,
        content: comment.content,
        timestamp: comment.timestamp || formatDate(comment.created_at),
      }))
    : fallbackComments;
  
  // Show only 3 comments at first, Facebook-style
  const MAX_VISIBLE_COMMENTS = 3;
  
  // Display only the most recent comments when collapsed
  const visibleComments = showAllComments
    ? formattedComments
    : formattedComments.slice(0, MAX_VISIBLE_COMMENTS);
    
  // Determine if we need a "View more comments" button
  const hasMoreComments = formattedComments.length > MAX_VISIBLE_COMMENTS;
  const hiddenCommentsCount = formattedComments.length - MAX_VISIBLE_COMMENTS;

  function formatDate(dateString: string): string {
    if (!dateString) return "Unknown date";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    
    // Convert to seconds, minutes, hours, days
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 30) {
      return date.toLocaleDateString();
    } else if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }
  
  const handleLike = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    onLike();
  };
  
  const handleBookmark = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    onBookmark();
  };
  
  const handleCommentSubmit = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    if (newComment.trim()) {
      setIsSubmitting(true);
      try {
        await onComment(newComment);
        // Clear the input after successful submission
        setNewComment("");
        // When adding a comment, make sure all comments are visible
        setShowAllComments(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleShare = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    onShare?.();
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-white dark:bg-gray-900 max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <DialogTitle className="text-2xl font-serif">
                  {title}
                </DialogTitle>
                <DialogDescription className="flex items-center mt-1">
                  <button 
                    onClick={onAuthorClick}
                    className="flex items-center hover:underline focus:outline-none"
                  >
                    <Avatar className="h-6 w-6 mr-2">
                      {authorImage ? (
                        <AvatarImage src={authorImage} alt={author} />
                      ) : (
                        <AvatarFallback>{author[0]}</AvatarFallback>
                      )}
                    </Avatar>
                    <span>{author}</span>
                  </button>
                  <span className="mx-2">•</span>
                  <span className="text-sm text-muted-foreground">
                    {createdAt}
                  </span>
                </DialogDescription>
              </div>
              <div className="flex space-x-1">
                {hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-grow">
            <div className="p-4 pt-0">
              <div className="my-4">
                <p className="text-gray-700 dark:text-gray-300 font-serif whitespace-pre-line">
                  {content}
                </p>
              </div>
              <Separator className="my-6" />
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    Comments ({formattedComments.length})
                  </h3>
                </div>
                
                {isLoadingComments ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* "View more comments" button if there are more than 3 comments */}
                    {hasMoreComments && !showAllComments && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllComments(true)}
                        className="flex items-center gap-1 text-sm text-muted-foreground w-full justify-start"
                      >
                        <ChevronDown className="h-4 w-4" /> 
                        View {hiddenCommentsCount} more comment{hiddenCommentsCount !== 1 ? 's' : ''}
                      </Button>
                    )}
                    
                    {visibleComments.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">
                        No comments yet. Be the first to share your thoughts!
                      </p>
                    ) : (
                      visibleComments.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <Avatar className="h-8 w-8">
                            {comment.authorImage ? (
                              <AvatarImage
                                src={comment.authorImage}
                                alt={comment.author}
                              />
                            ) : (
                              <AvatarFallback>{comment.author[0]}</AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                            <div className="flex justify-between">
                              <p className="font-medium text-sm">{comment.author}</p>
                              <p className="text-xs text-muted-foreground">
                                {comment.timestamp}
                              </p>
                            </div>
                            <p className="text-sm mt-1">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {/* "Show less" button if showing all comments */}
                    {hasMoreComments && showAllComments && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllComments(false)}
                        className="flex items-center gap-1 text-sm text-muted-foreground w-full justify-start"
                      >
                        <ChevronUp className="h-4 w-4" /> Show fewer comments
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            {user ? (
              <div className="flex space-x-2">
                <Avatar className="h-8 w-8">
                  {profile?.avatar_url ? (
                    <AvatarImage
                      src={profile.avatar_url}
                      alt={profile.display_name}
                    />
                  ) : (
                    <AvatarFallback>
                      {profile?.display_name?.[0] || user.email?.[0] || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 flex">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 resize-none min-h-[40px] h-[40px]"
                    disabled={isSubmitting}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleCommentSubmit();
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    className="ml-2"
                    disabled={!newComment.trim() || isSubmitting}
                    onClick={handleCommentSubmit}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAuthModal(true)}
              >
                Sign in to comment
              </Button>
            )}
          </div>
          <DialogFooter className="border-t p-4 flex justify-between">
            <div className="flex space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className={`p-0 h-auto ${isLiked ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
                onClick={handleLike}
              >
                <Heart
                  className="h-5 w-5 mr-1"
                  fill={isLiked ? "currentColor" : "none"}
                />
                <span>{likes}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto text-gray-500 dark:text-gray-400"
                onClick={() => {
                  document.querySelector("textarea")?.focus();
                }}
              >
                <MessageCircle className="h-5 w-5 mr-1" />
                <span>{formattedComments.length}</span>
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className={`p-0 h-auto ${isBookmarked ? "text-blue-500" : "text-gray-500 dark:text-gray-400"}`}
                onClick={handleBookmark}
              >
                <Bookmark
                  className="h-5 w-5"
                  fill={isBookmarked ? "currentColor" : "none"}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="p-0 h-auto text-gray-500 dark:text-gray-400"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default PoemDetailModal;
