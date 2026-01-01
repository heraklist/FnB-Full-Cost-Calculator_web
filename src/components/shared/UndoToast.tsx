import { memo, useState, useEffect } from 'react';
import { useUndoStore } from '../../stores/undoStore';
import useUndo from '../../hooks/useUndo';

const UndoToast = memo(function UndoToast() {
  const { pendingUndo, clearPending, undoTimeoutMs } = useUndoStore();
  const { executeUndo } = useUndo();
  const [timeLeft, setTimeLeft] = useState(0);
  const [isUndoing, setIsUndoing] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!pendingUndo) {
      setTimeLeft(0);
      return;
    }

    const endTime = pendingUndo.timestamp + undoTimeoutMs;
    
    const updateTimeLeft = () => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeLeft(Math.ceil(remaining / 1000));
      
      if (remaining <= 0) {
        clearPending();
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 100);

    return () => clearInterval(interval);
  }, [pendingUndo, undoTimeoutMs, clearPending]);

  // Handle undo click
  const handleUndo = async () => {
    if (isUndoing) return;
    
    setIsUndoing(true);
    const success = await executeUndo();
    setIsUndoing(false);
    
    if (success) {
      clearPending();
    }
  };

  // Handle dismiss
  const handleDismiss = () => {
    clearPending();
  };

  if (!pendingUndo || timeLeft <= 0) {
    return null;
  }

  return (
    <div className="undo-toast">
      <div className="undo-toast-content">
        <span className="undo-toast-icon">🗑️</span>
        <span className="undo-toast-message">{pendingUndo.description}</span>
      </div>
      
      <div className="undo-toast-actions">
        <button 
          className="undo-toast-btn"
          onClick={handleUndo}
          disabled={isUndoing}
        >
          {isUndoing ? '...' : `↩️ Αναίρεση (${timeLeft}s)`}
        </button>
        <button 
          className="undo-toast-dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
      
      {/* Progress bar */}
      <div 
        className="undo-toast-progress"
        style={{ 
          width: `${(timeLeft / (undoTimeoutMs / 1000)) * 100}%`,
        }}
      />
    </div>
  );
});

export default UndoToast;
