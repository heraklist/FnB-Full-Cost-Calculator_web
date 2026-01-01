import { useState, memo, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import IngredientCard from '../shared/IngredientCard';
import { SkeletonCard } from '../shared/Skeleton';
import { useIngredients } from '../../hooks/useIngredients';
import { useToast } from '../Toast';
import useUndo from '../../hooks/useUndo';
import usePagination from '../../hooks/usePagination';
import Pagination from '../shared/Pagination';
import VirtualTable from '../shared/VirtualTable';
import useVirtualScrolling from '../../hooks/useVirtualScrolling';
import type { Ingredient, PriceHistory, PriceStats } from '../../types';
import { INGREDIENT_CATEGORIES, UNITS } from '../../types';

function IngredientsTab() {
  // Βοηθητικό για ασφαλές number input με feedback
  const safeNumberInput = (e: React.ChangeEvent<HTMLInputElement>, cb: (val: number) => void, opts?: { min?: number, max?: number, fallback?: number }) => {
    const val = e.target.value === '' ? (opts?.fallback ?? 0) : Number(e.target.value);
    if (e.target.value !== '' && (isNaN(val) || (opts?.min !== undefined && val < opts.min) || (opts?.max !== undefined && val > opts.max))) {
      showToast('Παρακαλώ εισάγετε έγκυρο αριθμό', 'warning');
      cb(opts?.fallback ?? 0);
      return;
    }
    cb(val);
  };
  const { ingredients, loading, error, createIngredient, updateIngredient, deleteIngredient, refresh } = useIngredients();
  const { showToast, showConfirm } = useToast();
  const { recordDelete, recordUpdate } = useUndo();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState<Partial<Ingredient>>({
    name: '',
    category: 'Άλλα',
    unit: 'kg',
    price: 0,
    waste_percent: 0,
    supplier: '',
    notes: '',
  });

  // Price History Modal States
  const [priceHistoryModal, setPriceHistoryModal] = useState<Ingredient | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [priceStats, setPriceStats] = useState<PriceStats | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Filter ingredients
  const filteredIngredients = useMemo(() => {
    return ingredients.filter(ing => {
      const matchesSearch = searchQuery === '' || 
        ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ing.supplier && ing.supplier.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === '' || ing.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [ingredients, searchQuery, filterCategory]);


  // Pagination hook
  const {
    currentPageData: paginatedIngredients,
    currentPage,
    totalPages,
    pageSize,
    pageSizeOptions,
    rangeDisplay,
    isFirstPage,
    isLastPage,
    goToPage,
    setPageSize,
  } = usePagination(filteredIngredients, {
    initialPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  });

  // Virtual scrolling
  const { shouldVirtualize } = useVirtualScrolling(filteredIngredients.length);

  // VirtualTable columns
  const columns = [
    {
      key: 'name',
      header: 'Όνομα',
      render: (ing: Ingredient) => ing.name,
    },
    {
      key: 'category',
      header: 'Κατηγορία',
      render: (ing: Ingredient) => ing.category,
    },
    {
      key: 'price',
      header: 'Τιμή',
      render: (ing: Ingredient) => `${ing.price.toFixed(2)} €`,
    },
    {
      key: 'unit',
      header: 'Μονάδα',
      render: (ing: Ingredient) => ing.unit,
    },
    {
      key: 'waste_percent',
      header: 'Απώλεια',
      render: (ing: Ingredient) => `${ing.waste_percent}%`,
    },
    {
      key: 'supplier',
      header: 'Προμηθευτής',
      render: (ing: Ingredient) => ing.supplier || '-',
    },
    {
      key: 'actions',
      header: 'Ενέργειες',
      render: (ing: Ingredient) => (
        <div className="action-buttons">
          <button className="btn-icon history" onClick={() => openPriceHistory(ing)} title="Ιστορικό Τιμών">📈</button>
          <button className="btn-icon edit" onClick={() => handleEdit(ing)}>✏️</button>
          <button className="btn-icon delete" onClick={() => handleDelete(ing.id!)}>🗑️</button>
        </div>
      ),
      cellStyle: { minWidth: 120 },
    },
  ];

  // Get unique categories from ingredients
  const categories = [...new Set(ingredients.map(ing => ing.category))].sort();

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Άλλα',
      unit: 'kg',
      price: 0,
      waste_percent: 0,
      supplier: '',
      notes: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setFormData({
      id: ingredient.id,
      name: ingredient.name,
      category: ingredient.category,
      unit: ingredient.unit,
      price: ingredient.price,
      waste_percent: ingredient.waste_percent,
      supplier: ingredient.supplier || '',
      notes: ingredient.notes || '',
    });
    setEditingId(ingredient.id!);
    setShowForm(true);
  };

  const openPriceHistory = async (ingredient: Ingredient) => {
    setPriceHistoryModal(ingredient);
    setLoadingHistory(true);
    
    try {
      const { getPriceHistory, getPriceStats } = await import('../../lib/tauri');
      const [history, stats] = await Promise.all([
        getPriceHistory(ingredient.id!),
        getPriceStats(ingredient.id!)
      ]);
      setPriceHistory(history);
      setPriceStats(stats);
    } catch (err) {
      showToast(`Σφάλμα: ${err}`, 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate waste_percent upper bound
    if (
      typeof formData.waste_percent === 'number' &&
      (formData.waste_percent < 0 || formData.waste_percent > 100)
    ) {
      showToast('Το πεδίο "Απώλεια %" πρέπει να είναι μεταξύ 0 και 100.', 'warning');
      return;
    }
    try {
      if (editingId) {
        const previousState = ingredients.find(i => i.id === editingId);
        if (previousState) {
          recordUpdate('ingredient', previousState, previousState.name);
        }
        await updateIngredient({ ...formData, id: editingId } as Ingredient);
        showToast('Το υλικό ενημερώθηκε', 'success');
      } else {
        await createIngredient(formData as Ingredient);
        showToast('Το υλικό δημιουργήθηκε', 'success');
      }
      resetForm();
    } catch (err) {
      showToast(`Σφάλμα: ${err}`, 'error');
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let importedCount = 0;
        let errorCount = 0;

        for (const row of results.data as any[]) {
          try {
            if (!row.Name && !row.name) continue;
            
            const newIngredient: Omit<Ingredient, 'id'> = {
              name: row.Name || row.name,
              category: row.Category || row.category || 'Άλλα',
              price: parseFloat(row.Price || row.price || '0'),
              unit: (row.Unit || row.unit || 'kg') as any,
              waste_percent: parseFloat(row.Waste || row.waste || '0'),
              supplier: row.Supplier || row.supplier || '',
              notes: row.Notes || row.notes || ''
            };

            await createIngredient(newIngredient);
            importedCount++;
          } catch (err) {
            console.error('Error importing row:', row, err);
            errorCount++;
          }
        }
        
        showToast(`Εισήχθησαν ${importedCount} υλικά. ${errorCount > 0 ? `${errorCount} σφάλματα.` : ''}`, errorCount > 0 ? 'warning' : 'success');
        refresh();
      },
      error: (error) => {
        showToast(`Σφάλμα ανάγνωσης CSV: ${error.message}`, 'error');
      }
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: number) => {
    const ingredient = ingredients.find(i => i.id === id);
    if (!ingredient) return;
    
    showConfirm(`Διαγραφή "${ingredient.name}";`, async () => {
      try {
        recordDelete('ingredient', ingredient, ingredient.name);
        await deleteIngredient(id);
        showToast('Το υλικό διαγράφηκε', 'success');
      } catch (err) {
        showToast(`Σφάλμα: ${err}`, 'error');
      }
    });
  };

  return (
    <>
      <div className="toolbar">
        <button className="btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? '✕ Κλείσιμο' : '+ Νέο Υλικό'}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".csv"
          onChange={handleFileUpload}
        />
        <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
          📂 Import CSV
        </button>
        <button className="btn-secondary" onClick={refresh}>🔄</button>
      </div>

      {/* Search & Filter Bar */}
      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Αναζήτηση υλικού ή προμηθευτή..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button className="btn-icon clear-search" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>
        <select 
          value={filterCategory} 
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">Όλες οι κατηγορίες</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <span className="results-count">
          {filteredIngredients.length} / {ingredients.length}
        </span>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <h3 className="form-title">{editingId ? '✏️ Επεξεργασία Υλικού' : '➕ Νέο Υλικό'}</h3>
          
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label htmlFor="ing-name">Όνομα:</label>
              <input
                id="ing-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Κατηγορία:</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {INGREDIENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ing-price">Τιμή (€):</label>
              <input
                id="ing-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => safeNumberInput(e, v => setFormData({ ...formData, price: v }), { min: 0, fallback: 0 })}
              />
            </div>
            <div className="form-group">
              <label>Μονάδα:</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Απώλεια %:</label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={formData.waste_percent}
                onChange={(e) => safeNumberInput(e, v => setFormData({ ...formData, waste_percent: v }), { min: 0, max: 100, fallback: 0 })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Προμηθευτής:</label>
              <input
                type="text"
                value={formData.supplier || ''}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ flex: 2 }}>
              <label>Σημειώσεις:</label>
              <input
                type="text"
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">{editingId ? '💾 Ενημέρωση' : '💾 Αποθήκευση'}</button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={resetForm}>Ακύρωση</button>
            )}
          </div>
        </form>
      )}

      {loading && <SkeletonCard count={8} />}
      {error && <p className="error">Σφάλμα: {error}</p>}

      {shouldVirtualize ? (
        <VirtualTable
          items={filteredIngredients}
          columns={columns}
          rowHeight={48}
          headerHeight={48}
          className="virtual-table-ingredients"
        />
      ) : (
        <div className="ingredients-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {paginatedIngredients.map((ing) => (
            <IngredientCard
              key={ing.id}
              ingredient={ing}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
          {filteredIngredients.length === 0 && !loading && (
            <div className="no-data col-span-full">
              {searchQuery || filterCategory 
                ? 'Δεν βρέθηκαν υλικά με αυτά τα κριτήρια' 
                : 'Δεν υπάρχουν υλικά. Προσθέστε το πρώτο!'}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredIngredients.length > 0 && (
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

      {/* Price History Modal */}
      {priceHistoryModal && (
        <div className="modal-overlay" onClick={() => setPriceHistoryModal(null)}>
          <div className="modal price-history-modal" onClick={(e) => e.stopPropagation()}>
            <h3>📈 Ιστορικό Τιμών</h3>
            <p className="modal-subtitle">{priceHistoryModal.name}</p>
            
            {loadingHistory ? (
              <div className="loading">Φόρτωση...</div>
            ) : (
              <>
                {/* Stats */}
                {priceStats && priceStats.record_count > 0 && (
                  <div className="price-stats-grid">
                    <div className="price-stat">
                      <span className="stat-label">Τρέχουσα</span>
                      <span className="stat-value current">{priceStats.current_price.toFixed(2)} €</span>
                      {priceStats.previous_price && (
                        <span className={`stat-change ${priceStats.current_price > priceStats.previous_price ? 'up' : 'down'}`}>
                          {priceStats.current_price > priceStats.previous_price ? '▲' : '▼'}
                          {Math.abs(((priceStats.current_price - priceStats.previous_price) / priceStats.previous_price) * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <div className="price-stat">
                      <span className="stat-label">Ελάχιστη</span>
                      <span className="stat-value min">{priceStats.min_price.toFixed(2)} €</span>
                    </div>
                    <div className="price-stat">
                      <span className="stat-label">Μέγιστη</span>
                      <span className="stat-value max">{priceStats.max_price.toFixed(2)} €</span>
                    </div>
                    <div className="price-stat">
                      <span className="stat-label">Μέση</span>
                      <span className="stat-value avg">{priceStats.avg_price.toFixed(2)} €</span>
                    </div>
                  </div>
                )}
                
                {/* History List */}
                {priceHistory.length > 0 ? (
                  <div className="price-history-list">
                    <div className="history-header">
                      <span>Ημερομηνία</span>
                      <span>Τιμή</span>
                      <span>Σημείωση</span>
                    </div>
                    {priceHistory.map((record) => (
                      <div key={record.id} className="history-row">
                        <span className="history-date">
                          {record.recorded_at ? new Date(record.recorded_at).toLocaleDateString('el-GR') : '-'}
                        </span>
                        <span className="history-price">{record.price.toFixed(2)} €</span>
                        <span className="history-notes">{record.notes || '-'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-history">
                    <p>Δεν υπάρχει ιστορικό τιμών</p>
                    <p className="hint">Οι τιμές καταγράφονται αυτόματα όταν ενημερώνεις το υλικό</p>
                  </div>
                )}
              </>
            )}
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setPriceHistoryModal(null)}>
                Κλείσιμο
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(IngredientsTab);
