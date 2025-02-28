import React, { useState, useEffect, useRef, useCallback } from "react";
import PoemCard from "./PoemCard";
import { Loader2 } from "lucide-react";

interface Poem {
  id: string;
  title: string;
  author: string;
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
}

const PoemFeed = ({
  poems = [
    {
      id: "1",
      title: "Whispers of Autumn",
      author: "Emily Frost",
      content:
        "Crimson leaves dance in the wind,\nWhispering secrets of seasons past.\nGolden light filters through branches,\nPainting shadows on the forest floor.",
      hashtags: ["nature", "autumn", "reflection"],
      likes: 42,
      comments: 7,
      isLiked: false,
      isBookmarked: false,
    },
    {
      id: "2",
      title: "Urban Symphony",
      author: "Marcus Chen",
      content:
        "Steel giants touch the clouds,\nHumming with electric life.\nFootsteps and voices blend\nInto the city's endless song.",
      hashtags: ["city", "urban", "modern"],
      likes: 38,
      comments: 5,
      isLiked: true,
      isBookmarked: true,
    },
    {
      id: "3",
      title: "Ocean Memories",
      author: "Sophia Waters",
      content:
        "Salt-kissed air fills my lungs,\nWaves whisper ancient stories.\nBare feet sink into warm sand,\nAs memories wash ashore with the tide.",
      hashtags: ["ocean", "memories", "summer"],
      likes: 56,
      comments: 12,
      isLiked: false,
      isBookmarked: true,
    },
  ],
  isLoading = false,
  hasMore = true,
  onLoadMore = () => {},
  onPoemClick = () => {},
}: PoemFeedProps) => {
  const [loading, setLoading] = useState(isLoading);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

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
            title={poem.title}
            author={poem.author}
            content={poem.content}
            hashtags={poem.hashtags}
            likes={poem.likes}
            comments={poem.comments}
            isLiked={poem.isLiked}
            isBookmarked={poem.isBookmarked}
            onClick={() => onPoemClick(poem.id)}
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
