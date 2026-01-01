
import type { Ingredient } from '../../types';

interface IngredientCardProps {
  ingredient: Ingredient;
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (id: number) => void;
}

export default function IngredientCard({ ingredient, onEdit, onDelete }: IngredientCardProps) {
  return (
    <div className="ingredient-item">
      <div className="ingredient-info">
        <div className="ingredient-name">{ingredient.name}</div>
        <div className="ingredient-details">
          <span className="ingredient-price">
            Τιμή: <strong>{ingredient.price.toFixed(2)} €</strong>
          </span>
          <span className="ingredient-unit">
            Μονάδα: <strong>{ingredient.unit}</strong>
          </span>
          <span className="ingredient-waste">
            Απώλεια: <strong>{ingredient.waste_percent}%</strong>
          </span>
          <span className="ingredient-supplier">
            Προμηθευτής: <strong>{ingredient.supplier || '-'}</strong>
          </span>
        </div>
      </div>
      <div className="ingredient-actions">
        <button className="btn-icon edit" onClick={() => onEdit(ingredient)} aria-label="Επεξεργασία">✏️</button>
        <button className="btn-icon delete" onClick={() => onDelete(ingredient.id!)} aria-label="Διαγραφή">🗑️</button>
      </div>
    </div>
  );
}
