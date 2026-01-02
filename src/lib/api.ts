import { supabase } from './supabase'

// Types
export interface Ingredient {
  id: number
  name: string
  category: string
  unit: string
  price: number
  supplier: string | null
  waste_percent: number
  notes: string | null
  created_at?: string
  updated_at?: string
}

export type NewIngredient = Omit<Ingredient, 'id' | 'created_at' | 'updated_at'>

// Get all ingredients for current user
export async function getIngredients(): Promise<Ingredient[]> {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('name')

  if (error) throw error
  return data || []
}

// Create new ingredient
export async function createIngredient(ingredient: NewIngredient): Promise<Ingredient> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('ingredients')
    .insert({
      user_id: user.id,
      name: ingredient.name,
      category: ingredient.category,
      unit: ingredient.unit,
      price: ingredient.price,
      supplier: ingredient.supplier,
      waste_percent: ingredient.waste_percent,
      notes: ingredient.notes,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Update ingredient
export async function updateIngredient(id: number, ingredient: Partial<NewIngredient>): Promise<Ingredient> {
  const { data, error } = await supabase
    .from('ingredients')
    .update(ingredient)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete ingredient
export async function deleteIngredient(id: number): Promise<void> {
  const { error } = await supabase
    .from('ingredients')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// =====================================================
// RECIPES
// =====================================================

export interface RecipeIngredient {
  id?: number
  ingredient_id: number
  quantity: number
  unit: string
  ingredient?: Ingredient
}

export interface Recipe {
  id: number
  name: string
  category: string
  servings: number
  prep_time_minutes: number
  notes: string | null
  created_at?: string
  updated_at?: string
  recipe_ingredients?: RecipeIngredient[]
}

export type NewRecipe = Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'recipe_ingredients'>

// Get all recipes with ingredients
export async function getRecipes(): Promise<Recipe[]> {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        id,
        ingredient_id,
        quantity,
        unit,
        ingredients (
          id,
          name,
          price,
          unit,
          waste_percent
        )
      )
    `)
    .order('name')

  if (error) throw error
  
  return (data || []).map(recipe => ({
    ...recipe,
    recipe_ingredients: recipe.recipe_ingredients?.map((ri: any) => ({
      ...ri,
      ingredient: ri.ingredients
    }))
  }))
}

// Create recipe
export async function createRecipe(
  recipe: NewRecipe, 
  ingredients: { ingredient_id: number; quantity: number; unit: string }[]
): Promise<Recipe> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: newRecipe, error: recipeError } = await supabase
    .from('recipes')
    .insert({
      user_id: user.id,
      name: recipe.name,
      category: recipe.category,
      servings: recipe.servings,
      prep_time_minutes: recipe.prep_time_minutes,
      notes: recipe.notes,
    })
    .select()
    .single()

  if (recipeError) throw recipeError

  if (ingredients.length > 0) {
    const { error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .insert(
        ingredients.map(ing => ({
          recipe_id: newRecipe.id,
          ingredient_id: ing.ingredient_id,
          quantity: ing.quantity,
          unit: ing.unit,
        }))
      )

    if (ingredientsError) throw ingredientsError
  }

  return newRecipe
}

// Update recipe
export async function updateRecipe(
  id: number,
  recipe: Partial<NewRecipe>,
  ingredients?: { ingredient_id: number; quantity: number; unit: string }[]
): Promise<Recipe> {
  const { data, error } = await supabase
    .from('recipes')
    .update(recipe)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  if (ingredients !== undefined) {
    await supabase
      .from('recipe_ingredients')
      .delete()
      .eq('recipe_id', id)

    if (ingredients.length > 0) {
      await supabase
        .from('recipe_ingredients')
        .insert(
          ingredients.map(ing => ({
            recipe_id: id,
            ingredient_id: ing.ingredient_id,
            quantity: ing.quantity,
            unit: ing.unit,
          }))
        )
    }
  }

  return data
}

// Delete recipe
export async function deleteRecipe(id: number): Promise<void> {
  const { error } = await supabase
    .from('recipes')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Calculate recipe cost
export function calculateRecipeCost(recipe: Recipe): number {
  if (!recipe.recipe_ingredients) return 0
  
  return recipe.recipe_ingredients.reduce((total, ri) => {
    if (!ri.ingredient) return total
    const wasteMultiplier = 1 + ((ri.ingredient.waste_percent || 0) / 100)
    return total + (ri.quantity * ri.ingredient.price * wasteMultiplier)
  }, 0)
}

// =====================================================
// EVENTS
// =====================================================

export interface EventRecipe {
  id?: number
  recipe_id: number
  servings: number
  price_override: number | null
  recipe?: Recipe
}

export interface Event {
  id: number
  name: string
  client_name: string | null
  client_email: string | null
  client_phone: string | null
  event_date: string | null
  event_location: string | null
  guests: number
  pricing_mode: 'per_person' | 'per_event'
  staff_count: number
  staff_hours: number
  include_staff_in_price: boolean
  transport_km: number
  equipment_cost: number
  equipment_notes: string | null
  notes: string | null
  status: 'draft' | 'quote_sent' | 'confirmed' | 'completed' | 'cancelled'
  created_at?: string
  updated_at?: string
  event_recipes?: EventRecipe[]
}

export type NewEvent = Omit<Event, 'id' | 'created_at' | 'updated_at' | 'event_recipes'>

// Get all events
export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      event_recipes (
        id,
        recipe_id,
        servings,
        price_override,
        recipes (
          id,
          name,
          category,
          servings,
          recipe_ingredients (
            id,
            ingredient_id,
            quantity,
            unit,
            ingredients (
              id,
              name,
              price,
              waste_percent
            )
          )
        )
      )
    `)
    .order('event_date', { ascending: false })

  if (error) throw error

  return (data || []).map(event => ({
    ...event,
    event_recipes: event.event_recipes?.map((er: any) => ({
      ...er,
      recipe: er.recipes ? {
        ...er.recipes,
        recipe_ingredients: er.recipes.recipe_ingredients?.map((ri: any) => ({
          ...ri,
          ingredient: ri.ingredients
        }))
      } : null
    }))
  }))
}

// Create event
export async function createEvent(
  event: NewEvent,
  recipes: { recipe_id: number; servings: number; price_override: number | null }[]
): Promise<Event> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: newEvent, error: eventError } = await supabase
    .from('events')
    .insert({
      user_id: user.id,
      ...event
    })
    .select()
    .single()

  if (eventError) throw eventError

  if (recipes.length > 0) {
    const { error: recipesError } = await supabase
      .from('event_recipes')
      .insert(
        recipes.map(r => ({
          event_id: newEvent.id,
          recipe_id: r.recipe_id,
          servings: r.servings,
          price_override: r.price_override,
        }))
      )

    if (recipesError) throw recipesError
  }

  return newEvent
}

