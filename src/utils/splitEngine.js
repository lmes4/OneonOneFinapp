/**
 * FinApp Shared - Split Engine
 * Deterministic split calculations in integer cents with invariant enforcement.
 */

import { addCents } from './money';

/**
 * Method 1: Equal Split (50/50 for 2 members, or 1/N)
 * Policy: Remainder cents (modulo) are allocated to the payer to prevent decimal leakage.
 */
export function splitEqual(totalCents, members, payerId) {
  const safeTotal = Math.max(0, Math.round(Number(totalCents) || 0));
  if (!members || members.length === 0) return { splits: [], splitMethod: '50_50', totalCents: safeTotal };

  const n = members.length;
  const baseShare = Math.floor(safeTotal / n);
  const remainder = safeTotal % n;

  // Identify payer index for deterministic remainder assignment
  const payerIndex = Math.max(0, members.findIndex(m => m.id === payerId));

  const splits = members.map((member, index) => {
    // If there is a remainder, the payer receives +1 cent. If remainder > 1, distributed in order from payer
    const getsExtraCent = index === payerIndex && remainder > 0;
    const shareCents = baseShare + (getsExtraCent ? remainder : 0);
    const percentage = safeTotal > 0 ? Number(((shareCents / safeTotal) * 100).toFixed(2)) : Number((100 / n).toFixed(2));

    return {
      memberId: member.id,
      name: member.name,
      shareCents,
      percentage
    };
  });

  return {
    splitMethod: '50_50',
    totalCents: safeTotal,
    splits
  };
}

/**
 * Method 2: Proportional to Monthly Income
 * Formula: ratio_i = income_i / sum(income)
 * Edge cases:
 * - If sum(income) === 0: Fallback to 50/50 equal distribution.
 * - If one has income > 0 and other has 0: The earner assumes 100%.
 * - Residual cents: allocated to the higher earner.
 */
export function splitProportional(totalCents, members, payerId) {
  const safeTotal = Math.max(0, Math.round(Number(totalCents) || 0));
  if (!members || members.length === 0) return { splits: [], splitMethod: 'proportional', totalCents: safeTotal };

  const totalIncomeCents = members.reduce((sum, m) => sum + Math.max(0, Number(m.monthlyIncomeCents) || 0), 0);

  // Edge case: All incomes are 0 -> Clean fallback to equal 50/50
  if (totalIncomeCents === 0) {
    const equalResult = splitEqual(safeTotal, members, payerId);
    return {
      ...equalResult,
      splitMethod: 'proportional',
      fallbackToEqual: true
    };
  }

  // Calculate base shares and find highest earner for residual allocation
  let highestEarnerIndex = 0;
  let maxIncome = -1;

  members.forEach((m, idx) => {
    const income = Math.max(0, Number(m.monthlyIncomeCents) || 0);
    if (income > maxIncome) {
      maxIncome = income;
      highestEarnerIndex = idx;
    }
  });

  let allocatedCents = 0;
  const initialShares = members.map((member) => {
    const income = Math.max(0, Number(member.monthlyIncomeCents) || 0);
    const ratio = income / totalIncomeCents;
    const share = Math.floor(safeTotal * ratio);
    allocatedCents += share;
    return share;
  });

  // Distribute residual cents to highest earner
  const residualCents = safeTotal - allocatedCents;
  initialShares[highestEarnerIndex] += residualCents;

  const splits = members.map((member, idx) => {
    const shareCents = initialShares[idx];
    const percentage = safeTotal > 0 ? Number(((shareCents / safeTotal) * 100).toFixed(2)) : 0;
    return {
      memberId: member.id,
      name: member.name,
      shareCents,
      percentage,
      incomeCents: member.monthlyIncomeCents || 0
    };
  });

  return {
    splitMethod: 'proportional',
    totalCents: safeTotal,
    splits,
    fallbackToEqual: false
  };
}

/**
 * Method 3: Custom Split (by percentage or by fixed amount)
 * Validates exact 100% total or exact cent balance.
 */
export function splitCustom(totalCents, members, config = {}, payerId) {
  const safeTotal = Math.max(0, Math.round(Number(totalCents) || 0));
  const mode = config.mode || 'percentage'; // 'percentage' | 'amount'
  if (!members || members.length === 0) return { splits: [], splitMethod: 'custom', totalCents: safeTotal };

  if (mode === 'percentage') {
    const percentages = config.percentages || {};
    const sumPct = members.reduce((sum, m) => sum + (Number(percentages[m.id]) || 0), 0);

    // Tolerance for floating UI input (e.g. 50 + 50 = 100)
    const isValidSum = Math.abs(sumPct - 100) < 0.05;
    if (!isValidSum && safeTotal > 0) {
      throw new Error(`Los porcentajes personalizados deben sumar exactamente 100%. Suma actual: ${sumPct.toFixed(1)}%`);
    }

    let allocatedCents = 0;
    let highestPctIndex = 0;
    let maxPct = -1;

    members.forEach((m, idx) => {
      const pct = Number(percentages[m.id]) || 0;
      if (pct > maxPct) {
        maxPct = pct;
        highestPctIndex = idx;
      }
    });

    const initialShares = members.map((member) => {
      const pct = Number(percentages[member.id]) || 0;
      const share = Math.floor(safeTotal * (pct / 100));
      allocatedCents += share;
      return share;
    });

    // Remainder cent goes to the member with the highest percentage
    const residual = safeTotal - allocatedCents;
    initialShares[highestPctIndex] += residual;

    const splits = members.map((member, idx) => ({
      memberId: member.id,
      name: member.name,
      shareCents: initialShares[idx],
      percentage: Number(percentages[member.id]) || 0
    }));

    return {
      splitMethod: 'custom',
      customMode: 'percentage',
      totalCents: safeTotal,
      splits
    };
  } else {
    // Mode: fixed amount in cents
    const amounts = config.amounts || {};
    const sumAmounts = members.reduce((sum, m) => sum + (Number(amounts[m.id]) || 0), 0);

    if (sumAmounts !== safeTotal && safeTotal > 0) {
      throw new Error(`La suma de los importes personalizados (${(sumAmounts / 100).toFixed(2)}) no coincide con el total (${(safeTotal / 100).toFixed(2)})`);
    }

    const splits = members.map((member) => {
      const shareCents = Math.round(Number(amounts[member.id]) || 0);
      const percentage = safeTotal > 0 ? Number(((shareCents / safeTotal) * 100).toFixed(2)) : 0;
      return {
        memberId: member.id,
        name: member.name,
        shareCents,
        percentage
      };
    });

    return {
      splitMethod: 'custom',
      customMode: 'amount',
      totalCents: safeTotal,
      splits
    };
  }
}
