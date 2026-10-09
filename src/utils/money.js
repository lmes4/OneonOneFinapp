/**
 * FinApp Shared - Monetary Utilities (Integer Cents Arithmetic)
 * Prevents IEEE-754 binary floating point precision errors.
 */

export const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  PEN: 'S/.'
};

/**
 * Converts a floating point amount or string (e.g. 24.50, "15.99") to integer cents.
 * Handles rounding deterministically.
 */
export function toCents(amount) {
  if (amount === null || amount === undefined || amount === '') return 0;
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : Number(amount);
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.round(num * 100);
}

/**
 * Converts integer cents back to a floating point number for displays that require numeric value.
 */
export function fromCents(cents) {
  if (cents === null || cents === undefined) return 0;
  return Math.round(Number(cents)) / 100;
}

/**
 * Formats integer cents into localized currency string.
 * @param {number} cents - Amount in cents
 * @param {string} currencyCode - 'USD' | 'EUR' | 'PEN'
 * @param {boolean} showSign - Whether to force a '+' sign for positive amounts
 */
export function formatMoneyCents(cents, currencyCode = 'USD', showSign = false) {
  const safeCents = Number(cents) || 0;
  const absDollars = Math.abs(safeCents) / 100;
  const symbol = CURRENCY_SYMBOLS[currencyCode] || '$';
  
  const formattedNumber = absDollars.toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const sign = safeCents < 0 ? '-' : showSign && safeCents > 0 ? '+' : '';
  
  // Format based on standard European vs American currency placement
  if (currencyCode === 'EUR') {
    return `${sign}${formattedNumber} €`;
  } else if (currencyCode === 'PEN') {
    return `${sign}S/. ${formattedNumber}`;
  }
  return `${sign}$${formattedNumber}`;
}

/**
 * Adds multiple cent values safely
 */
export function addCents(...values) {
  return values.reduce((sum, v) => sum + (Number(v) || 0), 0);
}

/**
 * Subtracts b from a safely
 */
export function subtractCents(a, b) {
  return (Number(a) || 0) - (Number(b) || 0);
}
