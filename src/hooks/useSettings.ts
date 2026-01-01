import { useState, useEffect, useCallback } from 'react';
import type { Settings } from '../types';
import * as api from '../lib/api';

const DEFAULT_SETTINGS: Settings = {
  mode: 'restaurant',
  vat_rate: 24,
  fixed_costs_json: null,
  labour_cost_per_hour: 10,
  overhead_monthly: 1000,
  portions_per_month: 1000,
  packaging_per_portion: 0.5,
  target_food_cost_percent: 30,
  staff_rate_type: 'hourly',
  staff_hourly_rate: 10,
  staff_daily_rate: 80,
  transport_cost_per_km: 0.5,
  equipment_rental_default: 0,
  disposables_per_person: 1,
  catering_markup_percent: 30,
  chef_rate_type: 'hourly',
  chef_fee_per_hour: 50,
  chef_daily_rate: 300,
  assistant_rate_type: 'hourly',
  assistant_fee_per_hour: 20,
  assistant_daily_rate: 150,
  food_markup_percent: 30
};

interface UseSettingsReturn {
  settings: Settings;
  loading: boolean;
  error: string | null;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSettings(enabled: boolean = true): UseSettingsReturn {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!enabled) {
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getSettings();
      setSettings(data || DEFAULT_SETTINGS);
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettingsHandler = useCallback(async (newSettings: Partial<Settings>) => {
    await api.updateSettings(newSettings);
    await fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    updateSettings: updateSettingsHandler,
    refresh: fetchSettings
  };
}
