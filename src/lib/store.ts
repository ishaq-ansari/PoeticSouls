import { create } from 'zustand';
import { supabase, AuthChangeEvent } from './supabase';
import type { Database } from './database.types';
import { Provider } from '@supabase/supabase-js';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Poem = Database['public']['Tables']['poems']['Row'] & {
  author: Profile;
  tags: { id: string; name: string }[];
};

interface AuthState {
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  emailVerified: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signInWithProvider: (provider: Provider) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  emailVerified: false,
  
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // After successful sign-in, check if email is verified
    if (data.user?.email_confirmed_at) {
      set({ user: data.user, emailVerified: true });
    } else {
      set({ user: data.user, emailVerified: false });
      throw new Error('Please verify your email before signing in. Check your inbox for a verification link.');
    }
  },
  
  signUp: async (email, password, username) => {
    // Check if the username is taken
    const { data: existingUsername } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single();
    
    if (existingUsername) {
      throw new Error('This username is already taken. Please choose a different username.');
    }
    
    // Check if email already exists by trying to sign in with OTP
    // This is a workaround since we can't directly query the auth.users table
    try {
      // Try to get a magic link for this email without creating a new user
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false
        }
      });
      
      // If there's no error, the email exists
      if (!otpError) {
        throw new Error('This email is already registered. Please use a different email or sign in.');
      }
      
      // If error contains "Email not confirmed", it means the email exists
      if (otpError.message?.toLowerCase().includes("not confirmed")) {
        throw new Error('This email is already registered but not verified. Please check your email inbox for a verification link.');
      }
    } catch (err: any) {
      // If the error is from our own throw above, re-throw it
      if (err.message?.includes('already registered')) {
        throw err;
      }
      // Otherwise, continue with signup (it might be an error like "User not found")
    }
    
    try {
      // Proceed with registration
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/signin',
          data: {
            username: username,
            display_name: username
          }
        }
      });
      
      // Special handling for duplicate email error from Supabase
      if (error) {
        if (error.message?.toLowerCase().includes('email') && 
            (error.message?.toLowerCase().includes('already') || 
             error.message?.toLowerCase().includes('taken'))) {
          throw new Error('This email is already registered. Please use a different email or sign in.');
        }
        throw error;
      }
      
      // Make sure we have a user object before proceeding
      if (!data || !data.user) {
        throw new Error('Registration failed. User data not returned from server.');
      }
      
      try {
        // Create profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username,
            display_name: username, // Set username as default display name
            email: email, // Store email in profiles table for lookup
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      } catch (profileErr) {
        console.error('Exception during profile creation:', profileErr);
      }
      
      // We don't set the user in the state yet since we require email verification
      set({ emailVerified: false });
      
      // Return a message about email verification
      return { success: true, message: 'Please check your email to verify your account before signing in.' };
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  },
  
  signInWithProvider: async (provider: Provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/auth/callback',
      },
    });
    
    if (error) throw error;
    
    // The OAuth flow will redirect the user, so we don't need to update state here
  },
  
  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, emailVerified: false });
  },
  
  fetchProfile: async () => {
    set({ isLoading: true });
    
    try {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      
      if (session?.user) {
        // Check if email is verified
        const emailVerified = !!session.user.email_confirmed_at;
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        // If no profile exists or was deleted, recreate it
        if (profileError || !profile) {
          console.log('No profile found or profile was deleted, recreating...');
          
          // Make sure we have an email to work with
          if (!session.user.email) {
            console.error('No email found for user when trying to recreate profile');
            set({ 
              user: session.user,
              profile: null,
              isLoading: false,
              emailVerified
            });
            return;
          }
          
          // Generate username from email or user metadata
          const username = session.user.user_metadata?.username || 
                          session.user.user_metadata?.preferred_username ||
                          session.user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') + '_' + 
                          Date.now().toString().slice(-4);
          
          const displayName = session.user.user_metadata?.display_name || 
                            session.user.user_metadata?.full_name || 
                            username;
          
          try {
            const { data: newProfile, error: createProfileError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                username: username,
                display_name: displayName,
                email: session.user.email,
                avatar_url: session.user.user_metadata?.avatar_url || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single();
              
            if (createProfileError) {
              console.error('Profile recreation error:', createProfileError);
              set({ 
                user: session.user,
                profile: null,
                isLoading: false,
                emailVerified
              });
              return;
            }
            
            set({ 
              user: session.user, 
              profile: newProfile || null, 
              isLoading: false,
              emailVerified
            });
          } catch (error) {
            console.error('Error recreating profile:', error);
            set({ 
              user: session.user,
              profile: null,
              isLoading: false,
              emailVerified
            });
          }
        } else {
          // Profile exists, use it
          set({ 
            user: session.user, 
            profile, 
            isLoading: false,
            emailVerified
          });
        }
      } else {
        set({ user: null, profile: null, isLoading: false, emailVerified: false });
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      set({ user: null, profile: null, isLoading: false, emailVerified: false });
    }
  },
  
  resendVerificationEmail: async (email) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: window.location.origin + '/signin',
      },
    });
    
    if (error) throw error;
  },
  
  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    
    if (error) throw error;
  },
  
  checkEmailVerification: async () => {
    const { data } = await supabase.auth.getUser();
    const emailVerified = !!data.user?.email_confirmed_at;
    set({ emailVerified });
    return emailVerified;
  },
}));

