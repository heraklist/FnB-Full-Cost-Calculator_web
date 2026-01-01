import { SkeletonCard } from '../shared/Skeleton';
import { useState, memo, useMemo } from 'react';
import { useEvents } from '../../hooks/useEvents';
import { useRecipes } from '../../hooks/useRecipes';
import { useIngredients } from '../../hooks/useIngredients';
import { useSettings } from '../../hooks/useSettings';
import { useToast } from '../Toast';
import useUndo from '../../hooks/useUndo';
import usePagination from '../../hooks/usePagination';
import Pagination from '../shared/Pagination';
import type { Event, EventRecipe, EventStatus, Recipe } from '../../types';
import { EVENT_STATUS_LABELS, EVENT_STATUSES, EVENT_PRICING_MODES } from '../../types';
import {
  getRecipePricing as sharedGetRecipePricing,
  calculateEventTotals as sharedCalculateEventTotals,
} from '../../lib/costCalculations';

function EventsTab() {
  const { events, loading, error, createEvent, updateEvent, deleteEvent, refresh, updateStatus } = useEvents();
  const { recipes } = useRecipes();
  const { ingredients } = useIngredients();
  const { settings } = useSettings();
  const { showToast, showConfirm } = useToast();

  // Βοηθητικό για ασφαλές number input με feedback
  const safeNumberInput = (e: React.ChangeEvent<HTMLInputElement>, cb: (val: number) => void, opts?: { min?: number, fallback?: number }) => {
    const val = e.target.value === '' ? (opts?.fallback ?? 0) : Number(e.target.value);
    if (e.target.value !== '' && (isNaN(val) || (opts?.min !== undefined && val < opts.min))) {
      showToast('Παρακαλώ εισάγετε έγκυρο αριθμό', 'warning');
      cb(opts?.fallback ?? 0);
      return;
    }
    cb(val);
  };
  const { recordDelete, recordUpdate } = useUndo();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | ''>('');
  const [formData, setFormData] = useState<Partial<Event>>({
    name: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    event_date: '',
    event_location: '',
    guests: 10,
    pricing_mode: 'per_person',
    staff_count: 0,
    staff_hours: 0,
    include_staff_in_price: true,
    transport_km: 0,
    equipment_cost: 0,
    equipment_notes: '',
    notes: '',
    status: 'draft',
    recipes: [],
  });

  const [tempRecipe, setTempRecipe] = useState<{ recipe_id: number; servings: number; price_override?: number | null }>({
    recipe_id: 0,
    servings: 1,
    price_override: null,
  });

  // Calendar states
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  // Always use UTC for calendar logic to avoid timezone race conditions
  const getTodayUTC = () => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  };
  const [currentMonth, setCurrentMonth] = useState(() => getTodayUTC());

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    // Use UTC to avoid local timezone issues
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    const daysInMonth = lastDay.getUTCDate();
    const startingDay = firstDay.getUTCDay(); // 0 = Sunday
    return { daysInMonth, startingDay, year, month };
  };

  // Normalize date to YYYY-MM-DD (ISO, no time, always UTC)
  const toISODate = (d: string | Date | null | undefined) => {
    if (!d) return '';
    let dateObj = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return '';
    // Always use UTC for ISO string
    return dateObj.toISOString().slice(0, 10);
  };

  const getEventsForDate = (date: string) => {
    const isoDate = toISODate(date);
    return events.filter(e => toISODate(e.event_date) === isoDate);
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    // Always return YYYY-MM-DD, using UTC
    const d = new Date(Date.UTC(year, month, day));
    return d.toISOString().slice(0, 10);
  };

  const monthNames = [
    'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος',
    'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος',
    'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
  ];

  const dayNames = ['Κυρ', 'Δευ', 'Τρί', 'Τετ', 'Πέμ', 'Παρ', 'Σάβ'];

  const prevMonth = () => {
    setCurrentMonth(prev => {
      const year = prev.getUTCFullYear();
      const month = prev.getUTCMonth();
      return new Date(Date.UTC(year, month - 1, 1));
    });
  };

  const nextMonth = () => {
    setCurrentMonth(prev => {
      const year = prev.getUTCFullYear();
      const month = prev.getUTCMonth();
      return new Date(Date.UTC(year, month + 1, 1));
    });
  };

  const goToToday = () => {
    setCurrentMonth(getTodayUTC());
  };

  const resetForm = () => {
    setFormData({
      name: '',
      client_name: '',
      client_email: '',
      client_phone: '',
      event_date: '',
      event_location: '',
      guests: 10,
      pricing_mode: 'per_person',
      staff_count: 0,
      staff_hours: 0,
      include_staff_in_price: true,
      transport_km: 0,
      equipment_cost: 0,
      equipment_notes: '',
      notes: '',
      status: 'draft',
      recipes: [],
    });
    setEditingId(null);
    setShowForm(false);
    setTempRecipe({ recipe_id: 0, servings: 1, price_override: null });
  };

  const handleEdit = (event: Event) => {
    setFormData({
      ...event,
      client_name: event.client_name || '',
      client_email: event.client_email || '',
      client_phone: event.client_phone || '',
      event_date: event.event_date || '',
      event_location: event.event_location || '',
      equipment_notes: event.equipment_notes || '',
      notes: event.notes || '',
      recipes: event.recipes,
    });
    setEditingId(event.id!);
    setShowForm(true);
  };

  const addRecipeToEvent = () => {
    if (!tempRecipe.recipe_id || tempRecipe.servings <= 0) {
      showToast('Επιλέξτε συνταγή και μερίδες', 'warning');
      return;
    }

    // Validate price_override
    if (
      tempRecipe.price_override !== undefined &&
      tempRecipe.price_override !== null &&
      (isNaN(tempRecipe.price_override) || tempRecipe.price_override < 0)
    ) {
      showToast('Η τιμή/άτομο πρέπει να είναι μη αρνητικός αριθμός.', 'warning');
      return;
    }

    // Prevent duplicate recipe references
    if ((formData.recipes || []).some(r => r.recipe_id === tempRecipe.recipe_id)) {
      showToast('Η συνταγή έχει ήδη προστεθεί στο event.', 'warning');
      return;
    }

    const recipe = recipes.find(r => r.id === tempRecipe.recipe_id);
    if (!recipe) {
      showToast('Η συνταγή δεν βρέθηκε', 'error');
      return;
    }

    const entry: EventRecipe = {
      recipe_id: tempRecipe.recipe_id,
      recipe_name: recipe.name,
      servings: tempRecipe.servings,
      price_override: tempRecipe.price_override || null,
    };

    setFormData({
      ...formData,
      recipes: [...(formData.recipes || []), entry],
    });
    setTempRecipe({ recipe_id: 0, servings: 1, price_override: null });
  };

  const removeRecipeFromEvent = (index: number) => {
    const newRecipes = [...(formData.recipes || [])];
    newRecipes.splice(index, 1);
    setFormData({ ...formData, recipes: newRecipes });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.name.trim() === '') {
      showToast('Συμπληρώστε το όνομα του event', 'warning');
      return;
    }

    const payload: Event = {
      id: editingId ?? undefined,
      name: formData.name.trim(),
      client_name: formData.client_name || null,
      client_email: formData.client_email || null,
      client_phone: formData.client_phone || null,
      event_date: formData.event_date || null,
      event_location: formData.event_location || null,
      guests: formData.guests || 1,
      pricing_mode: (formData.pricing_mode as Event['pricing_mode']) || 'per_person',
      staff_count: formData.staff_count || 0,
      staff_hours: formData.staff_hours || 0,
      include_staff_in_price: formData.include_staff_in_price ?? true,
      transport_km: formData.transport_km || 0,
      equipment_cost: formData.equipment_cost || 0,
      equipment_notes: formData.equipment_notes || null,
      notes: formData.notes || null,
      status: (formData.status as EventStatus) || 'draft',
      recipes: formData.recipes || [],
    };

    try {
      if (editingId) {
        const previousState = events.find(e => e.id === editingId);
        if (previousState) {
          recordUpdate('event', previousState, previousState.name);
        }
        await updateEvent(payload);
        showToast('Το event ενημερώθηκε', 'success');
      } else {
        await createEvent(payload);
        showToast('Το event δημιουργήθηκε', 'success');
      }
      resetForm();
    } catch (err) {
      showToast(`Σφάλμα: ${err}`, 'error');
    }
  };

  const handleDelete = (id: number) => {
    const event = events.find(e => e.id === id);
    if (!event) return;
    
    showConfirm(`Διαγραφή "${event.name}";`, async () => {
      try {
        recordDelete('event', event, event.name);
        await deleteEvent(id);
        showToast('Το event διαγράφηκε', 'success');
      } catch (err) {
        showToast(`Σφάλμα: ${err}`, 'error');
      }
    });
  };

  const handleStatusChange = async (id: number, status: EventStatus) => {
    try {
      await updateStatus(id, status);
      showToast('Η κατάσταση ενημερώθηκε', 'success');
    } catch (err) {
      showToast(`Σφάλμα: ${err}`, 'error');
    }
  };

  const handleDuplicateEvent = async (id: number) => {
    try {
      const { duplicateEvent } = await import('../../lib/tauri');
      await duplicateEvent(id);
      refresh();
      showToast('Το event αντιγράφηκε', 'success');
    } catch (err) {
      showToast(`Σφάλμα: ${err}`, 'error');
    }
  };

  const handleExportPdf = async (evt: Event) => {
    const totals = sharedCalculateEventTotals(evt, recipes, ingredients, settings);
    if (!settings) {
      showToast('Δεν υπάρχουν ρυθμίσεις', 'warning');
      return;
    }

    try {
      const { exportEventPdf } = await import('../../lib/tauri');
      
      // Build company info from settings
      const companyName = settings.company_name || 'My Company';
      const companyInfoParts: string[] = [];
      if (settings.company_phone) companyInfoParts.push(`Tel: ${settings.company_phone}`);
      if (settings.company_email) companyInfoParts.push(`Email: ${settings.company_email}`);
      if (settings.company_address) companyInfoParts.push(settings.company_address);
      if (settings.company_vat_number) companyInfoParts.push(`VAT: ${settings.company_vat_number}`);
      const companyInfo = companyInfoParts.length > 0 ? companyInfoParts.join(' | ') : '';
      
      const quoteData = {
        event_name: evt.name,
        event_date: evt.event_date || null,
        event_location: evt.event_location || null,
        client_name: evt.client_name || null,
        client_email: evt.client_email || null,
        client_phone: evt.client_phone || null,
        guests: evt.guests,
        menu_items: (evt.recipes || []).map(er => {
          const recipe = recipes.find(r => r.id === er.recipe_id);
          const pricing = recipe ? sharedGetRecipePricing(recipe, ingredients, settings) : { pricePerServing: 0 };
          const pricePerServing = er.price_override ?? pricing.pricePerServing;
          return {
            name: er.recipe_name || 'Unknown',
            servings: er.servings,
            price: pricePerServing * er.servings,
          };
        }),
        food_cost: totals.costTotal,
        staff_cost: totals.staffCost,
        transport_cost: totals.transportCost,
        equipment_cost: totals.equipmentCost,
        subtotal: totals.total / (1 + settings.vat_rate / 100),
        vat_percent: settings.vat_rate,
        vat_amount: totals.total - (totals.total / (1 + settings.vat_rate / 100)),
        total: totals.total,
        price_per_person: totals.perGuest,
        notes: evt.notes || null,
        company_name: companyName,
        company_info: companyInfo,
      };

      await exportEventPdf(quoteData);
      showToast('PDF εξήχθη με επιτυχία', 'success');
    } catch (err) {
      if (String(err) !== 'Cancelled') {
        showToast(`Σφάλμα: ${err}`, 'error');
      }
    }
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const matchesSearch = searchQuery === '' ||
        evt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (evt.client_name && evt.client_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (evt.event_location && evt.event_location.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === '' || evt.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [events, searchQuery, statusFilter]);

  // Pagination hook
  const {
    currentPageData: paginatedEvents,
    currentPage,
    totalPages,
    pageSize,
    pageSizeOptions,
    rangeDisplay,
    isFirstPage,
    isLastPage,
    goToPage,
    setPageSize,
  } = usePagination(filteredEvents, {
    initialPageSize: 10,
    pageSizeOptions: [5, 10, 20, 50],
  });

  // Use shared cost calculations
  const getRecipePricing = (recipe: Recipe) => {
    return sharedGetRecipePricing(recipe, ingredients, settings);
  };

  const calculateEventTotals = (event: Event) => {
    return sharedCalculateEventTotals(event, recipes, ingredients, settings);
  };

  const statusCounts = EVENT_STATUSES.reduce<Record<EventStatus, number>>((acc, status) => {
    acc[status] = events.filter(e => e.status === status).length;
    return acc;
  }, {
    draft: 0,
    quote_sent: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  return (
    <>
      <div className="toolbar">
        <button className="btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? '✕ Κλείσιμο' : '+ Νέο Event'}
        </button>
        <button className="btn-secondary" onClick={refresh} title="Ανανέωση">🔄</button>
        
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 Λίστα
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            📅 Ημερολόγιο
          </button>
        </div>
      </div>

      <div className="event-stats">
        <div className="stat-card">
          <span className="stat-label">Σύνολο</span>
          <span className="stat-value">{events.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">ΕΠΙΒΕΒΑΙΩΜΕΝΑ</span>
          <span className="stat-value">{statusCounts.confirmed}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">ΠΡΟΣΦΟΡΕΣ</span>
          <span className="stat-value">{statusCounts.draft + statusCounts.quote_sent}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">ΟΛΟΚΛΗΡΩΜΕΝΑ</span>
          <span className="stat-value">{statusCounts.completed}</span>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Αναζήτηση event ή πελάτη..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="btn-icon clear-search" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EventStatus | '')}
          className="filter-select"
        >
          <option value="">Όλες οι καταστάσεις</option>
          {EVENT_STATUSES.map(stat => (
            <option key={stat} value={stat}>{EVENT_STATUS_LABELS[stat]}</option>
          ))}
        </select>
        <span className="results-count">{filteredEvents.length} / {events.length}</span>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <h3 className="form-title">{editingId ? '✏️ Επεξεργασία Event' : '➕ Νέο Event'}</h3>

          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label>Όνομα Event:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Ημερομηνία:</label>
              <input
                type="date"
                value={formData.event_date || ''}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Πελάτης:</label>
              <input
                type="text"
                value={formData.client_name || ''}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={formData.client_email || ''}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Τηλέφωνο:</label>
              <input
                type="text"
                value={formData.client_phone || ''}
                onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1.5 }}>
              <label>Τοποθεσία:</label>
              <input
                type="text"
                value={formData.event_location || ''}
                onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Καλεσμένοι:</label>
              <input
                type="number"
                min="1"
                value={formData.guests}
                onChange={(e) => safeNumberInput(e, v => setFormData({ ...formData, guests: v }), { min: 1, fallback: 1 })}
              />
            </div>
            <div className="form-group">
              <label>Mode Τιμολόγησης:</label>
              <select
                value={formData.pricing_mode}
                onChange={(e) => setFormData({ ...formData, pricing_mode: e.target.value as Event['pricing_mode'] })}
              >
                {EVENT_PRICING_MODES.map(mode => (
                  <option key={mode} value={mode}>{mode === 'per_person' ? 'Ανά άτομο' : 'Ανά event'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Προσωπικό (#):</label>
              <input
                type="number"
                min="0"
                value={formData.staff_count}
                onChange={(e) => safeNumberInput(e, v => setFormData({ ...formData, staff_count: v }), { min: 0, fallback: 0 })}
              />
            </div>
            <div className="form-group">
              <label>Ώρες προσωπικού:</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.staff_hours}
                onChange={(e) => safeNumberInput(e, v => setFormData({ ...formData, staff_hours: v }), { min: 0, fallback: 0 })}
              />
            </div>
            <div className="form-group checkbox">
              <label>Συμπ. προσωπικό στην τιμή:</label>
              <input
                type="checkbox"
                checked={formData.include_staff_in_price}
                onChange={(e) => setFormData({ ...formData, include_staff_in_price: e.target.checked })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Μεταφορά (χλμ):</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.transport_km}
                onChange={(e) => safeNumberInput(e, v => setFormData({ ...formData, transport_km: v }), { min: 0, fallback: 0 })}
              />
            </div>
            <div className="form-group">
              <label>Εξοπλισμός (€):</label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.equipment_cost}
                onChange={(e) => safeNumberInput(e, v => setFormData({ ...formData, equipment_cost: v }), { min: 0, fallback: 0 })}
              />
            </div>
            <div className="form-group" style={{ flex: 1.5 }}>
              <label>Κατάσταση:</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as EventStatus })}
              >
                {EVENT_STATUSES.map(stat => (
                  <option key={stat} value={stat}>{EVENT_STATUS_LABELS[stat]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Σημειώσεις εξοπλισμού:</label>
            <textarea
              value={formData.equipment_notes || ''}
              onChange={(e) => setFormData({ ...formData, equipment_notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Σημειώσεις:</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="ingredients-section">
            <h3>Μενού / Συνταγές</h3>

            <div className="add-ingredient-row">
              <select
                value={tempRecipe.recipe_id}
                onChange={(e) => setTempRecipe({ ...tempRecipe, recipe_id: parseInt(e.target.value) })}
              >
                <option value={0}>-- Επιλέξτε συνταγή --</option>
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                step="1"
                placeholder="Μερίδες"
                value={tempRecipe.servings}
                onChange={(e) => safeNumberInput(e, v => setTempRecipe({ ...tempRecipe, servings: v }), { min: 1, fallback: 1 })}
              />
              <input
                type="number"
                step="0.1"
                placeholder="Τιμή/άτομο (προαιρετικό)"
                value={tempRecipe.price_override || ''}
                onChange={(e) => safeNumberInput(e, v => setTempRecipe({ ...tempRecipe, price_override: v }), { min: 0, fallback: 0 })}
              />
              <button type="button" className="btn-icon" onClick={addRecipeToEvent}>➕</button>
            </div>

            {formData.recipes && formData.recipes.length > 0 && (
              <ul className="ingredient-list">
                {formData.recipes.map((er, idx) => (
                  <li key={`${er.recipe_id}-${idx}`}>
                    <span>{recipes.find(r => r.id === er.recipe_id)?.name || 'Συνταγή'} - {er.servings} σερβ.</span>
                    <div className="event-recipe-meta">
                      <small>{er.price_override ? `${er.price_override.toFixed(2)} €/άτομο` : 'Αυτόματη τιμολόγηση'}</small>
                      <button type="button" className="btn-icon" onClick={() => removeRecipeFromEvent(idx)}>✕</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">{editingId ? '💾 Ενημέρωση' : '💾 Αποθήκευση'}</button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={resetForm}>Ακύρωση</button>
            )}
          </div>
        </form>
      )}

      {loading && <SkeletonCard count={4} />}
      {error && <p className="error">Σφάλμα: {error}</p>}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="calendar-container">
          <div className="calendar-header">
            <button className="btn-icon" onClick={prevMonth}>◀</button>
            <h3>{monthNames[currentMonth.getUTCMonth()]} {currentMonth.getUTCFullYear()}</h3>
            <button className="btn-icon" onClick={nextMonth}>▶</button>
            <button className="btn-secondary" onClick={goToToday}>Σήμερα</button>
          </div>
          
          <div className="calendar-grid">
            {/* Day headers */}
            {dayNames.map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
            
            {/* Calendar days */}
            {(() => {
              const { daysInMonth, startingDay, year, month } = getDaysInMonth(currentMonth);
              const days = [];
              
              // Empty cells before first day
              for (let i = 0; i < startingDay; i++) {
                days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
              }
              
              // Days of month
              for (let day = 1; day <= daysInMonth; day++) {
                const dateKey = formatDateKey(year, month, day);
                const dayEvents = getEventsForDate(dateKey);
                // Always compare using UTC today
                const todayKey = toISODate(getTodayUTC());
                const isToday = dateKey === todayKey;
                
                days.push(
                  <div 
                    key={day} 
                    className={`calendar-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
                  >
                    <span className="day-number">{day}</span>
                    <div className="day-events">
                      {dayEvents.slice(0, 3).map(event => (
                        <div 
                          key={event.id} 
                          className={`day-event status-${event.status}`}
                          onClick={() => handleEdit(event)}
                          title={event.name}
                        >
                          {event.name.substring(0, 15)}{event.name.length > 15 ? '...' : ''}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="day-event more">+{dayEvents.length - 3} ακόμα</div>
                      )}
                    </div>
                  </div>
                );
              }
              
              return days;
            })()}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          <div className="events-grid">
            {paginatedEvents.map(evt => {
              const totals = calculateEventTotals(evt);
              return (
                <div key={evt.id} className="event-card card">
                  <div className="event-header">
                    <div>
                      <h3>{evt.name}</h3>
                      <div className="event-meta">
                        {evt.event_date && <span>📅 {evt.event_date}</span>}
                        {evt.event_location && <span>📍 {evt.event_location}</span>}
                        {evt.client_name && <span>👤 {evt.client_name}</span>}
                      </div>
                    </div>
                    <span className={`status-pill status-${evt.status}`}>
                      {EVENT_STATUS_LABELS[evt.status as EventStatus]}
                    </span>
                  </div>

                  <div className="event-body">
                    <div className="event-info-row">
                      <span>👥 {evt.guests} άτομα</span>
                      <span>🧾 Mode: {evt.pricing_mode === 'per_person' ? 'per person' : 'per event'}</span>
                      <span>🚚 {evt.transport_km} km</span>
                    </div>

                    <div className="event-recipes">
                      <h4>Μενού</h4>
                      {(evt.recipes || []).length === 0 && <p className="empty-state">Προσθέστε συνταγές για να κοστολογήσετε</p>}
                      {(evt.recipes || []).map((er) => {
                        const recipe = recipes.find(r => r.id === er.recipe_id);
                        if (!recipe) return null;
                        const pricing = getRecipePricing(recipe);
                        const pricePerServing = er.price_override ?? pricing.pricePerServing;
                        const lineTotal = pricePerServing * er.servings;
                        return (
                          <div key={er.id || `${er.recipe_id}-${er.servings}`} className="event-recipe-row">
                            <div>
                              <div className="event-recipe-name">{recipe.name}</div>
                              <small>{er.servings} σερβ. · {er.price_override ? 'Προσαρμ.' : 'Αυτόμ.'} τιμή</small>
                            </div>
                            <div className="event-recipe-price">{lineTotal.toFixed(2)} €</div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="event-summary">
                      <div className="summary-item">
                        <span>Τιμή/άτομο</span>
                        <strong>{totals.perGuest.toFixed(2)} €</strong>
                      </div>
                      <div className="summary-item">
                        <span>Σύνολο Event</span>
                        <strong>{totals.total.toFixed(2)} €</strong>
                      </div>
                      <div className="summary-item subtle">
                        <span>Προσωπικό/Μεταφορά/Εξοπλισμός</span>
                        <strong>{(totals.staffCost + totals.transportCost + totals.equipmentCost).toFixed(2)} €</strong>
                      </div>
                      <div className="summary-item profit">
                        <span>Κέρδος</span>
                        <strong>{totals.profitMargin.toFixed(1)}%</strong>
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button className="btn-icon pdf" onClick={() => handleExportPdf(evt)} title="Export PDF">📄</button>
                    <select
                      value={evt.status}
                      onChange={(e) => handleStatusChange(evt.id!, e.target.value as EventStatus)}
                      className="status-select"
                    >
                      {EVENT_STATUSES.map(stat => (
                        <option key={stat} value={stat}>{EVENT_STATUS_LABELS[stat]}</option>
                      ))}
                    </select>
                    <button className="btn-icon copy" onClick={() => handleDuplicateEvent(evt.id!)} title="Αντιγραφή">📋</button>
                    <button className="btn-secondary" onClick={() => handleEdit(evt)}>✏️ Επεξεργασία</button>
                    <button className="btn-danger" onClick={() => handleDelete(evt.id!)}>🗑️</button>
                  </div>
                </div>
              );
            })}
            {filteredEvents.length === 0 && !loading && (
              <p className="empty-state">Δεν υπάρχουν events με αυτά τα κριτήρια</p>
            )}
          </div>
          
          {/* Pagination */}
          {filteredEvents.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              pageSizeOptions={pageSizeOptions}
              rangeDisplay={rangeDisplay}
              isFirstPage={isFirstPage}
              isLastPage={isLastPage}
              onPageChange={goToPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </>
      )}
    </>
  );
}

export default memo(EventsTab);
