import { supabase } from "./supabase";
import { Profile } from "./auth";

export interface Notification {
  id: string;
  user_id: string;
  sender_id?: string;
  poem_id?: string;
  type: 'like' | 'comment' | 'follow' | 'system';
  content?: string;
  is_read: boolean;
  created_at: string;
  sender?: Profile;
  poem?: {
    id: string;
    title: string;
  };
}

// Create a notification
export async function createNotification({
  userId,
  senderId,
  poemId,
  type,
  content,
}: {
  userId: string;
  senderId?: string;
  poemId?: string;
  type: 'like' | 'comment' | 'follow' | 'system';
  content?: string;
}) {
  try {
    // Don't notify yourself
    if (userId === senderId) {
      return { notification: null, error: null };
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        sender_id: senderId,
        poem_id: poemId,
        type,
        content,
        is_read: false,
      })
      .select();

    if (error) throw error;

    return { notification: data && data[0], error: null };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { notification: null, error };
  }
}

// Get notifications for a user
export async function getNotifications(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:profiles!sender_id(*),
        poem:poems!poem_id(id, title)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;

    return { notifications: data, error: null };
  } catch (error) {
    console.error("Error getting notifications:", error);
    return { notifications: [], error };
  }
}

// Mark a notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return { error };
  }
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return { error };
  }
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: string) {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    return { count: count || 0, error: null };
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    return { count: 0, error };
  }
}