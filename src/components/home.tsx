import React, { useState, useEffect } from "react";
import Header from "./layout/Header";
import PoemFeed from "./feed/PoemFeed";
import AuthModal from "./auth/AuthModal";
import CreatePoemModal from "./poem/CreatePoemModal";
import PoemDetailModal from "./poem/PoemDetailModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPoems,
  createPoem,
  likePoem,
  bookmarkPoem,
  checkUserInteractions,
  addComment,
} from "@/lib/poems";

const Home = () => {
  const { user, profile } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreatePoemModal, setShowCreatePoemModal] = useState(false);
  const [showPoemDetailModal, setShowPoemDetailModal] = useState(false);
  const [selectedPoemId, setSelectedPoemId] = useState<string | null>(null);
  const [poems, setPoems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feed");

  // Sample poems data as fallback
  const samplePoems = [
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
    {
      id: "4",
      title: "Midnight Thoughts",
      author: "Leo Nightshade",
      content:
        "Stars puncture the velvet darkness,\nSilent witnesses to my restless mind.\nThoughts spiral like cosmic dust,\nIn the quiet hours when the world sleeps.",
      hashtags: ["night", "insomnia", "stars"],
      likes: 67,
      comments: 15,
      isLiked: true,
      isBookmarked: false,
    },
    {
      id: "5",
      title: "Digital Dreams",
      author: "Ava Pixel",
      content:
        "Binary whispers through silicon veins,\nPixels painting worlds unseen.\nReality blurs at the edges,\nAs we dance between dimensions.",
      hashtags: ["technology", "digital", "future"],
      likes: 29,
      comments: 8,
      isLiked: false,
      isBookmarked: false,
    },
    {
      id: "6",
      title: "Mountain Solitude",
      author: "Ethan Peak",
      content:
        "Granite sentinels stand watch,\nBreath visible in crisp mountain air.\nSolitude wraps around me like a blanket,\nAs the world shrinks to this single moment.",
      hashtags: ["mountains", "solitude", "nature"],
      likes: 45,
      comments: 6,
      isLiked: false,
      isBookmarked: true,
    },
  ];

  // Fetch poems from the API
  const fetchPoems = async () => {
    setIsLoading(true);
    try {
      const { poems: fetchedPoems, error } = await getPoems();

      if (error) {
        console.error("Error fetching poems:", error);
        setPoems(samplePoems);
        return;
      }

      if (fetchedPoems && fetchedPoems.length > 0) {
        // Transform the data to match our component's expected format
        const transformedPoems = fetchedPoems.map((poem: any) => ({
          id: poem.id,
          title: poem.title,
          author: poem.profiles?.display_name || "Unknown Author",
          authorId: poem.author_id,
          authorImage: poem.profiles?.avatar_url,
          content: poem.content,
          hashtags: poem.hashtags || [],
          likes: 0, // We'll need to count these from a separate query
          comments: 0, // We'll need to count these from a separate query
          isLiked: false,
          isBookmarked: false,
          createdAt: new Date(poem.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        }));

        // If user is logged in, check which poems they've liked/bookmarked
        if (user) {
          for (const poem of transformedPoems) {
            const { isLiked, isBookmarked } = await checkUserInteractions({
              poemId: poem.id,
              userId: user.id,
            });
            poem.isLiked = isLiked;
            poem.isBookmarked = isBookmarked;
          }
        }

        setPoems(transformedPoems);
      } else {
        // If no poems were found, use the sample data
        setPoems(samplePoems);
      }
    } catch (error) {
      console.error("Error in fetchPoems:", error);
      setPoems(samplePoems);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPoems();

    // Check for dark mode preference
    const isDark = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Refetch when user auth state changes
  useEffect(() => {
    if (user) {
      fetchPoems();
    }
  }, [user]);

  const handleThemeToggle = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    // Apply dark mode to document and save preference
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  };

  const handlePoemClick = (poemId: string) => {
    setSelectedPoemId(poemId);
    setShowPoemDetailModal(true);
  };

  const handleCreatePoemSubmit = async (poemData: any) => {
    if (!user) return;

    try {
      const { poem, error } = await createPoem({
        title: poemData.title,
        content: poemData.content,
        hashtags: poemData.hashtags,
        authorId: user.id,
      });

      if (error) {
        console.error("Error creating poem:", error);
        return;
      }

      if (poem) {
        // Add the new poem to the list
        const newPoem = {
          id: poem.id,
          title: poem.title,
          author: profile?.display_name || "You",
          authorId: poem.author_id,
          authorImage: profile?.avatar_url,
          content: poem.content,
          hashtags: poem.hashtags || [],
          likes: 0,
          comments: 0,
          isLiked: false,
          isBookmarked: false,
          createdAt: new Date(poem.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        };

        setPoems([newPoem, ...poems]);
      }
    } catch (error) {
      console.error("Error in handleCreatePoemSubmit:", error);
    } finally {
      setShowCreatePoemModal(false);
    }
  };

  const handleLike = async (poemId: string, liked: boolean) => {
    if (!user) return;

    try {
      await likePoem({ poemId, userId: user.id });

      // Update the poems state
      setPoems(
        poems.map((poem) => {
          if (poem.id === poemId) {
            return {
              ...poem,
              isLiked: liked,
              likes: liked ? poem.likes + 1 : poem.likes - 1,
            };
          }
          return poem;
        }),
      );
    } catch (error) {
      console.error("Error liking poem:", error);
    }
  };

  const handleBookmark = async (poemId: string, bookmarked: boolean) => {
    if (!user) return;

    try {
      await bookmarkPoem({ poemId, userId: user.id });

      // Update the poems state
      setPoems(
        poems.map((poem) => {
          if (poem.id === poemId) {
            return {
              ...poem,
              isBookmarked: bookmarked,
            };
          }
          return poem;
        }),
      );
    } catch (error) {
      console.error("Error bookmarking poem:", error);
    }
  };

  const handleComment = async (poemId: string, content: string) => {
    if (!user) return;

    try {
      await addComment({ poemId, userId: user.id, content });

      // Update the poems state
      setPoems(
        poems.map((poem) => {
          if (poem.id === poemId) {
            return {
              ...poem,
              comments: poem.comments + 1,
            };
          }
          return poem;
        }),
      );
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Find the selected poem for the detail modal
  const selectedPoem = poems.find((poem) => poem.id === selectedPoemId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header
        isAuthenticated={!!user}
        username={profile?.display_name || "Guest"}
        userAvatar={profile?.avatar_url || undefined}
        isDarkMode={isDarkMode}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onThemeToggle={handleThemeToggle}
        onWritePoemClick={() => {
          if (user) {
            setShowCreatePoemModal(true);
          } else {
            setShowAuthModal(true);
          }
        }}
        onSignInClick={() => setShowAuthModal(true)}
        onSignUpClick={() => {
          setShowAuthModal(true);
        }}
        onSignOutClick={async () => {
          await useAuth().signOut();
          fetchPoems(); // Refetch poems to update like/bookmark status
        }}
      />

      <main className="flex-1 container mx-auto py-6 px-4">
        <PoemFeed
          poems={poems}
          isLoading={isLoading}
          onPoemClick={handlePoemClick}
          hasMore={false}
          isAuthenticated={!!user}
          onAuthRequired={() => setShowAuthModal(true)}
        />
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      {/* Create Poem Modal */}
      <CreatePoemModal
        open={showCreatePoemModal}
        onOpenChange={setShowCreatePoemModal}
        onSubmit={handleCreatePoemSubmit}
      />

      {/* Poem Detail Modal */}
      {selectedPoem && (
        <PoemDetailModal
          id={selectedPoem.id}
          open={showPoemDetailModal}
          onOpenChange={setShowPoemDetailModal}
          title={selectedPoem.title}
          author={selectedPoem.author}
          authorId={selectedPoem.authorId}
          authorImage={selectedPoem.authorImage}
          content={selectedPoem.content}
          hashtags={selectedPoem.hashtags}
          likes={selectedPoem.likes}
          isLiked={selectedPoem.isLiked}
          isBookmarked={selectedPoem.isBookmarked}
          createdAt={selectedPoem.createdAt}
          onLike={handleLike}
          onBookmark={handleBookmark}
          onComment={handleComment}
        />
      )}
    </div>
  );
};

export default Home;
