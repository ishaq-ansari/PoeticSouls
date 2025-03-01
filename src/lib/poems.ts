import { supabase } from "./supabase";
import { Poem, Comment } from "./auth";
import { createNotification } from "./notifications";

export async function getPoems() {
  try {
    const { data: poems, error } = await supabase
      .from("poems")
      .select(`*, profiles(*)`) // Join with profiles to get author info
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Get likes and comments counts for each poem
    if (poems && poems.length > 0) {
      const poemsWithCounts = await Promise.all(
        poems.map(async (poem) => {
          const [likesResult, commentsResult] = await Promise.all([
            getLikesCount(poem.id),
            getCommentsCount(poem.id)
          ]);
          
          return {
            ...poem,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0
          };
        })
      );
      
      return { poems: poemsWithCounts, error: null };
    }

    return { poems, error: null };
  } catch (error) {
    console.error("Error getting poems:", error);
    return { poems: null, error };
  }
}

export async function getLikesCount(poemId: string) {
  try {
    const { count, error } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("poem_id", poemId);
      
    if (error) throw error;
    return { count, error: null };
  } catch (error) {
    console.error("Error getting likes count:", error);
    return { count: 0, error };
  }
}

export async function getCommentsCount(poemId: string) {
  try {
    const { count, error } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("poem_id", poemId);
      
    if (error) throw error;
    return { count, error: null };
  } catch (error) {
    console.error("Error getting comments count:", error);
    return { count: 0, error };
  }
}

export async function getTrendingPoems() {
  try {
    // First get poems
    const { data: poems, error } = await supabase
      .from("poems")
      .select(`*, profiles(*)`)
      .order("created_at", { ascending: false })
      .limit(50); // Get a reasonable number to start with
      
    if (error) throw error;
    
    // If no poems, return early
    if (!poems || poems.length === 0) {
      return { poems: [], error: null };
    }
    
    // Get likes for each poem to determine trending
    const poemsWithCounts = await Promise.all(
      poems.map(async (poem) => {
        const [likesResult, commentsResult] = await Promise.all([
          getLikesCount(poem.id),
          getCommentsCount(poem.id)
        ]);
        
        return {
          ...poem,
          likes_count: likesResult.count || 0,
          comments_count: commentsResult.count || 0,
          // Calculate a trending score based on likes and comments
          trending_score: (likesResult.count || 0) * 2 + (commentsResult.count || 0) * 3
        };
      })
    );
    
    // Sort by trending score and return top 20
    const sortedPoems = poemsWithCounts
      .sort((a, b) => b.trending_score - a.trending_score)
      .slice(0, 20);
      
    return { poems: sortedPoems, error: null };
  } catch (error) {
    console.error("Error getting trending poems:", error);
    return { poems: null, error };
  }
}

export async function getUserPoems(userId: string) {
  try {
    const { data: poems, error } = await supabase
      .from("poems")
      .select(`*, profiles(*)`)
      .eq("author_id", userId)
      .order("created_at", { ascending: false });
      
    if (error) throw error;

    // Get likes and comments counts for each poem
    if (poems && poems.length > 0) {
      const poemsWithCounts = await Promise.all(
        poems.map(async (poem) => {
          const [likesResult, commentsResult] = await Promise.all([
            getLikesCount(poem.id),
            getCommentsCount(poem.id)
          ]);
          
          return {
            ...poem,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0
          };
        })
      );
      
      return { poems: poemsWithCounts, error: null };
    }
    
    return { poems, error: null };
  } catch (error) {
    console.error("Error getting user poems:", error);
    return { poems: null, error };
  }
}

export async function getBookmarkedPoems(userId: string) {
  try {
    // First get bookmarks for the user
    const { data: bookmarks, error: bookmarksError } = await supabase
      .from("bookmarks")
      .select("poem_id")
      .eq("user_id", userId);
      
    if (bookmarksError) throw bookmarksError;
    
    if (!bookmarks || bookmarks.length === 0) {
      return { poems: [], error: null };
    }
    
    // Get the poem IDs from bookmarks
    const poemIds = bookmarks.map(bookmark => bookmark.poem_id);
    
    // Fetch the actual poems
    const { data: poems, error: poemsError } = await supabase
      .from("poems")
      .select(`*, profiles(*)`)
      .in("id", poemIds)
      .order("created_at", { ascending: false });
      
    if (poemsError) throw poemsError;
    
    // Get likes and comments counts for each poem
    if (poems && poems.length > 0) {
      const poemsWithCounts = await Promise.all(
        poems.map(async (poem) => {
          const [likesResult, commentsResult] = await Promise.all([
            getLikesCount(poem.id),
            getCommentsCount(poem.id)
          ]);
          
          return {
            ...poem,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0,
            isBookmarked: true
          };
        })
      );
      
      return { poems: poemsWithCounts, error: null };
    }
    
    return { poems, error: null };
  } catch (error) {
    console.error("Error getting bookmarked poems:", error);
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
    const { data: poem, error } = await supabase
      .from("poems")
      .select(`*, profiles(*)`) // Join with profiles to get author info
      .eq("id", poemId)
      .single();
      
    if (error) throw error;
    
    // Get likes and comments counts
    const [likesResult, commentsResult] = await Promise.all([
      getLikesCount(poemId),
      getCommentsCount(poemId)
    ]);
    
    const poemWithCounts = {
      ...poem,
      likes_count: likesResult.count || 0,
      comments_count: commentsResult.count || 0
    };
    
    return { poem: poemWithCounts, error: null };
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

    // Get the poem to find the author for notification
    const { data: poem } = await supabase
      .from("poems")
      .select("author_id, title")
      .eq("id", poemId)
      .single();

    // Create a notification for the poem author
    if (poem && poem.author_id !== userId) {
      await createNotification({
        userId: poem.author_id,
        senderId: userId,
        poemId: poemId,
        type: 'comment',
        content: content.substring(0, 100) // Include part of the comment in the notification
      });
    }
    
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

      // Get the poem to find the author for notification
      const { data: poem } = await supabase
        .from("poems")
        .select("author_id, title")
        .eq("id", poemId)
        .single();

      // Create a notification for the poem author
      if (poem && poem.author_id !== userId) {
        await createNotification({
          userId: poem.author_id,
          senderId: userId,
          poemId: poemId,
          type: 'like',
        });
      }
      
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
