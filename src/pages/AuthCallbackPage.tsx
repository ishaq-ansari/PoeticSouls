import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/store';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { fetchProfile } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the URL hash and handle it
      const hash = window.location.hash;
      
      try {
        if (hash) {
          // Handle the OAuth response
          const { data, error } = await supabase.auth.getUser();
          
          if (error) {
            throw error;
          }
          
          if (data.user) {
            // Refresh the profile data
            await fetchProfile();
            
            // Redirect to home page
            navigate('/', { replace: true });
          }
        } else {
          // If there's no hash, might be a direct access or some error
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (sessionData.session) {
            // User is already logged in, redirect to home
            navigate('/', { replace: true });
          } else {
            // No session, redirect to sign in
            navigate('/signin', { replace: true });
          }
        }
      } catch (error: any) {
        console.error('Error during auth callback:', error);
        setError(error.message || 'An error occurred during authentication');
      }
    };

    handleAuthCallback();
  }, [fetchProfile, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {error ? (
        <div className="card p-6 max-w-md">
          <h1 className="text-xl font-bold mb-4 text-red-600">Authentication Error</h1>
          <p>{error}</p>
          <button
            className="btn btn-primary mt-4"
            onClick={() => navigate('/signin')}
          >
            Return to Sign In
          </button>
        </div>
      ) : (
        <>
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600 dark:border-primary-400"></div>
          <p className="mt-4 text-lg">Completing your sign in...</p>
        </>
      )}
    </div>
  );
};

export default AuthCallbackPage;