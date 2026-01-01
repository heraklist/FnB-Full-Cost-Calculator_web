// ============ CONSTANTS ============
const MINUTES_PER_HOUR = 60;
const PERCENT_FACTOR = 100;
/**
 * Shared cost calculation utilities
 * DRY refactoring - Phase 3
 * 
 * These functions were extracted from RecipesTab, EventsTab, and ReportsTab
 * to eliminate code duplication.
 */


import type { Recipe, Ingredient, Settings, Event } from '../types';
import { parseFixedCosts, calculateMonthlyFixedCosts } from './fixedCosts';
import { toBaseUnit, normalizeUnit, convertQuantity } from './units';

// ============ TYPES ============

export interface RecipePricing {
  pricePerServing: number;
  costPerServing: number;
}

export interface EventTotals {
  total: number;
  perGuest: number;
  staffCost: number;
  transportCost: number;
  equipmentCost: number;
  baseTotal: number;
  costTotal: number;
  profitMargin: number;
}

export interface RestaurantCosts {
  mode: 'restaurant';
  foodCost: number;
  foodCostPerServing: number;
  labourCost: number;
  overheadCost: number;
  packagingCost: number;
  totalCost: number;
  costPerServing: number;
  suggestedPrice: number;
  priceWithVat: number;
  monthlyFixed: number;
}

export interface CateringCosts {
  mode: 'catering';
  foodCost: number;
  foodCostPerServing: number;
  disposablesCost: number;
  totalCost: number;
  costPerServing: number;
  suggestedPrice: number;
  priceWithVat: number;
  staffHourlyRate: number;
  transportPerKm: number;
  monthlyFixed: number;
}

export interface PrivateChefCosts {
  mode: 'private_chef';
  foodCost: number;
  foodCostPerServing: number;
  foodWithMarkup: number;
  chefCostForRecipe: number;
  prepTimeHours: number;
  totalCost: number;
  costPerServing: number;
  priceWithVat: number;
  chefFeePerHour: number;
  assistantFeePerHour: number;
  monthlyFixed: number;
}

export type RecipeCosts = RestaurantCosts | CateringCosts | PrivateChefCosts | null;

// ============ HELPER FUNCTIONS ============

/**
 * Get monthly fixed costs from settings
 */
export function getMonthlyFixedCosts(settings: Settings | null): number {
  if (!settings || !settings.fixed_costs_json) return 0;
  const fixedCosts = parseFixedCosts(settings.fixed_costs_json);
  return calculateMonthlyFixedCosts(fixedCosts);
}

// Re-export convertQuantity from units.ts for backward compatibility
export { convertQuantity };

// ============ CORE CALCULATIONS ============

/**
 * Calculate the raw food cost for a recipe
 * This is the base cost of all ingredients with waste factored in
 */
export function calculateFoodCost(
  recipe: Recipe,
  ingredients: Ingredient[]
): number {
  let foodCost = 0;
  
  for (const ri of recipe.ingredients || []) {
    const ing = ingredients.find(i => i.id === ri.ingredient_id);
    if (ing) {
      // Μετατροπή ποσότητας σε standardized base unit
      const recipeQuantityInBase = toBaseUnit(ri.quantity, normalizeUnit(ri.unit));
      const ingredientQuantityInBase = toBaseUnit(1, normalizeUnit(ing.unit));
      // Υπολογισμός standardized ποσότητας (π.χ. 100g -> 0.1 για 1kg)
      const standardizedQty = recipeQuantityInBase / ingredientQuantityInBase;
      // Apply waste percentage
      foodCost += standardizedQty * ing.price * (1 + (ing.waste_percent || 0) / PERCENT_FACTOR);
    }
  }
  
  return foodCost;
}

/**
 * Get simple recipe pricing (price per serving and cost per serving)
 * Used by EventsTab and ReportsTab for quick pricing lookups
 */
