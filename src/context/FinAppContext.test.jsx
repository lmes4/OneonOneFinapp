import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { FinAppProvider, useFinApp } from './FinAppContext';

function ContextProbe() {
  const { financialSummary, transactions, addTransaction } = useFinApp();

  return (
    <>
      <output data-testid="summary">{JSON.stringify(financialSummary)}</output>
      <output data-testid="transactions">{JSON.stringify(transactions)}</output>
      <button
        type="button"
        onClick={() => addTransaction({
          id: 'cents-only',
          concept: 'Importe en céntimos',
          totalAmountCents: 1250,
          type: 'gasto',
          scope: 'personal'
        })}
      >
        Añadir
      </button>
    </>
  );
}

function renderProvider() {
  return render(
    <FinAppProvider>
      <ContextProbe />
    </FinAppProvider>
  );
}

const members = [
  { id: 'member-1', name: 'Lucía', isCurrentUser: true, monthlyIncomeCents: 250000 },
  { id: 'member-2', name: 'Carlos', monthlyIncomeCents: 180000 }
];

describe('FinAppContext financial integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('does not count a settlement transfer as an additional shared expense', () => {
    localStorage.setItem('finapp_members', JSON.stringify(members));
    localStorage.setItem('finapp_goals', JSON.stringify([]));
    localStorage.setItem('finapp_transactions', JSON.stringify([
      {
        id: 'shared-expense',
        type: 'gasto',
        scope: 'shared',
        paidBy: 'member-1',
        totalAmountCents: 10000,
        splits: [
          { memberId: 'member-1', shareCents: 5000 },
          { memberId: 'member-2', shareCents: 5000 }
        ]
      },
      {
        id: 'settlement',
        type: 'gasto',
        scope: 'shared',
        isSettlement: true,
        paidBy: 'member-2',
        receiverMemberId: 'member-1',
        totalAmountCents: 5000
      }
    ]));

    renderProvider();

    const summary = JSON.parse(screen.getByTestId('summary').textContent);
    expect(summary.totalSharedOverallCents).toBe(10000);
    expect(summary.totalExpense).toBe(50);
    expect(summary.settlement.totalSharedSpentCents).toBe(10000);
  });

  it('treats totalAmountCents as cents when no decimal amount is supplied', () => {
    renderProvider();
    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }));

    const transactions = JSON.parse(screen.getByTestId('transactions').textContent);
    expect(transactions[0].totalAmountCents).toBe(1250);
    expect(transactions[0].amount).toBe(12.5);
  });

  it('preserves an explicit zero-cent amount instead of falling back to the decimal amount', () => {
    localStorage.setItem('finapp_transactions', JSON.stringify([
      { id: 'zero-cents', amount: 99, totalAmountCents: 0, type: 'gasto', scope: 'personal', paidBy: 'member-1' }
    ]));

    renderProvider();

    const summary = JSON.parse(screen.getByTestId('summary').textContent);
    const transactions = JSON.parse(screen.getByTestId('transactions').textContent);
    expect(transactions[0].amount).toBe(0);
    expect(summary.totalCashPaidCents).toBe(0);
  });
});
