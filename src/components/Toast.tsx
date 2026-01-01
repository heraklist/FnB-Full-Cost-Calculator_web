import { useState, createContext, useContext, useCallback, useRef } from 'react';
import { UI_CONFIG } from '../lib/constants';

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'undo';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  onUndo?: () => void;
  undoLabel?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showConfirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void;
  showUndoToast: (message: string, onUndo: () => void, undoLabel?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

interface ConfirmState {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after configured duration
    const timeout = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      timeoutRefs.current.delete(id);
    }, UI_CONFIG.toastDuration);
    
    timeoutRefs.current.set(id, timeout);
  }, []);

  const showUndoToast = useCallback((message: string, onUndo: () => void, undoLabel = 'Αναίρεση') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type: 'undo', onUndo, undoLabel }]);
    
    // Longer duration for undo toasts
    const timeout = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      timeoutRefs.current.delete(id);
    }, UI_CONFIG.toastUndoDuration);
    
    timeoutRefs.current.set(id, timeout);
  }, []);

  const showConfirm = useCallback((message: string, onConfirm: () => void, onCancel?: () => void) => {
    setConfirm({ message, onConfirm, onCancel });
  }, []);

  const handleConfirm = () => {
    confirm?.onConfirm();
    setConfirm(null);
  };

  const handleCancel = () => {
    confirm?.onCancel?.();
    setConfirm(null);
  };

  const removeToast = (id: string) => {
    // Clear timeout if exists
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleUndo = (toast: Toast) => {
    if (toast.onUndo) {
      toast.onUndo();
    }
    removeToast(toast.id);
  };

  return (
    <ToastContext.Provider value={{ showToast, showConfirm, showUndoToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="toast-container" aria-live="polite">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} animate-slide-in-right bg-surface shadow-md rounded-lg flex items-center gap-3 px-4 py-3 mb-3 transition-all`}
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <span className="toast-icon">
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '❌'}
              {toast.type === 'warning' && '⚠️'}
              {toast.type === 'info' && 'ℹ️'}
              {toast.type === 'undo' && '🗑️'}
            </span>
            <span className="toast-message flex-1">{toast.message}</span>
            {toast.type === 'undo' && toast.onUndo && (
              <button 
                className="toast-undo-btn btn-secondary"
                onClick={() => handleUndo(toast)}
              >
                ↩️ {toast.undoLabel}
              </button>
            )}
            <button 
              className="toast-close-btn btn-icon"
              onClick={() => removeToast(toast.id)}
              aria-label="Κλείσιμο"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Confirm Dialog - Proper Modal */}
      {confirm && (
        <div className="confirm-dialog-overlay">
          <div className="confirm-dialog">
            <div className="confirm-dialog-icon">⚠️</div>
            <h3>{confirm.message}</h3>
            <p>Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.</p>
            <div className="confirm-dialog-actions">
              <button className="btn-cancel" onClick={handleCancel}>Ακύρωση</button>
              <button className="btn-delete" onClick={handleConfirm}>Διαγραφή</button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
