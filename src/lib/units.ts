/**
 * Unit Conversion System - Phase 4
 * 
 * Comprehensive unit handling for F&B cost calculations.
 * Supports weight (mass), volume, and count units.
 */

// ============ TYPES ============

export type MassUnit = 'kg' | 'g' | 'mg' | 'lb' | 'oz';
export type VolumeUnit = 'L' | 'ml' | 'cl' | 'dl' | 'gal' | 'fl_oz' | 'cup' | 'tbsp' | 'tsp';
export type CountUnit = 'τεμ' | 'pcs' | 'dozen';
export type Unit = MassUnit | VolumeUnit | CountUnit;

export type UnitCategory = 'mass' | 'volume' | 'count';

export interface UnitInfo {
  symbol: string;
  name: string;
  nameGr: string;
  category: UnitCategory;
  baseUnit: string;
  toBase: number; // Multiplier to convert to base unit
}

// ============ EXTENDED UNIT DEFINITIONS ============

export type UnitType = 'weight' | 'volume' | 'count';
export interface UnitDefinition {
  name: string;
  type: UnitType;
  toBase: number;
  aliases?: string[];
  displayName?: string;
}

// ============ UNITS DEFINITION ============
export const UNITS: Record<string, UnitDefinition> = {
  // ============ WEIGHT (base: kg) ============
  'kg': { name: 'kg', type: 'weight', toBase: 1, aliases: ['kilo', 'kilos', 'κιλό'], displayName: 'Κιλό' },
  'g': { name: 'g', type: 'weight', toBase: 0.001, aliases: ['gr', 'gram', 'grams', 'γρ'], displayName: 'Γραμμάριο' },
  'mg': { name: 'mg', type: 'weight', toBase: 0.000001, aliases: ['milligram'], displayName: 'Χιλιοστόγραμμο' },
  'lb': { name: 'lb', type: 'weight', toBase: 0.453592, aliases: ['lbs', 'pound', 'pounds', 'λίβρα'], displayName: 'Λίβρα' },
  'oz': { name: 'oz', type: 'weight', toBase: 0.0283495, aliases: ['ounce', 'ounces', 'ουγγιά'], displayName: 'Ουγγιά' },

  // ============ VOLUME (base: L) ============
  'L': { name: 'L', type: 'volume', toBase: 1, aliases: ['l', 'lt', 'liter', 'λίτρο'], displayName: 'Λίτρο' },
  'ml': { name: 'ml', type: 'volume', toBase: 0.001, aliases: ['mL', 'milliliter'], displayName: 'Χιλιοστόλιτρο' },
  'cl': { name: 'cl', type: 'volume', toBase: 0.01, aliases: ['centiliter'], displayName: 'Εκατοστόλιτρο' },
  'dl': { name: 'dl', type: 'volume', toBase: 0.1, aliases: ['deciliter'], displayName: 'Δεκατόλιτρο' },
  'gal': { name: 'gal', type: 'volume', toBase: 3.78541, aliases: ['gallon', 'gallons', 'γαλόνι'], displayName: 'Γαλόνι' },
  'qt': { name: 'qt', type: 'volume', toBase: 0.946353, aliases: ['quart', 'quarts'], displayName: 'Quart' },
  'pt': { name: 'pt', type: 'volume', toBase: 0.473176, aliases: ['pint', 'pints'], displayName: 'Pint' },
  'cup': { name: 'cup', type: 'volume', toBase: 0.236588, aliases: ['cups', 'φλιτζάνι'], displayName: 'Φλιτζάνι' },
  'tbsp': { name: 'tbsp', type: 'volume', toBase: 0.0147868, aliases: ['tbs', 'tablespoon', 'κ.σ.'], displayName: 'Κουταλιά σούπας' },
  'tsp': { name: 'tsp', type: 'volume', toBase: 0.00492892, aliases: ['teaspoon', 'κ.γ.'], displayName: 'Κουταλιά γλυκού' },
  'fl oz': { name: 'fl oz', type: 'volume', toBase: 0.0295735, aliases: ['floz', 'fluid ounce'], displayName: 'Fluid ounce' },

  // ============ COUNT ============
  'τεμ': { name: 'τεμ', type: 'count', toBase: 1, aliases: ['τεμ.', 'τεμάχιο', 'pc', 'pcs', 'piece'], displayName: 'Τεμάχιο' },
  'pcs': { name: 'pcs', type: 'count', toBase: 1, aliases: ['pieces'], displayName: 'Pieces' },
  'dozen': { name: 'dozen', type: 'count', toBase: 12, aliases: ['dz', 'ντουζίνα'], displayName: 'Ντουζίνα' },
  'φέτα': { name: 'φέτα', type: 'count', toBase: 1, aliases: ['φέτες', 'slice'], displayName: 'Φέτα' },
  'σκελίδα': { name: 'σκελίδα', type: 'count', toBase: 1, aliases: ['σκελίδες', 'clove'], displayName: 'Σκελίδα' },
  'ματσάκι': { name: 'ματσάκι', type: 'count', toBase: 1, aliases: ['bunch'], displayName: 'Ματσάκι' },
};