export function getRecipePricing(
  recipe: Recipe,
  ingredients: Ingredient[],
  settings: Settings | null
): RecipePricing {
  if (!settings) return { pricePerServing: 0, costPerServing: 0 };

  const foodCost = calculateFoodCost(recipe, ingredients);
  const servings = Math.max(recipe.servings, 1); // Guard against division by zero
  const foodCostPerServing = foodCost / servings;
  const monthlyFixed = getMonthlyFixedCosts(settings);
  const mode = settings.mode;

  if (mode === 'restaurant') {
    const labourCost = (settings.labour_cost_per_hour * recipe.prep_time_minutes) / MINUTES_PER_HOUR;
    const portionsPerMonth = Math.max(settings.portions_per_month, 1); // Guard
    const overheadPerServing = (settings.overhead_monthly + monthlyFixed) / portionsPerMonth;
    const overheadCost = overheadPerServing * servings;
    const packagingCost = settings.packaging_per_portion * servings;
    const totalCost = foodCost + labourCost + overheadCost + packagingCost;
    const costPerServing = totalCost / servings;
    // Guard: never divide by zero, minimum 1%
    const targetFoodCost = Math.max(settings.target_food_cost_percent, 1) / PERCENT_FACTOR;
    const suggestedPrice = costPerServing / targetFoodCost;
    const priceWithVat = suggestedPrice * (1 + settings.vat_rate / 100);
    return { pricePerServing: priceWithVat, costPerServing };
  }

  if (mode === 'catering') {
    const disposablesCost = settings.disposables_per_person * servings;
    const totalCost = foodCost + disposablesCost;
    const costPerServing = totalCost / servings;
    const suggestedPrice = costPerServing * (1 + settings.catering_markup_percent / 100);
    const priceWithVat = suggestedPrice * (1 + settings.vat_rate / 100);
    return { pricePerServing: priceWithVat, costPerServing };
  }

  if (mode === 'private_chef') {
    const prepTimeHours = recipe.prep_time_minutes / 60;
    const chefCostForRecipe = prepTimeHours * settings.chef_fee_per_hour;
    const foodWithMarkup = foodCost * (1 + settings.food_markup_percent / 100);
    const totalCost = foodWithMarkup + chefCostForRecipe;
    const costPerServing = totalCost / servings;
    const priceWithVat = costPerServing * (1 + settings.vat_rate / 100);
    return { pricePerServing: priceWithVat, costPerServing };
  }

  return { pricePerServing: foodCostPerServing, costPerServing: foodCostPerServing };
}

/**
 * Calculate detailed recipe costs with mode-specific breakdown
 * Used by RecipesTab for detailed cost display
 */
