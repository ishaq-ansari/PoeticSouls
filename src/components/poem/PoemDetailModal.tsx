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
  author: string;
  authorImage?: string;
  content: string;
  timestamp: string;
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
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt?: string;
  onLike?: (id: string, liked: boolean) => void;
  onBookmark?: (id: string, bookmarked: boolean) => void;
  onComment?: (id: string, content: string) => void;
  onShare?: (id: string) => void;
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
  comments = [
    {
      id: "1",
      author: "Alex Rivera",
      authorImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      content:
        "This perfectly captures the essence of autumn. Beautiful imagery!",
      timestamp: "2 days ago",
    },
    {
      id: "2",
      author: "Jordan Lee",
      authorImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
      content:
        "The line about footsteps crunching on fallen memories really resonated with me.",
      timestamp: "1 day ago",
    },
    {
      id: "3",
      author: "Taylor Kim",
      authorImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor",
      content:
        "I love how you've captured both the visual and sensory experience of autumn.",
      timestamp: "12 hours ago",
    },
  ],
  isLiked = false,
  isBookmarked = false,
  createdAt = "October 15, 2023",
  onLike = () => {},
  onBookmark = () => {},
  onComment = () => {},
  onShare = () => {},
}: PoemDetailModalProps) => {
  const { user, profile } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [localLikes, setLocalLikes] = useState(likes);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localIsBookmarked, setLocalIsBookmarked] = useState(isBookmarked);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Display only the 3 most recent comments when collapsed
  const visibleComments = showAllComments
    ? localComments
    : localComments.slice(Math.max(0, localComments.length - 3));

  const handleLike = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLocalIsLiked(!localIsLiked);
    setLocalLikes(localIsLiked ? localLikes - 1 : localLikes + 1);
    onLike(id, !localIsLiked);
  };

  const handleBookmark = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLocalIsBookmarked(!localIsBookmarked);
    onBookmark(id, !localIsBookmarked);
  };

  const handleCommentSubmit = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (newComment.trim()) {
      setIsLoading(true);

      // Create a temporary comment to show immediately
      const tempComment: Comment = {
        id: `temp-${Date.now()}`,
        author: profile?.display_name || "You",
        authorImage:
          profile?.avatar_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.display_name || "You"}`,
        content: newComment,
        timestamp: "Just now",
      };

      setLocalComments([...localComments, tempComment]);

      // Call the API to save the comment
      onComment(id, newComment);

      // Clear the input
      setNewComment("");
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    onShare(id);
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
                  <Avatar className="h-6 w-6 mr-2">
                    {authorImage ? (
                      <AvatarImage src={authorImage} alt={author} />
                    ) : (
                      <AvatarFallback>{author[0]}</AvatarFallback>
                    )}
                  </Avatar>
                  <span>{author}</span>
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
                    Comments ({localComments.length})
                  </h3>
                  {localComments.length > 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllComments(!showAllComments)}
                      className="flex items-center gap-1 text-sm"
                    >
                      {showAllComments ? (
                        <>
                          <ChevronUp className="h-4 w-4" /> Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" /> Show All
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {visibleComments.map((comment) => (
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
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <p className="font-medium">{comment.author}</p>
                          <p className="text-xs text-muted-foreground">
                            {comment.timestamp}
                          </p>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
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
                    disabled={isLoading}
                  />
                  <Button
                    size="icon"
                    className="ml-2"
                    disabled={!newComment.trim() || isLoading}
                    onClick={handleCommentSubmit}
                  >
                    <Send className="h-4 w-4" />
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
                className={`p-0 h-auto ${localIsLiked ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
                onClick={handleLike}
              >
                <Heart
                  className="h-5 w-5 mr-1"
                  fill={localIsLiked ? "currentColor" : "none"}
                />
                <span>{localLikes}</span>
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
                <span>{localComments.length}</span>
              </Button>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className={`p-0 h-auto ${localIsBookmarked ? "text-blue-500" : "text-gray-500 dark:text-gray-400"}`}
                onClick={handleBookmark}
              >
                <Bookmark
                  className="h-5 w-5"
                  fill={localIsBookmarked ? "currentColor" : "none"}
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
