import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, X, ChefHat, Clock, Users } from 'lucide-react'
import { CATEGORIES, UNITS } from '../lib/constants'
import * as api from '../lib/api'
import type { Recipe, NewRecipe, Ingredient } from '../lib/api'

const RECIPE_CATEGORIES = [
  'Ορεκτικά',
  'Κυρίως Πιάτα',
  'Σαλάτες',
  'Σούπες',
  'Ζυμαρικά',
  'Θαλασσινά',
  'Κρεατικά',
  'Επιδόρπια',
  'Ποτά',
  'Άλλο'
]

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Όλα')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  
  const [formData, setFormData] = useState<NewRecipe>({
    name: '',
    category: 'Άλλο',
    servings: 1,
    prep_time_minutes: 0,
    notes: ''
  })
  
  const [recipeIngredients, setRecipeIngredients] = useState<{
    ingredient_id: number
    quantity: number
    unit: string
  }[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [recipesData, ingredientsData] = await Promise.all([
        api.getRecipes(),
        api.getIngredients()
      ])
      setRecipes(recipesData)
      setIngredients(ingredientsData)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.updateRecipe(editingId, formData, recipeIngredients)
      } else {
        await api.createRecipe(formData, recipeIngredients)
      }
      await loadData()
      resetForm()
    } catch (err) {
      console.error('Error saving recipe:', err)
      alert('Σφάλμα κατά την αποθήκευση')
    }
  }

  const handleEdit = (recipe: Recipe) => {
    setFormData({
      name: recipe.name,
      category: recipe.category,
      servings: recipe.servings,
      prep_time_minutes: recipe.prep_time_minutes,
      notes: recipe.notes || ''
    })
    setRecipeIngredients(
      recipe.recipe_ingredients?.map(ri => ({
        ingredient_id: ri.ingredient_id,
        quantity: ri.quantity,
        unit: ri.unit
      })) || []
    )
    setEditingId(recipe.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Διαγραφή συνταγής;')) return
    try {
      await api.deleteRecipe(id)
      await loadData()
    } catch (err) {
      console.error('Error deleting:', err)
      alert('Σφάλμα κατά τη διαγραφή')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Άλλο',
      servings: 1,
      prep_time_minutes: 0,
      notes: ''
    })
    setRecipeIngredients([])
    setEditingId(null)
    setShowForm(false)
  }

  const addIngredientToRecipe = () => {
    if (ingredients.length === 0) return
    setRecipeIngredients([
      ...recipeIngredients,
      { ingredient_id: ingredients[0].id, quantity: 0, unit: ingredients[0].unit }
    ])
  }

  const removeIngredientFromRecipe = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index))
  }

  const updateRecipeIngredient = (index: number, field: string, value: any) => {
    const updated = [...recipeIngredients]
    if (field === 'ingredient_id') {
      const ing = ingredients.find(i => i.id === Number(value))
      updated[index] = { ...updated[index], ingredient_id: Number(value), unit: ing?.unit || 'kg' }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setRecipeIngredients(updated)
  }

  const calculateCost = (recipe: Recipe): number => {
    return api.calculateRecipeCost(recipe)
  }

  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Όλα' || r.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Συνταγές</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Νέα Συνταγή
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Αναζήτηση συνταγής..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="Όλα">Όλες οι κατηγορίες</option>
          {RECIPE_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Recipes Grid */}
      {loading ? (
        <p className="text-gray-400">Φόρτωση...</p>
      ) : filteredRecipes.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
          <ChefHat className="mx-auto text-gray-500 mb-4" size={48} />
          <p className="text-gray-400">Δεν βρέθηκαν συνταγές</p>
          <button 
            onClick={() => setShowForm(true)}
            className="mt-4 text-indigo-400 hover:text-indigo-300"
          >
            Δημιουργήστε την πρώτη σας συνταγή
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => {
            const cost = calculateCost(recipe)
            const costPerServing = cost / (recipe.servings || 1)
            return (
              <div key={recipe.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{recipe.name}</h3>
                      <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded-full">
                        {recipe.category}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(recipe)}
                        className="text-indigo-400 hover:text-indigo-300 p-1"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(recipe.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Users size={16} />
                      {recipe.servings} μερίδες
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {recipe.prep_time_minutes} λεπτά
                    </span>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Κόστος:</span>
                      <span className="text-emerald-400 font-bold">€{cost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-gray-400">Ανά μερίδα:</span>
                      <span className="text-emerald-400">€{costPerServing.toFixed(2)}</span>
                    </div>
                  </div>

                  {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-xs text-gray-500 mb-2">Υλικά ({recipe.recipe_ingredients.length}):</p>
                      <div className="flex flex-wrap gap-1">
                        {recipe.recipe_ingredients.slice(0, 5).map((ri, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                            {ri.ingredient?.name}
                          </span>
                        ))}
                        {recipe.recipe_ingredients.length > 5 && (
                          <span className="text-xs px-2 py-1 text-gray-500">
                            +{recipe.recipe_ingredients.length - 5} ακόμα
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={resetForm}>
          <div 
            className="bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                {editingId ? 'Επεξεργασία Συνταγής' : 'Νέα Συνταγή'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Όνομα *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Κατηγορία</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {RECIPE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Μερίδες</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.servings}
                    onChange={e => setFormData({...formData, servings: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Χρόνος (λεπτά)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.prep_time_minutes}
                    onChange={e => setFormData({...formData, prep_time_minutes: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Recipe Ingredients */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Υλικά</label>
                  <button
                    type="button"
                    onClick={addIngredientToRecipe}
                    disabled={ingredients.length === 0}
                    className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Plus size={16} />
                    Προσθήκη υλικού
                  </button>
                </div>
                
                {ingredients.length === 0 ? (
                  <p className="text-sm text-gray-500">Πρέπει πρώτα να προσθέσετε υλικά στη βάση.</p>
                ) : recipeIngredients.length === 0 ? (
                  <p className="text-sm text-gray-500">Δεν έχουν προστεθεί υλικά.</p>
                ) : (
                  <div className="space-y-2">
                    {recipeIngredients.map((ri, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <select
                          value={ri.ingredient_id}
                          onChange={e => updateRecipeIngredient(index, 'ingredient_id', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm"
                        >
                          {ingredients.map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={ri.quantity}
                          onChange={e => updateRecipeIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                          placeholder="Ποσ."
                          className="w-24 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm"
                        />
                        <select
                          value={ri.unit}
                          onChange={e => updateRecipeIngredient(index, 'unit', e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm"
                        >
                          {UNITS.map(u => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => removeIngredientFromRecipe(index)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Σημειώσεις</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700"
                >
                  Ακύρωση
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingId ? 'Αποθήκευση' : 'Δημιουργία'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
