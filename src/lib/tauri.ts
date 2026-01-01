// Tauri module - kept for backward compatibility
// In Supabase version, we use Supabase storage instead
// This is a placeholder for any Tauri-specific functionality

export const tauriAvailable = false;

export async function backupData(): Promise<void> {
  console.log('Backup functionality not available in web version');
}

export async function restoreData(): Promise<void> {
  console.log('Restore functionality not available in web version');
}

export async function exportData(): Promise<string> {
  console.log('Export functionality not available in web version');
  return '';
}

export async function getEncryptionStatus(): Promise<any> {
  return { enabled: false };
}

export async function exportEncryptionKey(): Promise<void> {
  console.log('Encryption not available in web version');
}

export async function importEncryptionKey(): Promise<void> {
  console.log('Encryption not available in web version');
}

export async function getUsers(): Promise<any[]> {
  return [];
}

export async function updateUserRole(): Promise<void> {
  console.log('User management not available');
}

export async function checkSuperAdmin(): Promise<boolean> {
  return false;
}

export async function duplicateEvent(): Promise<void> {
  console.log('Duplicate not available');
}

export async function exportEventPdf(): Promise<void> {
  console.log('PDF export not available');
}

export async function getPriceHistory(): Promise<any[]> {
  return [];
}

export async function getPriceStats(): Promise<any> {
  return {};
}

export async function saveBackupToFile(): Promise<void> {
  console.log('Backup to file not available');
}

export async function loadBackupFromFile(): Promise<void> {
  console.log('Load backup not available');
}

export async function loadFnbRecipeManagerJson(): Promise<void> {
  console.log('Import not available');
}

export async function loadFnbRecipeManagerCsv(): Promise<void> {
  console.log('Import not available');
}

export async function loadSimpleCsv(): Promise<void> {
  console.log('Import not available');
}
