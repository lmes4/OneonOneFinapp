import { describe, it, expect } from 'vitest';
import { splitEqual, splitProportional, splitCustom } from './splitEngine';

describe('Split Engine (Financial Business Rules)', () => {
  const members = [
    { id: 'm1', name: 'Lucía', monthlyIncomeCents: 200000 }, // 2,000 €
    { id: 'm2', name: 'Carlos', monthlyIncomeCents: 300000 }, // 3,000 €
  ];

  describe('Method 1: Equal Split (50/50)', () => {
    it('splits even amounts equally with zero remainder', () => {
      const result = splitEqual(10000, members, 'm1'); // 100.00 €
      expect(result.splits).toHaveLength(2);
      expect(result.splits[0].shareCents).toBe(5000);
      expect(result.splits[1].shareCents).toBe(5000);
      expect(result.splits[0].shareCents + result.splits[1].shareCents).toBe(10000);
    });

    it('allocates residual odd cents deterministically to the payer', () => {
      // 25.01 € = 2501 cents
      const resultPayer1 = splitEqual(2501, members, 'm1');
      expect(resultPayer1.splits[0].shareCents).toBe(1251); // Lucía (payer) gets 12.51 €
      expect(resultPayer1.splits[1].shareCents).toBe(1250); // Carlos gets 12.50 €
      expect(resultPayer1.splits[0].shareCents + resultPayer1.splits[1].shareCents).toBe(2501);

      // If Carlos is the payer, Carlos receives the extra cent
      const resultPayer2 = splitEqual(2501, members, 'm2');
      expect(resultPayer2.splits[0].shareCents).toBe(1250);
      expect(resultPayer2.splits[1].shareCents).toBe(1251);
      expect(resultPayer2.splits[0].shareCents + resultPayer2.splits[1].shareCents).toBe(2501);
    });

    it('handles 1 cent total gracefully', () => {
      const result = splitEqual(1, members, 'm1');
      expect(result.splits[0].shareCents).toBe(1);
      expect(result.splits[1].shareCents).toBe(0);
      expect(result.splits[0].shareCents + result.splits[1].shareCents).toBe(1);
    });

    it('handles 0 cents gracefully', () => {
      const result = splitEqual(0, members, 'm1');
      expect(result.splits[0].shareCents).toBe(0);
      expect(result.splits[1].shareCents).toBe(0);
    });
  });

  describe('Method 2: Proportional to Income', () => {
    it('splits 1,000 € based on 2,000 € vs 3,000 € incomes (400 € and 600 €)', () => {
      // Acceptance criterion from user prompt:
      // Incomes 2,000 € and 3,000 €, shared expense 1,000 € -> 400 € and 600 €
      const result = splitProportional(100000, members, 'm1'); // 1,000.00 €
      expect(result.splits[0].shareCents).toBe(40000); // 400.00 €
      expect(result.splits[1].shareCents).toBe(60000); // 600.00 €
      expect(result.splits[0].shareCents + result.splits[1].shareCents).toBe(100000);
      expect(result.fallbackToEqual).toBe(false);
    });

    it('allocates remainder cent to higher earner when ratio leaves residual', () => {
      // 100.01 € with 40% / 60% ratio:
      // Base: 4000 cents and 6000 cents -> sum 10000, 1 cent residual
      const result = splitProportional(10001, members, 'm1');
      expect(result.splits[0].shareCents).toBe(4000);
      expect(result.splits[1].shareCents).toBe(6001); // Carlos has higher income
      expect(result.splits[0].shareCents + result.splits[1].shareCents).toBe(10001);
    });

    it('falls back to 50/50 when both members have 0 income', () => {
      const zeroIncomeMembers = [
        { id: 'm1', name: 'Lucía', monthlyIncomeCents: 0 },
        { id: 'm2', name: 'Carlos', monthlyIncomeCents: 0 },
      ];
      const result = splitProportional(5000, zeroIncomeMembers, 'm1');
      expect(result.fallbackToEqual).toBe(true);
      expect(result.splits[0].shareCents).toBe(2500);
      expect(result.splits[1].shareCents).toBe(2500);
      expect(result.splits[0].shareCents + result.splits[1].shareCents).toBe(5000);
    });

    it('assigns 100% to earner if only one member has positive income', () => {
      const singleEarnerMembers = [
        { id: 'm1', name: 'Lucía', monthlyIncomeCents: 250000 },
        { id: 'm2', name: 'Carlos', monthlyIncomeCents: 0 },
      ];
      const result = splitProportional(8000, singleEarnerMembers, 'm1');
      expect(result.splits[0].shareCents).toBe(8000);
      expect(result.splits[1].shareCents).toBe(0);
      expect(result.splits[0].shareCents + result.splits[1].shareCents).toBe(8000);
    });
  });

  describe('Method 3: Custom Split', () => {
    it('splits by custom percentage accurately (40/60 of 100 €)', () => {
      // Acceptance criterion from user prompt:
      // 100 € with 40/60 assigns 40 € to first and 60 € to second
      const result = splitCustom(10000, members, {
        mode: 'percentage',
        percentages: { m1: 40, m2: 60 }
      }, 'm1');

      expect(result.splits[0].shareCents).toBe(4000);
      expect(result.splits[1].shareCents).toBe(6000);
      expect(result.splits[0].shareCents + result.splits[1].shareCents).toBe(10000);
    });

    it('throws error if custom percentages do not total 100%', () => {
      expect(() => {
        splitCustom(10000, members, {
          mode: 'percentage',
          percentages: { m1: 40, m2: 50 } // Sum = 90%
        }, 'm1');
      }).toThrow(/sumar exactamente 100%/);
    });

    it('splits by custom fixed amounts accurately', () => {
      const result = splitCustom(7500, members, {
        mode: 'amount',
        amounts: { m1: 2500, m2: 5000 }
      }, 'm1');

      expect(result.splits[0].shareCents).toBe(2500);
      expect(result.splits[1].shareCents).toBe(5000);
      expect(result.splits[0].shareCents + result.splits[1].shareCents).toBe(7500);
    });

    it('throws error if custom amounts do not match total', () => {
      expect(() => {
        splitCustom(7500, members, {
          mode: 'amount',
          amounts: { m1: 2000, m2: 5000 } // Sum = 7000 != 7500
        }, 'm1');
      }).toThrow(/no coincide con el total/);
    });
  });
});
