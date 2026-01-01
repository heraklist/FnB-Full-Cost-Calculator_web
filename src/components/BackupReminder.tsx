/**
 * Backup Reminder Component - Phase 7
 * 
 * Displays a reminder banner when backup is overdue.
 */

import { memo } from 'react';
import { useBackupReminder } from '../hooks/useBackupReminder';

interface BackupReminderProps {
  onBackupClick?: () => void;
}

function BackupReminderBanner({ onBackupClick }: BackupReminderProps) {
  const { showReminder, daysSinceBackup, dismissReminder, recordBackup } = useBackupReminder();

  if (!showReminder) return null;

  const handleBackupClick = () => {
    if (onBackupClick) {
      onBackupClick();
    }
    recordBackup();
  };

  const getMessage = () => {
    if (daysSinceBackup === -1) {
      return 'Δεν έχετε κάνει ποτέ backup των δεδομένων σας.';
    }
    return `Έχουν περάσει ${daysSinceBackup} μέρες από το τελευταίο backup.`;
  };

  return (
    <div className="backup-reminder">
      <div className="backup-reminder-content">
        <span className="backup-reminder-icon">💾</span>
        <span className="backup-reminder-message">
          {getMessage()} Προτείνουμε να κάνετε backup!
        </span>
      </div>
      <div className="backup-reminder-actions">
        <button 
          className="backup-reminder-btn backup"
          onClick={handleBackupClick}
        >
          📥 Backup τώρα
        </button>
        <button 
          className="backup-reminder-btn dismiss"
          onClick={dismissReminder}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

export default memo(BackupReminderBanner);
