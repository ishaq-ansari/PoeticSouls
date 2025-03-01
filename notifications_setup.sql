-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  sender_id UUID REFERENCES public.profiles(id),
  poem_id UUID REFERENCES public.poems(id),
  type VARCHAR(50) NOT NULL, -- 'like', 'comment', 'follow', etc.
  content TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up Row Level Security for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy for viewing notifications (users can only see their own)
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for inserting notifications (service role or the authenticated user)
CREATE POLICY "Users can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);  -- We'll control this through application logic

-- Policy for updating notifications (users can only update their own)
CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications (created_at);