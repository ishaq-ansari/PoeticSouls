import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, X, PenSquare, User } from 'lucide-react';
import { useAuthStore } from '../lib/store';

const Navbar: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
    setIsDarkMode(!isDarkMode);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-serif font-bold">
              Poetic Souls
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <>
                <Link
                  to="/write"
                  className="btn btn-primary flex items-center space-x-2"
                >
                  <PenSquare size={18} />
                  <span>Write Poem</span>
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700">
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.username}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-700 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-600"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/my-poems"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-600"
                    >
                      My Poems
                    </Link>
                    <Link
                      to="/bookmarks"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-600"
                    >
                      Bookmarks
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-600"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/signin" className="btn btn-outline">
                  Sign In
                </Link>
                <Link to="/signup" className="btn btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-700 mr-2"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-dark-700"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-dark-700">
            <div className="flex flex-col space-y-3">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 px-2 py-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-700 dark:text-primary-300">
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{profile?.display_name || profile?.username}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">@{profile?.username}</div>
                    </div>
                  </div>
                  <Link
                    to="/write"
                    className="btn btn-primary flex items-center justify-center space-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <PenSquare size={18} />
                    <span>Write Poem</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="px-2 py-3 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/my-poems"
                    className="px-2 py-3 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Poems
                  </Link>
                  <Link
                    to="/bookmarks"
                    className="px-2 py-3 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Bookmarks
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-2 py-3 text-left hover:bg-gray-100 dark:hover:bg-dark-700 rounded-md"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="btn btn-outline w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="btn btn-primary w-full"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;