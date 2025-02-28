import React, { useState } from "react";
import Header from "./layout/Header";
import PoemFeed from "./feed/PoemFeed";
import AuthModal from "./auth/AuthModal";
import CreatePoemModal from "./poem/CreatePoemModal";
import PoemDetailModal from "./poem/PoemDetailModal";

const Home = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreatePoemModal, setShowCreatePoemModal] = useState(false);
  const [showPoemDetailModal, setShowPoemDetailModal] = useState(false);
  const [selectedPoemId, setSelectedPoemId] = useState<string | null>(null);

  // Sample poems data
  const poems = [
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

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // Apply dark mode to document
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSignIn = (data: any) => {
    console.log("Sign in data:", data);
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  const handleSignUp = (data: any) => {
    console.log("Sign up data:", data);
    setIsAuthenticated(true);
    setShowAuthModal(false);
  };

  const handlePoemClick = (poemId: string) => {
    setSelectedPoemId(poemId);
    setShowPoemDetailModal(true);
  };

  const handleCreatePoemSubmit = (poemData: any) => {
    console.log("New poem data:", poemData);
    // Here you would typically send the data to your backend
    setShowCreatePoemModal(false);
  };

  // Find the selected poem for the detail modal
  const selectedPoem = poems.find((poem) => poem.id === selectedPoemId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header
        isAuthenticated={isAuthenticated}
        username={isAuthenticated ? "Jane Poet" : "Guest"}
        isDarkMode={isDarkMode}
        onThemeToggle={handleThemeToggle}
        onWritePoemClick={() => {
          if (isAuthenticated) {
            setShowCreatePoemModal(true);
          } else {
            setShowAuthModal(true);
          }
        }}
        onSignInClick={() => setShowAuthModal(true)}
        onSignUpClick={() => {
          setShowAuthModal(true);
          // You could set a state to show the sign-up tab by default
        }}
      />

      <main className="flex-1 container mx-auto py-6 px-4">
        <PoemFeed
          poems={poems}
          onPoemClick={handlePoemClick}
          hasMore={false} // Set to true if you have pagination
        />
      </main>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
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
          open={showPoemDetailModal}
          onOpenChange={setShowPoemDetailModal}
          title={selectedPoem.title}
          author={selectedPoem.author}
          content={selectedPoem.content}
          hashtags={selectedPoem.hashtags}
          likes={selectedPoem.likes}
          isLiked={selectedPoem.isLiked}
          isBookmarked={selectedPoem.isBookmarked}
        />
      )}
    </div>
  );
};

export default Home;
