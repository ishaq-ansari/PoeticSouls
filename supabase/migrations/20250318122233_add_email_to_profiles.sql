-- Add email column to profiles table for uniqueness checks
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
-- Create an index on the email column for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);
