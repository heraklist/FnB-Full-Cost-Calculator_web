import { supabase, requireUser } from './supabase';
import type { 
  Ingredient, 
  Recipe, 
  RecipeIngredient,
  Event, 
  EventRecipe,
  Settings, 
  EventStatus 
} from '../types';

// ============================================================
// INGREDIENTS API
// ============================================================

export async function getIngredients(): Promise<Ingredient[]> {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('name');

  if (error) throw new Error(`Failed to fetch ingredients: ${error.message}`);
  
  return (data || []).map(mapIngredientFromDb);
}

export async function getIngredient(id: number): Promise<Ingredient> {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(`Failed to fetch ingredient: ${error.message}`);
  if (!data) throw new Error(`Ingredient with id ${id} not found`);
  
  return mapIngredientFromDb(data);
}

export async function createIngredient(ingredient: Omit<Ingredient, 'id'>): Promise<number> {
  const userId = await requireUser();
  
  const { data, error } = await supabase
    .from('ingredients')
    .insert({
      user_id: userId,
      name: ingredient.name,
      category: ingredient.category,
      unit: ingredient.unit,
      price: ingredient.price,
      supplier: ingredient.supplier || null,
      waste_percent: ingredient.waste_percent || 0,
      notes: ingredient.notes || null
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create ingredient: ${error.message}`);
  return data!.id;
}

export async function updateIngredient(ingredient: Ingredient): Promise<void> {
  if (!ingredient.id) throw new Error('Ingredient ID is required');

  const { error } = await supabase
    .from('ingredients')
    .update({
      name: ingredient.name,
      category: ingredient.category,
      unit: ingredient.unit,
      price: ingredient.price,
      supplier: ingredient.supplier || null,
      waste_percent: ingredient.waste_percent || 0,
      notes: ingredient.notes || null
    })
    .eq('id', ingredient.id);

  if (error) throw new Error(`Failed to update ingredient: ${error.message}`);
}

export async function deleteIngredient(id: number): Promise<void> {
  const { error } = await supabase
    .from('ingredients')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete ingredient: ${error.message}`);
}

export async function searchIngredients(query: string): Promise<Ingredient[]> {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name');

  if (error) throw new Error(`Failed to search ingredients: ${error.message}`);
  return (data || []).map(mapIngredientFromDb);
}

// ============================================================
// RECIPES API
// ============================================================

export async function getRecipes(): Promise<Recipe[]> {
  // Fetch recipes
  const { data: recipes, error: recipesError } = await supabase
    .from('recipes')
    .select('*')
    .order('name');

  if (recipesError) throw new Error(`Failed to fetch recipes: ${recipesError.message}`);
  if (!recipes || recipes.length === 0) return [];

  // Fetch recipe ingredients for all recipes
  const recipeIds = recipes.map(r => r.id);
  const { data: recipeIngredients, error: riError } = await supabase
    .from('recipe_ingredients')
    .select(`
      *,
      ingredients:ingredient_id (name)
    `)
    .in('recipe_id', recipeIds);

  if (riError) throw new Error(`Failed to fetch recipe ingredients: ${riError.message}`);

  // Map recipes with their ingredients
  return recipes.map(recipe => ({
    id: recipe.id,
    name: recipe.name,
    category: recipe.category,
    servings: recipe.servings,
    prep_time_minutes: recipe.prep_time_minutes || 0,
    notes: recipe.notes || undefined,
    created_at: recipe.created_at || undefined,
    updated_at: recipe.updated_at || undefined,
    ingredients: (recipeIngredients || [])
      .filter(ri => ri.recipe_id === recipe.id)
      .map(ri => ({
        ingredient_id: ri.ingredient_id,
        ingredient_name: (ri.ingredients as any)?.name,
        quantity: ri.quantity,
        unit: ri.unit
      }))
  }));
}

export async function getRecipe(id: number): Promise<Recipe> {
  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();

  if (recipeError) throw new Error(`Failed to fetch recipe: ${recipeError.message}`);
  if (!recipe) throw new Error(`Recipe with id ${id} not found`);

  const { data: recipeIngredients, error: riError } = await supabase
    .from('recipe_ingredients')
    .select(`
      *,
      ingredients:ingredient_id (name)
    `)
    .eq('recipe_id', id);

  if (riError) throw new Error(`Failed to fetch recipe ingredients: ${riError.message}`);

  return {
    id: recipe.id,
    name: recipe.name,
    category: recipe.category,
    servings: recipe.servings,
    prep_time_minutes: recipe.prep_time_minutes || 0,
    notes: recipe.notes || undefined,
    created_at: recipe.created_at || undefined,
    updated_at: recipe.updated_at || undefined,
    ingredients: (recipeIngredients || []).map(ri => ({
      ingredient_id: ri.ingredient_id,
      ingredient_name: (ri.ingredients as any)?.name,
      quantity: ri.quantity,
      unit: ri.unit
    }))
  };
}

export async function createRecipe(recipe: Omit<Recipe, 'id'>): Promise<number> {
  const userId = await requireUser();

  // Create recipe
  const { data: newRecipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      user_id: userId,
      name: recipe.name,
      category: recipe.category,
      servings: recipe.servings,
      prep_time_minutes: recipe.prep_time_minutes || 0,
      notes: recipe.notes || null
    })
    .select('id')
    .single();

  if (recipeError) throw new Error(`Failed to create recipe: ${recipeError.message}`);
  
  const recipeId = newRecipe!.id;

  // Add ingredients
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    const { error: riError } = await supabase
      .from('recipe_ingredients')
      .insert(
        recipe.ingredients.map(ri => ({
          recipe_id: recipeId,
          ingredient_id: ri.ingredient_id,
          quantity: ri.quantity,
          unit: ri.unit
        }))
      );

    if (riError) throw new Error(`Failed to add recipe ingredients: ${riError.message}`);
  }

  return recipeId;
}

