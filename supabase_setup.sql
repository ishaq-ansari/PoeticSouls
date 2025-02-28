-- Create tables for Poetic Souls app

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  use_real_name BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create poems table
CREATE TABLE IF NOT EXISTS public.poems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  hashtags TEXT[] DEFAULT '{}'::TEXT[]
);

-- Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  poem_id UUID REFERENCES public.poems(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, poem_id)
);

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  poem_id UUID REFERENCES public.poems(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, poem_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  poem_id UUID REFERENCES public.poems(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up Row Level Security (RLS)

-- Profiles table policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY Public profiles are viewable by everyone.
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY Users can insert their own profile.
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY Users can update their own profile.
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Poems table policies
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;

CREATE POLICY Poems are viewable by everyone.
  ON public.poems FOR SELECT
  USING (true);

CREATE POLICY Users can insert their own poems.
  ON public.poems FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY Users can update their own poems.
  ON public.poems FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY Users can delete their own poems.
  ON public.poems FOR DELETE
  USING (auth.uid() = author_id);

-- Likes table policies
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY Likes are viewable by everyone.
  ON public.likes FOR SELECT
  USING (true);

CREATE POLICY Users can insert their own likes.
  ON public.likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY Users can delete their own likes.
  ON public.likes FOR DELETE
  USING (auth.uid() = user_id);

-- Bookmarks table policies
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY Bookmarks are viewable by the user who created them.
  ON public.bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY Users can insert their own bookmarks.
  ON public.bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY Users can delete their own bookmarks.
  ON public.bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- Comments table policies
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY Comments are viewable by everyone.
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY Users can insert their own comments.
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY Users can update their own comments.
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY Users can delete their own comments.
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS 267
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.email)
  );
  RETURN NEW;
END;
267 LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

