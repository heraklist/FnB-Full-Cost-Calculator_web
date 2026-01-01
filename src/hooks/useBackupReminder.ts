/**
 * Backup Reminder Hook - Phase 7
 * 
 * Shows a reminder to backup data if it's been too long since the last backup.
 */

import { useState, useEffect, useCallback } from 'react';
import { STORAGE_KEYS, UI_CONFIG } from '../lib/constants';

interface BackupReminderState {
  showReminder: boolean;
  daysSinceBackup: number;
  dismissReminder: () => void;
  recordBackup: () => void;
}

/**
 * Hook to manage backup reminders
 * Shows reminder after configured days without backup
 */
export function useBackupReminder(): BackupReminderState {
  const [showReminder, setShowReminder] = useState(false);
  const [daysSinceBackup, setDaysSinceBackup] = useState(0);

  // Check if reminder should be shown
  useEffect(() => {
    const checkBackupStatus = () => {
      const lastBackup = localStorage.getItem(STORAGE_KEYS.lastBackupDate);
      const dismissed = localStorage.getItem(STORAGE_KEYS.backupReminderDismissed);

      // If dismissed today, don't show
      if (dismissed) {
        const dismissedDate = new Date(dismissed);
        const today = new Date();
        if (
          dismissedDate.toDateString() === today.toDateString()
        ) {
          setShowReminder(false);
          return;
        }
      }

      // Calculate days since last backup
      if (lastBackup) {
        const lastDate = new Date(lastBackup);
        const today = new Date();
        const diffTime = today.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        setDaysSinceBackup(diffDays);
        setShowReminder(diffDays >= UI_CONFIG.backupReminderDays);
      } else {
        // No backup ever recorded - show reminder
        setDaysSinceBackup(-1); // -1 indicates never
        setShowReminder(true);
      }
    };

    checkBackupStatus();
  }, []);

  // Dismiss reminder for today
  const dismissReminder = useCallback(() => {
    localStorage.setItem(
      STORAGE_KEYS.backupReminderDismissed,
      new Date().toISOString()
    );
    setShowReminder(false);
  }, []);

  // Record that a backup was made
  const recordBackup = useCallback(() => {
    localStorage.setItem(
      STORAGE_KEYS.lastBackupDate,
      new Date().toISOString()
    );
    setShowReminder(false);
    setDaysSinceBackup(0);
  }, []);

  return {
    showReminder,
    daysSinceBackup,
    dismissReminder,
    recordBackup,
  };
}
