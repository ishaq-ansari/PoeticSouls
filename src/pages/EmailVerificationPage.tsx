import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import { Mail, ArrowRight } from 'lucide-react';

const EmailVerificationPage: React.FC = () => {
  const { resendVerificationEmail } = useAuthStore();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleResendEmail = async () => {
    if (!email) {
      setError('No email address provided');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await resendVerificationEmail(email);
      setSuccess('Verification email sent! Please check your inbox and spam folder.');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto my-8">
      <div className="card p-8">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-primary-100 p-4 dark:bg-primary-900/30">
            <Mail size={36} className="text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        
        <h1 className="text-3xl font-serif font-bold mb-2 text-center">Verify Your Email</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          We've sent a verification link to{' '}
          <span className="font-medium">{email || 'your email address'}</span>
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
            {success}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-800/50 p-4 rounded">
            <h2 className="font-medium mb-2">What to do next:</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Check your email inbox for the verification link</li>
              <li>Click the link in the email to verify your account</li>
              <li>If you don't see the email, check your spam folder</li>
              <li>After verifying, return to the sign-in page</li>
            </ul>
          </div>
          
          <div className="text-center">
            <button
              onClick={handleResendEmail}
              className="btn btn-outline"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
          
          <div className="text-center">
            <Link to="/signin" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 inline-flex items-center">
              Go to Sign In
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;