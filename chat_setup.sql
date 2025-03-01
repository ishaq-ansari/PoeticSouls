-- Create chat tables

-- Conversations table (represents a chat between two users)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Participants table (connects users to conversations)
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(conversation_id, profile_id)
);

-- Messages table (stores individual messages)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversation policies
CREATE POLICY "Users can view their own conversations"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants 
      WHERE conversation_id = public.conversations.id 
      AND profile_id = auth.uid()
    )
  );

-- Conversation participants policies
CREATE POLICY "Users can view participants in their conversations"
  ON public.conversation_participants FOR SELECT
  USING (
    profile_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.conversation_participants 
      WHERE conversation_id = public.conversation_participants.conversation_id 
      AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert themselves as participants"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants 
      WHERE conversation_id = public.messages.conversation_id 
      AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversation_participants 
      WHERE conversation_id = public.messages.conversation_id 
      AND profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can update read status of messages in their conversations"
  ON public.messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants 
      WHERE conversation_id = public.messages.conversation_id 
      AND profile_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Only allow updating the is_read field
    sender_id = sender_id AND
    conversation_id = conversation_id AND
    content = content AND
    created_at = created_at
  );

-- Create function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update conversation timestamp when new message is added
CREATE OR REPLACE TRIGGER update_conversation_timestamp_trigger
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Function to find or create a conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(user_id_1 UUID, user_id_2 UUID)
RETURNS UUID AS $$
DECLARE
  conv_id UUID;
BEGIN
  -- First check if a conversation already exists between these users
  SELECT c.id INTO conv_id
  FROM public.conversations c
  JOIN public.conversation_participants p1 ON c.id = p1.conversation_id AND p1.profile_id = user_id_1
  JOIN public.conversation_participants p2 ON c.id = p2.conversation_id AND p2.profile_id = user_id_2
  WHERE p1.profile_id = user_id_1 AND p2.profile_id = user_id_2
  LIMIT 1;
  
  -- If conversation exists, return it
  IF conv_id IS NOT NULL THEN
    RETURN conv_id;
  END IF;
  
  -- Otherwise create a new conversation
  INSERT INTO public.conversations DEFAULT VALUES
  RETURNING id INTO conv_id;
  
  -- Add participants
  INSERT INTO public.conversation_participants(conversation_id, profile_id)
  VALUES (conv_id, user_id_1), (conv_id, user_id_2);
  
  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;