import React from "react";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PoemCardProps {
  title?: string;
  author?: string;
  content?: string;
  hashtags?: string[];
  likes?: number;
  comments?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onClick?: () => void;
}

const PoemCard = ({
  title = "Whispers of Autumn",
  author = "Emily Frost",
  content = "Crimson leaves dance in the wind,\nWhispering secrets of seasons past.\nGolden light filters through branches,\nPainting shadows on the forest floor.",
  hashtags = ["nature", "autumn", "reflection"],
  likes = 42,
  comments = 7,
  isLiked = false,
  isBookmarked = false,
  onClick = () => {},
}: PoemCardProps) => {
  return (
    <Card className="w-full max-w-[550px] h-[320px] flex flex-col bg-white dark:bg-gray-900 hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle
              className="text-xl font-serif cursor-pointer"
              onClick={onClick}
            >
              {title}
            </CardTitle>
            <CardDescription className="text-sm">by {author}</CardDescription>
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
      </CardHeader>

      <CardContent className="flex-grow overflow-hidden">
        <p
          className="text-gray-700 dark:text-gray-300 font-serif whitespace-pre-line line-clamp-5 cursor-pointer"
          onClick={onClick}
        >
          {content}
        </p>
      </CardContent>

      <CardFooter className="border-t pt-3 flex justify-between items-center">
        <div className="flex space-x-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-0 h-auto ${isLiked ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Like button clicked");
                  }}
                >
                  <Heart
                    className="h-5 w-5 mr-1"
                    fill={isLiked ? "currentColor" : "none"}
                  />
                  <span>{likes}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Like this poem</p>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Comment button clicked");
                  }}
                >
                  <MessageCircle className="h-5 w-5 mr-1" />
                  <span>{comments}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Comment on this poem</p>
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
                  className={`p-0 h-auto ${isBookmarked ? "text-blue-500" : "text-gray-500 dark:text-gray-400"}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Bookmark button clicked");
                  }}
                >
                  <Bookmark
                    className="h-5 w-5"
                    fill={isBookmarked ? "currentColor" : "none"}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bookmark this poem</p>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Share button clicked");
                  }}
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
      </CardFooter>
    </Card>
  );
};

export default PoemCard;