export function calculateRecipeCosts(
  recipe: Recipe,
  ingredients: Ingredient[],
  settings: Settings | null
): RecipeCosts {
  if (!settings) return null;
  
  // Division by zero guards
  if (recipe.servings <= 0) {
    console.warn('Recipe servings must be > 0');
    return null;
  }
  
  if (settings.mode === 'restaurant' && settings.portions_per_month <= 0) {
    console.warn('portions_per_month must be > 0 in restaurant mode');
    return null;
  }
  
  const foodCost = calculateFoodCost(recipe, ingredients);
  const foodCostPerServing = foodCost / recipe.servings;
  const monthlyFixed = getMonthlyFixedCosts(settings);
  const mode = settings.mode;

  if (mode === 'restaurant') {
    const labourCost = (settings.labour_cost_per_hour * recipe.prep_time_minutes) / 60;
    const totalMonthlyOverhead = settings.overhead_monthly + monthlyFixed;
    const overheadPerServing = totalMonthlyOverhead / settings.portions_per_month;
    const overheadCost = overheadPerServing * recipe.servings;
    const packagingCost = settings.packaging_per_portion * recipe.servings;
    const totalCost = foodCost + labourCost + overheadCost + packagingCost;
    const costPerServing = totalCost / recipe.servings;
    const targetFoodCost = Math.max(settings.target_food_cost_percent, 1) / 100;
    const suggestedPrice = costPerServing / targetFoodCost;
    const priceWithVat = suggestedPrice * (1 + settings.vat_rate / 100);
    
    return {
      mode: 'restaurant',
      foodCost,
      foodCostPerServing,
      labourCost,
      overheadCost,
      packagingCost,
      totalCost,
      costPerServing,
      suggestedPrice,
      priceWithVat,
      monthlyFixed,
    };
  }
  
  if (mode === 'catering') {
    const disposablesCost = settings.disposables_per_person * recipe.servings;
    const totalCost = foodCost + disposablesCost;
    const costPerServing = totalCost / recipe.servings;
    const suggestedPrice = costPerServing * (1 + settings.catering_markup_percent / 100);
    const priceWithVat = suggestedPrice * (1 + settings.vat_rate / 100);
    
    return {
      mode: 'catering',
      foodCost,
      foodCostPerServing,
      disposablesCost,
      totalCost,
      costPerServing,
      suggestedPrice,
      priceWithVat,
      staffHourlyRate: settings.staff_hourly_rate,
      transportPerKm: settings.transport_cost_per_km,
      monthlyFixed,
    };
  }
  
  if (mode === 'private_chef') {
    const prepTimeHours = recipe.prep_time_minutes / 60;
    const chefCostForRecipe = prepTimeHours * settings.chef_fee_per_hour;
    const foodWithMarkup = foodCost * (1 + settings.food_markup_percent / 100);
    const totalCost = foodWithMarkup + chefCostForRecipe;
    const costPerServing = totalCost / recipe.servings;
    const priceWithVat = costPerServing * (1 + settings.vat_rate / 100);
    
    return {
      mode: 'private_chef',
      foodCost,
      foodCostPerServing,
      foodWithMarkup,
      chefCostForRecipe,
      prepTimeHours,
      totalCost,
      costPerServing,
      priceWithVat,
      chefFeePerHour: settings.chef_fee_per_hour,
      assistantFeePerHour: settings.assistant_fee_per_hour,
      monthlyFixed,
    };
  }
  
  return null;
}

/**
 * Calculate event totals including all costs and profit margin
 * Used by EventsTab and ReportsTab
 */
export function calculateEventTotals(
  event: Event,
  recipes: Recipe[],
  ingredients: Ingredient[],
  settings: Settings | null
): EventTotals {
  let baseTotal = 0;
  let perPersonFromRecipes = 0;
  let costTotal = 0;

  for (const er of event.recipes || []) {
    const recipe = recipes.find(r => r.id === er.recipe_id);
    if (!recipe) continue;
    
    const pricing = getRecipePricing(recipe, ingredients, settings);
    const pricePerServing = er.price_override ?? pricing.pricePerServing;
    const servings = er.servings || 1;
    const lineTotal = pricePerServing * servings;
    
    baseTotal += lineTotal;
    perPersonFromRecipes += pricePerServing;
    costTotal += pricing.costPerServing * servings;
  }

  const guests = Math.max(event.guests || 1, 1);
  
  // Staff cost calculation
  const staffCost = !settings
    ? 0
    : settings.staff_rate_type === 'hourly'
      ? (event.staff_count || 0) * (event.staff_hours || 0) * (settings.staff_hourly_rate || 0)
      : (event.staff_count || 0) * (settings.staff_daily_rate || 0);
  
  const transportCost = settings ? (settings.transport_cost_per_km || 0) * (event.transport_km || 0) : 0;
  const equipmentCost = event.equipment_cost || 0;
  const extras = (event.include_staff_in_price ? staffCost : 0) + transportCost + equipmentCost;

  const total = (event.pricing_mode === 'per_person' ? perPersonFromRecipes * guests : baseTotal) + extras;
  const perGuest = total / guests;
  
  // Calculate profit margin with guard
  const profitMargin = total > 0 
    ? ((total - costTotal - staffCost - transportCost - equipmentCost) / total) * 100 
    : 0;

  return {
    total,
    perGuest,
    staffCost,
    transportCost,
    equipmentCost,
    baseTotal,
    costTotal,
    profitMargin,
  };
}
