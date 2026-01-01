export interface User {
  id: string;
  email?: string;
  phone?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface EncryptionStatus {
  is_encrypted: boolean;
  key_exists: boolean;
  database_exists: boolean;
  can_migrate: boolean;
}
// Types που αντιστοιχούν στα Rust models

export interface Ingredient {
  id?: number;
  name: string;
  category: string;
  unit: string;
  price: number;
  supplier?: string;
  waste_percent: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Recipe {
  id?: number;
  name: string;
  category: string;
  servings: number;
  prep_time_minutes: number;
  notes?: string;
  ingredients: RecipeIngredient[];
  created_at?: string;
  updated_at?: string;
}

export interface RecipeIngredient {
  ingredient_id: number;
  ingredient_name?: string;
  quantity: number;
  unit: string;
}

export type EventStatus = 'draft' | 'quote_sent' | 'confirmed' | 'completed' | 'cancelled';
export type EventPricingMode = 'per_person' | 'per_event';

export interface EventRecipe {
  id?: number;
  event_id?: number;
  recipe_id: number;
  recipe_name?: string;
  servings: number;
  price_override?: number | null;
}

export interface Event {
  id?: number;
  name: string;
  client_name?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  event_date?: string | null;
  event_location?: string | null;
  guests: number;
  pricing_mode: EventPricingMode;
  staff_count: number;
  staff_hours: number;
  include_staff_in_price: boolean;
  transport_km: number;
  equipment_cost: number;
  equipment_notes?: string | null;
  notes?: string | null;
  status: EventStatus;
  created_at?: string;
  updated_at?: string;
  recipes: EventRecipe[];
}

export type CostingMode = 'restaurant' | 'catering' | 'private_chef';
export type RateType = 'hourly' | 'daily';

export interface FixedCost {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: 'monthly' | 'yearly';
}

export interface Settings {
  // Mode
  mode: CostingMode;
  
  // Common
  vat_rate: number;
  fixed_costs_json: string | null;
  
  // Restaurant Mode
  labour_cost_per_hour: number;
  overhead_monthly: number;
  portions_per_month: number;
  packaging_per_portion: number;
  target_food_cost_percent: number;
  
  // Catering Mode
  staff_rate_type: RateType;
  staff_hourly_rate: number;
  staff_daily_rate: number;
  transport_cost_per_km: number;
  equipment_rental_default: number;
  disposables_per_person: number;
  catering_markup_percent: number;
  
  // Private Chef Mode
  chef_rate_type: RateType;
  chef_fee_per_hour: number;
  chef_daily_rate: number;
  assistant_rate_type: RateType;
  assistant_fee_per_hour: number;
  assistant_daily_rate: number;
  food_markup_percent: number;
  
  // Company Info
  company_name?: string | null;
  company_email?: string | null;
  company_phone?: string | null;
  company_address?: string | null;
  company_vat_number?: string | null;
  company_logo_path?: string | null;
}

export const MODE_LABELS: Record<CostingMode, string> = {
  restaurant: '🍽️ Εστιατόριο',
  catering: '🎪 Catering',
  private_chef: '👨‍🍳 Ιδιωτικός Chef',
};

export const FIXED_COST_CATEGORIES = [
  'Ενοίκιο',
  'ΔΕΗ/Ρεύμα',
  'Νερό',
  'Τηλέφωνο/Internet',
  'Ασφάλειες',
  'Λογιστής',
  'Συντήρηση',
  'Marketing',
  'Λοιπά',
];

// Κατηγορίες υλικών
export const INGREDIENT_CATEGORIES = [
  'Κρέατα',
  'Πουλερικά',
  'Ψάρια/Θαλασσινά',
  'Λαχανικά',
  'Φρούτα',
  'Γαλακτοκομικά',
  'Αυγά',
  'Όσπρια',
  'Ζυμαρικά/Ρύζι',
  'Αλεύρια',
  'Λάδια/Λίπη',
  'Μπαχαρικά',
  'Σάλτσες',
  'Ποτά',
  'Άλλα',
] as const;

// Μονάδες μέτρησης
export const UNITS = [
  'kg',
  'g',
  'L',
  'ml',
  'τεμ',
] as const;

// Κατηγορίες συνταγών
export const RECIPE_CATEGORIES = [
  'Ορεκτικά',
  'Σαλάτες',
  'Σούπες',
  'Κυρίως Πιάτα',
  'Ζυμαρικά',
  'Θαλασσινά',
  'Επιδόρπια',
  'Ποτά',
  'Άλλο',
] as const;

export const EVENT_STATUSES = ['draft', 'quote_sent', 'confirmed', 'completed', 'cancelled'] as const;
export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: '📝 Πρόχειρο',
  quote_sent: '📧 Προσφορά',
  confirmed: '✅ Επιβεβαιωμένο',
  completed: '🏁 Ολοκληρωμένο',
  cancelled: '⛔ Ακυρώθηκε',
};

export const EVENT_PRICING_MODES = ['per_person', 'per_event'] as const;

export interface PriceHistory {
  id?: number;
  ingredient_id: number;
  price: number;
  recorded_at?: string;
  notes?: string;
}

export interface PriceStats {
  min_price: number;
  max_price: number;
  avg_price: number;
  record_count: number;
  current_price: number;
  previous_price?: number;
}

export interface QuotePdfData {
  event_name: string;
  event_date: string | null;
  event_location: string | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  guests: number;
  menu_items: {
    name: string;
    servings: number;
    price: number;
  }[];
  food_cost: number;
  staff_cost: number;
  transport_cost: number;
  equipment_cost: number;
  subtotal: number;
  vat_percent: number;
  vat_amount: number;
  total: number;
  price_per_person: number;
  notes: string | null;
  company_name: string;
  company_info: string;
}
