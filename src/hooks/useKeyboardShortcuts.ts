import { useEffect } from 'react';
import useUndo from './useUndo';

export function useKeyboardShortcuts() {
  const { executeUndo, executeRedo, canUndo, canRedo } = useUndo();

  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl+Z or Cmd+Z for Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        
        if (canUndo) {
          await executeUndo();
        }
      }

      // Ctrl+Shift+Z or Cmd+Shift+Z for Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        
        if (canRedo) {
          await executeRedo();
        }
      }

      // Ctrl+Y for Redo (Windows style)
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        
        if (canRedo) {
          await executeRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executeUndo, executeRedo, canUndo, canRedo]);
}

export default useKeyboardShortcuts;