// Set up auth state listener
supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    useAuthStore.getState().fetchProfile();
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, profile: null, emailVerified: false });
  } else if (event === 'EMAIL_CONFIRMED') {
    useAuthStore.setState({ emailVerified: true });
    useAuthStore.getState().fetchProfile();
  }
});

interface PoemState {
  poems: Poem[];
  trendingPoems: Poem[];
  userPoems: Poem[];
  isLoading: boolean;
  fetchPoems: () => Promise<void>;
  fetchTrendingPoems: () => Promise<void>;
  fetchUserPoems: (userId: string) => Promise<void>;
  createPoem: (poem: any) => Promise<void>;
  likePoem: (poemId: string) => Promise<void>;
  bookmarkPoem: (poemId: string) => Promise<void>;
}

export const usePoemStore = create<PoemState>((set, get) => ({
  poems: [],
  trendingPoems: [],
  userPoems: [],
  isLoading: false,
  fetchPoems: async () => {
    set({ isLoading: true });
    
    const { data, error } = await supabase
      .from('poems')
      .select(`
        *,
        author:profiles(*),
        tags:poem_tags(tag_id(id, name))
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching poems:', error);
      set({ isLoading: false });
      return;
    }
    
    set({ poems: data as unknown as Poem[], isLoading: false });
  },
  fetchTrendingPoems: async () => {
    set({ isLoading: true });
    
    const { data, error } = await supabase
      .from('poems')
      .select(`
        *,
        author:profiles(*),
        tags:poem_tags(tag_id(id, name))
      `)
      .eq('is_published', true)
      .order('likes_count', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching trending poems:', error);
      set({ isLoading: false });
      return;
    }
    
    set({ trendingPoems: data as unknown as Poem[], isLoading: false });
  },
  fetchUserPoems: async (userId) => {
    set({ isLoading: true });
    
    const { data, error } = await supabase
      .from('poems')
      .select(`
        *,
        author:profiles(*),
        tags:poem_tags(tag_id(id, name))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user poems:', error);
      set({ isLoading: false });
      return;
    }
    
    set({ userPoems: data as unknown as Poem[], isLoading: false });
  },
  createPoem: async (poemData) => {
    try {
      const { user } = useAuthStore.getState();
      
      if (!user) {
        throw new Error('You must be signed in to create a poem');
      }
      
      // First, verify that the user has a profile in the profiles table
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (profileError || !existingProfile) {
        console.log('No profile found, attempting to create one...');
        
        // Generate a username based on email or fallback to a timestamp
        let username = '';
        if (user.email) {
          // Extract part before @ and ensure it's unique by adding a timestamp suffix
          username = user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') + '_' + Date.now().toString().slice(-4);
        } else {
          username = 'user_' + Date.now().toString();
        }
        
        // If no profile exists, create one automatically
        const { data: newProfile, error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: username,
            display_name: user.user_metadata?.full_name || username,
            avatar_url: user.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (createProfileError) {
          console.error('Profile creation error:', createProfileError);
          throw new Error('Failed to create user profile. Please try again.');
        }
        
        console.log('Profile created successfully:', newProfile);
        
        // Update the auth store with the new profile
        useAuthStore.setState({ profile: newProfile });
      }
      
      // Now create the poem with the verified user_id
      const { data: newPoem, error } = await supabase
        .from('poems')
        .insert({
          title: poemData.title,
          content: poemData.content,
          user_id: user.id,
          is_published: poemData.isPublished,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          likes_count: 0,
          comments_count: 0,
        })
        .select(`
          *,
          author:profiles(*),
          tags:poem_tags(tag_id(id, name))
        `)
        .single();
      
      if (error) {
        console.error('Poem creation error:', error);
        throw error;
      }

      // Process tags
      if (poemData.tags?.length > 0) {
        for (const tagName of poemData.tags) {
          // Check if tag exists
          let tagId;
          const { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName)
            .single();
          
          if (existingTag) {
            tagId = existingTag.id;
            // Increment tag count
            await supabase
              .from('tags')
              .update({ count: supabase.rpc('increment', { x: 1 }) })
              .eq('id', tagId);
          } else {
            // Create new tag
            const { data: newTag } = await supabase
              .from('tags')
              .insert({ name: tagName, count: 1 })
              .select()
              .single();
            
            if (newTag) {
              tagId = newTag.id;
            }
          }
          
          if (tagId) {
            // Create poem-tag relationship
            await supabase
              .from('poem_tags')
              .insert({
                poem_id: newPoem.id,
                tag_id: tagId,
              });
          }
        }
      }

      // Refresh poems after creating a new one
      await get().fetchPoems();
      return newPoem;
    } catch (error) {
      console.error('Error creating poem:', error);
      throw error;
    }
  },
  likePoem: async (poemId) => {
    const { user } = useAuthStore.getState();
    
    if (!user) return;
    
    const { data: existingLike } = await supabase
      .from('likes')
      .select('*')
      .eq('poem_id', poemId)
      .eq('user_id', user.id)
      .single();
    
    if (existingLike) {
      // Unlike
      await supabase
        .from('likes')
        .delete()
        .eq('id', existingLike.id);
      
      await supabase
        .from('poems')
        .update({ likes_count: supabase.rpc('decrement', { x: 1 }) })
        .eq('id', poemId);
    } else {
      // Like
      await supabase
        .from('likes')
        .insert({
          poem_id: poemId,
          user_id: user.id,
          created_at: new Date().toISOString(),
        });
      
      await supabase
        .from('poems')
        .update({ likes_count: supabase.rpc('increment', { x: 1 }) })
        .eq('id', poemId);
    }
    
    // Refresh poems
    get().fetchPoems();
  },
  bookmarkPoem: async (poemId) => {
    const { user } = useAuthStore.getState();
    
    if (!user) return;
    
    const { data: existingBookmark } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('poem_id', poemId)
      .eq('user_id', user.id)
      .single();
    
    if (existingBookmark) {
      // Remove bookmark
      await supabase
        .from('bookmarks')
        .delete()
        .eq('id', existingBookmark.id);
    } else {
      // Add bookmark
      await supabase
        .from('bookmarks')
        .insert({
          poem_id: poemId,
          user_id: user.id,
          created_at: new Date().toISOString(),
        });
    }
  },
}));