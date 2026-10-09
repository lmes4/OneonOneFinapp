import { describe, it, expect } from 'vitest';
import { calculateSettlement } from './settlement';

describe('Settlement Engine (Debts and Balances)', () => {
  const members = [
    { id: 'm1', name: 'Lucía' },
    { id: 'm2', name: 'Carlos' }
  ];

  it('calculates debt when one member pays a 50/50 shared expense', () => {
    // Lucía pays 100 € shared 50/50 -> Carlos owes Lucía 50 €
    const transactions = [
      {
        id: 'tx-1',
        scope: 'shared',
        paidBy: 'm1',
        totalAmountCents: 10000,
        splits: [
          { memberId: 'm1', shareCents: 5000 },
          { memberId: 'm2', shareCents: 5000 }
        ]
      }
    ];

    const result = calculateSettlement(transactions, members);
    expect(result.isSettled).toBe(false);
    expect(result.memberBalances.m1.netBalanceCents).toBe(5000); // Lucía is creditor +50 €
    expect(result.memberBalances.m2.netBalanceCents).toBe(-5000); // Carlos is debtor -50 €
    expect(result.debtSummary.debtorId).toBe('m2');
    expect(result.debtSummary.creditorId).toBe('m1');
    expect(result.debtSummary.amountCents).toBe(5000);
  });

  it('balances out when both members pay alternating expenses', () => {
    // Tx1: Lucía pays 60 € (30 / 30) -> Carlos owes Lucía 30 €
    // Tx2: Carlos pays 60 € (30 / 30) -> Lucía owes Carlos 30 €
    // Net: 0 €
    const transactions = [
      {
        id: 'tx-1',
        scope: 'shared',
        paidBy: 'm1',
        totalAmountCents: 6000,
        splits: [
          { memberId: 'm1', shareCents: 3000 },
          { memberId: 'm2', shareCents: 3000 }
        ]
      },
      {
        id: 'tx-2',
        scope: 'shared',
        paidBy: 'm2',
        totalAmountCents: 6000,
        splits: [
          { memberId: 'm1', shareCents: 3000 },
          { memberId: 'm2', shareCents: 3000 }
        ]
      }
    ];

    const result = calculateSettlement(transactions, members);
    expect(result.isSettled).toBe(true);
    expect(result.memberBalances.m1.netBalanceCents).toBe(0);
    expect(result.memberBalances.m2.netBalanceCents).toBe(0);
    expect(result.debtSummary.amountCents).toBe(0);
  });

  it('handles settlement payment resetting debt to zero', () => {
    // Tx1: Lucía pays 100 € shared 50/50 -> Carlos owes 50 €
    // Tx2: Carlos pays 50 € settlement to Lucía -> Net 0 €
    const transactions = [
      {
        id: 'tx-1',
        scope: 'shared',
        paidBy: 'm1',
        totalAmountCents: 10000,
        splits: [
          { memberId: 'm1', shareCents: 5000 },
          { memberId: 'm2', shareCents: 5000 }
        ]
      },
      {
        id: 'tx-settlement',
        scope: 'shared',
        isSettlement: true,
        paidBy: 'm2',
        receiverMemberId: 'm1',
        totalAmountCents: 5000
      }
    ];

    const result = calculateSettlement(transactions, members);
    expect(result.isSettled).toBe(true);
    expect(result.memberBalances.m1.netBalanceCents).toBe(0);
    expect(result.memberBalances.m2.netBalanceCents).toBe(0);
  });

  it('ignores personal expenses in settlement calculation', () => {
    const transactions = [
      {
        id: 'tx-personal',
        scope: 'personal',
        paidBy: 'm1',
        totalAmountCents: 50000
      }
    ];

    const result = calculateSettlement(transactions, members);
    expect(result.isSettled).toBe(true);
    expect(result.totalSharedSpentCents).toBe(0);
    expect(result.memberBalances.m1.netBalanceCents).toBe(0);
  });
});
