/**
 * FinApp Shared - Settlement Engine
 * Computes net balances and simplified debt settlement between participants.
 */

import { toCents } from './money';

export function calculateSettlement(transactions = [], members = []) {
  if (!members || members.length === 0) {
    return {
      memberBalances: {},
      debtSummary: null,
      isSettled: true,
      totalSharedSpentCents: 0
    };
  }

  const memberBalances = {};
  members.forEach(m => {
    memberBalances[m.id] = {
      memberId: m.id,
      name: m.name,
      totalPaidCents: 0,
      totalOwedShareCents: 0,
      netBalanceCents: 0
    };
  });

  let totalSharedSpentCents = 0;

  // Filter shared movements
  const sharedMovements = transactions.filter(t => t.scope === 'shared');

  sharedMovements.forEach(tx => {
    const totalCents = Math.round(Number(tx.totalAmountCents ?? toCents(tx.amount)) || 0);
    const paidById = tx.paidByMemberId || tx.paidBy;

    // Handle settlement payments (one paying the other)
    if (tx.isSettlement) {
      const receiverId = tx.receiverMemberId;
      if (memberBalances[paidById]) {
        memberBalances[paidById].totalPaidCents += totalCents;
      }
      if (memberBalances[receiverId]) {
        memberBalances[receiverId].totalOwedShareCents += totalCents;
      }
      return;
    }

    totalSharedSpentCents += totalCents;

    // Credit the payer
    if (memberBalances[paidById]) {
      memberBalances[paidById].totalPaidCents += totalCents;
    }

    // Debit each member's share
    if (Array.isArray(tx.splits) && tx.splits.length > 0) {
      tx.splits.forEach(split => {
        if (memberBalances[split.memberId]) {
          memberBalances[split.memberId].totalOwedShareCents += Math.round(Number(split.shareCents || 0));
        }
      });
    } else {
      // Fallback if legacy split: 50/50
      const half = Math.floor(totalCents / members.length);
      members.forEach((m, idx) => {
        const extra = idx === 0 ? totalCents % members.length : 0;
        memberBalances[m.id].totalOwedShareCents += (half + extra);
      });
    }
  });

  // Calculate Net Balances: Net = Paid - OwedShare
  members.forEach(m => {
    const b = memberBalances[m.id];
    b.netBalanceCents = b.totalPaidCents - b.totalOwedShareCents;
  });

  // For 2 members, determine who owes whom
  let debtSummary = null;
  let isSettled = true;

  if (members.length === 2) {
    const m1 = members[0];
    const m2 = members[1];
    const b1 = memberBalances[m1.id].netBalanceCents;
    const b2 = memberBalances[m2.id].netBalanceCents;

    if (b1 > 0) {
      // Member 2 owes Member 1
      isSettled = false;
      debtSummary = {
        debtorId: m2.id,
        debtorName: m2.name,
        creditorId: m1.id,
        creditorName: m1.name,
        amountCents: b1,
        message: `${m2.name} le debe a ${m1.name}`
      };
    } else if (b2 > 0) {
      // Member 1 owes Member 2
      isSettled = false;
      debtSummary = {
        debtorId: m1.id,
        debtorName: m1.name,
        creditorId: m2.id,
        creditorName: m2.name,
        amountCents: b2,
        message: `${m1.name} le debe a ${m2.name}`
      };
    } else {
      isSettled = true;
      debtSummary = {
        amountCents: 0,
        message: '¡Están al día! Sin deudas pendientes.'
      };
    }
  }

  return {
    memberBalances,
    debtSummary,
    isSettled,
    totalSharedSpentCents
  };
}
