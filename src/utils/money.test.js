import { describe, it, expect } from 'vitest';
import { toCents, fromCents, formatMoneyCents, addCents, subtractCents } from './money';

describe('Money Utilities (Integer Cents Arithmetic)', () => {
  describe('toCents', () => {
    it('converts decimal amounts to integer cents accurately', () => {
      expect(toCents(24.50)).toBe(2450);
      expect(toCents(120.00)).toBe(12000);
      expect(toCents(0.01)).toBe(1);
      expect(toCents(0.00)).toBe(0);
    });

    it('avoids floating point rounding issues (e.g. 19.99 * 100)', () => {
      expect(toCents(19.99)).toBe(1999);
      expect(toCents(1.14)).toBe(114);
    });

    it('handles string inputs cleanly', () => {
      expect(toCents("15.50")).toBe(1550);
      expect(toCents("1,250.00")).toBe(125000);
      expect(toCents("")).toBe(0);
      expect(toCents(null)).toBe(0);
      expect(toCents(undefined)).toBe(0);
    });
  });

  describe('fromCents', () => {
    it('converts integer cents back to decimal representation', () => {
      expect(fromCents(2450)).toBe(24.50);
      expect(fromCents(100)).toBe(1.00);
      expect(fromCents(1)).toBe(0.01);
      expect(fromCents(0)).toBe(0);
    });
  });

  describe('formatMoneyCents', () => {
    it('formats USD currency correctly', () => {
      expect(formatMoneyCents(2450, 'USD')).toBe('$24,50');
      expect(formatMoneyCents(0, 'USD')).toBe('$0,00');
    });

    it('formats EUR currency correctly', () => {
      expect(formatMoneyCents(1550, 'EUR')).toBe('15,50 €');
    });

    it('formats PEN currency correctly', () => {
      expect(formatMoneyCents(10000, 'PEN')).toBe('S/. 100,00');
    });

    it('handles negative cents correctly', () => {
      expect(formatMoneyCents(-2450, 'USD')).toBe('-$24,50');
    });

    it('supports forcing positive sign', () => {
      expect(formatMoneyCents(500, 'USD', true)).toBe('+$5,00');
    });
  });

  describe('addCents and subtractCents', () => {
    it('adds and subtracts without floating point leakage', () => {
      expect(addCents(10, 20, 30)).toBe(60);
      expect(subtractCents(100, 35)).toBe(65);
    });
  });
});
