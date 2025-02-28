export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      poems: {
        Row: {
          id: string;
          title: string;
          content: string;
          author_id: string;
          created_at: string;
          hashtags: string[];
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          author_id: string;
          created_at?: string;
          hashtags?: string[];
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          author_id?: string;
          created_at?: string;
          hashtags?: string[];
        };
      };
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          use_real_name: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          use_real_name?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          use_real_name?: boolean;
          created_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          poem_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          poem_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          poem_id?: string;
          created_at?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          poem_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          poem_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          poem_id?: string;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          poem_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          poem_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          poem_id?: string;
          content?: string;
          created_at?: string;
        };
      };
    };
  };
}
