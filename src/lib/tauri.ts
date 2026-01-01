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
