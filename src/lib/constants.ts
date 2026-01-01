/**
 * Application Constants - Phase 7
 * 
 * Centralized configuration for all hardcoded values.
 * These can be moved to settings/env vars later.
 */

// ============ APP INFO ============

export const APP_CONFIG = {
  name: 'F&B Cost Calculator',
  version: '1.2.0',
  author: 'Herax',
  github: 'https://github.com/heraklist/FnB-Full-Cost-Calculator',
} as const;

// ============ LOCALE ============

export const LOCALE_CONFIG = {
  default: 'el-GR',
  currency: 'EUR',
  currencySymbol: '€',
  dateFormat: 'dd/MM/yyyy',
} as const;

// ============ DEFAULTS ============

export const DEFAULT_VALUES = {
  // Restaurant Mode
  labourCostPerHour: 15,
  overheadMonthly: 3000,
  portionsPerMonth: 1000,
  packagingPerPortion: 0.5,
  targetFoodCostPercent: 30,
  
  // Catering Mode
  staffHourlyRate: 12,
  staffDailyRate: 80,
  transportCostPerKm: 0.5,
  disposablesPerPerson: 2,
  cateringMarkupPercent: 50,
  
  // Private Chef Mode
  chefFeePerHour: 50,
  chefDailyRate: 300,
  assistantFeePerHour: 20,
  assistantDailyRate: 120,
  foodMarkupPercent: 30,
  
  // Common
  vatRate: 24,
  wastePercent: 5,
  servings: 4,
  prepTimeMinutes: 30,
} as const;

// ============ LIMITS ============

export const LIMITS = {
  // Input limits
  maxNameLength: 100,
  maxNotesLength: 500,
  maxPrice: 99999.99,
  maxQuantity: 99999,
  maxServings: 1000,
  maxGuests: 10000,
  maxStaffCount: 100,
  maxStaffHours: 24,
  maxTransportKm: 1000,
  
  // Percentage limits
  minPercent: 0,
  maxPercent: 100,
  maxMarkupPercent: 500,
  maxWastePercent: 50,
  
  // List limits
  maxIngredientsPerRecipe: 50,
  maxRecipesPerEvent: 50,
  maxPriceHistoryRecords: 365,
} as const;

// ============ UI ============

export const UI_CONFIG = {
  // Toast durations (ms)
  toastDuration: 3000,
  toastUndoDuration: 5000,
  
  // Debounce delays (ms)
  searchDebounce: 300,
  autoSaveDebounce: 1000,
  
  // Animation durations (ms)
  fadeInDuration: 200,
  slideInDuration: 300,
  
  // Pagination
  itemsPerPage: 20,
  
  // Auto-backup reminder (days)
  backupReminderDays: 7,
} as const;

// ============ STORAGE KEYS ============

export const STORAGE_KEYS = {
  lastBackupDate: 'fnb_last_backup_date',
  backupReminderDismissed: 'fnb_backup_reminder_dismissed',
  activeTab: 'fnb_active_tab',
  theme: 'fnb_theme',
} as const;

// ============ VALIDATION PATTERNS ============

export const VALIDATION = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[\d\s-]{8,}$/,
  vatNumber: /^[A-Z]{2}\d{9}$/,
} as const;

// ============ EXPORT FORMATS ============

export const EXPORT_CONFIG = {
  jsonIndent: 2,
  csvDelimiter: ';',
  csvDecimalSeparator: ',',
  dateFormat: 'yyyy-MM-dd',
  timestampFormat: 'yyyy-MM-dd_HH-mm-ss',
} as const;

// ============ CATEGORY COLORS ============

export const CATEGORY_COLORS: Record<string, string> = {
  // Ingredient categories
  'Κρέατα': '#ef4444',
  'Πουλερικά': '#f97316',
  'Ψάρια/Θαλασσινά': '#3b82f6',
  'Γαλακτοκομικά': '#fbbf24',
  'Λαχανικά': '#22c55e',
  'Φρούτα': '#a855f7',
  'Όσπρια': '#78716c',
  'Αλεύρι/Ζυμαρικά': '#d4a373',
  'Λάδια/Λίπη': '#facc15',
  'Μπαχαρικά': '#ec4899',
  'Σάλτσες': '#dc2626',
  'Ποτά': '#06b6d4',
  'Άλλα': '#6b7280',
  
  // Recipe categories
  'Ορεκτικά': '#f59e0b',
  'Σαλάτες': '#10b981',
  'Σούπες': '#8b5cf6',
  'Κυρίως Πιάτα': '#ef4444',
  'Ζυμαρικά': '#d4a373',
  'Θαλασσινά': '#3b82f6',
  'Επιδόρπια': '#ec4899',
  'Άλλο': '#6b7280',
};

// ============ STATUS COLORS ============

export const STATUS_COLORS = {
  draft: '#6b7280',
  quote_sent: '#3b82f6',
  confirmed: '#22c55e',
  completed: '#10b981',
  cancelled: '#ef4444',
} as const;

// ============ MODE COLORS ============

export const MODE_COLORS = {
  restaurant: '#f59e0b',
  catering: '#8b5cf6',
  private_chef: '#ec4899',
} as const;
