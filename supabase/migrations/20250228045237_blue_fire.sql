/*
  # Initial Schema for Poetic Souls

  1. New Tables
    - `profiles` - User profiles with username, display name, avatar, and bio
    - `poems` - Poetry content with title, content, and metadata
    - `tags` - Categories and themes for poems
    - `poem_tags` - Junction table linking poems to tags
    - `likes` - Records of users liking poems
    - `comments` - User comments on poems, with support for threaded replies
    - `bookmarks` - User bookmarks of poems
    - `challenges` - Poetry challenges and prompts
    - `challenge_entries` - Poems submitted to challenges

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
    - Add policies for public access to published content
*/

-- IMPORTANT: Order matters for foreign key references!

-- Step 1: Create the profiles table first
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Apply RLS to profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing profile policies to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create policies for profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Step 2: Now create poems table, which references profiles
CREATE TABLE IF NOT EXISTS public.poems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_published boolean DEFAULT true,
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0
);

-- Apply RLS to poems
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;

-- Drop existing poem policies 
DROP POLICY IF EXISTS "Published poems are viewable by everyone" ON public.poems;
DROP POLICY IF EXISTS "Users can view their own unpublished poems" ON public.poems;
DROP POLICY IF EXISTS "Users can create poems" ON public.poems;
DROP POLICY IF EXISTS "Users can update their own poems" ON public.poems;
DROP POLICY IF EXISTS "Users can delete their own poems" ON public.poems;

-- Create policies for poems
CREATE POLICY "Published poems are viewable by everyone"
  ON public.poems
  FOR SELECT
  USING (is_published = true);

CREATE POLICY "Users can view their own unpublished poems"
  ON public.poems
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create poems"
  ON public.poems
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own poems"
  ON public.poems
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own poems"
  ON public.poems
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 3: Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  count integer DEFAULT 0
);

-- Apply RLS to tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Drop existing tag policies
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can create tags" ON public.tags;

-- Create policies for tags
CREATE POLICY "Tags are viewable by everyone"
  ON public.tags
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tags"
  ON public.tags
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Step 4: Create poem_tags junction table
CREATE TABLE IF NOT EXISTS public.poem_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id uuid NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  UNIQUE(poem_id, tag_id)
);

-- Apply RLS to poem_tags
ALTER TABLE public.poem_tags ENABLE ROW LEVEL SECURITY;

-- Drop existing poem_tags policies
DROP POLICY IF EXISTS "Poem tags are viewable by everyone" ON public.poem_tags;
DROP POLICY IF EXISTS "Users can add tags to their own poems" ON public.poem_tags;
DROP POLICY IF EXISTS "Users can remove tags from their own poems" ON public.poem_tags;

-- Create policies for poem_tags
CREATE POLICY "Poem tags are viewable by everyone"
  ON public.poem_tags
  FOR SELECT
  USING (true);

CREATE POLICY "Users can add tags to their own poems"
  ON public.poem_tags
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.poems WHERE id = poem_id
    )
  );

CREATE POLICY "Users can remove tags from their own poems"
  ON public.poem_tags
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.poems WHERE id = poem_id
    )
  );

-- Step 5: Create likes table
CREATE TABLE IF NOT EXISTS public.likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id uuid NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poem_id, user_id)
);

-- Apply RLS to likes
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Drop existing likes policies
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;
DROP POLICY IF EXISTS "Users can like poems" ON public.likes;
DROP POLICY IF EXISTS "Users can unlike poems" ON public.likes;

-- Create policies for likes
CREATE POLICY "Likes are viewable by everyone"
  ON public.likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can like poems"
  ON public.likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike poems"
  ON public.likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 6: Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id uuid NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE
);

-- Apply RLS to comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Drop existing comments policies
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.comments;

-- Create policies for comments
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON public.comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.comments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 7: Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id uuid NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poem_id, user_id)
);

-- Apply RLS to bookmarks
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Drop existing bookmarks policies
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can create bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmarks;

-- Create policies for bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON public.bookmarks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookmarks"
  ON public.bookmarks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON public.bookmarks
  FOR DELETE
  USING (auth.uid() = user_id);

-- Step 8: Create challenges table
CREATE TABLE IF NOT EXISTS public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Apply RLS to challenges
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Drop existing challenges policies
DROP POLICY IF EXISTS "Challenges are viewable by everyone" ON public.challenges;

-- Create policies for challenges
CREATE POLICY "Challenges are viewable by everyone"
  ON public.challenges
  FOR SELECT
  USING (true);

-- Step 9: Create challenge_entries table
CREATE TABLE IF NOT EXISTS public.challenge_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  poem_id uuid NOT NULL REFERENCES public.poems(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, poem_id)
);

-- Apply RLS to challenge_entries
ALTER TABLE public.challenge_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing challenge_entries policies
DROP POLICY IF EXISTS "Challenge entries are viewable by everyone" ON public.challenge_entries;
DROP POLICY IF EXISTS "Users can submit their poems to challenges" ON public.challenge_entries;

-- Create policies for challenge_entries
CREATE POLICY "Challenge entries are viewable by everyone"
  ON public.challenge_entries
  FOR SELECT
  USING (true);

CREATE POLICY "Users can submit their poems to challenges"
  ON public.challenge_entries
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    auth.uid() IN (
      SELECT user_id FROM public.poems WHERE id = poem_id
    )
  );

-- Create helper functions
CREATE OR REPLACE FUNCTION public.increment(x integer)
RETURNS integer AS $$
  BEGIN
    RETURN x + 1;
  END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.decrement(x integer)
RETURNS integer AS $$
  BEGIN
    RETURN GREATEST(0, x - 1);
  END;
$$ LANGUAGE plpgsql;