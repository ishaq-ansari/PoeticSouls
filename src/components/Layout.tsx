import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuthStore } from '../lib/store';

const Layout: React.FC = () => {
  const { fetchProfile, isLoading } = useAuthStore();

  React.useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <footer className="bg-white dark:bg-dark-800 border-t border-gray-200 dark:border-dark-700 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-serif font-bold">Poetic Souls</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">A community for poetry lovers</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500">About</a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500">Guidelines</a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500">Privacy</a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500">Terms</a>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Poetic Souls. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;