import { supabase } from "./supabase";
import { Database } from "../types/supabase";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Poem = Database["public"]["Tables"]["poems"]["Row"];
export type Comment = Database["public"]["Tables"]["comments"]["Row"] & {
  profile?: Profile;
};

export async function signUp({
  email,
  password,
  displayName,
  useRealName,
}: {
  email: string;
  password: string;
  displayName: string;
  useRealName: boolean;
}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // Create a profile for the user
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        display_name: displayName,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`,
        use_real_name: useRealName,
      });

      if (profileError) throw profileError;
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error signing up:", error);
    return { data: null, error };
  }
}

export async function signIn({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("Error signing in:", error);
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error signing out:", error);
    return { error };
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error) {
    console.error("Error getting current user:", error);
    return { user: null, error };
  }
}

export async function getProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return { profile: data, error: null };
  } catch (error) {
    console.error("Error getting profile:", error);
    return { profile: null, error };
  }
}