export async function updateRecipe(recipe: Recipe): Promise<void> {
  if (!recipe.id) throw new Error('Recipe ID is required');

  // Update recipe
  const { error: recipeError } = await supabase
    .from('recipes')
    .update({
      name: recipe.name,
      category: recipe.category,
      servings: recipe.servings,
      prep_time_minutes: recipe.prep_time_minutes || 0,
      notes: recipe.notes || null
    })
    .eq('id', recipe.id);

  if (recipeError) throw new Error(`Failed to update recipe: ${recipeError.message}`);

  // Delete existing ingredients and re-add
  const { error: deleteError } = await supabase
    .from('recipe_ingredients')
    .delete()
    .eq('recipe_id', recipe.id);

  if (deleteError) throw new Error(`Failed to update recipe ingredients: ${deleteError.message}`);

  if (recipe.ingredients && recipe.ingredients.length > 0) {
    const { error: riError } = await supabase
      .from('recipe_ingredients')
      .insert(
        recipe.ingredients.map(ri => ({
          recipe_id: recipe.id!,
          ingredient_id: ri.ingredient_id,
          quantity: ri.quantity,
          unit: ri.unit
        }))
      );

    if (riError) throw new Error(`Failed to add recipe ingredients: ${riError.message}`);
  }
}

export async function deleteRecipe(id: number): Promise<void> {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete recipe: ${error.message}`);
}

export async function duplicateRecipe(id: number): Promise<number> {
  const recipe = await getRecipe(id);
  const { id: _, ...recipeWithoutId } = recipe;
  return createRecipe({
    ...recipeWithoutId,
    name: `${recipe.name} (Αντίγραφο)`
  });
}

// ============================================================
// EVENTS API
// ============================================================

export async function getEvents(): Promise<Event[]> {
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false });

  if (eventsError) throw new Error(`Failed to fetch events: ${eventsError.message}`);
  if (!events || events.length === 0) return [];

  const eventIds = events.map(e => e.id);
  const { data: eventRecipes, error: erError } = await supabase
    .from('event_recipes')
    .select(`
      *,
      recipes:recipe_id (name)
    `)
    .in('event_id', eventIds);

  if (erError) throw new Error(`Failed to fetch event recipes: ${erError.message}`);

  return events.map(event => mapEventFromDb(event, eventRecipes || []));
}

export async function getEvent(id: number): Promise<Event> {
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (eventError) throw new Error(`Failed to fetch event: ${eventError.message}`);
  if (!event) throw new Error(`Event with id ${id} not found`);

  const { data: eventRecipes, error: erError } = await supabase
    .from('event_recipes')
    .select(`
      *,
      recipes:recipe_id (name)
    `)
    .eq('event_id', id);

  if (erError) throw new Error(`Failed to fetch event recipes: ${erError.message}`);

  return mapEventFromDb(event, eventRecipes || []);
}

export async function createEvent(event: Omit<Event, 'id'>): Promise<number> {
  const userId = await requireUser();

  const { data: newEvent, error: eventError } = await supabase
    .from('events')
    .insert({
      user_id: userId,
      name: event.name,
      client_name: event.client_name || null,
      client_email: event.client_email || null,
      client_phone: event.client_phone || null,
      event_date: event.event_date || null,
      event_location: event.event_location || null,
      guests: event.guests || 0,
      pricing_mode: event.pricing_mode || 'per_person',
      staff_count: event.staff_count || 0,
      staff_hours: event.staff_hours || 0,
      include_staff_in_price: event.include_staff_in_price || false,
      transport_km: event.transport_km || 0,
      equipment_cost: event.equipment_cost || 0,
      equipment_notes: event.equipment_notes || null,
      notes: event.notes || null,
      status: event.status || 'draft'
    })
    .select('id')
    .single();

  if (eventError) throw new Error(`Failed to create event: ${eventError.message}`);
  
  const eventId = newEvent!.id;

  if (event.recipes && event.recipes.length > 0) {
    const { error: erError } = await supabase
      .from('event_recipes')
      .insert(
        event.recipes.map(er => ({
          event_id: eventId,
          recipe_id: er.recipe_id,
          servings: er.servings,
          price_override: er.price_override || null
        }))
      );

    if (erError) throw new Error(`Failed to add event recipes: ${erError.message}`);
  }

  return eventId;
}

export async function updateEvent(event: Event): Promise<void> {
  if (!event.id) throw new Error('Event ID is required');

  const { error: eventError } = await supabase
    .from('events')
    .update({
      name: event.name,
      client_name: event.client_name || null,
      client_email: event.client_email || null,
      client_phone: event.client_phone || null,
      event_date: event.event_date || null,
      event_location: event.event_location || null,
      guests: event.guests || 0,
      pricing_mode: event.pricing_mode || 'per_person',
      staff_count: event.staff_count || 0,
      staff_hours: event.staff_hours || 0,
      include_staff_in_price: event.include_staff_in_price || false,
      transport_km: event.transport_km || 0,
      equipment_cost: event.equipment_cost || 0,
      equipment_notes: event.equipment_notes || null,
      notes: event.notes || null,
      status: event.status || 'draft'
    })
    .eq('id', event.id);

  if (eventError) throw new Error(`Failed to update event: ${eventError.message}`);

  // Delete and re-add recipes
  const { error: deleteError } = await supabase
    .from('event_recipes')
    .delete()
    .eq('event_id', event.id);

  if (deleteError) throw new Error(`Failed to update event recipes: ${deleteError.message}`);

  if (event.recipes && event.recipes.length > 0) {
    const { error: erError } = await supabase
      .from('event_recipes')
      .insert(
        event.recipes.map(er => ({
          event_id: event.id!,
          recipe_id: er.recipe_id,
          servings: er.servings,
          price_override: er.price_override || null
        }))
      );

    if (erError) throw new Error(`Failed to add event recipes: ${erError.message}`);
  }
}

export async function deleteEvent(id: number): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete event: ${error.message}`);
}