// Update event
export async function updateEvent(
  id: number,
  event: Partial<NewEvent>,
  recipes?: { recipe_id: number; servings: number; price_override: number | null }[]
): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .update(event)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  if (recipes !== undefined) {
    await supabase
      .from('event_recipes')
      .delete()
      .eq('event_id', id)

    if (recipes.length > 0) {
      await supabase
        .from('event_recipes')
        .insert(
          recipes.map(r => ({
            event_id: id,
            recipe_id: r.recipe_id,
            servings: r.servings,
            price_override: r.price_override,
          }))
        )
    }
  }

  return data
}

// Delete event
export async function deleteEvent(id: number): Promise<void> {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Calculate event cost
export function calculateEventCost(event: Event): { foodCost: number; totalCost: number } {
  let foodCost = 0

  if (event.event_recipes) {
    event.event_recipes.forEach(er => {
      if (er.recipe) {
        const recipeCost = calculateRecipeCost(er.recipe)
        const costPerServing = recipeCost / (er.recipe.servings || 1)
        foodCost += costPerServing * er.servings
      }
    })
  }

  const totalCost = foodCost + (event.equipment_cost || 0) + (event.transport_km * 0.5) // €0.50/km

  return { foodCost, totalCost }
}

// =====================================================
// TRANSACTIONS (Έσοδα/Έξοδα)
// =====================================================

export interface Transaction {
  id: number
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string | null
  transaction_date: string
  event_id: number | null
  created_at?: string
  updated_at?: string
}

export type NewTransaction = Omit<Transaction, 'id' | 'created_at' | 'updated_at'>

export const INCOME_CATEGORIES = [
  'Πωλήσεις',
  'Catering',
  'Events',
  'Άλλα Έσοδα'
]

export const EXPENSE_CATEGORIES = [
  'Πρώτες Ύλες',
  'Προσωπικό',
  'Ενοίκιο',
  'Λογαριασμοί',
  'Εξοπλισμός',
  'Μεταφορικά',
  'Marketing',
  'Άλλα Έξοδα'
]

// Get all transactions
export async function getTransactions(startDate?: string, endDate?: string): Promise<Transaction[]> {
  let query = supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false })

  if (startDate) {
    query = query.gte('transaction_date', startDate)
  }
  if (endDate) {
    query = query.lte('transaction_date', endDate)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

// Create transaction
export async function createTransaction(transaction: NewTransaction): Promise<Transaction> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      ...transaction
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Update transaction
export async function updateTransaction(id: number, transaction: Partial<NewTransaction>): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .update(transaction)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete transaction
export async function deleteTransaction(id: number): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Get monthly summary
export function getMonthlyStats(transactions: Transaction[]) {
  const monthlyData: { [key: string]: { income: number; expense: number; profit: number } } = {}

  transactions.forEach(t => {
    const month = t.transaction_date.substring(0, 7) // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expense: 0, profit: 0 }
    }
    if (t.type === 'income') {
      monthlyData[month].income += t.amount
    } else {
      monthlyData[month].expense += t.amount
    }
    monthlyData[month].profit = monthlyData[month].income - monthlyData[month].expense
  })

  return Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      name: new Date(month + '-01').toLocaleDateString('el-GR', { month: 'short' }),
      month,
      ...data
    }))
}

