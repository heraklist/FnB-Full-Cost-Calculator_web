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
