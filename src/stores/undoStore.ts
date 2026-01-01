import { create } from 'zustand';

// Types for undo actions
type ActionType = 'create' | 'update' | 'delete';
type EntityType = 'ingredient' | 'recipe' | 'event';

interface UndoAction {
  id: string;
  type: ActionType;
  entity: EntityType;
  data: any; // The data needed to undo (e.g., deleted item, previous state)
  description: string; // Human readable: "Διαγραφή συνταγής 'Μουσακάς'"
  timestamp: number;
  undone: boolean;
}

interface UndoState {
  // History stacks
  undoStack: UndoAction[];
  redoStack: UndoAction[];
  
  // Current undo toast
  pendingUndo: UndoAction | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
  
  // Settings
  maxHistorySize: number;
  undoTimeoutMs: number;
  
  // Actions
  pushAction: (action: Omit<UndoAction, 'id' | 'timestamp' | 'undone'>) => void;
  undo: () => UndoAction | null;
  redo: () => UndoAction | null;
  clearPending: () => void;
  clearHistory: () => void;
  
  // Getters
  canUndo: boolean;
  canRedo: boolean;
}

export const useUndoStore = create<UndoState>((set, get) => ({
  undoStack: [],
  redoStack: [],
  pendingUndo: null,
  timeoutId: null,
  maxHistorySize: 50,
  undoTimeoutMs: 10000, // 10 seconds to undo
  
  get canUndo() {
    return get().undoStack.length > 0;
  },
  
  get canRedo() {
    return get().redoStack.length > 0;
  },
  
  pushAction: (action) => {
    const newAction: UndoAction = {
      ...action,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      undone: false,
    };
    
    set((state) => {
      // Clear any existing timeout
      if (state.timeoutId) {
        clearTimeout(state.timeoutId);
      }
      
      // Add to undo stack, clear redo stack
      const newUndoStack = [newAction, ...state.undoStack].slice(0, state.maxHistorySize);
      
      // Set timeout to clear pending undo
      const timeoutId = setTimeout(() => {
        set({ pendingUndo: null, timeoutId: null });
      }, state.undoTimeoutMs);
      
      return {
        undoStack: newUndoStack,
        redoStack: [], // Clear redo on new action
        pendingUndo: newAction,
        timeoutId,
      };
    });
  },
  
  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return null;
    
    const [action, ...rest] = state.undoStack;
    
    // Clear timeout
    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
    }
    
    set({
      undoStack: rest,
      redoStack: [{ ...action, undone: true }, ...state.redoStack],
      pendingUndo: null,
      timeoutId: null,
    });
    
    return action;
  },
  
  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return null;
    
    const [action, ...rest] = state.redoStack;
    
    set({
      redoStack: rest,
      undoStack: [{ ...action, undone: false }, ...state.undoStack],
    });
    
    return action;
  },
  
  clearPending: () => {
    const state = get();
    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
    }
    set({ pendingUndo: null, timeoutId: null });
  },
  
  clearHistory: () => {
    const state = get();
    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
    }
    set({
      undoStack: [],
      redoStack: [],
      pendingUndo: null,
      timeoutId: null,
    });
  },
}));

export type { UndoAction, ActionType, EntityType };
