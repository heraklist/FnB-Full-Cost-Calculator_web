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

export async function exportEncryptionKey(_password?: string): Promise<string> {
  console.log('Encryption not available in web version');
  return '';
}

export async function importEncryptionKey(_key?: string, _password?: string): Promise<void> {
  console.log('Encryption not available in web version');
}

export async function getUsers(): Promise<any[]> {
  return [];
}

export async function updateUserRole(_userId: string, _role: string, _action: string): Promise<void> {
  console.log('User management not available');
}

export async function checkSuperAdmin(): Promise<boolean> {
  return false;
}

export async function duplicateEvent(_eventId: number): Promise<void> {
  console.log('Duplicate not available');
}

export async function exportEventPdf(_quoteData: any): Promise<void> {
  console.log('PDF export not available');
}

export async function getPriceHistory(_ingredientId: number): Promise<any[]> {
  return [];
}

export async function getPriceStats(_ingredientId: number): Promise<any> {
  return {};
}

export async function saveBackupToFile(_filePath?: string): Promise<string> {
  console.log('Backup to file not available');
  return 'Web version - backup not available';
}

export async function loadBackupFromFile(_filePath?: string): Promise<string> {
  console.log('Load backup not available');
  return 'Web version - restore not available';
}

export async function loadFnbRecipeManagerJson(_filePath?: string): Promise<any> {
  console.log('Import not available');
  return null;
}

export async function loadFnbRecipeManagerCsv(_filePath?: string): Promise<any> {
  console.log('Import not available');
  return null;
}

export async function loadSimpleCsv(_filePath?: string): Promise<any> {
  console.log('Import not available');
  return null;
}