export async function updateEventStatus(id: number, status: EventStatus): Promise<void> {
  const { error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(`Failed to update event status: ${error.message}`);
}

// ============================================================
// SETTINGS API
// ============================================================

export async function getSettings(): Promise<Settings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw new Error(`Failed to fetch settings: ${error.message}`);
  }

  return mapSettingsFromDb(data);
}

export async function updateSettings(settings: Partial<Settings>): Promise<void> {
  const userId = await requireUser();

  const dbSettings = mapSettingsToDb(settings);

  // Try to update first
  const { data: existing } = await supabase
    .from('settings')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('settings')
      .update(dbSettings)
      .eq('user_id', userId);

    if (error) throw new Error(`Failed to update settings: ${error.message}`);
  } else {
    const { error } = await supabase
      .from('settings')
      .insert({ ...dbSettings, user_id: userId });

    if (error) throw new Error(`Failed to create settings: ${error.message}`);
  }
}

// ============================================================
// ADMIN API
// ============================================================

export async function checkAdmin(): Promise<boolean> {
  const userId = await requireUser();
  
  const { data, error } = await supabase
    .rpc('is_admin', { check_user_id: userId });

  if (error) return false;
  return data === true;
}

export async function checkSuperAdmin(): Promise<boolean> {
  const userId = await requireUser();
  
  const { data, error } = await supabase
    .rpc('is_super_admin', { check_user_id: userId });

  if (error) return false;
  return data === true;
}

