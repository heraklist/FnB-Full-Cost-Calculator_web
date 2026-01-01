/**
 * Validation helper functions for form inputs and calculations.
 * Provides type-safe utilities to prevent common errors like division by zero.
 */

/**
 * Validates if a number is positive (greater than 0)
 * @param value - The number to validate
 * @returns true if value is a valid number greater than 0
 * @example
 * isPositiveNumber(5)  // true
 * isPositiveNumber(0)  // false
 * isPositiveNumber(-1) // false
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value > 0;
}

/**
 * Validates if a number is a valid percentage (0-100)
 * @param value - The number to validate
 * @returns true if value is between 0 and 100 inclusive
 * @example
 * isValidPercentage(50)  // true
 * isValidPercentage(0)   // true
 * isValidPercentage(100) // true
 * isValidPercentage(101) // false
 */
export function isValidPercentage(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= 0 && value <= 100;
}

/**
 * Validates if a price is valid (>= 0)
 * @param value - The price to validate
 * @returns true if value is a valid non-negative number
 * @example
 * isValidPrice(10.50) // true
 * isValidPrice(0)     // true
 * isValidPrice(-5)    // false
 */
export function isValidPrice(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

/**
 * Validates if a string has content (not empty after trim)
 * @param value - The string to validate
 * @returns true if string has at least one non-whitespace character
 * @example
 * isNonEmptyString("hello")  // true
 * isNonEmptyString("  hi  ") // true
 * isNonEmptyString("")       // false
 * isNonEmptyString("   ")    // false
 */
export function isNonEmptyString(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Sanitizes a number input - converts to number, returns 0 if invalid or negative
 * @param value - The value to sanitize (string or number)
 * @returns A valid non-negative number, or 0 if invalid
 * @example
 * sanitizeNumber("10.5")    // 10.5
 * sanitizeNumber(5)         // 5
 * sanitizeNumber("invalid") // 0
 * sanitizeNumber(-5)        // 0
 */
export function sanitizeNumber(value: string | number): number {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) || num < 0 ? 0 : num;
}

/**
 * Clamps a value between min and max
 * @param value - The value to clamp
 * @param min - The minimum allowed value
 * @param max - The maximum allowed value
 * @returns The value clamped to the range [min, max]
 * @example
 * clamp(5, 0, 10)   // 5
 * clamp(-5, 0, 10)  // 0
 * clamp(15, 0, 10)  // 10
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Safe division - returns fallback if denominator is 0 or invalid
 * Use this to prevent division by zero errors in cost calculations.
 * @param numerator - The dividend
 * @param denominator - The divisor
 * @param fallback - The value to return if division is not possible (default: 0)
 * @returns The result of division, or fallback if denominator is 0
 * @example
 * safeDiv(10, 2)     // 5
 * safeDiv(10, 0)     // 0
 * safeDiv(10, 0, -1) // -1
 */
export function safeDiv(numerator: number, denominator: number, fallback = 0): number {
  if (denominator === 0 || !isFinite(denominator)) {
    return fallback;
  }
  const result = numerator / denominator;
  return isFinite(result) ? result : fallback;
}

/**
 * Validates if a number is non-negative (>= 0)
 * @param value - The number to validate
 * @returns true if value is a valid number >= 0
 * @example
 * isNonNegative(5)  // true
 * isNonNegative(0)  // true
 * isNonNegative(-1) // false
 */
export function isNonNegative(value: number): boolean {
  return typeof value === 'number' && !isNaN(value) && value >= 0;
}

/**
 * Safely parses an integer from string input, with a default value
 * @param value - The value to parse
 * @param defaultValue - The default value if parsing fails (default: 0)
 * @returns The parsed integer, or defaultValue if invalid
 * @example
 * safeParseInt("10")      // 10
 * safeParseInt("invalid") // 0
 * safeParseInt("", 1)     // 1
 */
export function safeParseInt(value: string | number, defaultValue = 0): number {
  if (typeof value === 'number') return Math.floor(value);
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safely parses a float from string input, with a default value
 * @param value - The value to parse
 * @param defaultValue - The default value if parsing fails (default: 0)
 * @returns The parsed float, or defaultValue if invalid
 * @example
 * safeParseFloat("10.5")   // 10.5
 * safeParseFloat("invalid") // 0
 * safeParseFloat("", 1.5)  // 1.5
 */
export function safeParseFloat(value: string | number, defaultValue = 0): number {
  if (typeof value === 'number') return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}
