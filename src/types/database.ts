export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      countries: { Row: { id: string; name: string }; Insert: { id: string; name: string }; Update: {name?:string}; Relationships: [] };
      origin_regions: { Row: { id: string; country_id: string; name: string; latitude: number; longitude: number; source_url: string; attribution: string }; Insert: never; Update: never; Relationships: [] };

      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          is_admin: boolean;
          created_at: string;
          age_verified_at: string | null;
          theme: "amber" | "atlas";
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          created_at?: string;
          age_verified_at?: string | null;
          theme?: "amber" | "atlas";
        };
        Update: {
          username?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          is_admin?: boolean;
          age_verified_at?: string | null;
          theme?: "amber" | "atlas";
        };
        Relationships: [];
      };
      rakija: {
        Row: {
          id: string;
          type: "commercial" | "personal" | "homemade";
          name: string;
          producer: string | null;
          fruit: string | null;
          region: string | null;
          country: string;
          country_id: string | null;
          region_id: string | null;
          origin_verified: boolean;
          category: string;
          aliases: string[];
          image_rights: string | null;
          image_source: string | null;
          image_attribution: string | null;
          vintage_year: number | null;
          abv: number | null;
          description: string | null;
          image_url: string | null;
          is_verified: boolean;
          added_by: string | null;
          global_rating: number | null;
          rating_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: "commercial" | "personal" | "homemade";
          name: string;
          producer?: string | null;
          fruit?: string | null;
          region?: string | null;
          country?: string;
          vintage_year?: number | null;
          abv?: number | null;
          description?: string | null;
          image_url?: string | null;
          image_rights?: string | null;
          image_source?: string | null;
          image_attribution?: string | null;
          category?: string;
          aliases?: string[];
          is_verified?: boolean;
          added_by?: string | null;
        };
        Update: {
          country_id?: string | null;
          region_id?: string | null;
          origin_verified?: boolean;
          origin_source?: string | null;
          origin_reviewed_at?: string;
          name?: string;
          producer?: string | null;
          fruit?: string | null;
          region?: string | null;
          country?: string;
          vintage_year?: number | null;
          abv?: number | null;
          description?: string | null;
          image_url?: string | null;
          image_rights?: string | null;
          image_source?: string | null;
          image_attribution?: string | null;
          category?: string;
          aliases?: string[];
          is_verified?: boolean;
          type?: "commercial" | "personal" | "homemade";
        };
        Relationships: [];
      };
      personal_entries: {
        Row: {
          id: string;
          rakija_id: string;
          owner_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          rakija_id: string;
          owner_id: string;
        };
        Update: {
          rakija_id?: string;
          owner_id?: string;
        };
        Relationships: [];
      };
      ratings: {
        Row: {
          id: string;
          rakija_id: string;
          user_id: string;
          score: number;
          tasted_at: string;
          aroma_tags: string[] | null;
          taste_tags: string[] | null;
          finish_tags: string[] | null;
          color_tags: string[] | null;
          aroma_note: string | null;
          taste_note: string | null;
          finish_note: string | null;
          venue_place_id: string | null;
          venue_name: string | null;
          notes: string | null;
          is_private: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          rakija_id: string;
          user_id: string;
          score: number;
          aroma_tags?: string[] | null;
          taste_tags?: string[] | null;
          finish_tags?: string[] | null;
          color_tags?: string[] | null;
          aroma_note?: string | null;
          taste_note?: string | null;
          finish_note?: string | null;
          venue_place_id?: string | null;
          venue_name?: string | null;
          notes?: string | null;
          is_private?: boolean;
        };
        Update: {
          score?: number;
          tasted_at?: string;
          aroma_tags?: string[] | null;
          taste_tags?: string[] | null;
          finish_tags?: string[] | null;
          color_tags?: string[] | null;
          aroma_note?: string | null;
          taste_note?: string | null;
          finish_note?: string | null;
          venue_place_id?: string | null;
          venue_name?: string | null;
          notes?: string | null;
          is_private?: boolean;
        };
        Relationships: [];
      };
      friendships: {
        Row: {
          id: string;
          requester_id: string;
          addressee_id: string;
          status: "pending" | "accepted" | "blocked";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          addressee_id: string;
          status?: "pending" | "accepted" | "blocked";
        };
        Update: {
          status?: "pending" | "accepted" | "blocked";
          updated_at?: string;
        };
        Relationships: [];
      };
      reactions: {
        Row: {
          id: string;
          rating_id: string;
          user_id: string;
          type: "nazdrave";
          created_at: string;
        };
        Insert: {
          id?: string;
          rating_id: string;
          user_id: string;
          type?: "nazdrave";
        };
        Update: {
          type?: "nazdrave";
        };
        Relationships: [];
      };
      wishlists: {
        Row: { id: string; user_id: string; rakija_id: string; created_at: string };
        Insert: { user_id: string; rakija_id: string; id?: string; created_at?: string };
        Update: Record<string, never>;
        Relationships: [];
      };
      promotion_suggestions: {
        Row: {
          id: string;
          rakija_id: string;
          match_count: number;
          status: "pending" | "approved" | "rejected";
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          rakija_id: string;
          match_count: number;
          status?: "pending" | "approved" | "rejected";
        };
        Update: {
          status?: "pending" | "approved" | "rejected";
          reviewed_by?: string | null;
          reviewed_at?: string | null;
        };
        Relationships: [];
      };
      invite_links: {
        Row: {
          id: string;
          created_by: string;
          token: string;
          used_by: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          token: string;
          used_by?: string | null;
          expires_at: string;
        };
        Update: {
          used_by?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      search_catalog: { Args: { q: string; fruit_filter?: string; country_filter?: string; region_filter?: string; verified_filter?: boolean; sort_key?: string; page_offset?: number; tried_only?: boolean }; Returns: Database["public"]["Tables"]["rakija"]["Row"][] };
      toggle_wishlist: { Args: { p_id: string }; Returns: boolean };
      merge_products: { Args: { source_id: string; target_id: string }; Returns: undefined };
      save_tasting: { Args: { p: Json }; Returns: string };
      review_suggestion: { Args: { p_id: string; p_action: string }; Returns: undefined };
      public_profile: { Args: { p_username: string }; Returns: Json };

      are_friends: {
        Args: { uid_a: string; uid_b: string };
        Returns: boolean;
      };
      check_promotion_threshold: {
        Args: { p_rakija_id: string };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
  };
};
