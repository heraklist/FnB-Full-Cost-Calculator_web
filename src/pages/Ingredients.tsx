import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, AlertCircle, X } from 'lucide-react'
import { CATEGORIES, UNITS } from '../lib/constants'
import * as api from '../lib/api'
import type { Ingredient, NewIngredient } from '../lib/api'

export default function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Όλα')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<NewIngredient>({
    name: '',
    category: 'Άλλο',
    unit: 'kg',
    price: 0,
    supplier: '',
    waste_percent: 0,
    notes: ''
  })

  useEffect(() => {
    loadIngredients()
  }, [])

  const loadIngredients = async () => {
    setLoading(true)
    try {
      const data = await api.getIngredients()
      setIngredients(data)
    } catch (err) {
      console.error('Error loading ingredients:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.updateIngredient(editingId, formData)
      } else {
        await api.createIngredient(formData)
      }
      await loadIngredients()
      resetForm()
    } catch (err) {
      console.error('Error saving ingredient:', err)
      alert('Σφάλμα κατά την αποθήκευση')
    }
  }

  const handleEdit = (ingredient: Ingredient) => {
    setFormData({
      name: ingredient.name,
      category: ingredient.category,
      unit: ingredient.unit,
      price: ingredient.price,
      supplier: ingredient.supplier || '',
      waste_percent: ingredient.waste_percent,
      notes: ingredient.notes || ''
    })
    setEditingId(ingredient.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Διαγραφή υλικού;')) return
    try {
      await api.deleteIngredient(id)
      await loadIngredients()
    } catch (err: any) {
      console.error('Error deleting:', err)
      if (err?.code === '23503') {
        alert('Δεν μπορείτε να διαγράψετε αυτό το υλικό γιατί χρησιμοποιείται σε συνταγές. Διαγράψτε πρώτα τις συνταγές που το χρησιμοποιούν.')
      } else {
        alert('Σφάλμα κατά τη διαγραφή')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Άλλο',
      unit: 'kg',
      price: 0,
      supplier: '',
      waste_percent: 0,
      notes: ''
    })
    setEditingId(null)
    setShowForm(false)
  }

  const filteredIngredients = ingredients.filter(ing => {
    const matchesSearch = ing.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ing.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Όλα' || ing.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Πρώτες Ύλες</h1>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Νέα Πρώτη Ύλη
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Αναζήτηση υλικού ή προμηθευτή..."
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
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Όνομα</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Κατηγορία</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Τιμή / Μονάδα</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Προμηθευτής</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Απώλεια %</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Ενέργειες</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                    Φόρτωση...
                  </td>
                </tr>
              ) : filteredIngredients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                    Δεν βρέθηκαν υλικά
                  </td>
                </tr>
              ) : (
                filteredIngredients.map((ing) => (
                  <tr key={ing.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{ing.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-700 text-gray-300">
                        {ing.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-emerald-400 font-medium">
                      €{ing.price.toFixed(2)} / {ing.unit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">{ing.supplier || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {ing.waste_percent > 0 ? (
                        <span className="text-red-400 flex items-center gap-1">
                          <AlertCircle size={14} />
                          {ing.waste_percent}%
                        </span>
                      ) : (
                        <span className="text-green-400">0%</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(ing)}
                          className="text-indigo-400 hover:text-indigo-300 p-1"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(ing.id)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={resetForm}>
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 border border-gray-700" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                {editingId ? 'Επεξεργασία Υλικού' : 'Νέο Υλικό'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Κατηγορία</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Μονάδα</label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    {UNITS.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Τιμή (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                    required
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Απώλεια (%)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={formData.waste_percent}
                    onChange={e => setFormData({...formData, waste_percent: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Προμηθευτής</label>
                <input
                  type="text"
                  value={formData.supplier || ''}
                  onChange={e => setFormData({...formData, supplier: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Σημειώσεις</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
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
                  {editingId ? 'Αποθήκευση' : 'Προσθήκη'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
