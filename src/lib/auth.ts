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
    // Create the user account with metadata for the trigger function
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          // Include user metadata for the database trigger
          display_name: displayName,
          use_real_name: useRealName,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`
        }
      }
    });

    if (authError) {
      console.error("Auth error during signup:", authError);
      return { data: null, error: authError };
    }

    // For auto-confirmation enabled projects, sign in the user immediately
    if (data?.user && !data.user.email_confirmed_at && !data.session) {
      // If the user was created but there's no session, it means email confirmation is required
      return { 
        data, 
        error: {
          message: "Account created! Please check your email to confirm your account before signing in."
        } 
      };
    }

    // The profile will be created automatically by the database trigger
    return { data, error: null };
  } catch (error) {
    console.error("Error signing up:", error);
    return { 
      data: null, 
      error: {
        message: `Signup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    };
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
    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Sign in error:", error);
      
      // For better user experience, provide a clearer message
      if (error.message?.includes("Invalid login credentials")) {
        return { 
          data: null, 
          error: { 
            message: "Invalid email or password. If you just created your account, make sure to check your email for verification." 
          } 
        };
      }
      
      return { data: null, error };
    }

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
