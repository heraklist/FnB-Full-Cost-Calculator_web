import { useState, useEffect, memo } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useIngredients } from '../../hooks/useIngredients';
import { useRecipes } from '../../hooks/useRecipes';
import { useToast } from '../Toast';
import {
  parseFixedCosts,
  stringifyFixedCosts,
  calculateMonthlyFixedCosts,
  generateId,
} from '../../lib/fixedCosts';
import type { Settings, FixedCost } from '../../types';
import { FIXED_COST_CATEGORIES } from '../../types';
import { EncryptionSettings } from '../EncryptionSettings';

function SettingsTab() {
  const { settings, loading, error, updateSettings, refresh: refreshSettings } = useSettings();
  const { refresh: refreshIngredients } = useIngredients();
  const { refresh: refreshRecipes } = useRecipes();
  const { showToast } = useToast();
  const [formData, setFormData] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  
  // Fixed costs state
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>([]);
  const [newCost, setNewCost] = useState({ name: '', category: '', amount: 0, frequency: 'monthly' as 'monthly' | 'yearly' });

  // Sync formData with settings and parse fixed costs
  useEffect(() => {
    if (settings && !formData) {
      setFormData(settings);
      if (settings.fixed_costs_json) {
        setFixedCosts(parseFixedCosts(settings.fixed_costs_json));
      }
    }
  }, [settings, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    try {
      setSaving(true);
      const dataToSave = {
        ...formData,
        fixed_costs_json: stringifyFixedCosts(fixedCosts)
      };
      await updateSettings(dataToSave);
      showToast('Οι ρυθμίσεις αποθηκεύτηκαν', 'success');
    } catch (err) {
      showToast(`Σφάλμα: ${err}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFixedCost = () => {
    if (!newCost.name || newCost.name.trim() === '') {
      alert('Συμπληρώστε το όνομα του εξόδου');
      return;
    }
    if (!newCost.amount || newCost.amount <= 0) {
      alert('Συμπληρώστε το ποσό (> 0)');
      return;
    }

    const costToAdd: FixedCost = {
      id: generateId(),
      name: newCost.name.trim(),
      category: newCost.category || 'Λοιπά',
      amount: newCost.amount,
      frequency: newCost.frequency || 'monthly',
    };

    setFixedCosts([...fixedCosts, costToAdd]);
    setNewCost({ name: '', category: 'Λοιπά', amount: 0, frequency: 'monthly' });
  };

  const handleRemoveFixedCost = (id: string) => {
    setFixedCosts(fixedCosts.filter(cost => cost.id !== id));
  };

  const refreshAll = () => { refreshIngredients(); refreshRecipes(); refreshSettings(); setFormData(null); };

  const handleExportBackup = async () => {
    try {
      const { saveBackupToFile } = await import('../../lib/tauri');
      const result = await saveBackupToFile();
      setImportResult(result);
      setTimeout(() => setImportResult(null), 5000);
    } catch (err) { if (String(err) !== 'Ακυρώθηκε') alert(`Σφάλμα: ${err}`); }
  };

  const handleImportBackup = async () => {
    try {
      const { loadBackupFromFile } = await import('../../lib/tauri');
      const result = await loadBackupFromFile();
      setImportResult(result);
      refreshAll();
      setTimeout(() => setImportResult(null), 5000);
    } catch (err) { if (String(err) !== 'Ακυρώθηκε') alert(`Σφάλμα: ${err}`); }
  };

  const handleImportFnbJson = async () => {
    try {
      const { loadFnbRecipeManagerJson } = await import('../../lib/tauri');
      const result = await loadFnbRecipeManagerJson();
      setImportResult(result);
      refreshAll();
      setTimeout(() => setImportResult(null), 5000);
    } catch (err) { if (String(err) !== 'Ακυρώθηκε') alert(`Σφάλμα: ${err}`); }
  };

  const handleImportFnbCsv = async () => {
    try {
      const { loadFnbRecipeManagerCsv } = await import('../../lib/tauri');
      const result = await loadFnbRecipeManagerCsv();
      setImportResult(result);
      refreshAll();
      setTimeout(() => setImportResult(null), 5000);
    } catch (err) { if (String(err) !== 'Ακυρώθηκε') alert(`Σφάλμα: ${err}`); }
  };

  const handleImportSimpleCsv = async () => {
    try {
      const { loadSimpleCsv } = await import('../../lib/tauri');
      const result = await loadSimpleCsv();
      setImportResult(result);
      refreshIngredients();
      setTimeout(() => setImportResult(null), 5000);
    } catch (err) { if (String(err) !== 'Ακυρώθηκε') alert(`Σφάλμα: ${err}`); }
  };

  if (loading) return <p className="loading">Φόρτωση ρυθμίσεων...</p>;
  if (error) return <p className="error">Σφάλμα: {error}</p>;
  if (!formData) return null;

  const currentMode = formData.mode;
  const monthlyFixedTotal = calculateMonthlyFixedCosts(fixedCosts);

  return (
    <div className="settings-layout">
      {/* LEFT COLUMN */}
      <div className="settings-panel">
        {/* MODE SELECTOR */}
        <div className="card mode-selector-card">
          <h3 className="card-title">🎯 Τρόπος Λειτουργίας</h3>
          <div className="mode-buttons">
            <button
              type="button"
              className={`mode-btn ${currentMode === 'restaurant' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, mode: 'restaurant' })}
            >
              <span className="mode-icon">🍽️</span>
              <span className="mode-name">Restaurant</span>
              <span className="mode-desc">Σταθερή κουζίνα</span>
            </button>
            <button
              type="button"
              className={`mode-btn ${currentMode === 'catering' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, mode: 'catering' })}
            >
              <span className="mode-icon">🎪</span>
              <span className="mode-name">Catering</span>
              <span className="mode-desc">Events & Εκδηλώσεις</span>
            </button>
            <button
              type="button"
              className={`mode-btn ${currentMode === 'private_chef' ? 'active' : ''}`}
              onClick={() => setFormData({ ...formData, mode: 'private_chef' })}
            >
              <span className="mode-icon">👨‍🍳</span>
              <span className="mode-name">Private Chef</span>
              <span className="mode-desc">Ιδιωτικός σεφ</span>
            </button>
          </div>
        </div>

        {/* MODE-SPECIFIC SETTINGS */}
        <form onSubmit={handleSubmit} className="card">
          <h3 className="card-title">
            {currentMode === 'restaurant' && '🍽️ Ρυθμίσεις Restaurant'}
            {currentMode === 'catering' && '🎪 Ρυθμίσεις Catering'}
            {currentMode === 'private_chef' && '👨‍🍳 Ρυθμίσεις Private Chef'}
          </h3>

          {/* RESTAURANT MODE */}
          {currentMode === 'restaurant' && (
            <>
              <div className="setting-group">
                <h4>💼 Εργασία</h4>
                <div className="form-group">
                  <label>Κόστος εργασίας (€/ώρα):</label>
                  <input type="number" step="0.5" min="0" value={formData.labour_cost_per_hour} onChange={(e) => setFormData({ ...formData, labour_cost_per_hour: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="setting-group">
                <h4>🏢 Overheads</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Μηνιαία έξοδα (€):</label>
                    <input type="number" step="10" min="0" value={formData.overhead_monthly} onChange={(e) => setFormData({ ...formData, overhead_monthly: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="form-group">
                    <label>Μερίδες/μήνα:</label>
                    <input type="number" min="1" value={formData.portions_per_month} onChange={(e) => setFormData({ ...formData, portions_per_month: parseInt(e.target.value) || 1 })} />
                  </div>
                </div>
                <p className="calc-result">= {((formData.overhead_monthly + monthlyFixedTotal) / formData.portions_per_month).toFixed(2)} €/μερίδα</p>
              </div>

              <div className="setting-group">
                <h4>📦 Συσκευασία</h4>
                <div className="form-group">
                  <label>Κόστος (€/μερίδα):</label>
                  <input type="number" step="0.05" min="0" value={formData.packaging_per_portion} onChange={(e) => setFormData({ ...formData, packaging_per_portion: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="setting-group">
                <h4>💰 Τιμολόγηση</h4>
                <div className="form-group">
                  <label>Target Food Cost (%):</label>
                  <input type="number" step="1" min="1" max="100" value={formData.target_food_cost_percent} onChange={(e) => setFormData({ ...formData, target_food_cost_percent: parseFloat(e.target.value) || 30 })} />
                </div>
              </div>
            </>
          )}

          {/* CATERING MODE */}
          {currentMode === 'catering' && (
            <>
              <div className="setting-group">
                <h4>👥 Προσωπικό</h4>
                
                {/* Rate type selector */}
                <div className="rate-type-selector">
                  <label>
                    <input
                      type="radio"
                      name="staff_rate_type"
                      value="hourly"
                      checked={formData.staff_rate_type === 'hourly'}
                      onChange={(e) => setFormData({ ...formData, staff_rate_type: e.target.value as 'hourly' | 'daily' })}
                    />
                    Ωρομίσθιο
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="staff_rate_type"
                      value="daily"
                      checked={formData.staff_rate_type === 'daily'}
                      onChange={(e) => setFormData({ ...formData, staff_rate_type: e.target.value as 'hourly' | 'daily' })}
                    />
                    Ημερομίσθιο
                  </label>
                </div>

                {/* Conditional rate fields */}
                {formData.staff_rate_type === 'hourly' ? (
                  <div className="form-group">
                    <label>Ωρομίσθιο προσωπικού (€/ώρα):</label>
                    <input type="number" step="0.5" min="0" value={formData.staff_hourly_rate} onChange={(e) => setFormData({ ...formData, staff_hourly_rate: parseFloat(e.target.value) || 0 })} />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Ημερομίσθιο προσωπικού (€/ημέρα):</label>
                    <input type="number" step="1" min="0" value={formData.staff_daily_rate} onChange={(e) => setFormData({ ...formData, staff_daily_rate: parseFloat(e.target.value) || 0 })} />
                  </div>
                )}
              </div>
              <div className="setting-group">
                <h4>🚗 Μεταφορά</h4>
                <div className="form-group">
                  <label>Κόστος μεταφοράς (€/χλμ):</label>
                  <input type="number" step="0.05" min="0" value={formData.transport_cost_per_km} onChange={(e) => setFormData({ ...formData, transport_cost_per_km: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="setting-group">
                <h4>🍽️ Αναλώσιμα</h4>
                <div className="form-group">
                  <label>Κόστος αναλώσιμων (€/άτομο):</label>
                  <input type="number" step="0.1" min="0" value={formData.disposables_per_person} onChange={(e) => setFormData({ ...formData, disposables_per_person: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="setting-group">
                <h4>💰 Κέρδος</h4>
                <div className="form-group">
                  <label>Markup (%):</label>
                  <input type="number" step="1" min="0" value={formData.catering_markup_percent} onChange={(e) => setFormData({ ...formData, catering_markup_percent: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
            </>
          )}

          {/* PRIVATE CHEF MODE */}
          {currentMode === 'private_chef' && (
            <>
              <div className="setting-group">
                <h4>👨‍🍳 Chef</h4>
                
                {/* Rate type selector for chef */}
                <div className="rate-type-selector">
                  <label>
                    <input
                      type="radio"
                      name="chef_rate_type"
                      value="hourly"
                      checked={formData.chef_rate_type === 'hourly'}
                      onChange={(e) => setFormData({ ...formData, chef_rate_type: e.target.value as 'hourly' | 'daily' })}
                    />
                    Ωρομίσθιο
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="chef_rate_type"
                      value="daily"
                      checked={formData.chef_rate_type === 'daily'}
                      onChange={(e) => setFormData({ ...formData, chef_rate_type: e.target.value as 'hourly' | 'daily' })}
                    />
                    Ημερομίσθιο
                  </label>
                </div>

                {/* Conditional rate fields for chef */}
                {formData.chef_rate_type === 'hourly' ? (
                  <div className="form-group">
                    <label>Αμοιβή Chef (€/ώρα):</label>
                    <input type="number" step="1" min="0" value={formData.chef_fee_per_hour} onChange={(e) => setFormData({ ...formData, chef_fee_per_hour: parseFloat(e.target.value) || 0 })} />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Αμοιβή Chef (€/ημέρα):</label>
                    <input type="number" step="1" min="0" value={formData.chef_daily_rate} onChange={(e) => setFormData({ ...formData, chef_daily_rate: parseFloat(e.target.value) || 0 })} />
                  </div>
                )}
              </div>
              
              <div className="setting-group">
                <h4>👥 Βοηθοί</h4>
                
                {/* Rate type selector for assistants */}
                <div className="rate-type-selector">
                  <label>
                    <input
                      type="radio"
                      name="assistant_rate_type"
                      value="hourly"
                      checked={formData.assistant_rate_type === 'hourly'}
                      onChange={(e) => setFormData({ ...formData, assistant_rate_type: e.target.value as 'hourly' | 'daily' })}
                    />
                    Ωρομίσθιο
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="assistant_rate_type"
                      value="daily"
                      checked={formData.assistant_rate_type === 'daily'}
                      onChange={(e) => setFormData({ ...formData, assistant_rate_type: e.target.value as 'hourly' | 'daily' })}
                    />
                    Ημερομίσθιο
                  </label>
                </div>

                {/* Conditional rate fields for assistants */}
                {formData.assistant_rate_type === 'hourly' ? (
                  <div className="form-group">
                    <label>Αμοιβή βοηθού (€/ώρα):</label>
                    <input type="number" step="1" min="0" value={formData.assistant_fee_per_hour} onChange={(e) => setFormData({ ...formData, assistant_fee_per_hour: parseFloat(e.target.value) || 0 })} />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Αμοιβή βοηθού (€/ημέρα):</label>
                    <input type="number" step="1" min="0" value={formData.assistant_daily_rate} onChange={(e) => setFormData({ ...formData, assistant_daily_rate: parseFloat(e.target.value) || 0 })} />
                  </div>
                )}
              </div>

              <div className="setting-group">
                <h4>🚗 Μεταφορά</h4>
                <div className="form-group">
                  <label>Κόστος μεταφοράς (€/χλμ):</label>
                  <input type="number" step="0.05" min="0" value={formData.transport_cost_per_km} onChange={(e) => setFormData({ ...formData, transport_cost_per_km: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="setting-group">
                <h4>🍴 Υλικά</h4>
                <div className="form-group">
                  <label>Markup υλικών (%):</label>
                  <input type="number" step="1" min="0" value={formData.food_markup_percent} onChange={(e) => setFormData({ ...formData, food_markup_percent: parseFloat(e.target.value) || 0 })} />
                </div>
              </div>
            </>
          )}

          {/* COMMON: VAT */}
          <div className="setting-group">
            <h4>📋 ΦΠΑ</h4>
            <div className="form-group">
              <label>ΦΠΑ (%):</label>
              <input type="number" step="1" min="0" max="100" value={formData.vat_rate} onChange={(e) => setFormData({ ...formData, vat_rate: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>

          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? '⏳ Αποθήκευση...' : '💾 Αποθήκευση Ρυθμίσεων'}
          </button>
        </form>
        
        {/* FIXED COSTS - ΠΑΝΤΑ ΟΡΑΤΟ, ΕΚΤΟΣ FORM */}
        <div className="card">
          <h3 className="card-title">🏢 Πάγια Μηνιαία Έξοδα</h3>
          <p className="card-desc">Μηνιαίο σύνολο: <strong>{monthlyFixedTotal.toFixed(2)} €</strong></p>

          <div className="fixed-costs-list">
            {fixedCosts.map(cost => (
              <div key={cost.id} className="fixed-cost-item">
                <div className="fixed-cost-info">
                  <span className="fixed-cost-name">{cost.name}</span>
                  <span className="fixed-cost-category">{cost.category}</span>
                </div>
                <div className="fixed-cost-amount">
                  {cost.amount.toFixed(2)} €/{cost.frequency === 'monthly' ? 'μήνα' : 'έτος'}
                </div>
                <button type="button" className="btn-icon delete small" onClick={() => handleRemoveFixedCost(cost.id)}>✕</button>
              </div>
            ))}
          </div>

          <div className="add-fixed-cost">
            <input type="text" placeholder="Όνομα εξόδου" value={newCost.name || ''} onChange={(e) => setNewCost({ ...newCost, name: e.target.value })} />
            <select value={newCost.category} onChange={(e) => setNewCost({ ...newCost, category: e.target.value })}>
              {FIXED_COST_CATEGORIES.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
            </select>
            <input type="number" placeholder="Ποσό" step="1" min="0" value={newCost.amount || ''} onChange={(e) => setNewCost({ ...newCost, amount: parseFloat(e.target.value) || 0 })} />
            <select value={newCost.frequency} onChange={(e) => setNewCost({ ...newCost, frequency: e.target.value as 'monthly' | 'yearly' })}>
              <option value="monthly">Μηνιαίο</option>
              <option value="yearly">Ετήσιο</option>
            </select>
            <button type="button" className="btn-icon add small" onClick={handleAddFixedCost}>➕</button>
          </div>
          
          <p className="helper-text" style={{marginTop: '10px'}}>
            💡 Τα πάγια έξοδα προστίθενται στα overheads (Restaurant) ή υπολογίζονται στα Events (Catering/Private Chef)
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN - Import/Export */}
      <div className="settings-panel">
        {/* Company Info Section */}
        <div className="card">
          <h3 className="card-title">🏢 Στοιχεία Επιχείρησης</h3>
          <p className="card-desc">Θα εμφανίζονται στις προσφορές PDF</p>
          
          <div className="form-group">
            <label>Επωνυμία:</label>
            <input
              type="text"
              placeholder="π.χ. Evochia Catering"
              value={formData.company_name || ''}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              placeholder="info@company.com"
              value={formData.company_email || ''}
              onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label>Τηλέφωνο:</label>
            <input
              type="tel"
              placeholder="+30 210 1234567"
              value={formData.company_phone || ''}
              onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label>Διεύθυνση:</label>
            <textarea
              rows={2}
              placeholder="Οδός, Αριθμός, ΤΚ Πόλη"
              value={formData.company_address || ''}
              onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label>ΑΦΜ:</label>
            <input
              type="text"
              placeholder="123456789"
              value={formData.company_vat_number || ''}
              onChange={(e) => setFormData({ ...formData, company_vat_number: e.target.value })}
            />
          </div>
          
          <p className="helper-text" style={{marginTop: '10px'}}>
            💡 Συμπληρώστε τα στοιχεία για επαγγελματικές προσφορές
          </p>
        </div>
        
        {/* Backup Section */}
        <div className="card">
          <h3 className="card-title">💾 Backup & Restore</h3>
          <div className="btn-row">
            <button type="button" onClick={handleExportBackup} className="settings-btn export">📥 Εξαγωγή</button>
            <button type="button" onClick={handleImportBackup} className="settings-btn import">📤 Εισαγωγή</button>
          </div>
        </div>

        {/* F&B Recipe Manager Pro Section */}
        <div className="card highlight-card">
          <h3 className="card-title purple">📲 F&B Recipe Manager Pro</h3>
          <p className="card-desc">Import από το HTML app</p>
          <div className="btn-column">
            <button type="button" onClick={handleImportFnbJson} className="settings-btn json">📋 Import JSON</button>
            <button type="button" onClick={handleImportFnbCsv} className="settings-btn csv">📊 Import CSV</button>
          </div>
        </div>

        {/* Simple CSV Section */}
        <div className="card">
          <h3 className="card-title">📄 CSV Υλικών</h3>
          <button type="button" onClick={handleImportSimpleCsv} className="settings-btn csv">Επιλογή αρχείου</button>
        </div>

        {/* Import Result */}
        {importResult && (
          <div className={`result-box ${importResult.includes('✅') ? 'success' : 'info'}`}>
            {importResult}
          </div>
        )}
      </div>

      <EncryptionSettings />
    </div>
  );
}

export default memo(SettingsTab);
