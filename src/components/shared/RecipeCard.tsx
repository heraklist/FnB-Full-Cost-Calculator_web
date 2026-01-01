import React from 'react';
import type { Recipe } from '../../types';

interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
  onScale: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, onEdit, onDelete, onDuplicate, onScale }: RecipeCardProps) {
  return (
    <div
      className="recipe-card card bg-surface rounded-lg shadow-md p-5 animate-fade-in transition-all hover:shadow-lg hover:-translate-y-1 duration-200"
      tabIndex={0}
      style={{ '--card-shadow': 'var(--shadow-md)' } as React.CSSProperties}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="m-0 text-lg font-semibold text-primary-900">{recipe.name}</h3>
        <span className="category-badge px-2 py-1 rounded text-xs font-bold bg-primary-100 text-primary-700">
          {recipe.category}
        </span>
      </div>
      <div className="flex gap-4 text-xs text-muted-700 mb-2">
        <span>🍽️ {recipe.servings} μερίδες</span>
        <span>⏱️ {recipe.prep_time_minutes} λεπτά</span>
      </div>
      <div className="mb-2">
        <strong>Υλικά:</strong>
        <ul className="list-disc list-inside text-sm mt-1">
          {(recipe.ingredients || []).slice(0, 4).map((ri, i) => (
            <li key={i}>{ri.ingredient_name} - {ri.quantity} {ri.unit}</li>
          ))}
          {(recipe.ingredients || []).length > 4 && (
            <li className="text-xs text-muted-500">+{(recipe.ingredients || []).length - 4} ακόμα...</li>
          )}
        </ul>
      </div>
      {/* Costs/Breakdown placeholder - can be extended */}
      <div className="mb-2">
        {/* You can render cost breakdown here if needed */}
      </div>
      <div className="flex gap-2 mt-2 pt-2 border-t border-t-divider">
        <button className="btn-icon" onClick={() => onScale(recipe)} title="Κλιμάκωση" aria-label="Κλιμάκωση">⚖️</button>
        <button className="btn-icon" onClick={() => onDuplicate(recipe.id!)} title="Αντιγραφή" aria-label="Αντιγραφή">📋</button>
        <button className="btn-secondary" onClick={() => onEdit(recipe)} aria-label="Επεξεργασία">✏️ Επεξεργασία</button>
        <button className="btn-danger" onClick={() => onDelete(recipe.id!)} aria-label="Διαγραφή">🗑️</button>
      </div>
    </div>
  );
}
