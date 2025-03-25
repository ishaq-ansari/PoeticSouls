export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      poems: {
        Row: {
          id: string
          title: string
          content: string
          user_id: string
          created_at: string
          updated_at: string
          is_published: boolean
          likes_count: number
          comments_count: number
        }
        Insert: {
          id?: string
          title: string
          content: string
          user_id: string
          created_at?: string
          updated_at?: string
          is_published?: boolean
          likes_count?: number
          comments_count?: number
        }
        Update: {
          id?: string
          title?: string
          content?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          is_published?: boolean
          likes_count?: number
          comments_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "poems_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
          count: number
        }
        Insert: {
          id?: string
          name: string
          count?: number
        }
        Update: {
          id?: string
          name?: string
          count?: number
        }
        Relationships: []
      }
      poem_tags: {
        Row: {
          id: string
          poem_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          poem_id: string
          tag_id: string
        }
        Update: {
          id?: string
          poem_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poem_tags_poem_id_fkey"
            columns: ["poem_id"]
            isOneToOne: false
            referencedRelation: "poems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poem_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          }
        ]
      }
      likes: {
        Row: {
          id: string
          poem_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          poem_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          poem_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_poem_id_fkey"
            columns: ["poem_id"]
            isOneToOne: false
            referencedRelation: "poems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          id: string
          poem_id: string
          user_id: string
          content: string
          created_at: string
          parent_id: string | null
        }
        Insert: {
          id?: string
          poem_id: string
          user_id: string
          content: string
          created_at?: string
          parent_id?: string | null
        }
        Update: {
          id?: string
          poem_id?: string
          user_id?: string
          content?: string
          created_at?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_poem_id_fkey"
            columns: ["poem_id"]
            isOneToOne: false
            referencedRelation: "poems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          }
        ]
      }
      bookmarks: {
        Row: {
          id: string
          poem_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          poem_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          poem_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_poem_id_fkey"
            columns: ["poem_id"]
            isOneToOne: false
            referencedRelation: "poems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      challenges: {
        Row: {
          id: string
          title: string
          description: string
          start_date: string
          end_date: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          start_date: string
          end_date: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          start_date?: string
          end_date?: string
          created_at?: string
        }
        Relationships: []
      }
      challenge_entries: {
        Row: {
          id: string
          challenge_id: string
          poem_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          poem_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          challenge_id?: string
          poem_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_entries_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_entries_poem_id_fkey"
            columns: ["poem_id"]
            isOneToOne: false
            referencedRelation: "poems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment: {
        Args: {
          x: number
        }
        Returns: number
      }
      decrement: {
        Args: {
          x: number
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}