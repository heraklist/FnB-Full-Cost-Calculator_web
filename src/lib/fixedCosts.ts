import type { FixedCost } from '../types';

export function parseFixedCosts(json: string | null): FixedCost[] {
  if (!json) return [];
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function stringifyFixedCosts(costs: FixedCost[]): string {
  return JSON.stringify(costs);
}

export function calculateMonthlyFixedCosts(costs: FixedCost[]): number {
  return costs.reduce((total, cost) => {
    if (cost.frequency === 'yearly') {
      return total + cost.amount / 12;
    }
    return total + cost.amount;
  }, 0);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
