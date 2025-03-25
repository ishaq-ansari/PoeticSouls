import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../lib/store';

// Import icons
import { ArrowRight, Mail, AlertCircle } from 'lucide-react';

interface SignInFormData {
  email: string;
  password: string;
}

const SignInPage: React.FC = () => {
  const { signIn, signInWithProvider, emailVerified, checkEmailVerification, resendVerificationEmail } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [configErrorVisible, setConfigErrorVisible] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<SignInFormData>();
  
  useEffect(() => {
    const verifyEmailStatus = async () => {
      const isVerified = await checkEmailVerification();
      if (isVerified) {
        navigate('/');
      }
    };
    
    verifyEmailStatus();
  }, [checkEmailVerification, navigate, emailVerified]);

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await signIn(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setEmail(data.email);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialSignIn = async (provider: 'google' | 'apple') => {
    try {
      setIsLoading(true);
      await signInWithProvider(provider);
      // The redirect will happen automatically, no need to navigate
    } catch (err: any) {
      console.error("Auth error:", err);
      // Check if this is a provider configuration error
      if (err.message?.includes("provider is not enabled") || err.error_code === "validation_failed") {
        setConfigErrorVisible(true);
      } else {
        setError(err.message || `Failed to sign in with ${provider}`);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    
    setIsLoading(true);
    try {
      await resendVerificationEmail(email);
      setSuccess('Verification email sent. Please check your inbox.');
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto my-8">
      {configErrorVisible ? (
        <div className="card p-8">
          <div className="flex justify-center mb-6 text-yellow-600">
            <AlertCircle size={48} />
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">OAuth Provider Not Configured</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4 dark:bg-yellow-900/20 dark:border-yellow-800">
            <p className="mb-2">The OAuth provider you selected is not enabled in your Supabase project. To enable it:</p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Go to the Supabase dashboard</li>
              <li>Select your project</li>
              <li>Go to Authentication &gt; Providers</li>
              <li>Enable and configure Google and/or Apple providers</li>
              <li>Add the correct redirect URLs</li>
            </ol>
          </div>
          <button 
            className="btn btn-primary w-full mt-4"
            onClick={() => setConfigErrorVisible(false)}
          >
            Return to Sign In
          </button>
        </div>
      ) : (
        <div className="card p-8">
          <h1 className="text-3xl font-serif font-bold mb-6 text-center">Sign In</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
              {error}
              {error.includes('verify your email') && (
                <button 
                  onClick={handleResendVerification}
                  className="text-red-700 dark:text-red-400 underline ml-2"
                >
                  Resend verification email
                </button>
              )}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="your@email.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  }
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            
            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Forgot password?
              </Link>
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In with Email'}
              <Mail size={18} className="ml-2" />
            </button>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialSignIn('google')}
                className="btn btn-outline flex items-center justify-center"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
              
              <button
                type="button"
                onClick={() => handleSocialSignIn('apple')}
                className="btn btn-outline flex items-center justify-center"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z" />
                </svg>
                Apple
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                Sign Up <ArrowRight size={16} className="inline" />
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignInPage;