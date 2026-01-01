import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './lib/supabase'
import * as api from './lib/api'
import type { Ingredient, NewIngredient } from './lib/api'

type Tab = 'ingredients' | 'recipes' | 'events' | 'settings'

// Categories for ingredients
const CATEGORIES = [
  'Κρέατα',
  'Ψάρια/Θαλασσινά',
  'Λαχανικά',
  'Φρούτα',
  'Γαλακτοκομικά',
  'Αλλαντικά',
  'Όσπρια/Δημητριακά',
  'Μπαχαρικά/Βότανα',
  'Λάδια/Ξύδια',
  'Ζυμαρικά',
  'Αλεύρια',
  'Ζάχαρη/Γλυκαντικά',
  'Ποτά',
  'Άλλο'
]

const UNITS = ['kg', 'g', 'lt', 'ml', 'τεμ', 'ματσάκι', 'φέτα', 'κουτί', 'συσκ']

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('ingredients')
  
  // Ingredients state
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [ingredientsLoading, setIngredientsLoading] = useState(false)
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      loadIngredients()
    }
  }, [session])

  const loadIngredients = async () => {
    setIngredientsLoading(true)
    try {
      const data = await api.getIngredients()
      setIngredients(data)
    } catch (err) {
      console.error('Error loading ingredients:', err)
    } finally {
      setIngredientsLoading(false)
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
    } catch (err) {
      console.error('Error deleting:', err)
      alert('Σφάλμα κατά τη διαγραφή')
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

  if (loading) {
    return <div className="loading"><p>Φόρτωση...</p></div>
  }

  if (!session) {
    return (
      <div className="auth-container">
        <div className="auth-header">
          <span style={{ fontSize: '3rem' }}>🍳</span>
          <h1>FnB Cost Calculator</h1>
          <p style={{ color: '#94a3b8' }}>Υπολογισμός κόστους για εστιατόρια</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email',
                password_label: 'Κωδικός',
                button_label: 'Σύνδεση',
              },
              sign_up: {
                email_label: 'Email',
                password_label: 'Κωδικός',
                button_label: 'Εγγραφή',
              },
            },
          }}
        />
      </div>
    )
  }

  return (
    <div className="app-container">
      <nav className="top-nav">
        <div className="nav-brand">
          <span>🍳</span>
          <h1>FnB Cost</h1>
        </div>
        <div className="nav-tabs">
          <button
            className={`nav-item ${activeTab === 'ingredients' ? 'active' : ''}`}
            onClick={() => setActiveTab('ingredients')}
          >
            📦 Υλικά ({ingredients.length})
          </button>
          <button
            className={`nav-item ${activeTab === 'recipes' ? 'active' : ''}`}
            onClick={() => setActiveTab('recipes')}
          >
            📖 Συνταγές
          </button>
          <button
            className={`nav-item ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            🎪 Events
          </button>
          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Ρυθμίσεις
          </button>
        </div>
        <div className="nav-actions">
          <span className="user-email">{session.user.email}</span>
          <button className="logout-btn" onClick={() => supabase.auth.signOut()}>
            Έξοδος
          </button>
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'ingredients' && (
          <div className="tab-content">
            <div className="tab-header">
              <h2>📦 Υλικά</h2>
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                + Νέο Υλικό
              </button>
            </div>

            {showForm && (
              <div className="modal-overlay" onClick={resetForm}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                  <h3>{editingId ? 'Επεξεργασία' : 'Νέο Υλικό'}</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label>Όνομα *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Κατηγορία</label>
                        <select
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Μονάδα</label>
                        <select
                          value={formData.unit}
                          onChange={e => setFormData({...formData, unit: e.target.value})}
                        >
                          {UNITS.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Τιμή (€) *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={e => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Απώλεια (%)</label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="100"
                          value={formData.waste_percent}
                          onChange={e => setFormData({...formData, waste_percent: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Προμηθευτής</label>
                      <input
                        type="text"
                        value={formData.supplier || ''}
                        onChange={e => setFormData({...formData, supplier: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Σημειώσεις</label>
                      <textarea
                        value={formData.notes || ''}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                        rows={2}
                      />
                    </div>
                    <div className="form-actions">
                      <button type="button" className="btn btn-secondary" onClick={resetForm}>
                        Ακύρωση
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {editingId ? 'Αποθήκευση' : 'Προσθήκη'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {ingredientsLoading ? (
              <p>Φόρτωση...</p>
            ) : ingredients.length === 0 ? (
              <div className="empty-state">
                <p>Δεν υπάρχουν υλικά ακόμα.</p>
                <p>Πάτησε "Νέο Υλικό" για να προσθέσεις!</p>
              </div>
            ) : (
              <div className="ingredients-grid">
                {ingredients.map(ing => (
                  <div key={ing.id} className="ingredient-card">
                    <div className="card-header">
                      <h4>{ing.name}</h4>
                      <span className="category-badge">{ing.category}</span>
                    </div>
                    <div className="card-body">
                      <p className="price">€{ing.price.toFixed(2)} / {ing.unit}</p>
                      {ing.waste_percent > 0 && (
                        <p className="waste">Απώλεια: {ing.waste_percent}%</p>
                      )}
                      {ing.supplier && (
                        <p className="supplier">📍 {ing.supplier}</p>
                      )}
                    </div>
                    <div className="card-actions">
                      <button className="btn-icon" onClick={() => handleEdit(ing)}>✏️</button>
                      <button className="btn-icon" onClick={() => handleDelete(ing.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'recipes' && (
          <div className="tab-content">
            <h2>📖 Συνταγές</h2>
            <p>Σύντομα διαθέσιμο...</p>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="tab-content">
            <h2>🎪 Events</h2>
            <p>Σύντομα διαθέσιμο...</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tab-content">
            <h2>⚙️ Ρυθμίσεις</h2>
            <p>Σύντομα διαθέσιμο...</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
