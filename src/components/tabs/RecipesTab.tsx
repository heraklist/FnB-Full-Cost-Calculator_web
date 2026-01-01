
import { useState, memo, useMemo } from 'react';
import RecipeCard from '../shared/RecipeCard';
import { SkeletonCard } from '../shared/Skeleton';
import usePagination from '../../hooks/usePagination';
import Pagination from '../shared/Pagination';
import VirtualGrid from '../shared/VirtualGrid';
import useVirtualScrolling from '../../hooks/useVirtualScrolling';
import { useRecipes } from '../../hooks/useRecipes';
import { useIngredients } from '../../hooks/useIngredients';

import { useToast } from '../Toast';
import useUndo from '../../hooks/useUndo';
import type { Recipe, RecipeIngredient } from '../../types';
import { RECIPE_CATEGORIES, UNITS } from '../../types';



function RecipesTab() {
  // Προσθήκη duplicateRecipe, scaleRecipe από το useRecipes
  const { recipes, loading, error, createRecipe, updateRecipe, deleteRecipe, refresh } = useRecipes();
  const { ingredients } = useIngredients();
  // const { settings } = useSettings();
  const { showToast, showConfirm } = useToast();
  const { recordUpdate } = useUndo();

  // DEBUG: Βήμα 2 - Έλεγχος αν υπάρχει showConfirm
  console.log('showConfirm available:', typeof showConfirm);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [scaleModal, setScaleModal] = useState<{ recipeId: number; recipeName: string; currentServings: number } | null>(null);
  const [newServings, setNewServings] = useState<number>(1);

  const [formData, setFormData] = useState<Partial<Recipe>>({
    name: '',
    category: 'Άλλο',
    servings: 1,
    prep_time_minutes: 0,
    notes: '',
    ingredients: [],
  });

  const [tempIngredient, setTempIngredient] = useState({
    ingredient_id: 0,
    quantity: 0,
    unit: 'g',
  });

  // DEBUG: Βήμα 1 - Custom handleDeleteClick με logs
  const handleDeleteClick = (recipe: Recipe) => {
    if (!recipe.id) return;
    console.log('Delete clicked for:', recipe.id, recipe.name);
    showConfirm(
      `Διαγραφή "${recipe.name}";`,
      () => {
        console.log('Confirm clicked, deleting:', recipe.id);
        deleteRecipe(recipe.id!);
      },
      () => {
        console.log('Cancel clicked');
      }
    );
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = searchQuery === '' || 
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(ri => 
          ri.ingredient_name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesCategory = filterCategory === '' || recipe.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [recipes, searchQuery, filterCategory]);

  // Move useVirtualScrolling to top level (not inside render)
  const { shouldVirtualize } = useVirtualScrolling(filteredRecipes.length);

  const {
    currentPageData: paginatedRecipes,
    currentPage,
    totalPages,
    pageSize,
    pageSizeOptions,
    rangeDisplay,
    isFirstPage,
    isLastPage,
    goToPage,
    setPageSize,
  } = usePagination(filteredRecipes, {
    initialPageSize: 12,
    pageSizeOptions: [6, 12, 24, 48],
  });

  const categories = [...new Set(recipes.map(r => r.category))].sort();

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Άλλο',
      servings: 1,
      prep_time_minutes: 0,
      notes: '',
      ingredients: [],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (recipe: Recipe) => {
    setFormData({
      id: recipe.id,
      name: recipe.name,
      category: recipe.category,
      servings: recipe.servings,
      prep_time_minutes: recipe.prep_time_minutes,
      notes: recipe.notes || '',
      ingredients: recipe.ingredients.map(ri => ({
        ...ri,
        ingredient_name: ri.ingredient_name || ingredients.find(i => i.id === ri.ingredient_id)?.name,
      })),
    });
    setEditingId(recipe.id!);
    setShowForm(true);
  };

  // ΔΙΟΡΘΩΣΗ: Προσθήκη της handleDuplicate που έλειπε
  const handleDuplicate = async (id: number) => {
    const original = recipes.find(r => r.id === id);
    if (!original) return;
    const newRecipe = {
      ...original,
      id: undefined,
      name: `${original.name} (Αντίγραφο)`
    };
    try {
      await createRecipe(newRecipe as Recipe);
      showToast('Η συνταγή αντιγράφηκε!', 'success');
    } catch (err) {
      showToast('Σφάλμα κατά την αντιγραφή', 'error');
    }
  };

  // ΔΙΟΡΘΩΣΗ: Προσθήκη της openScaleModal που έλειπε
  const openScaleModal = (recipe: Recipe) => {
    setScaleModal({
      recipeId: recipe.id!,
      recipeName: recipe.name,
      currentServings: recipe.servings
    });
    setNewServings(recipe.servings);
  };

  // ΔΙΟΡΘΩΣΗ: Υλοποίηση της handleScale
  const handleScale = async () => {
    if (!scaleModal) return;
    const recipe = recipes.find(r => r.id === scaleModal.recipeId);
    if (!recipe) return;
    const factor = newServings / recipe.servings;
    const scaledRecipe: Recipe = {
      ...recipe,
      servings: newServings,
      ingredients: recipe.ingredients.map(ri => ({
        ...ri,
        quantity: Number((ri.quantity * factor).toFixed(3))
      }))
    };
    try {
      await updateRecipe(scaledRecipe);
      showToast('Η κλιμάκωση ολοκληρώθηκε!', 'success');
      setScaleModal(null);
    } catch (err) {
      showToast('Σφάλμα κατά την κλιμάκωση', 'error');
    }
  };

  // Μοναδικές υλοποιήσεις handlers
  const handleAddIngredient = () => {
    if (tempIngredient.ingredient_id === 0 || tempIngredient.quantity <= 0) {
      alert('Επιλέξτε υλικό και ποσότητα');
      return;
    }
    const ing = ingredients.find(i => i.id === tempIngredient.ingredient_id);
    const newIngredient: RecipeIngredient = {
      ingredient_id: tempIngredient.ingredient_id,
      ingredient_name: ing?.name,
      quantity: tempIngredient.quantity,
      unit: tempIngredient.unit,
    };
    setFormData({
      ...formData,
      ingredients: [...(formData.ingredients || []), newIngredient],
    });
    setTempIngredient({ ingredient_id: 0, quantity: 0, unit: 'g' });
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = [...(formData.ingredients || [])];
    newIngredients.splice(index, 1);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ingredients || formData.ingredients.length === 0) {
      showToast('Προσθέστε τουλάχιστον ένα υλικό', 'warning');
      return;
    }
    // Validate all ingredient quantities are positive
    const invalidQty = formData.ingredients.find(ri => typeof ri.quantity !== 'number' || ri.quantity <= 0);
    if (invalidQty) {
      showToast('Όλες οι ποσότητες υλικών πρέπει να είναι θετικές.', 'warning');
      return;
    }
    try {
      if (editingId) {
        await updateRecipe(formData as Recipe);
        showToast('Η συνταγή ενημερώθηκε!', 'success');
        recordUpdate('recipe', editingId.toString(), JSON.stringify(formData));
      } else {
        await createRecipe(formData as Recipe);
        showToast('Η συνταγή προστέθηκε!', 'success');
      }
      resetForm();
    } catch (err) {
      showToast('Σφάλμα κατά την αποθήκευση', 'error');
    }
  };

  // (Unused) renderCostBreakdown function removed to fix TS error


  // (Διαγράφω τις διπλές δηλώσεις των handlers εδώ)

  return (
    <>
      <div className="toolbar">
        <button className="btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm ? '✕ Κλείσιμο' : '+ Νέα Συνταγή'}
        </button>
        <button className="btn-secondary" onClick={refresh}>🔄</button>
      </div>

      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Αναζήτηση συνταγής ή υλικού..."
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
          {filteredRecipes.length} / {recipes.length}
        </span>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <h3 className="form-title">{editingId ? '✏️ Επεξεργασία Συνταγής' : '➕ Νέα Συνταγή'}</h3>
          {/* ... Υπόλοιπη φόρμα παραμένει ίδια ... */}
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label htmlFor="recipe-name">Όνομα Συνταγής:</label>
              <input
                id="recipe-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="recipe-category">Κατηγορία:</label>
              <select
                id="recipe-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {RECIPE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="recipe-servings">Μερίδες:</label>
              <input
                id="recipe-servings"
                type="number"
                min="1"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="recipe-prep-time">Χρόνος (λεπτά):</label>
              <input
                id="recipe-prep-time"
                type="number"
                min="0"
                value={formData.prep_time_minutes}
                onChange={(e) => setFormData({ ...formData, prep_time_minutes: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="recipe-notes">Σημειώσεις:</label>
            <textarea
              id="recipe-notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>
          <div className="ingredients-section">
            <h3>Υλικά Συνταγής</h3>
            <div className="add-ingredient-row">
              <select
                value={tempIngredient.ingredient_id}
                onChange={(e) => setTempIngredient({ ...tempIngredient, ingredient_id: parseInt(e.target.value) })}
              >
                <option value={0}>-- Επιλέξτε υλικό --</option>
                {ingredients.map((ing) => (
                  <option key={ing.id} value={ing.id}>{ing.name} ({ing.price.toFixed(2)}€/{ing.unit})</option>
                ))}
              </select>
              <input
                type="number"
                step="0.001"
                min="0"
                placeholder="Ποσότητα"
                value={tempIngredient.quantity || ''}
                onChange={(e) => setTempIngredient({ ...tempIngredient, quantity: parseFloat(e.target.value) || 0 })}
              />
              <select
                value={tempIngredient.unit}
                onChange={(e) => setTempIngredient({ ...tempIngredient, unit: e.target.value })}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <button type="button" onClick={handleAddIngredient}>➕</button>
            </div>
            {formData.ingredients && formData.ingredients.length > 0 && (
              <ul className="ingredient-list">
                {formData.ingredients.map((ri, index) => (
                  <li key={index}>
                    <span>{ri.ingredient_name} - {ri.quantity} {ri.unit}</span>
                    <button type="button" className="btn-icon" onClick={() => handleRemoveIngredient(index)}>✕</button>
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

      {loading && <SkeletonCard count={6} />}
      {error && <p className="error">Σφάλμα: {error}</p>}

      {/* Render recipes grid or virtual grid */}
      {(() => {
        const columnCount = 3;
        const cardHeight = 320;
        const gap = 24;
        const renderItem = (recipe: Recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onEdit={handleEdit}
            onDelete={() => handleDeleteClick(recipe)}
            onDuplicate={handleDuplicate}
            onScale={openScaleModal}
          />
        );

        if (shouldVirtualize) {
          return (
            <VirtualGrid
              items={filteredRecipes}
              renderItem={renderItem}
              columnCount={columnCount}
              rowHeight={cardHeight}
              gap={gap}
              className="virtual-recipes-grid"
            />
          );
        }
        return (
          <div className="recipes-grid">
            {paginatedRecipes.map(renderItem)}
            {filteredRecipes.length === 0 && !loading && (
              <div className="no-data">Δεν υπάρχουν συνταγές.</div>
            )}
          </div>
        );
      })()}

      {filteredRecipes.length > 0 && (
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

      {scaleModal && (
        <div className="modal-overlay" onClick={() => setScaleModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>⚖️ Κλιμάκωση Συνταγής</h3>
            <p className="modal-subtitle">{scaleModal.recipeName}</p>
            <div className="scale-info">
              <span>Τρέχουσες μερίδες: <strong>{scaleModal.currentServings}</strong></span>
            </div>
            <div className="form-group">
              <label>Νέες μερίδες:</label>
              <input 
                type="number" 
                min="1" 
                value={newServings} 
                onChange={(e) => setNewServings(parseInt(e.target.value) || 1)}
                autoFocus
              />
            </div>
            {newServings !== scaleModal.currentServings && (
              <div className="scale-preview">
                <span>Συντελεστής: </span>
                <strong>{(newServings / scaleModal.currentServings).toFixed(2)}x</strong>
                <p className="scale-note">Οι ποσότητες υλικών θα {newServings > scaleModal.currentServings ? 'αυξηθούν' : 'μειωθούν'}</p>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setScaleModal(null)}>Ακύρωση</button>
              <button className="btn-primary" onClick={handleScale} disabled={newServings === scaleModal.currentServings}>
                ⚖️ Εφαρμογή
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(RecipesTab);