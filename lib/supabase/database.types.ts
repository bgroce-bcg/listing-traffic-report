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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      analytics: {
        Row: {
          clicks: number
          created_at: string
          facebook_url_id: string | null
          id: string
          listing_id: string
          metric_date: string
          updated_at: string
          views: number
        }
        Insert: {
          clicks?: number
          created_at?: string
          facebook_url_id?: string | null
          id?: string
          listing_id: string
          metric_date: string
          updated_at?: string
          views?: number
        }
        Update: {
          clicks?: number
          created_at?: string
          facebook_url_id?: string | null
          id?: string
          listing_id?: string
          metric_date?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "analytics_facebook_url_id_fkey"
            columns: ["facebook_url_id"]
            isOneToOne: false
            referencedRelation: "facebook_urls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_metrics: {
        Row: {
          comments: number | null
          created_at: string
          facebook_url_id: string
          id: string
          impressions: number | null
          metric_date: string
          post_clicks: number | null
          reach: number | null
          reactions: number | null
          shares: number | null
          updated_at: string
        }
        Insert: {
          comments?: number | null
          created_at?: string
          facebook_url_id: string
          id?: string
          impressions?: number | null
          metric_date: string
          post_clicks?: number | null
          reach?: number | null
          reactions?: number | null
          shares?: number | null
          updated_at?: string
        }
        Update: {
          comments?: number | null
          created_at?: string
          facebook_url_id?: string
          id?: string
          impressions?: number | null
          metric_date?: string
          post_clicks?: number | null
          reach?: number | null
          reactions?: number | null
          shares?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facebook_metrics_facebook_url_id_fkey"
            columns: ["facebook_url_id"]
            isOneToOne: false
            referencedRelation: "facebook_urls"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_posts: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          updated_at: string
          url: string
          views: number
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          updated_at?: string
          url: string
          views?: number
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          updated_at?: string
          url?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "facebook_posts_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_urls: {
        Row: {
          created_at: string
          facebook_url: string
          id: string
          listing_id: string
        }
        Insert: {
          created_at?: string
          facebook_url: string
          id?: string
          listing_id: string
        }
        Update: {
          created_at?: string
          facebook_url?: string
          id?: string
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "facebook_urls_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          created_at: string
          deleted_at: string | null
          har_days_on_market: number | null
          har_desktop_views: number | null
          har_mobile_views: number | null
          har_photo_views: number | null
          har_status: string | null
          har_url: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          realtor_url: string | null
          updated_at: string
          user_id: string
          zillow_url: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          har_days_on_market?: number | null
          har_desktop_views?: number | null
          har_mobile_views?: number | null
          har_photo_views?: number | null
          har_status?: string | null
          har_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          realtor_url?: string | null
          updated_at?: string
          user_id: string
          zillow_url?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          har_days_on_market?: number | null
          har_desktop_views?: number | null
          har_mobile_views?: number | null
          har_photo_views?: number | null
          har_status?: string | null
          har_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          realtor_url?: string | null
          updated_at?: string
          user_id?: string
          zillow_url?: string | null
        }
        Relationships: []
      }
      platform_metrics: {
        Row: {
          created_at: string
          id: string
          leads: number | null
          listing_id: string
          metric_date: string
          platform: string
          saves: number | null
          shares: number | null
          updated_at: string
          views: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          leads?: number | null
          listing_id: string
          metric_date: string
          platform: string
          saves?: number | null
          shares?: number | null
          updated_at?: string
          views?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          leads?: number | null
          listing_id?: string
          metric_date?: string
          platform?: string
          saves?: number | null
          shares?: number | null
          updated_at?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_metrics_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
