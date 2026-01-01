import { useCallback } from 'react';
import { useUndoStore, type EntityType } from '../stores/undoStore';
import { useIngredients } from './useIngredients';
import { useRecipes } from './useRecipes';
import { useEvents } from './useEvents';

export function useUndo() {
  const { 
    pushAction, 
    undo: undoFromStore, 
    redo: redoFromStore,
    pendingUndo,
    clearPending,
    undoStack,
    redoStack,
  } = useUndoStore();
  
  const { createIngredient, updateIngredient, deleteIngredient } = useIngredients();
  const { createRecipe, updateRecipe, deleteRecipe } = useRecipes();
  const { createEvent, updateEvent, deleteEvent } = useEvents();

  // Record a delete action (saves the deleted item for potential restore)
  const recordDelete = useCallback((
    entity: EntityType,
    data: any,
    name: string
  ) => {
    const entityLabels = {
      ingredient: 'υλικό',
      recipe: 'συνταγή',
      event: 'event',
    };
    
    pushAction({
      type: 'delete',
      entity,
      data,
      description: `Διαγραφή ${entityLabels[entity]} "${name}"`,
    });
  }, [pushAction]);

  // Record an update action (saves the previous state)
  const recordUpdate = useCallback((
    entity: EntityType,
    previousData: any,
    name: string
  ) => {
    const entityLabels = {
      ingredient: 'υλικό',
      recipe: 'συνταγή',
      event: 'event',
    };
    
    pushAction({
      type: 'update',
      entity,
      data: previousData,
      description: `Τροποποίηση ${entityLabels[entity]} "${name}"`,
    });
  }, [pushAction]);

  // Record a create action
  const recordCreate = useCallback((
    entity: EntityType,
    data: any,
    name: string
  ) => {
    const entityLabels = {
      ingredient: 'υλικό',
      recipe: 'συνταγή',
      event: 'event',
    };
    
    pushAction({
      type: 'create',
      entity,
      data,
      description: `Δημιουργία ${entityLabels[entity]} "${name}"`,
    });
  }, [pushAction]);

  // Execute undo
  const executeUndo = useCallback(async (): Promise<boolean> => {
    const action = undoFromStore();
    if (!action) return false;

    try {
      switch (action.type) {
        case 'delete':
          // Restore deleted item
          switch (action.entity) {
            case 'ingredient':
              await createIngredient(action.data);
              break;
            case 'recipe':
              await createRecipe(action.data);
              break;
            case 'event':
              await createEvent(action.data);
              break;
          }
          break;
          
        case 'update':
          // Restore previous state
          switch (action.entity) {
            case 'ingredient':
              await updateIngredient(action.data);
              break;
            case 'recipe':
              await updateRecipe(action.data);
              break;
            case 'event':
              await updateEvent(action.data);
              break;
          }
          break;
          
        case 'create':
          // Delete the created item
          switch (action.entity) {
            case 'ingredient':
              await deleteIngredient(action.data.id);
              break;
            case 'recipe':
              await deleteRecipe(action.data.id);
              break;
            case 'event':
              await deleteEvent(action.data.id);
              break;
          }
          break;
      }
      
      return true;
    } catch (error) {
      console.error('Undo failed:', error);
      return false;
    }
  }, [undoFromStore, createIngredient, createRecipe, createEvent, 
      updateIngredient, updateRecipe, updateEvent,
      deleteIngredient, deleteRecipe, deleteEvent]);

  // Execute redo (similar logic but reversed)
  const executeRedo = useCallback(async (): Promise<boolean> => {
    const action = redoFromStore();
    if (!action) return false;
    
    // Redo is the opposite of undo
    try {
      switch (action.type) {
        case 'delete':
          // Delete again
          switch (action.entity) {
            case 'ingredient':
              await deleteIngredient(action.data.id);
              break;
            case 'recipe':
              await deleteRecipe(action.data.id);
              break;
            case 'event':
              await deleteEvent(action.data.id);
              break;
          }
          break;
          
        case 'update':
          // Redo the update with new state - not fully supported yet
          // For now, just move it back to undo stack
          return false;
          
        case 'create':
          // Create again
          switch (action.entity) {
            case 'ingredient':
              await createIngredient(action.data);
              break;
            case 'recipe':
              await createRecipe(action.data);
              break;
            case 'event':
              await createEvent(action.data);
              break;
          }
          break;
      }
      
      return true;
    } catch (error) {
      console.error('Redo failed:', error);
      return false;
    }
  }, [redoFromStore, deleteIngredient, deleteRecipe, deleteEvent, 
      createIngredient, createRecipe, createEvent]);

  return {
    // Recording actions
    recordDelete,
    recordUpdate,
    recordCreate,
    
    // Executing undo/redo
    executeUndo,
    executeRedo,
    
    // State
    pendingUndo,
    clearPending,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    undoCount: undoStack.length,
    redoCount: redoStack.length,
  };
}

export default useUndo;
