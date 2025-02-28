import { supabase } from "./supabase";
import { Poem, Comment } from "./auth";

export async function getPoems() {
  try {
    const { data, error } = await supabase
      .from("poems")
      .select(`*, profiles(*)`) // Join with profiles to get author info
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { poems: data, error: null };
  } catch (error) {
    console.error("Error getting poems:", error);
    return { poems: null, error };
  }
}

export async function getTrendingPoems() {
  try {
    // Get poems with the most likes in the last 7 days
    const { data, error } = await supabase
      .from("poems")
      .select(`*, profiles(*), likes(count)`) // Join with profiles and count likes
      .order("likes.count", { ascending: false })
      .limit(20);

    if (error) throw error;

    return { poems: data, error: null };
  } catch (error) {
    console.error("Error getting trending poems:", error);
    return { poems: null, error };
  }
}

export async function getUserPoems(userId: string) {
  try {
    const { data, error } = await supabase
      .from("poems")
      .select(`*`)
      .eq("author_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { poems: data, error: null };
  } catch (error) {
    console.error("Error getting user poems:", error);
    return { poems: null, error };
  }
}

export async function createPoem({
  title,
  content,
  hashtags,
  authorId,
}: {
  title: string;
  content: string;
  hashtags: string[];
  authorId: string;
}) {
  try {
    const { data, error } = await supabase
      .from("poems")
      .insert({
        title,
        content,
        hashtags,
        author_id: authorId,
      })
      .select();

    if (error) throw error;

    return { poem: data[0], error: null };
  } catch (error) {
    console.error("Error creating poem:", error);
    return { poem: null, error };
  }
}

export async function getPoemById(poemId: string) {
  try {
    const { data, error } = await supabase
      .from("poems")
      .select(`*, profiles(*)`) // Join with profiles to get author info
      .eq("id", poemId)
      .single();

    if (error) throw error;

    return { poem: data, error: null };
  } catch (error) {
    console.error("Error getting poem:", error);
    return { poem: null, error };
  }
}

export async function getCommentsByPoemId(poemId: string) {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select(`*, profiles(*)`) // Join with profiles to get author info
      .eq("poem_id", poemId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { comments: data, error: null };
  } catch (error) {
    console.error("Error getting comments:", error);
    return { comments: null, error };
  }
}

export async function addComment({
  poemId,
  userId,
  content,
}: {
  poemId: string;
  userId: string;
  content: string;
}) {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert({
        poem_id: poemId,
        user_id: userId,
        content,
      })
      .select(`*, profiles(*)`);

    if (error) throw error;

    return { comment: data[0], error: null };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { comment: null, error };
  }
}

export async function likePoem({
  poemId,
  userId,
}: {
  poemId: string;
  userId: string;
}) {
  try {
    // Check if already liked
    const { data: existingLike } = await supabase
      .from("likes")
      .select("*")
      .eq("poem_id", poemId)
      .eq("user_id", userId);

    if (existingLike && existingLike.length > 0) {
      // Already liked, so unlike
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("poem_id", poemId)
        .eq("user_id", userId);

      if (error) throw error;
      return { liked: false, error: null };
    } else {
      // Not liked, so like
      const { error } = await supabase.from("likes").insert({
        poem_id: poemId,
        user_id: userId,
      });

      if (error) throw error;
      return { liked: true, error: null };
    }
  } catch (error) {
    console.error("Error liking poem:", error);
    return { liked: null, error };
  }
}

export async function bookmarkPoem({
  poemId,
  userId,
}: {
  poemId: string;
  userId: string;
}) {
  try {
    // Check if already bookmarked
    const { data: existingBookmark } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("poem_id", poemId)
      .eq("user_id", userId);

    if (existingBookmark && existingBookmark.length > 0) {
      // Already bookmarked, so unbookmark
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("poem_id", poemId)
        .eq("user_id", userId);

      if (error) throw error;
      return { bookmarked: false, error: null };
    } else {
      // Not bookmarked, so bookmark
      const { error } = await supabase.from("bookmarks").insert({
        poem_id: poemId,
        user_id: userId,
      });

      if (error) throw error;
      return { bookmarked: true, error: null };
    }
  } catch (error) {
    console.error("Error bookmarking poem:", error);
    return { bookmarked: null, error };
  }
}

export async function checkUserInteractions({
  poemId,
  userId,
}: {
  poemId: string;
  userId: string;
}) {
  try {
    // Check if liked
    const { data: likeData } = await supabase
      .from("likes")
      .select("*")
      .eq("poem_id", poemId)
      .eq("user_id", userId);

    // Check if bookmarked
    const { data: bookmarkData } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("poem_id", poemId)
      .eq("user_id", userId);

    return {
      isLiked: likeData && likeData.length > 0,
      isBookmarked: bookmarkData && bookmarkData.length > 0,
      error: null,
    };
  } catch (error) {
    console.error("Error checking user interactions:", error);
    return { isLiked: false, isBookmarked: false, error };
  }
}