// ============ DERIVED LISTS (after UNITS) ============
export const UNIT_NAMES = Object.keys(UNITS);
export const WEIGHT_UNITS = Object.entries(UNITS).filter(([_, u]) => u.type === 'weight').map(([k]) => k);
export const VOLUME_UNITS = Object.entries(UNITS).filter(([_, u]) => u.type === 'volume').map(([k]) => k);
export const COUNT_UNITS = Object.entries(UNITS).filter(([_, u]) => u.type === 'count').map(([k]) => k);

// ============ UNIT REGISTRY FOR TESTS & API ============
// Maps unit symbol to full info - MUST use UnitCategory (mass/volume/count)
export const UNIT_REGISTRY: Record<string, UnitInfo> = {
  // Mass units
  'kg': { symbol: 'kg', name: 'kg', nameGr: 'Κιλό', category: 'mass', baseUnit: 'kg', toBase: 1 },
  'g': { symbol: 'g', name: 'g', nameGr: 'Γραμμάριο', category: 'mass', baseUnit: 'kg', toBase: 0.001 },
  'mg': { symbol: 'mg', name: 'mg', nameGr: 'Χιλιοστόγραμμο', category: 'mass', baseUnit: 'kg', toBase: 0.000001 },
  'lb': { symbol: 'lb', name: 'lb', nameGr: 'Λίβρα', category: 'mass', baseUnit: 'kg', toBase: 0.453592 },
  'oz': { symbol: 'oz', name: 'oz', nameGr: 'Ουγγιά', category: 'mass', baseUnit: 'kg', toBase: 0.0283495 },
  
  // Volume units
  'L': { symbol: 'L', name: 'L', nameGr: 'Λίτρο', category: 'volume', baseUnit: 'L', toBase: 1 },
  'ml': { symbol: 'ml', name: 'ml', nameGr: 'Χιλιοστόλιτρο', category: 'volume', baseUnit: 'L', toBase: 0.001 },
  'cl': { symbol: 'cl', name: 'cl', nameGr: 'Εκατοστόλιτρο', category: 'volume', baseUnit: 'L', toBase: 0.01 },
  'dl': { symbol: 'dl', name: 'dl', nameGr: 'Δεκατόλιτρο', category: 'volume', baseUnit: 'L', toBase: 0.1 },
  'gal': { symbol: 'gal', name: 'gal', nameGr: 'Γαλόνι', category: 'volume', baseUnit: 'L', toBase: 3.78541 },
  'qt': { symbol: 'qt', name: 'qt', nameGr: 'Quart', category: 'volume', baseUnit: 'L', toBase: 0.946353 },
  'pt': { symbol: 'pt', name: 'pt', nameGr: 'Pint', category: 'volume', baseUnit: 'L', toBase: 0.473176 },
  'cup': { symbol: 'cup', name: 'cup', nameGr: 'Φλιτζάνι', category: 'volume', baseUnit: 'L', toBase: 0.236588 },
  'tbsp': { symbol: 'tbsp', name: 'tbsp', nameGr: 'Κουταλιά σούπας', category: 'volume', baseUnit: 'L', toBase: 0.0147868 },
  'tsp': { symbol: 'tsp', name: 'tsp', nameGr: 'Κουταλιά γλυκού', category: 'volume', baseUnit: 'L', toBase: 0.00492892 },
  'fl oz': { symbol: 'fl oz', name: 'fl oz', nameGr: 'Fluid ounce', category: 'volume', baseUnit: 'L', toBase: 0.0295735 },
  'fl_oz': { symbol: 'fl_oz', name: 'fl_oz', nameGr: 'Fluid ounce', category: 'volume', baseUnit: 'L', toBase: 0.0295735 },
  
  // Count units
  'τεμ': { symbol: 'τεμ', name: 'τεμ', nameGr: 'Τεμάχιο', category: 'count', baseUnit: 'τεμ', toBase: 1 },
  'pcs': { symbol: 'pcs', name: 'pcs', nameGr: 'Pieces', category: 'count', baseUnit: 'τεμ', toBase: 1 },
  'dozen': { symbol: 'dozen', name: 'dozen', nameGr: 'Ντουζίνα', category: 'count', baseUnit: 'τεμ', toBase: 12 },
};

