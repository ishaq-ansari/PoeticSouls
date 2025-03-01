import { supabase } from "./supabase";
import { Profile } from "./auth";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants?: Profile[];
  last_message?: Message;
  unread_count?: number;
}

// Function to get or create a conversation between two users
export async function getOrCreateConversation(userId: string, otherUserId: string) {
  try {
    // Call the database function we created in chat_setup.sql
    const { data, error } = await supabase
      .rpc('get_or_create_conversation', {
        user_id_1: userId,
        user_id_2: otherUserId
      });

    if (error) throw error;
    
    return { conversationId: data, error: null };
  } catch (error) {
    console.error("Error getting/creating conversation:", error);
    return { conversationId: null, error };
  }
}

// Function to get a user's conversations
export async function getUserConversations(userId: string) {
  try {
    // Get conversations the user participates in
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select(`
        *,
        conversation_participants!inner(profile_id)
      `)
      .eq('conversation_participants.profile_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // For each conversation, get the participants and last message
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        // Get participants
        const { data: participants } = await supabase
          .from("conversation_participants")
          .select(`
            profiles(*)
          `)
          .eq('conversation_id', conversation.id);

        // Get last message
        const { data: messages } = await supabase
          .from("messages")
          .select(`
            *,
            sender:profiles(*)
          `)
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Get unread count
        const { count } = await supabase
          .from("messages")
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conversation.id)
          .eq('is_read', false)
          .neq('sender_id', userId);

        // Map participants to profile objects
        const profilesArray = participants?.map(p => p.profiles) || [];
        
        // Filter out the current user from participants
        const otherParticipants = profilesArray.filter(p => p.id !== userId);

        return {
          ...conversation,
          participants: otherParticipants,
          last_message: messages?.[0] || null,
          unread_count: count || 0
        };
      })
    );

    return { conversations: conversationsWithDetails, error: null };
  } catch (error) {
    console.error("Error getting user conversations:", error);
    return { conversations: [], error };
  }
}

// Function to get messages for a conversation
export async function getConversationMessages(conversationId: string) {
  try {
    const { data: messages, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:profiles(*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    
    return { messages, error: null };
  } catch (error) {
    console.error("Error getting conversation messages:", error);
    return { messages: [], error };
  }
}

// Function to send a message
export async function sendMessage({
  conversationId,
  senderId,
  content
}: {
  conversationId: string;
  senderId: string;
  content: string;
}) {
  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      })
      .select(`
        *,
        sender:profiles(*)
      `);

    if (error) throw error;
    
    return { message: data?.[0], error: null };
  } catch (error) {
    console.error("Error sending message:", error);
    return { message: null, error };
  }
}

// Function to mark messages as read
export async function markMessagesAsRead(conversationId: string, userId: string) {
  try {
    // Only mark messages as read that were sent by other users
    const { error } = await supabase
      .from("messages")
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('is_read', false)
      .neq('sender_id', userId);

    if (error) throw error;
    
    return { error: null };
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return { error };
  }
}

// Function to get a user's profile by ID (for finding chat participants)
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
      
    if (error) throw error;
    
    return { profile: data, error: null };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return { profile: null, error };
  }
}

// Function to get unread message count for a user
export async function getUnreadMessageCount(userId: string) {
  try {
    const { count, error } = await supabase
      .from("messages")
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
      .neq('sender_id', userId)
      .in('conversation_id', supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', userId)
      );

    if (error) throw error;
    
    return { count: count || 0, error: null };
  } catch (error) {
    console.error("Error getting unread message count:", error);
    return { count: 0, error };
  }
}