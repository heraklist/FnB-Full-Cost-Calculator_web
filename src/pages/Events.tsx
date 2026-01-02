import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, X, Calendar, MapPin, Users, Phone, Mail, Clock } from 'lucide-react'
import * as api from '../lib/api'
import type { Event, NewEvent, Recipe } from '../lib/api'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Πρόχειρο', color: 'bg-gray-500' },
  quote_sent: { label: 'Προσφορά', color: 'bg-blue-500' },
  confirmed: { label: 'Επιβεβαιωμένο', color: 'bg-green-500' },
  completed: { label: 'Ολοκληρωμένο', color: 'bg-emerald-600' },
  cancelled: { label: 'Ακυρωμένο', color: 'bg-red-500' },
}

export default function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('Όλα')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState<NewEvent>({
    name: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    event_date: '',
    event_location: '',
    guests: 0,
    pricing_mode: 'per_person',
    staff_count: 0,
    staff_hours: 0,
    include_staff_in_price: false,
    transport_km: 0,
    equipment_cost: 0,
    equipment_notes: '',
    notes: '',
    status: 'draft'
  })

  const [eventRecipes, setEventRecipes] = useState<{
    recipe_id: number
    servings: number
    price_override: number | null
  }[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [eventsData, recipesData] = await Promise.all([
        api.getEvents(),
        api.getRecipes()
      ])
      setEvents(eventsData)
      setRecipes(recipesData)
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
        await api.updateEvent(editingId, formData, eventRecipes)
      } else {
        await api.createEvent(formData, eventRecipes)
      }
      await loadData()
      resetForm()
    } catch (err) {
      console.error('Error saving event:', err)
      alert('Σφάλμα κατά την αποθήκευση')
    }
  }

  const handleEdit = (event: Event) => {
    setFormData({
      name: event.name,
      client_name: event.client_name || '',
      client_email: event.client_email || '',
      client_phone: event.client_phone || '',
      event_date: event.event_date || '',
      event_location: event.event_location || '',
      guests: event.guests,
      pricing_mode: event.pricing_mode,
      staff_count: event.staff_count,
      staff_hours: event.staff_hours,
      include_staff_in_price: event.include_staff_in_price,
      transport_km: event.transport_km,
      equipment_cost: event.equipment_cost,
      equipment_notes: event.equipment_notes || '',
      notes: event.notes || '',
      status: event.status
    })
    setEventRecipes(
      event.event_recipes?.map(er => ({
        recipe_id: er.recipe_id,
        servings: er.servings,
        price_override: er.price_override
      })) || []
    )
    setEditingId(event.id)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Διαγραφή event;')) return
    try {
      await api.deleteEvent(id)
      await loadData()
    } catch (err) {
      console.error('Error deleting:', err)
      alert('Σφάλμα κατά τη διαγραφή')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      client_name: '',
      client_email: '',
      client_phone: '',
      event_date: '',
      event_location: '',
      guests: 0,
      pricing_mode: 'per_person',
      staff_count: 0,
      staff_hours: 0,
      include_staff_in_price: false,
      transport_km: 0,
      equipment_cost: 0,
      equipment_notes: '',
      notes: '',
      status: 'draft'
    })
    setEventRecipes([])
    setEditingId(null)
    setShowForm(false)
  }

  const addRecipeToEvent = () => {
    if (recipes.length === 0) return
    setEventRecipes([
      ...eventRecipes,
      { recipe_id: recipes[0].id, servings: formData.guests || 1, price_override: null }
    ])
  }

  const removeRecipeFromEvent = (index: number) => {
    setEventRecipes(eventRecipes.filter((_, i) => i !== index))
  }

  const updateEventRecipe = (index: number, field: string, value: any) => {
    const updated = [...eventRecipes]
    updated[index] = { ...updated[index], [field]: value }
    setEventRecipes(updated)
  }

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'Όλα' || e.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('el-GR')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Events / Catering</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Νέο Event
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Αναζήτηση event ή πελάτη..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="Όλα">Όλες οι καταστάσεις</option>
          {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Events List */}
      {loading ? (
        <p className="text-gray-400">Φόρτωση...</p>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 text-center">
          <Calendar className="mx-auto text-gray-500 mb-4" size={48} />
          <p className="text-gray-400">Δεν βρέθηκαν events</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-indigo-400 hover:text-indigo-300"
          >
            Δημιουργήστε το πρώτο σας event
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => {
            const { foodCost, totalCost } = api.calculateEventCost(event)
            const status = STATUS_LABELS[event.status]
            return (
              <div key={event.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{event.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full text-white ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                      {event.client_name && (
                        <span className="flex items-center gap-1">
                          <Users size={14} />
                          {event.client_name}
                        </span>
                      )}
                      {event.event_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(event.event_date)}
                        </span>
                      )}
                      {event.event_location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {event.event_location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {event.guests} άτομα
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Κόστος</p>
                      <p className="text-xl font-bold text-emerald-400">€{totalCost.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="text-indigo-400 hover:text-indigo-300 p-2"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="text-red-400 hover:text-red-300 p-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
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
            className="bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-700"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-700">
              <h3 className="text-lg font-semibold text-white">
                {editingId ? 'Επεξεργασία Event' : 'Νέο Event'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Βασικά Στοιχεία</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-400 mb-1">Όνομα Event *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Ημερομηνία</label>
                    <input
                      type="date"
                      value={formData.event_date || ''}
                      onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Τοποθεσία</label>
                    <input
                      type="text"
                      value={formData.event_location || ''}
                      onChange={e => setFormData({ ...formData, event_location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Άτομα</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.guests}
                      onChange={e => setFormData({ ...formData, guests: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Κατάσταση</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                    >
                      {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Στοιχεία Πελάτη</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Όνομα</label>
                    <input
                      type="text"
                      value={formData.client_name || ''}
                      onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.client_email || ''}
                      onChange={e => setFormData({ ...formData, client_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Τηλέφωνο</label>
                    <input
                      type="tel"
                      value={formData.client_phone || ''}
                      onChange={e => setFormData({ ...formData, client_phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Recipes */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-300">Συνταγές</h4>
                  <button
                    type="button"
                    onClick={addRecipeToEvent}
                    disabled={recipes.length === 0}
                    className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 disabled:opacity-50"
                  >
                    <Plus size={16} />
                    Προσθήκη συνταγής
                  </button>
                </div>

                {recipes.length === 0 ? (
                  <p className="text-sm text-gray-500">Πρέπει πρώτα να δημιουργήσετε συνταγές.</p>
                ) : eventRecipes.length === 0 ? (
                  <p className="text-sm text-gray-500">Δεν έχουν προστεθεί συνταγές.</p>
                ) : (
                  <div className="space-y-2">
                    {eventRecipes.map((er, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <select
                          value={er.recipe_id}
                          onChange={e => updateEventRecipe(index, 'recipe_id', Number(e.target.value))}
                          className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm"
                        >
                          {recipes.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={er.servings}
                          onChange={e => updateEventRecipe(index, 'servings', parseInt(e.target.value) || 1)}
                          placeholder="Μερίδες"
                          className="w-24 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeRecipeFromEvent(index)}
                          className="text-red-400 hover:text-red-300 p-1"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Extra Costs */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Επιπλέον Κόστη</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Χιλιόμετρα</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.transport_km}
                      onChange={e => setFormData({ ...formData, transport_km: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Εξοπλισμός (€)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.equipment_cost}
                      onChange={e => setFormData({ ...formData, equipment_cost: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Σημειώσεις</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
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
