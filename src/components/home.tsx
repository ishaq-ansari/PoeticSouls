import React, { useState, useEffect } from "react";
import Header from "./layout/Header";
import PoemFeed from "./feed/PoemFeed";
import AuthModal from "./auth/AuthModal";
import CreatePoemModal from "./poem/CreatePoemModal";
import PoemDetailModal from "./poem/PoemDetailModal";
import ChatModal from "./chat/ChatModal"; // We'll create this
import { useAuth } from "@/contexts/AuthContext";
import {
  getPoems,
  createPoem,
  likePoem,
  bookmarkPoem,
  checkUserInteractions,
  addComment,
  getTrendingPoems,
  getBookmarkedPoems,
  getUserPoems,
  getCommentsByPoemId,
} from "@/lib/poems";
import { Notification, markNotificationAsRead } from "@/lib/notifications";

const Home = () => {
  const { user, profile, signOut, refreshUser } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreatePoemModal, setShowCreatePoemModal] = useState(false);
  const [showPoemDetailModal, setShowPoemDetailModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatUserId, setChatUserId] = useState<string | null>(null);
  const [chatUsername, setChatUsername] = useState<string>("");
  const [selectedPoemId, setSelectedPoemId] = useState<string | null>(null);
  const [poems, setPoems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feed");
  const [poemComments, setPoemComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  // Add a hasMore state that's actually managed properly
  const [hasMore, setHasMore] = useState(false);

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

  // Fetch user profile on initial load to make sure we have the latest data
  useEffect(() => {
    if (user) {
      refreshUser();
    }
  }, [user]);

  // Fetch poems based on the active tab
  const fetchPoems = async () => {
    setIsLoading(true);
    try {
      // Different fetch based on tab
      let fetchResult;
      
      if (activeTab === "feed") {
        fetchResult = await getPoems();
      } else if (activeTab === "trending") {
        fetchResult = await getTrendingPoems();
      } else if (activeTab === "my-poems" && user) {
        fetchResult = await getUserPoems(user.id);
      } else if (activeTab === "bookmarks" && user) {
        fetchResult = await getBookmarkedPoems(user.id);
      } else {
        // Default to all poems
        fetchResult = await getPoems();
      }

      const { poems: fetchedPoems, error } = fetchResult;

      if (error) {
        console.error(`Error fetching ${activeTab} poems:`, error);
        setPoems(samplePoems);
        setHasMore(false);
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
          likes: poem.likes_count || 0, // Use the count from the backend
          comments: poem.comments_count || 0, // Use the count from the backend
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
            poem.isBookmarked = isBookmarked || poem.isBookmarked; // Preserve isBookmarked if already set
          }
        }

        setPoems(transformedPoems);
        // Set hasMore based on how many poems were fetched
        // For now we'll set it to false since we're not implementing pagination yet
        setHasMore(false); 
      } else {
        // If no poems were found, use the sample data
        setPoems(samplePoems);
        setHasMore(false);
      }
    } catch (error) {
      console.error(`Error in fetchPoems for ${activeTab}:`, error);
      setPoems(samplePoems);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate loading more poems - in a real app, this would call an API with pagination
  const handleLoadMore = () => {
    // This is a stub for now - in a real app, you would fetch more poems with pagination
    // For now, we'll just set hasMore to false to indicate there are no more poems
    setHasMore(false);
  };

  // Fetch comments for a specific poem
  const fetchPoemComments = async (poemId: string) => {
    setIsLoadingComments(true);
    try {
      const { comments, error } = await getCommentsByPoemId(poemId);
      
      if (error) {
        console.error("Error fetching comments:", error);
        setPoemComments([]);
        return;
      }
      
      setPoemComments(comments || []);
    } catch (error) {
      console.error("Error in fetchPoemComments:", error);
      setPoemComments([]);
    } finally {
      setIsLoadingComments(false);
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

  // Refetch when user auth state or active tab changes
  useEffect(() => {
    fetchPoems();
  }, [user, activeTab]);

  // Fetch comments when poem modal is opened
  useEffect(() => {
    if (selectedPoemId && showPoemDetailModal) {
      fetchPoemComments(selectedPoemId);
    }
  }, [selectedPoemId, showPoemDetailModal]);

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

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
  };

  const handlePoemClick = (poemId: string) => {
    setSelectedPoemId(poemId);
    setShowPoemDetailModal(true);
  };

  const handleLike = async (poemId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      // Find the current poem
      const poem = poems.find(poem => poem.id === poemId);
      if (!poem) return;

      // Toggle like state
      const newLikedState = !poem.isLiked;

      // Optimistically update UI
      setPoems(prevPoems => prevPoems.map(p => 
        p.id === poemId 
          ? { 
              ...p, 
              isLiked: newLikedState, 
              likes: newLikedState ? p.likes + 1 : p.likes - 1 
            } 
          : p
      ));

      // Call API to update like state
      await likePoem({ poemId, userId: user.id });
    } catch (error) {
      console.error("Error liking poem:", error);
      // Revert UI state on error
      fetchPoems();
    }
  };

  const handleBookmark = async (poemId: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      // Find the current poem
      const poem = poems.find(poem => poem.id === poemId);
      if (!poem) return;

      // Toggle bookmark state
      const newBookmarkState = !poem.isBookmarked;

      // Optimistically update UI
      setPoems(prevPoems => prevPoems.map(p => 
        p.id === poemId 
          ? { ...p, isBookmarked: newBookmarkState } 
          : p
      ));

      // Call API to update bookmark state
      await bookmarkPoem({ poemId, userId: user.id });
    } catch (error) {
      console.error("Error bookmarking poem:", error);
      // Revert UI state on error
      fetchPoems();
    }
  };

  const handleComment = async (poemId: string, content: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    try {
      const { comment, error } = await addComment({ 
        poemId, 
        userId: user.id, 
        content 
      });

      if (error) {
        console.error("Error adding comment:", error);
        return;
      }

      if (comment) {
        // Update the comments list if we're viewing this poem
        if (selectedPoemId === poemId) {
          setPoemComments(prev => [comment, ...prev]);
        }
        
        // Update the comment count in the poems list
        setPoems(prevPoems => prevPoems.map(p => 
          p.id === poemId 
            ? { ...p, comments: p.comments + 1 } 
            : p
        ));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
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

  // Handle author click to open chat
  const handleAuthorClick = (authorId: string, authorName: string) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // Don't open chat with yourself
    if (user.id === authorId) {
      return;
    }
    
    setChatUserId(authorId);
    setChatUsername(authorName);
    setShowChatModal(true);
  };

  // Open the chat modal from header
  const handleChatClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    setChatUserId(null); // No specific recipient initially
    setChatUsername("");
    setShowChatModal(true);
  };

  // Open the poem modal when clicking the comment button
  const handleCommentClick = (poemId: string) => {
    handlePoemClick(poemId);
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    // Mark the notification as read
    await markNotificationAsRead(notification.id);
    
    // If it's a poem-related notification, open the poem detail modal
    if (notification.poem_id) {
      setSelectedPoemId(notification.poem_id);
      setShowPoemDetailModal(true);
    }
    
    // If sent by another user, provide option to chat with them
    if (notification.sender_id && notification.sender_id !== user?.id) {
      // Could show a button or toast to start chat with this user
      // For now we'll just focus on the poem
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
        onTabChange={handleTabChange}
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
          try {
            await signOut();
            // Reset state after sign out
            setActiveTab("feed");
            fetchPoems(); // Refetch poems to update like/bookmark status
          } catch (error) {
            console.error("Error signing out:", error);
          }
        }}
        onMyPoemsClick={() => setActiveTab("my-poems")}
        onBookmarksClick={() => setActiveTab("bookmarks")}
        onNotificationClick={handleNotificationClick}
        onChatClick={handleChatClick}
      />

      <main className="flex-1 container mx-auto py-6 px-4">
        <PoemFeed
          poems={poems}
          isLoading={isLoading}
          onPoemClick={handlePoemClick}
          onLike={handleLike}
          onComment={handleCommentClick}
          onBookmark={handleBookmark}
          onAuthorClick={handleAuthorClick}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
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
          onLike={() => handleLike(selectedPoem.id)}
          onBookmark={() => handleBookmark(selectedPoem.id)}
          onComment={(content) => handleComment(selectedPoem.id, content)}
          onAuthorClick={() => handleAuthorClick(selectedPoem.authorId, selectedPoem.author)}
          comments={poemComments}
          isLoadingComments={isLoadingComments}
        />
      )}

      {/* Chat Modal */}
      <ChatModal
        open={showChatModal}
        onOpenChange={setShowChatModal}
        userId={user?.id || ""}
        recipientId={chatUserId}
        recipientName={chatUsername}
      />
    </div>
  );
};

export default Home;
