import { useState, useEffect } from 'react';
import {
  getEncryptionStatus,
  exportEncryptionKey,
  importEncryptionKey,
} from '../lib/tauri';
import { useToast } from './Toast';
import type { EncryptionStatus } from '../types';

export function EncryptionSettings() {
  const { showToast } = useToast();
  const [status, setStatus] = useState<EncryptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [exportedKey, setExportedKey] = useState<string | null>(null);
  const [importKey, setImportKey] = useState('');
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const s = await getEncryptionStatus();
      setStatus(s);
    } catch (err) {
      showToast(`Σφάλμα: ${err}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportKey = async () => {
    if (!window.confirm('ΠΡΟΣΟΧΗ: Το κλειδί κρυπτογράφησης θα εμφανιστεί μία φορά. Αποθηκεύστε το σε ασφαλές μέρος! Χωρίς αυτό δεν μπορείτε να ανακτήσετε τα δεδομένα σας.')) return;
    try {
      const key = await exportEncryptionKey();
      setExportedKey(key);
      setShowKey(true);
    } catch (err) {
      showToast(`Σφάλμα: ${err}`, 'error');
    }
  };

  const handleImportKey = async () => {
    if (!importKey.trim()) {
      showToast('Εισάγετε το κλειδί', 'warning');
      return;
    }
    try {
      await importEncryptionKey(importKey.trim());
      showToast('Το κλειδί εισήχθη επιτυχώς', 'success');
      setImportKey('');
      setShowImport(false);
      loadStatus();
    } catch (err) {
      showToast(`Σφάλμα: ${err}`, 'error');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Αντιγράφηκε!', 'success');
    } catch {
      showToast('Αποτυχία αντιγραφής', 'error');
    }
  };

  if (loading) {
    return <div className="loading">Φόρτωση...</div>;
  }

  return (
    <div className="encryption-settings">
      <h3>🔐 Κρυπτογράφηση Βάσης Δεδομένων</h3>
      <div className="encryption-status">
        <div className="status-item">
          <span>Κατάσταση:</span>
          <span className={status?.is_encrypted ? 'status-encrypted' : 'status-unencrypted'}>
            {status?.is_encrypted ? '🔒 Κρυπτογραφημένη' : '🔓 Μη κρυπτογραφημένη'}
          </span>
        </div>
        <div className="status-item">
          <span>Κλειδί:</span>
          <span>{status?.key_exists ? '✅ Υπάρχει' : '❌ Δεν υπάρχει'}</span>
        </div>
      </div>
      <div className="encryption-actions">
        <button className="btn-secondary" onClick={handleExportKey}>
          📤 Εξαγωγή Κλειδιού Backup
        </button>
        <button className="btn-secondary" onClick={() => setShowImport(!showImport)}>
          📥 Εισαγωγή Κλειδιού
        </button>
      </div>
      {showKey && exportedKey && (
        <div className="key-display">
          <h4>⚠️ Κλειδί Κρυπτογράφησης</h4>
          <p className="warning">
            Αποθηκεύστε αυτό το κλειδί σε ασφαλές μέρος! Χωρίς αυτό δεν μπορείτε να ανακτήσετε τα δεδομένα σας.
          </p>
          <div className="key-value">
            <code>{exportedKey}</code>
            <button className="btn-icon" onClick={() => copyToClipboard(exportedKey)} title="Αντιγραφή">📋</button>
          </div>
          <button className="btn-secondary" onClick={() => setShowKey(false)}>
            Κλείσιμο
          </button>
        </div>
      )}
      {showImport && (
        <div className="key-import">
          <h4>Εισαγωγή Κλειδιού Ανάκτησης</h4>
          <input
            type="text"
            placeholder="Επικολλήστε το κλειδί εδώ..."
            value={importKey}
            onChange={(e) => setImportKey(e.target.value)}
            className="key-input"
          />
          <div className="import-actions">
            <button className="btn-primary" onClick={handleImportKey}>
              Εισαγωγή
            </button>
            <button className="btn-secondary" onClick={() => setShowImport(false)}>
              Ακύρωση
            </button>
          </div>
        </div>
      )}
      <div className="encryption-info">
        <h4>ℹ️ Πληροφορίες</h4>
        <ul>
          <li>Η βάση δεδομένων κρυπτογραφείται με AES-256</li>
          <li>Το κλειδί αποθηκεύεται τοπικά στον υπολογιστή σας</li>
          <li>Κρατήστε backup του κλειδιού σε ασφαλές μέρος</li>
          <li>Χωρίς το κλειδί, τα δεδομένα δεν ανακτώνται</li>
        </ul>
      </div>
    </div>
  );
}
