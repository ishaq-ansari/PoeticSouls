import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { X, PenSquare } from 'lucide-react';
import { useAuthStore, usePoemStore } from '../lib/store';

interface PoemFormData {
  title: string;
  content: string;
  isPublished: boolean;
}

const PoemEditor: React.FC = () => {
  const { user } = useAuthStore();
  const { createPoem } = usePoemStore();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<PoemFormData>();
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim().toLowerCase())) {
      setTags([...tags, tagInput.trim().toLowerCase()]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  const onSubmit = async (data: PoemFormData) => {
    if (!user) {
      navigate('/signin');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const poemData = {
        title: data.title,
        content: data.content,
        user_id: user.id, // This is correct because auth.users and profiles share the same id
        is_published: data.isPublished, // Fixed property name to match schema
        tags: tags,
      };
      
      const newPoem = await createPoem(poemData);
      navigate(`/poem/${newPoem.id}`);
    } catch (err: any) {
      console.error('Error creating poem:', err);
      setError(err.message || 'Failed to create poem. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-serif font-bold mb-4">Sign in to write a poem</h2>
        <button 
          onClick={() => navigate('/signin')}
          className="btn btn-primary"
        >
          Sign In
        </button>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-serif font-bold mb-6">Write a Poem</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="input"
            placeholder="Enter a title for your poem"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium mb-1">
            Content
          </label>
          <textarea
            id="content"
            rows={10}
            className="input font-serif"
            placeholder="Express yourself through words..."
            {...register('content', { required: 'Content is required' })}
          ></textarea>
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="tags" className="block text-sm font-medium mb-1">
            Tags
          </label>
          <div className="flex items-center">
            <input
              id="tags"
              type="text"
              className="input"
              placeholder="Add tags (e.g., love, nature, reflection)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="ml-2 btn btn-secondary"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <div key={tag} className="tag flex items-center">
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            id="isPublished"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            {...register('isPublished')}
            defaultChecked
          />
          <label htmlFor="isPublished" className="ml-2 block text-sm">
            Publish immediately (uncheck to save as draft)
          </label>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn btn-outline"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Poem'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PoemEditor;