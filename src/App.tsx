import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import TrendingPage from './pages/TrendingPage';
import ChallengesPage from './pages/ChallengesPage';
import MyPoemsPage from './pages/MyPoemsPage';
import WritePoemPage from './pages/WritePoemPage';
import PoemDetailPage from './pages/PoemDetailPage';
import ProfilePage from './pages/ProfilePage';
import BookmarksPage from './pages/BookmarksPage';
import TagPage from './pages/TagPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import EmailVerificationPage from './pages/EmailVerificationPage';

import { useAuth } from './lib/AuthProvider';
import { useAuthStore } from './lib/store';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isEmailVerified } = useAuth();
  const { user } = useAuthStore();
  
  if (!isAuthenticated) {
    // Redirect to sign in if not logged in
    return <Navigate to="/signin" replace />;
  }
  
  if (!isEmailVerified) {
    // Redirect to email verification page if email is not verified
    return <Navigate to={`/verify-email?email=${user?.email}`} replace />;
  }
  
  return <>{children}</>;
};

function App() {
  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  return (
    <Router>
      <Routes>
        {/* Auth routes outside layout */}
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        
        <Route path="/" element={<Layout />}>
          {/* Public routes */}
          <Route index element={<HomePage />} />
          <Route path="trending" element={<TrendingPage />} />
          <Route path="challenges" element={<ChallengesPage />} />
          <Route path="tag/:tagName" element={<TagPage />} />
          <Route path="poem/:id" element={<PoemDetailPage />} />
          <Route path="profile/:id" element={<ProfilePage />} />
          
          {/* Auth routes */}
          <Route path="signin" element={<SignInPage />} />
          <Route path="signup" element={<SignUpPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="verify-email" element={<EmailVerificationPage />} />
          
          {/* Protected routes */}
          <Route path="my-poems" element={
            <ProtectedRoute>
              <MyPoemsPage />
            </ProtectedRoute>
          } />
          <Route path="write" element={
            <ProtectedRoute>
              <WritePoemPage />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="bookmarks" element={
            <ProtectedRoute>
              <BookmarksPage />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App; 