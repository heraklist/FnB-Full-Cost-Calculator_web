import { useState, useEffect, useCallback } from 'react';
import type { Ingredient } from '../types';
import * as api from '../lib/api';

interface UseIngredientsReturn {
  ingredients: Ingredient[];
  loading: boolean;
  error: string | null;
  createIngredient: (ingredient: Omit<Ingredient, 'id'>) => Promise<number>;
  updateIngredient: (ingredient: Ingredient) => Promise<void>;
  deleteIngredient: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useIngredients(enabled: boolean = true): UseIngredientsReturn {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredients = useCallback(async () => {
    if (!enabled) {
      setIngredients([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getIngredients();
      setIngredients(data);
    } catch (err) {
      console.error('Failed to fetch ingredients:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch ingredients');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const createIngredient = useCallback(async (ingredient: Omit<Ingredient, 'id'>) => {
    const id = await api.createIngredient(ingredient);
    await fetchIngredients();
    return id;
  }, [fetchIngredients]);

  const updateIngredient = useCallback(async (ingredient: Ingredient) => {
    if (!ingredient.id) throw new Error('Ingredient ID required');
    await api.updateIngredient(ingredient.id, ingredient);
    await fetchIngredients();
  }, [fetchIngredients]);

  const deleteIngredient = useCallback(async (id: number) => {
    await api.deleteIngredient(id);
    await fetchIngredients();
  }, [fetchIngredients]);

  return {
    ingredients,
    loading,
    error,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    refresh: fetchIngredients
  };
}
