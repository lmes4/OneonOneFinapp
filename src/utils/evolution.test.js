import { describe, expect, it } from 'vitest';
import { buildEvolutionData } from './evolution';

describe('buildEvolutionData', () => {
  const referenceDate = new Date(2026, 9, 9, 12);

  it('groups the last seven days and excludes settlement transfers', () => {
    const data = buildEvolutionData([
      {
        type: 'ingreso',
        fullDate: new Date(2026, 9, 9, 9).toISOString(),
        totalAmountCents: 250000
      },
      {
        type: 'gasto',
        fullDate: new Date(2026, 9, 9, 10).toISOString(),
        totalAmountCents: 1250
      },
      {
        type: 'gasto',
        isSettlement: true,
        fullDate: new Date(2026, 9, 9, 11).toISOString(),
        totalAmountCents: 5000
      }
    ], 'Sem', referenceDate);

    expect(data).toHaveLength(7);
    expect(data.at(-1)).toMatchObject({ income: 2500, expense: 12.5, isCurrent: true });
    expect(data.reduce((sum, bucket) => sum + bucket.expense, 0)).toBe(12.5);
  });

  it('returns twelve month buckets for the yearly view and omits out-of-range records', () => {
    const data = buildEvolutionData([
      {
        type: 'gasto',
        fullDate: new Date(2026, 9, 1).toISOString(),
        amount: 20
      },
      {
        type: 'gasto',
        fullDate: new Date(2025, 8, 30).toISOString(),
        amount: 80
      }
    ], 'Año', referenceDate);

    expect(data).toHaveLength(12);
    expect(data.at(-1).expense).toBe(20);
    expect(data.reduce((sum, bucket) => sum + bucket.expense, 0)).toBe(20);
  });
});
