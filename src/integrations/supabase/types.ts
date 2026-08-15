export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          category: string
          created_at: string
          creator_id: string
          description: string | null
          download_count: number
          download_file_path: string | null
          engines: string[]
          file_size: number
          formats: string[]
          id: string
          included_files: string[]
          license: string
          like_count: number
          moderation_status: Database["public"]["Enums"]["moderation_status"]
          name: string
          preview_model_url: string | null
          scan_result: Json | null
          scan_status: Database["public"]["Enums"]["scan_status"]
          scan_timestamp: string | null
          slug: string
          tags: string[]
          thumbnail_url: string | null
          triangle_count: number | null
          updated_at: string
          upload_status: Database["public"]["Enums"]["upload_status"]
          validation_status: Database["public"]["Enums"]["validation_status"]
          version: string
        }
        Insert: {
          category: string
          created_at?: string
          creator_id: string
          description?: string | null
          download_count?: number
          download_file_path?: string | null
          engines?: string[]
          file_size?: number
          formats?: string[]
          id?: string
          included_files?: string[]
          license?: string
          like_count?: number
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          name: string
          preview_model_url?: string | null
          scan_result?: Json | null
          scan_status?: Database["public"]["Enums"]["scan_status"]
          scan_timestamp?: string | null
          slug: string
          tags?: string[]
          thumbnail_url?: string | null
          triangle_count?: number | null
          updated_at?: string
          upload_status?: Database["public"]["Enums"]["upload_status"]
          validation_status?: Database["public"]["Enums"]["validation_status"]
          version?: string
        }
        Update: {
          category?: string
          created_at?: string
          creator_id?: string
          description?: string | null
          download_count?: number
          download_file_path?: string | null
          engines?: string[]
          file_size?: number
          formats?: string[]
          id?: string
          included_files?: string[]
          license?: string
          like_count?: number
          moderation_status?: Database["public"]["Enums"]["moderation_status"]
          name?: string
          preview_model_url?: string | null
          scan_result?: Json | null
          scan_status?: Database["public"]["Enums"]["scan_status"]
          scan_timestamp?: string | null
          slug?: string
          tags?: string[]
          thumbnail_url?: string | null
          triangle_count?: number | null
          updated_at?: string
          upload_status?: Database["public"]["Enums"]["upload_status"]
          validation_status?: Database["public"]["Enums"]["validation_status"]
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_assets: {
        Row: {
          asset_id: string
          collection_id: string
          created_at: string
        }
        Insert: {
          asset_id: string
          collection_id: string
          created_at?: string
        }
        Update: {
          asset_id?: string
          collection_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_assets_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_assets_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          cover_image: string | null
          created_at: string
          creator_id: string
          description: string | null
          id: string
          is_public: boolean
          name: string
          slug: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          is_public?: boolean
          name: string
          slug: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          is_public?: boolean
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      download_events: {
        Row: {
          asset_id: string
          created_at: string
          id: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          id?: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "download_events_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          asset_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          username: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id: string
          username: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          asset_id: string
          created_at: string
          description: string | null
          id: string
          reason: string
          reporter_id: string | null
          status: string
        }
        Insert: {
          asset_id: string
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reporter_id?: string | null
          status?: string
        }
        Update: {
          asset_id?: string
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reporter_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      moderation_status: "pending" | "approved" | "rejected"
      scan_status:
        | "pending"
        | "scanning"
        | "clean"
        | "infected"
        | "failed"
        | "skipped"
      upload_status:
        | "uploading"
        | "quarantined"
        | "validating"
        | "scanning"
        | "approved"
        | "rejected"
      validation_status: "pending" | "passed" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      moderation_status: ["pending", "approved", "rejected"],
      scan_status: [
        "pending",
        "scanning",
        "clean",
        "infected",
        "failed",
        "skipped",
      ],
      upload_status: [
        "uploading",
        "quarantined",
        "validating",
        "scanning",
        "approved",
        "rejected",
      ],
      validation_status: ["pending", "passed", "failed"],
    },
  },
} as const
