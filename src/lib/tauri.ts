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

export async function exportEncryptionKey(password: string): Promise<string> {
  console.log('Encryption not available in web version');
  return '';
}

export async function importEncryptionKey(key: string, password?: string): Promise<void> {
  console.log('Encryption not available in web version');
}

export async function getUsers(): Promise<any[]> {
  return [];
}

export async function updateUserRole(userId: string, role: string, action: string): Promise<void> {
  console.log('User management not available');
}

export async function checkSuperAdmin(): Promise<boolean> {
  return false;
}

export async function duplicateEvent(eventId: number): Promise<void> {
  console.log('Duplicate not available');
}

export async function exportEventPdf(quoteData: any): Promise<void> {
  console.log('PDF export not available');
}

export async function getPriceHistory(ingredientId: number): Promise<any[]> {
  return [];
}

export async function getPriceStats(ingredientId: number): Promise<any> {
  return {};
}

export async function saveBackupToFile(filePath: string): Promise<void> {
  console.log('Backup to file not available');
}

export async function loadBackupFromFile(filePath: string): Promise<void> {
  console.log('Load backup not available');
}

export async function loadFnbRecipeManagerJson(filePath: string): Promise<any> {
  console.log('Import not available');
  return null;
}

export async function loadFnbRecipeManagerCsv(filePath: string): Promise<any> {
  console.log('Import not available');
  return null;
}

export async function loadSimpleCsv(filePath: string): Promise<any> {
  console.log('Import not available');
  return null;
}