/**
 * Common units used in F&B (subset for UI dropdowns)
 */
export const COMMON_UNITS: Unit[] = ['kg', 'g', 'L', 'ml', 'τεμ'];

/**
 * All available units grouped by category
 */
export const UNITS_BY_CATEGORY: Record<UnitCategory, Unit[]> = {
  mass: ['kg', 'g', 'mg', 'lb', 'oz'],
  volume: ['L', 'ml', 'cl', 'dl', 'gal', 'fl_oz', 'cup', 'tbsp', 'tsp'],
  count: ['τεμ', 'pcs', 'dozen'],
};

// ============ BASIC VALIDATION ============

/**
 * Check if a unit is valid (exists in registry)
 */
export function isValidUnit(unit: string): boolean {
  return unit in UNIT_REGISTRY;
}

// ============ CONVERSION FUNCTIONS ============

export function normalizeUnit(unit: string): string {
  if (!unit) return unit;
  const trimmed = unit.trim();
  if (UNITS[trimmed]) return trimmed;
  const lowerUnit = trimmed.toLowerCase();
  for (const [key, def] of Object.entries(UNITS)) {
    if (key.toLowerCase() === lowerUnit) return key;
    if (def.aliases?.some(alias => alias.toLowerCase() === lowerUnit)) return key;
  }
  return trimmed;
}

export function getUnitType(unit: string): UnitType | null {
  const normalized = normalizeUnit(unit);
  return UNITS[normalized]?.type || null;
}

/**
 * Get the category of a unit (mass, volume, count)
 * Returns UnitCategory format for API compatibility
 */
export function getUnitCategory(unit: string): UnitCategory | null {
  const def = UNIT_REGISTRY[unit];
  if (!def) return null;
  return def.category;
}

export function areUnitsCompatible(unit1: string, unit2: string): boolean {
  const cat1 = getUnitCategory(unit1);
  const cat2 = getUnitCategory(unit2);
  return cat1 !== null && cat1 === cat2;
}

export function convertQuantity(quantity: number, fromUnit: string, toUnit: string): number | null {
  const from = normalizeUnit(fromUnit);
  const to = normalizeUnit(toUnit);
  if (from === to) return quantity;
  const fromDef = UNITS[from];
  const toDef = UNITS[to];
  if (!fromDef || !toDef || fromDef.type !== toDef.type) return null;
  const inBaseUnit = quantity * fromDef.toBase;
  return inBaseUnit / toDef.toBase;
}

/**
 * Convert between units - returns original value if conversion not possible
 */
export function convertUnit(quantity: number, fromUnit: string, toUnit: string): number {
  // Same unit - return as is
  if (fromUnit === toUnit) return quantity;
  
  // Check if both units exist
  const fromDef = UNIT_REGISTRY[fromUnit];
  const toDef = UNIT_REGISTRY[toUnit];
  
  // Invalid units - return original
  if (!fromDef || !toDef) return quantity;
  
  // Different categories - return original
  if (fromDef.category !== toDef.category) return quantity;
  
  // Convert: quantity -> base -> target
  const inBase = quantity * fromDef.toBase;
  return inBase / toDef.toBase;
}

