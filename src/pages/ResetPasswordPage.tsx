import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { Lock } from 'lucide-react';

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormData>();
  const password = watch('password');
  
  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      
      if (error) throw error;
      
      setSuccess('Password updated successfully!');
      
      // After 3 seconds, redirect to sign-in page
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto my-8">
      <div className="card p-8">
        <h1 className="text-3xl font-serif font-bold mb-6 text-center">Set New Password</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400">
            {success}
            <p className="mt-2">Redirecting you to sign in page...</p>
          </div>
        )}
        
        {!success && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                New Password
              </label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  }
                })}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="input"
                placeholder="••••••••"
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
              <Lock size={18} className="ml-2" />
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Remember your password?{' '}
            <Link to="/signin" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;