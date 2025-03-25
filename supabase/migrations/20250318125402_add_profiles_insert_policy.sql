-- Add INSERT policy for profiles table
-- This policy allows newly created users to insert their own profile
CREATE POLICY "Users can create their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
