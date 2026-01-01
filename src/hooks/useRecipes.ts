import { useState, useEffect, useCallback } from 'react';
import type { Recipe } from '../types';
import * as api from '../lib/api';

interface UseRecipesReturn {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  createRecipe: (recipe: Omit<Recipe, 'id'>) => Promise<number>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: number) => Promise<void>;
  duplicateRecipe: (id: number) => Promise<number>;
  refresh: () => Promise<void>;
}

export function useRecipes(enabled: boolean = true): UseRecipesReturn {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecipes = useCallback(async () => {
    if (!enabled) {
      setRecipes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getRecipes();
      setRecipes(data);
    } catch (err) {
      console.error('Failed to fetch recipes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const createRecipe = useCallback(async (recipe: Omit<Recipe, 'id'>) => {
    const id = await api.createRecipe(recipe);
    await fetchRecipes();
    return id;
  }, [fetchRecipes]);

  const updateRecipe = useCallback(async (recipe: Recipe) => {
    if (!recipe.id) throw new Error('Recipe ID required');
    await api.updateRecipe(recipe.id, recipe);
    await fetchRecipes();
  }, [fetchRecipes]);

  const deleteRecipe = useCallback(async (id: number) => {
    await api.deleteRecipe(id);
    await fetchRecipes();
  }, [fetchRecipes]);

  const duplicateRecipe = useCallback(async (id: number) => {
    const newId = await api.duplicateRecipe(id);
    await fetchRecipes();
    return newId;
  }, [fetchRecipes]);

  return {
    recipes,
    loading,
    error,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    duplicateRecipe,
    refresh: fetchRecipes
  };
}
