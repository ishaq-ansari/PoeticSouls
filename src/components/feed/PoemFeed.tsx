import React, { useState, useEffect, useRef, useCallback } from "react";
import PoemCard from "./PoemCard";
import { Loader2 } from "lucide-react";

interface Poem {
  id: string;
  title: string;
  author: string;
  authorId: string;
  authorImage?: string;
  content: string;
  hashtags: string[];
  likes: number;
  comments: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

interface PoemFeedProps {
  poems?: Poem[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onPoemClick?: (poemId: string) => void;
  onLike?: (poemId: string) => void;
  onComment?: (poemId: string) => void;
  onBookmark?: (poemId: string) => void;
  onShare?: (poemId: string) => void;
  onAuthorClick?: (authorId: string, authorName: string) => void;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

const PoemFeed = ({
  poems = [],
  isLoading = false,
  hasMore = true,
  onLoadMore = () => {},
  onPoemClick = () => {},
  onLike = () => {},
  onComment = () => {},
  onBookmark = () => {},
  onShare = () => {},
  onAuthorClick = () => {},
  isAuthenticated = false,
  onAuthRequired = () => {},
}: PoemFeedProps) => {
  const [loading, setLoading] = useState(isLoading);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Update loading state when isLoading prop changes
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  // Function to handle intersection with the loading element
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !loading) {
        setLoading(true);
        // Simulate loading delay
        setTimeout(() => {
          onLoadMore();
          setLoading(false);
        }, 1000);
      }
    },
    [hasMore, loading, onLoadMore],
  );

  // Set up the intersection observer
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 1.0,
    };

    observer.current = new IntersectionObserver(handleObserver, options);

    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [handleObserver]);

  return (
    <div className="w-full max-w-[1200px] min-h-[850px] mx-auto bg-gray-50 dark:bg-gray-950 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 justify-items-center">
        {poems.map((poem) => (
          <PoemCard
            key={poem.id}
            id={poem.id}
            title={poem.title}
            author={poem.author}
            authorImage={poem.authorImage}
            content={poem.content}
            hashtags={poem.hashtags}
            likes={poem.likes}
            comments={poem.comments}
            isLiked={poem.isLiked}
            isBookmarked={poem.isBookmarked}
            onClick={() => onPoemClick(poem.id)}
            onLike={() => onLike(poem.id)}
            onComment={() => onComment(poem.id)}
            onBookmark={() => onBookmark(poem.id)}
            onShare={() => onShare(poem.id)}
            onAuthorClick={() => onAuthorClick(poem.authorId, poem.author)}
            isAuthenticated={isAuthenticated}
            onAuthRequired={onAuthRequired}
          />
        ))}
      </div>

      {/* Loading indicator */}
      <div
        ref={loadingRef}
        className="w-full flex justify-center items-center py-8"
      >
        {loading && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Loading more poems...
            </p>
          </div>
        )}
        {!loading && !hasMore && poems.length > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            You've reached the end of the feed
          </p>
        )}
        {!loading && poems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              No poems found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Be the first to share your poetic inspiration
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoemFeed;