export function toBaseUnit(quantity: number, unit: string): number {
  const normalized = normalizeUnit(unit);
  const def = UNITS[normalized];
  return def ? quantity * def.toBase : quantity;
}

/**
 * Smart convert - finds the best unit for display
 */
export function smartConvert(quantity: number, unit: string): { value: number; unit: string } {
  const def = UNIT_REGISTRY[unit];
  if (!def) return { value: quantity, unit };
  
  // Get base value
  const baseValue = quantity * def.toBase;
  const category = def.category;
  
  // Define preferred units by category in order of preference (largest to smallest)
  const preferredUnits: Record<UnitCategory, string[]> = {
    mass: ['kg', 'g', 'mg'],
    volume: ['L', 'ml'],
    count: ['τεμ'],
  };
  
  const unitsToTry = preferredUnits[category] || [unit];
  
  // Find the best unit (value between 1 and 1000)
  for (const targetUnit of unitsToTry) {
    const targetDef = UNIT_REGISTRY[targetUnit];
    if (!targetDef) continue;
    
    const converted = baseValue / targetDef.toBase;
    // Round to avoid floating point precision issues
    const rounded = Math.round(converted * 1e10) / 1e10;
    if (rounded >= 1 && rounded < 1000) {
      return { value: rounded, unit: targetUnit };
    }
  }
  
  // If no good fit found, try to find any reasonable unit
  for (const targetUnit of unitsToTry) {
    const targetDef = UNIT_REGISTRY[targetUnit];
    if (!targetDef) continue;
    
    const converted = baseValue / targetDef.toBase;
    const rounded = Math.round(converted * 1e10) / 1e10;
    if (rounded >= 0.001) {
      return { value: rounded, unit: targetUnit };
    }
  }
  
  return { value: quantity, unit };
}

// ============ LEGACY FUNCTIONS FOR API COMPAT ============

export function standardizeToBase(quantity: number, unit: string): number {
  const def = UNIT_REGISTRY[unit];
  if (!def) throw new Error(`Invalid unit: ${unit}`);
  return quantity * def.toBase;
}

export function fromBase(quantity: number, unit: string): number {
  const def = UNIT_REGISTRY[unit];
  if (!def) throw new Error(`Invalid unit: ${unit}`);
  return quantity / def.toBase;
}

export function formatQuantity(
  quantity: number,
  unit: string,
  opts?: { decimals?: number; showSymbol?: boolean }
): string {
  const showSymbol = opts?.showSymbol !== false;

  let value: string;
  if (typeof opts?.decimals === 'number') {
    // Explicit decimals - use exactly that many
    value = Number(quantity).toLocaleString('el-GR', {
      maximumFractionDigits: opts.decimals,
      minimumFractionDigits: opts.decimals
    });
  } else {
    // Smart formatting: no decimals for integers, 1 for floats
    const isInt = Math.abs(quantity - Math.round(quantity)) < 1e-9;
    value = Number(quantity).toLocaleString('el-GR', {
      maximumFractionDigits: isInt ? 0 : 1,
      minimumFractionDigits: isInt ? 0 : 1
    });
  }

  return showSymbol ? `${value} ${unit}` : value;
}

export function formatQuantitySmart(quantity: number, unit: string): string {
  const { value, unit: newUnit } = smartConvert(quantity, unit);
  return formatQuantity(value, newUnit);
}

export function getUnitOptions(category?: UnitCategory): { value: string; label: string }[] {
  const units = category ? UNITS_BY_CATEGORY[category] : Object.keys(UNIT_REGISTRY);
  return units.map(u => ({ value: u, label: `${u} - ${UNIT_REGISTRY[u]?.nameGr || u}` }));
}

export function getUnitNameGr(unit: string): string {
  const def = UNIT_REGISTRY[unit];
  return def?.nameGr || unit;
}

export function getBaseUnit(unit: string): string | null {
  const def = UNIT_REGISTRY[unit];
  if (!def) return null;
  return def.baseUnit;
}