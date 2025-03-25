import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuthStore } from './store';
import { supabase } from './supabase';

type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  isEmailVerified: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, emailVerified, isLoading, fetchProfile } = useAuthStore();
  const [initialized, setInitialized] = useState(false);

  // Initialize auth state on first load
  useEffect(() => {
    const initAuth = async () => {
      await fetchProfile();
      setInitialized(true);
    };
    
    initAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchProfile();
      } else if (event === 'SIGNED_OUT') {
        fetchProfile();
      } else if (event === 'USER_UPDATED') {
        fetchProfile();
      } else if (event === 'PASSWORD_RECOVERY') {
        // Handle password recovery if needed
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Don't render children until we've initialized auth
  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  const value = {
    isAuthenticated: !!user,
    isLoading,
    isEmailVerified: emailVerified,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};