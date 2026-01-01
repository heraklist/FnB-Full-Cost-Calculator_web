// =====================================================
// Database Types for Supabase
// Generated from schema - keep in sync with migrations
// =====================================================

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
      ingredients: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          category: string;
          unit: string;
          price: number;
          supplier: string | null;
          waste_percent: number | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          name: string;
          category: string;
          unit: string;
          price: number;
          supplier?: string | null;
          waste_percent?: number | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          name?: string;
          category?: string;
          unit?: string;
          price?: number;
          supplier?: string | null;
          waste_percent?: number | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      recipes: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          category: string;
          servings: number;
          prep_time_minutes: number | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          name: string;
          category: string;
          servings: number;
          prep_time_minutes?: number | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          name?: string;
          category?: string;
          servings?: number;
          prep_time_minutes?: number | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      recipe_ingredients: {
        Row: {
          id: number;
          recipe_id: number;
          ingredient_id: number;
          quantity: number;
          unit: string;
        };
        Insert: {
          id?: number;
          recipe_id: number;
          ingredient_id: number;
          quantity: number;
          unit: string;
        };
        Update: {
          id?: number;
          recipe_id?: number;
          ingredient_id?: number;
          quantity?: number;
          unit?: string;
        };
      };
      events: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          client_name: string | null;
          client_email: string | null;
          client_phone: string | null;
          event_date: string | null;
          event_location: string | null;
          guests: number | null;
          pricing_mode: 'per_person' | 'per_event';
          staff_count: number | null;
          staff_hours: number | null;
          include_staff_in_price: boolean | null;
          transport_km: number | null;
          equipment_cost: number | null;
          equipment_notes: string | null;
          notes: string | null;
          status: 'draft' | 'quote_sent' | 'confirmed' | 'completed' | 'cancelled';
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          name: string;
          client_name?: string | null;
          client_email?: string | null;
          client_phone?: string | null;
          event_date?: string | null;
          event_location?: string | null;
          guests?: number | null;
          pricing_mode?: 'per_person' | 'per_event';
          staff_count?: number | null;
          staff_hours?: number | null;
          include_staff_in_price?: boolean | null;
          transport_km?: number | null;
          equipment_cost?: number | null;
          equipment_notes?: string | null;
          notes?: string | null;
          status?: 'draft' | 'quote_sent' | 'confirmed' | 'completed' | 'cancelled';
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          name?: string;
          client_name?: string | null;
          client_email?: string | null;
          client_phone?: string | null;
          event_date?: string | null;
          event_location?: string | null;
          guests?: number | null;
          pricing_mode?: 'per_person' | 'per_event';
          staff_count?: number | null;
          staff_hours?: number | null;
          include_staff_in_price?: boolean | null;
          transport_km?: number | null;
          equipment_cost?: number | null;
          equipment_notes?: string | null;
          notes?: string | null;
          status?: 'draft' | 'quote_sent' | 'confirmed' | 'completed' | 'cancelled';
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      event_recipes: {
        Row: {
          id: number;
          event_id: number;
          recipe_id: number;
          servings: number;
          price_override: number | null;
        };
        Insert: {
          id?: number;
          event_id: number;
          recipe_id: number;
          servings: number;
          price_override?: number | null;
        };
        Update: {
          id?: number;
          event_id?: number;
          recipe_id?: number;
          servings?: number;
          price_override?: number | null;
        };
      };
      settings: {
        Row: {
          id: number;
          user_id: string;
          mode: 'restaurant' | 'catering' | 'private_chef';
          vat_rate: number | null;
          fixed_costs_json: Json | null;
          labour_cost_per_hour: number | null;
          overhead_monthly: number | null;
          portions_per_month: number | null;
          packaging_per_portion: number | null;
          target_food_cost_percent: number | null;
          staff_rate_type: 'hourly' | 'daily' | null;
          staff_hourly_rate: number | null;
          staff_daily_rate: number | null;
          transport_cost_per_km: number | null;
          equipment_rental_default: number | null;
          disposables_per_person: number | null;
          catering_markup_percent: number | null;
          chef_rate_type: 'hourly' | 'daily' | null;
          chef_fee_per_hour: number | null;
          chef_daily_rate: number | null;
          assistant_rate_type: 'hourly' | 'daily' | null;
          assistant_fee_per_hour: number | null;
          assistant_daily_rate: number | null;
          food_markup_percent: number | null;
          company_name: string | null;
          company_email: string | null;
          company_phone: string | null;
          company_address: string | null;
          company_vat_number: string | null;
          company_logo_url: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          mode?: 'restaurant' | 'catering' | 'private_chef';
          vat_rate?: number | null;
          fixed_costs_json?: Json | null;
          labour_cost_per_hour?: number | null;
          overhead_monthly?: number | null;
          portions_per_month?: number | null;
          packaging_per_portion?: number | null;
          target_food_cost_percent?: number | null;
          staff_rate_type?: 'hourly' | 'daily' | null;
          staff_hourly_rate?: number | null;
          staff_daily_rate?: number | null;
          transport_cost_per_km?: number | null;
          equipment_rental_default?: number | null;
          disposables_per_person?: number | null;
          catering_markup_percent?: number | null;
          chef_rate_type?: 'hourly' | 'daily' | null;
          chef_fee_per_hour?: number | null;
          chef_daily_rate?: number | null;
          assistant_rate_type?: 'hourly' | 'daily' | null;
          assistant_fee_per_hour?: number | null;
          assistant_daily_rate?: number | null;
          food_markup_percent?: number | null;
          company_name?: string | null;
          company_email?: string | null;
          company_phone?: string | null;
          company_address?: string | null;
          company_vat_number?: string | null;
          company_logo_url?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          mode?: 'restaurant' | 'catering' | 'private_chef';
          vat_rate?: number | null;
          fixed_costs_json?: Json | null;
          labour_cost_per_hour?: number | null;
          overhead_monthly?: number | null;
          portions_per_month?: number | null;
          packaging_per_portion?: number | null;
          target_food_cost_percent?: number | null;
          staff_rate_type?: 'hourly' | 'daily' | null;
          staff_hourly_rate?: number | null;
          staff_daily_rate?: number | null;
          transport_cost_per_km?: number | null;
          equipment_rental_default?: number | null;
          disposables_per_person?: number | null;
          catering_markup_percent?: number | null;
          chef_rate_type?: 'hourly' | 'daily' | null;
          chef_fee_per_hour?: number | null;
          chef_daily_rate?: number | null;
          assistant_rate_type?: 'hourly' | 'daily' | null;
          assistant_fee_per_hour?: number | null;
          assistant_daily_rate?: number | null;
          food_markup_percent?: number | null;
          company_name?: string | null;
          company_email?: string | null;
          company_phone?: string | null;
          company_address?: string | null;
          company_vat_number?: string | null;
          company_logo_url?: string | null;
          updated_at?: string | null;
        };
      };
      user_roles: {
        Row: {
          id: number;
          user_id: string;
          role: 'user' | 'admin' | 'super_admin';
          created_at: string | null;
        };
        Insert: {
          id?: number;
          user_id: string;
          role: 'user' | 'admin' | 'super_admin';
          created_at?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string;
          role?: 'user' | 'admin' | 'super_admin';
          created_at?: string | null;
        };
      };
    };
    Views: {
      recipes_with_ingredients: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          category: string;
          servings: number;
          prep_time_minutes: number | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
          ingredients: Json;
        };
      };
      events_with_recipes: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          client_name: string | null;
          client_email: string | null;
          client_phone: string | null;
          event_date: string | null;
          event_location: string | null;
          guests: number | null;
          pricing_mode: string;
          staff_count: number | null;
          staff_hours: number | null;
          include_staff_in_price: boolean | null;
          transport_km: number | null;
          equipment_cost: number | null;
          equipment_notes: string | null;
          notes: string | null;
          status: string;
          created_at: string | null;
          updated_at: string | null;
          recipes: Json;
        };
      };
    };
    Functions: {
      is_admin: {
        Args: { check_user_id: string };
        Returns: boolean;
      };
      is_super_admin: {
        Args: { check_user_id: string };
        Returns: boolean;
      };
    };
  };
}
