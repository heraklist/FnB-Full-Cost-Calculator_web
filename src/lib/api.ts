import { supabase, requireUser } from './supabase';

// Types
export interface Ingredient {
  id?: number;
  user_id?: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  supplier?: string | null;
  waste_percent?: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Recipe {
  id?: number;
  user_id?: string;
  name: string;
  category: string;
  servings: number;
  prep_time_minutes: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  ingredients?: RecipeIngredient[];
}

export interface RecipeIngredient {
  id?: number;
  recipe_id?: number;
  ingredient_id: number;
  ingredients?: Ingredient;
  quantity: number;
  unit: string;
}

export interface Event {
  id?: number;
  user_id?: string;
  name: string;
  client_name?: string | null;
  client_email?: string | null;
  client_phone?: string | null;
  event_date?: string | null;
  event_location?: string | null;
  guests: number;
  pricing_mode: 'per_person' | 'fixed' | 'per_event';
  menu_description?: string | null;
  special_requests?: string | null;
  profit_margin?: number;
  staff_count?: number;
  staff_hours?: number;
  include_staff_in_price?: boolean;
  transport_km?: number;
  equipment_cost?: number;
  created_at?: string;
  updated_at?: string;
  status: 'draft' | 'confirmed' | 'completed' | 'cancelled';
  recipes?: EventRecipe[];
}

export interface EventRecipe {
  id?: number;
  event_id?: number;
  recipe_id: number;
  servings: number;
  price_override?: number | null;
}

// Ingredients
export async function createIngredient(ingredient: Ingredient) {
  const userId = await requireUser();
  const { data, error } = await supabase
    .from('ingredients')
    .insert([{ ...ingredient, user_id: userId }] as any);
  if (error) throw error;
  return data?.[0];
}

export async function getIngredients() {
  const userId = await requireUser();
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []) as Ingredient[];
}

export async function updateIngredient(id: number, updates: Partial<Ingredient>) {
  const { data, error } = await supabase
    .from('ingredients')
    .update(updates as any)
    .eq('id', id);
  if (error) throw error;
  return data?.[0];
}

export async function deleteIngredient(id: number) {
  const { error } = await supabase.from('ingredients').delete().eq('id', id);
  if (error) throw error;
}

// Recipes
export async function createRecipe(recipe: Recipe) {
  const userId = await requireUser();
  const { data: recipeData, error: recipeError } = await supabase
    .from('recipes')
    .insert([{ ...recipe, user_id: userId }] as any);

  if (recipeError) throw recipeError;
  if (!recipeData || !recipeData[0]) throw new Error('Failed to create recipe');

  const recipeId = recipeData[0].id;

  // Insert recipe ingredients
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    const ingredientsToInsert = recipe.ingredients.map((ing) => ({
      recipe_id: recipeId,
      ingredient_id: ing.ingredient_id,
      quantity: ing.quantity,
      unit: ing.unit,
    }));

    const { error: ingredientError } = await supabase
      .from('recipe_ingredients')
      .insert(ingredientsToInsert as any);

    if (ingredientError) throw ingredientError;
  }

  return recipeData[0];
}

export async function getRecipes() {
  const userId = await requireUser();
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients(
        *,
        ingredients(*)
      )
    `)
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []) as Recipe[];
}

export async function updateRecipe(id: number, updates: Partial<Recipe>) {
  const { data, error } = await supabase
    .from('recipes')
    .update(updates as any)
    .eq('id', id);
  if (error) throw error;
  return data?.[0];
}

export async function deleteRecipe(id: number) {
  // Delete recipe ingredients first
  await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);
  
  // Delete recipe
  const { error } = await supabase.from('recipes').delete().eq('id', id);
  if (error) throw error;
}

// Events
export async function createEvent(event: Event) {
  const userId = await requireUser();
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .insert([{ ...event, user_id: userId }] as any);

  if (eventError) throw eventError;
  if (!eventData || !eventData[0]) throw new Error('Failed to create event');

  const eventId = eventData[0].id;

  // Insert event recipes
  if (event.recipes && event.recipes.length > 0) {
    const recipesToInsert = event.recipes.map((recipe) => ({
      event_id: eventId,
      recipe_id: recipe.recipe_id,
      servings: recipe.servings,
      price_override: recipe.price_override,
    }));

    const { error: recipeError } = await supabase
      .from('event_recipes')
      .insert(recipesToInsert as any);

    if (recipeError) throw recipeError;
  }

  return eventData[0];
}

export async function getEvents() {
  const userId = await requireUser();
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      event_recipes(
        *,
        recipes(
          *,
          recipe_ingredients(
            *,
            ingredients(*)
          )
        )
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Event[];
}

export async function updateEvent(id: number, updates: Partial<Event>) {
  const { data, error } = await supabase
    .from('events')
    .update(updates as any)
    .eq('id', id);
  if (error) throw error;
  return data?.[0];
}

export async function updateEventStatus(id: number, status: string) {
  return updateEvent(id, { status: status as any });
}

export async function deleteEvent(id: number) {
  // Delete event recipes first
  await supabase.from('event_recipes').delete().eq('event_id', id);
  
  // Delete event
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}

// Settings
export async function getSettings() {
  const userId = await requireUser();
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateSettings(updates: any) {
  const userId = await requireUser();
  const { data, error } = await supabase
    .from('settings')
    .update(updates)
    .eq('user_id', userId);
  if (error) throw error;
  return data?.[0];
}

// Auth helpers
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function checkAdmin(): Promise<boolean> {
  // Placeholder - implement with user_roles table if needed
  return false;
}

export async function updateEventStatus(id: number, status: string) {
  const { data, error } = await supabase
    .from('events')
    .update({ status } as any)
    .eq('id', id);
  if (error) throw error;
  return data?.[0];
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
