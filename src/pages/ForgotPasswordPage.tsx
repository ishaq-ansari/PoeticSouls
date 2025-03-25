import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../lib/store';
import { ArrowLeft, Send } from 'lucide-react';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>();
  
  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await resetPassword(data.email);
      setSuccess(`Recovery link sent to ${data.email}. Please check your inbox.`);
    } catch (err: any) {
      setError(err.message || 'Failed to send recovery email');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto my-8">
      <div className="card p-8">
        <h1 className="text-3xl font-serif font-bold mb-6 text-center">Reset Password</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
            {success}
            <p className="mt-2">
              <Link to="/signin" className="text-green-700 dark:text-green-400 underline">
                Return to Sign In
              </Link>
            </p>
          </div>
        )}
        
        {!success && (
          <>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            
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
              
              <button
                type="submit"
                className="btn btn-primary w-full flex items-center justify-center"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Recovery Link'}
                <Send size={18} className="ml-2" />
              </button>
            </form>
          </>
        )}
        
        <div className="mt-6 text-center">
          <Link 
            to="/signin" 
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center justify-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;