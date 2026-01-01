/**
 * Formatting Utilities - Phase 7
 * 
 * Consistent formatting for currency, numbers, dates, and percentages
 * throughout the application.
 */

// ============ CURRENCY ============

export interface CurrencyOptions {
  locale?: string;
  currency?: string;
  decimals?: number;
  showSymbol?: boolean;
}

const DEFAULT_CURRENCY_OPTIONS: Required<CurrencyOptions> = {
  locale: 'el-GR',
  currency: 'EUR',
  decimals: 2,
  showSymbol: true,
};

/**
 * Format a number as currency
 * 
 * @example
 * formatCurrency(1234.5) // "1.234,50 €"
 * formatCurrency(1234.5, { showSymbol: false }) // "1.234,50"
 * formatCurrency(1234.5, { locale: 'en-US', currency: 'USD' }) // "$1,234.50"
 */
export function formatCurrency(
  value: number | null | undefined,
  options: CurrencyOptions = {}
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return options.showSymbol !== false ? '0,00 €' : '0,00';
  }

  const opts = { ...DEFAULT_CURRENCY_OPTIONS, ...options };

  if (opts.showSymbol) {
    return value.toLocaleString(opts.locale, {
      style: 'currency',
      currency: opts.currency,
      minimumFractionDigits: opts.decimals,
      maximumFractionDigits: opts.decimals,
    });
  }

  return value.toLocaleString(opts.locale, {
    minimumFractionDigits: opts.decimals,
    maximumFractionDigits: opts.decimals,
  });
}

/**
 * Format currency per unit (e.g., "12,50 €/kg")
 */
export function formatCurrencyPerUnit(
  value: number | null | undefined,
  unit: string,
  options: CurrencyOptions = {}
): string {
  return `${formatCurrency(value, options)}/${unit}`;
}

/**
 * Format a price range
 */
export function formatPriceRange(
  min: number,
  max: number,
  options: CurrencyOptions = {}
): string {
  if (min === max) {
    return formatCurrency(min, options);
  }
  return `${formatCurrency(min, options)} - ${formatCurrency(max, options)}`;
}

// ============ NUMBERS ============

export interface NumberOptions {
  locale?: string;
  decimals?: number;
  minDecimals?: number;
}

const DEFAULT_NUMBER_OPTIONS: Required<NumberOptions> = {
  locale: 'el-GR',
  decimals: 2,
  minDecimals: 0,
};

/**
 * Format a number with locale-specific separators
 * 
 * @example
 * formatNumber(1234.567) // "1.234,57"
 * formatNumber(1234.567, { decimals: 1 }) // "1.234,6"
 */
export function formatNumber(
  value: number | null | undefined,
  options: NumberOptions = {}
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const opts = { ...DEFAULT_NUMBER_OPTIONS, ...options };

  return value.toLocaleString(opts.locale, {
    minimumFractionDigits: opts.minDecimals,
    maximumFractionDigits: opts.decimals,
  });
}

/**
 * Format a number as integer (no decimals)
 */
export function formatInteger(value: number | null | undefined): string {
  return formatNumber(value, { decimals: 0, minDecimals: 0 });
}

// ============ PERCENTAGES ============

export interface PercentOptions {
  locale?: string;
  decimals?: number;
  showSymbol?: boolean;
}

/**
 * Format a number as percentage
 * 
 * @param value - The value (0.5 = 50%, 50 = 50% depending on isDecimal)
 * @param isDecimal - If true, treats 0.5 as 50%. If false, treats 50 as 50%
 * 
 * @example
 * formatPercent(0.5, true) // "50%"
 * formatPercent(50) // "50%"
 * formatPercent(33.33, false, { decimals: 1 }) // "33,3%"
 */
export function formatPercent(
  value: number | null | undefined,
  isDecimal = false,
  options: PercentOptions = {}
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const { locale = 'el-GR', decimals = 0, showSymbol = true } = options;
  const displayValue = isDecimal ? value * 100 : value;

  const formatted = displayValue.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });

  return showSymbol ? `${formatted}%` : formatted;
}

// ============ DATES ============

export interface DateOptions {
  locale?: string;
  format?: 'short' | 'medium' | 'long' | 'full';
  includeTime?: boolean;
}

/**
 * Format a date string or Date object
 * 
 * @example
 * formatDate('2024-12-20') // "20/12/2024"
 * formatDate('2024-12-20', { format: 'long' }) // "20 Δεκεμβρίου 2024"
 * formatDate('2024-12-20T18:30:00', { includeTime: true }) // "20/12/2024, 18:30"
 */
export function formatDate(
  value: string | Date | null | undefined,
  options: DateOptions = {}
): string {
  if (!value) return '-';

  const { locale = 'el-GR', format = 'short', includeTime = false } = options;

  try {
    const date = typeof value === 'string' ? new Date(value) : value;

    if (isNaN(date.getTime())) return '-';

    const dateStyle: Intl.DateTimeFormatOptions['dateStyle'] = format;
    const timeStyle: Intl.DateTimeFormatOptions['timeStyle'] = includeTime ? 'short' : undefined;

    return date.toLocaleString(locale, {
      dateStyle,
      timeStyle,
    });
  } catch {
    return '-';
  }
}

/**
 * Format a date as relative time (e.g., "πριν 2 ώρες")
 */
export function formatRelativeTime(
  value: string | Date | null | undefined,
  locale = 'el-GR'
): string {
  if (!value) return '-';

  try {
    const date = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(date.getTime())) return '-';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffDays > 30) {
      return formatDate(date, { format: 'medium' });
    } else if (diffDays > 0) {
      return rtf.format(-diffDays, 'day');
    } else if (diffHours > 0) {
      return rtf.format(-diffHours, 'hour');
    } else if (diffMins > 0) {
      return rtf.format(-diffMins, 'minute');
    } else {
      return rtf.format(-diffSecs, 'second');
    }
  } catch {
    return '-';
  }
}

// ============ DURATION ============

/**
 * Format minutes as human-readable duration
 * 
 * @example
 * formatDuration(90) // "1ώ 30λ"
 * formatDuration(45) // "45λ"
 * formatDuration(120) // "2ώ"
 */
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes || minutes <= 0) return '-';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}λ`;
  if (mins === 0) return `${hours}ώ`;
  return `${hours}ώ ${mins}λ`;
}

/**
 * Format hours and minutes as duration
 */
export function formatHoursDuration(hours: number, minutes = 0): string {
  return formatDuration(hours * 60 + minutes);
}

// ============ QUANTITY ============

/**
 * Format a quantity with its unit
 * 
 * @example
 * formatQuantityWithUnit(1.5, 'kg') // "1,5 kg"
 * formatQuantityWithUnit(500, 'g') // "500 g"
 */
export function formatQuantityWithUnit(
  quantity: number | null | undefined,
  unit: string,
  options: NumberOptions = {}
): string {
  if (quantity === null || quantity === undefined) return `-`;
  return `${formatNumber(quantity, options)} ${unit}`;
}

// ============ COMPACT NUMBERS ============

/**
 * Format large numbers in compact form
 * 
 * @example
 * formatCompact(1234) // "1,2χ"
 * formatCompact(1234567) // "1,2εκ"
 */
export function formatCompact(
  value: number | null | undefined,
  locale = 'el-GR'
): string {
  if (value === null || value === undefined || isNaN(value)) return '0';

  return value.toLocaleString(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  });
}
