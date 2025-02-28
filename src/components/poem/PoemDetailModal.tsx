import React, { useState } from "react";
import { Heart, MessageCircle, Bookmark, Share2, X, Send } from "lucide-react";
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

interface Comment {
  id: string;
  author: string;
  authorImage?: string;
  content: string;
  timestamp: string;
}

interface PoemDetailModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  author?: string;
  authorImage?: string;
  content?: string;
  hashtags?: string[];
  likes?: number;
  comments?: Comment[];
  isLiked?: boolean;
  isBookmarked?: boolean;
  createdAt?: string;
}

const PoemDetailModal = ({
  open = true,
  onOpenChange = () => {},
  title = "Whispers of Autumn",
  author = "Emily Frost",
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
}: PoemDetailModalProps) => {
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [localLikes, setLocalLikes] = useState(likes);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localIsBookmarked, setLocalIsBookmarked] = useState(isBookmarked);

  const handleLike = () => {
    setLocalIsLiked(!localIsLiked);
    setLocalLikes(localIsLiked ? localLikes - 1 : localLikes + 1);
  };

  const handleBookmark = () => {
    setLocalIsBookmarked(!localIsBookmarked);
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        author: "You",
        authorImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
        content: newComment,
        timestamp: "Just now",
      };
      setLocalComments([...localComments, newCommentObj]);
      setNewComment("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] bg-white dark:bg-gray-900 overflow-hidden relative">
        <DialogHeader className="flex flex-row items-start justify-between pr-8">
          <div>
            <DialogTitle className="text-2xl font-serif">{title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 mt-1">
              <Avatar className="h-6 w-6">
                <AvatarImage src={authorImage} alt={author} />
                <AvatarFallback>{author[0]}</AvatarFallback>
              </Avatar>
              <span>{author}</span>
              <span className="text-xs text-gray-500">• {createdAt}</span>
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0 absolute top-4 right-4 z-10"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="flex flex-wrap gap-1 mb-4">
          {hashtags.map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300"
            >
              #{tag}
            </span>
          ))}
        </div>

        <ScrollArea className="pr-4 max-h-[150px]">
          <div className="font-serif text-gray-800 dark:text-gray-200 whitespace-pre-line">
            {content}
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center py-3">
          <div className="flex space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    className={`p-0 h-auto ${localIsLiked ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
                  >
                    <Heart
                      className="h-5 w-5 mr-1"
                      fill={localIsLiked ? "currentColor" : "none"}
                    />
                    <span>{localLikes}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{localIsLiked ? "Unlike this poem" : "Like this poem"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto text-gray-500 dark:text-gray-400"
                  >
                    <MessageCircle className="h-5 w-5 mr-1" />
                    <span>{localComments.length}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Comments</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleBookmark}
                    className={`p-0 h-auto ${localIsBookmarked ? "text-blue-500" : "text-gray-500 dark:text-gray-400"}`}
                  >
                    <Bookmark
                      className="h-5 w-5"
                      fill={localIsBookmarked ? "currentColor" : "none"}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {localIsBookmarked
                      ? "Remove bookmark"
                      : "Bookmark this poem"}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-0 h-auto text-gray-500 dark:text-gray-400"
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share this poem</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="space-y-4">
          <h3 className="font-medium">Comments</h3>

          <ScrollArea className="pr-4 max-h-[150px]">
            <div className="space-y-4">
              {localComments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={comment.authorImage}
                      alt={comment.author}
                    />
                    <AvatarFallback>{comment.author[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{comment.author}</span>
                      <span className="text-xs text-gray-500">
                        {comment.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="flex items-center gap-2 mt-4 pt-2 border-t">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=You"
              alt="You"
            />
            <AvatarFallback>Y</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Textarea
              placeholder="Add a comment..."
              className="min-h-[40px] flex-1"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleCommentSubmit();
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleCommentSubmit}
              disabled={!newComment.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PoemDetailModal;