export async function getUsers(): Promise<any[]> {
  // Note: This requires admin role
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      user_id,
      role,
      created_at
    `);

  if (error) throw new Error(`Failed to fetch users: ${error.message}`);
  return data || [];
}

export async function updateUserRole(userId: string, role: string, action: 'add' | 'remove'): Promise<void> {
  if (action === 'add') {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role });

    if (error) throw new Error(`Failed to add role: ${error.message}`);
  } else {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('role', role);

    if (error) throw new Error(`Failed to remove role: ${error.message}`);
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function mapIngredientFromDb(data: any): Ingredient {
  return {
    id: data.id,
    name: data.name,
    category: data.category,
    unit: data.unit,
    price: Number(data.price),
    supplier: data.supplier || undefined,
    waste_percent: Number(data.waste_percent || 0),
    notes: data.notes || undefined,
    created_at: data.created_at,
    updated_at: data.updated_at
  };
}

function mapEventFromDb(event: any, eventRecipes: any[]): Event {
  return {
    id: event.id,
    name: event.name,
    client_name: event.client_name,
    client_email: event.client_email,
    client_phone: event.client_phone,
    event_date: event.event_date,
    event_location: event.event_location,
    guests: event.guests || 0,
    pricing_mode: event.pricing_mode || 'per_person',
    staff_count: event.staff_count || 0,
    staff_hours: Number(event.staff_hours || 0),
    include_staff_in_price: event.include_staff_in_price || false,
    transport_km: Number(event.transport_km || 0),
    equipment_cost: Number(event.equipment_cost || 0),
    equipment_notes: event.equipment_notes,
    notes: event.notes,
    status: event.status || 'draft',
    created_at: event.created_at,
    updated_at: event.updated_at,
    recipes: eventRecipes
      .filter(er => er.event_id === event.id)
      .map(er => ({
        id: er.id,
        event_id: er.event_id,
        recipe_id: er.recipe_id,
        recipe_name: (er.recipes as any)?.name,
        servings: Number(er.servings),
        price_override: er.price_override ? Number(er.price_override) : null
      }))
  };
}

function mapSettingsFromDb(data: any): Settings {
  return {
    mode: data.mode || 'restaurant',
    vat_rate: Number(data.vat_rate || 24),
    fixed_costs_json: data.fixed_costs_json ? JSON.stringify(data.fixed_costs_json) : null,
    labour_cost_per_hour: Number(data.labour_cost_per_hour || 10),
    overhead_monthly: Number(data.overhead_monthly || 1000),
    portions_per_month: Number(data.portions_per_month || 1000),
    packaging_per_portion: Number(data.packaging_per_portion || 0.5),
    target_food_cost_percent: Number(data.target_food_cost_percent || 30),
    staff_rate_type: data.staff_rate_type || 'hourly',
    staff_hourly_rate: Number(data.staff_hourly_rate || 10),
    staff_daily_rate: Number(data.staff_daily_rate || 80),
    transport_cost_per_km: Number(data.transport_cost_per_km || 0.5),
    equipment_rental_default: Number(data.equipment_rental_default || 0),
    disposables_per_person: Number(data.disposables_per_person || 1),
    catering_markup_percent: Number(data.catering_markup_percent || 30),
    chef_rate_type: data.chef_rate_type || 'hourly',
    chef_fee_per_hour: Number(data.chef_fee_per_hour || 50),
    chef_daily_rate: Number(data.chef_daily_rate || 300),
    assistant_rate_type: data.assistant_rate_type || 'hourly',
    assistant_fee_per_hour: Number(data.assistant_fee_per_hour || 20),
    assistant_daily_rate: Number(data.assistant_daily_rate || 150),
    food_markup_percent: Number(data.food_markup_percent || 30),
    company_name: data.company_name,
    company_email: data.company_email,
    company_phone: data.company_phone,
    company_address: data.company_address,
    company_vat_number: data.company_vat_number,
    company_logo_path: data.company_logo_url
  };
}

function mapSettingsToDb(settings: Partial<Settings>): any {
  const db: any = {};
  
  if (settings.mode !== undefined) db.mode = settings.mode;
  if (settings.vat_rate !== undefined) db.vat_rate = settings.vat_rate;
  if (settings.fixed_costs_json !== undefined) {
    db.fixed_costs_json = settings.fixed_costs_json ? JSON.parse(settings.fixed_costs_json) : null;
  }
  if (settings.labour_cost_per_hour !== undefined) db.labour_cost_per_hour = settings.labour_cost_per_hour;
  if (settings.overhead_monthly !== undefined) db.overhead_monthly = settings.overhead_monthly;
  if (settings.portions_per_month !== undefined) db.portions_per_month = settings.portions_per_month;
  if (settings.packaging_per_portion !== undefined) db.packaging_per_portion = settings.packaging_per_portion;
  if (settings.target_food_cost_percent !== undefined) db.target_food_cost_percent = settings.target_food_cost_percent;
  if (settings.staff_rate_type !== undefined) db.staff_rate_type = settings.staff_rate_type;
  if (settings.staff_hourly_rate !== undefined) db.staff_hourly_rate = settings.staff_hourly_rate;
  if (settings.staff_daily_rate !== undefined) db.staff_daily_rate = settings.staff_daily_rate;
  if (settings.transport_cost_per_km !== undefined) db.transport_cost_per_km = settings.transport_cost_per_km;
  if (settings.equipment_rental_default !== undefined) db.equipment_rental_default = settings.equipment_rental_default;
  if (settings.disposables_per_person !== undefined) db.disposables_per_person = settings.disposables_per_person;
  if (settings.catering_markup_percent !== undefined) db.catering_markup_percent = settings.catering_markup_percent;
  if (settings.chef_rate_type !== undefined) db.chef_rate_type = settings.chef_rate_type;
  if (settings.chef_fee_per_hour !== undefined) db.chef_fee_per_hour = settings.chef_fee_per_hour;
  if (settings.chef_daily_rate !== undefined) db.chef_daily_rate = settings.chef_daily_rate;
  if (settings.assistant_rate_type !== undefined) db.assistant_rate_type = settings.assistant_rate_type;
  if (settings.assistant_fee_per_hour !== undefined) db.assistant_fee_per_hour = settings.assistant_fee_per_hour;
  if (settings.assistant_daily_rate !== undefined) db.assistant_daily_rate = settings.assistant_daily_rate;
  if (settings.food_markup_percent !== undefined) db.food_markup_percent = settings.food_markup_percent;
  if (settings.company_name !== undefined) db.company_name = settings.company_name;
  if (settings.company_email !== undefined) db.company_email = settings.company_email;
  if (settings.company_phone !== undefined) db.company_phone = settings.company_phone;
  if (settings.company_address !== undefined) db.company_address = settings.company_address;
  if (settings.company_vat_number !== undefined) db.company_vat_number = settings.company_vat_number;
  if (settings.company_logo_path !== undefined) db.company_logo_url = settings.company_logo_path;

  return db;
}
