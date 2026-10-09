import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { toCents, fromCents, formatMoneyCents, addCents, subtractCents, CURRENCY_SYMBOLS } from '../utils/money';
import { splitEqual, splitProportional, splitCustom } from '../utils/splitEngine';
import { calculateSettlement } from '../utils/settlement';

const FinAppContext = createContext();

export const CATEGORIES = [
  { id: 'comida', label: 'Comida', groupName: 'Alimentación', emoji: '🍔', color: '#6366f1' },
  { id: 'viaje', label: 'Viaje', groupName: 'Transporte', emoji: '🚗', color: '#334155' },
  { id: 'hogar', label: 'Hogar', groupName: 'Vivienda y Servicios', emoji: '🏠', color: '#10b981' },
  { id: 'luz', label: 'Luz/Agua', groupName: 'Vivienda y Servicios', emoji: '💡', color: '#0ea5e9' },
  { id: 'ocio', label: 'Ocio', groupName: 'Ocio y Entretenimiento', emoji: '🎬', color: '#8b5cf6' },
  { id: 'compras', label: 'Compras', groupName: 'Compras', emoji: '🛍️', color: '#ec4899' },
  { id: 'salud', label: 'Salud', groupName: 'Salud y Otros', emoji: '💊', color: '#14b8a6' },
  { id: 'otros', label: 'Otros', groupName: 'Salud y Otros', emoji: '📦', color: '#94a3b8' },
];

export const PAYMENT_METHODS = [
  { id: 'debito', label: 'Débito', icon: 'credit-card' },
  { id: 'efectivo', label: 'Efectivo', icon: 'cash' },
  { id: 'credito', label: 'Crédito', icon: 'credit-card-alt' },
];

export const CURRENCIES = {
  EUR: { symbol: '€', code: 'EUR', label: 'EUR €' },
  USD: { symbol: '$', code: 'USD', label: 'USD $' },
  PEN: { symbol: 'S/.', code: 'PEN', label: 'PEN S/' }
};

export const INITIAL_MEMBERS = [
  {
    id: 'member-1',
    name: 'Lucía',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    monthlyIncomeCents: 250000, // 2,500.00 €
    isCurrentUser: true
  },
  {
    id: 'member-2',
    name: 'Carlos',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    monthlyIncomeCents: 180000, // 1,800.00 €
    isCurrentUser: false
  }
];

// Rich, authentic demo dataset demonstrating both personal and shared movements
export const DEMO_TRANSACTIONS = [
  {
    id: 'tx-1',
    concept: 'Compra Supermercado Quincenal',
    note: 'Carrefour Central',
    category: 'comida',
    categoryName: 'Alimentación',
    method: 'Débito',
    paymentType: 'debito',
    type: 'gasto',
    scope: 'shared',
    paidBy: 'member-1', // Lucía pagó
    totalAmountCents: 12000, // 120.00 €
    amount: 120.00,
    splitMethod: '50_50',
    splits: [
      { memberId: 'member-1', name: 'Lucía', shareCents: 6000, percentage: 50 },
      { memberId: 'member-2', name: 'Carlos', shareCents: 6000, percentage: 50 }
    ],
    dateText: 'Hoy, 14:20',
    fullDate: '2026-10-09T14:20:00.000Z',
    status: 'Completado'
  },
  {
    id: 'tx-2',
    concept: 'Alquiler Piso Compartido',
    note: 'Inmobiliaria Horizonte',
    category: 'hogar',
    categoryName: 'Vivienda y Servicios',
    method: 'Débito',
    paymentType: 'debito',
    type: 'gasto',
    scope: 'shared',
    paidBy: 'member-1', // Lucía pagó
    totalAmountCents: 90000, // 900.00 €
    amount: 900.00,
    splitMethod: 'proportional', // 2500 vs 1800 -> 58.14% vs 41.86%
    splits: [
      { memberId: 'member-1', name: 'Lucía', shareCents: 52326, percentage: 58.14 },
      { memberId: 'member-2', name: 'Carlos', shareCents: 37674, percentage: 41.86 }
    ],
    dateText: '05 Oct, 09:00',
    fullDate: '2026-10-05T09:00:00.000Z',
    status: 'Completado'
  },
  {
    id: 'tx-3',
    concept: 'Cena Aniversario Bistro',
    note: 'Regalo especial',
    category: 'ocio',
    categoryName: 'Ocio y Entretenimiento',
    method: 'Crédito',
    paymentType: 'credito',
    type: 'gasto',
    scope: 'shared',
    paidBy: 'member-2', // Carlos pagó
    totalAmountCents: 8000, // 80.00 €
    amount: 80.00,
    splitMethod: 'custom',
    customMode: 'percentage',
    splits: [
      { memberId: 'member-1', name: 'Lucía', shareCents: 3200, percentage: 40 },
      { memberId: 'member-2', name: 'Carlos', shareCents: 4800, percentage: 60 }
    ],
    dateText: '03 Oct, 21:30',
    fullDate: '2026-10-03T21:30:00.000Z',
    status: 'Completado'
  },
  {
    id: 'tx-4',
    concept: 'Nómina Mensual Lucía',
    note: 'Empresa Tecnológica S.A.',
    category: 'otros',
    categoryName: 'Ingreso',
    method: 'Débito',
    paymentType: 'debito',
    type: 'ingreso',
    scope: 'personal',
    paidBy: 'member-1',
    totalAmountCents: 250000, // 2,500.00 €
    amount: 2500.00,
    dateText: '01 Oct, 08:00',
    fullDate: '2026-10-01T08:00:00.000Z',
    status: 'Completado'
  },
  {
    id: 'tx-5',
    concept: 'Farmacia y Cosmética Personal',
    note: 'Farmacia San Pablo',
    category: 'salud',
    categoryName: 'Salud y Otros',
    method: 'Efectivo',
    paymentType: 'efectivo',
    type: 'gasto',
    scope: 'personal',
    paidBy: 'member-1',
    totalAmountCents: 2450, // 24.50 €
    amount: 24.50,
    dateText: '07 Oct, 11:15',
    fullDate: '2026-10-07T11:15:00.000Z',
    status: 'Completado'
  },
  {
    id: 'tx-6',
    concept: 'Recibo Fibra Óptica y Móvil',
    note: 'Vodafone Hogar',
    category: 'luz',
    categoryName: 'Vivienda y Servicios',
    method: 'Débito',
    paymentType: 'debito',
    type: 'gasto',
    scope: 'shared',
    paidBy: 'member-2', // Carlos pagó
    totalAmountCents: 5000, // 50.00 €
    amount: 50.00,
    splitMethod: '50_50',
    splits: [
      { memberId: 'member-1', name: 'Lucía', shareCents: 2500, percentage: 50 },
      { memberId: 'member-2', name: 'Carlos', shareCents: 2500, percentage: 50 }
    ],
    dateText: '02 Oct, 10:00',
    fullDate: '2026-10-02T10:00:00.000Z',
    status: 'Completado'
  }
];

export const DEMO_GOALS = [
  {
    id: 'goal-1',
    title: 'Viaje a Japón',
    description: 'Ahorro conjunto para vuelo y hospedaje en Tokio',
    targetAmountCents: 400000, // 4,000.00 €
    currentAmountCents: 300000, // 3,000.00 €
    targetAmount: 4000,
    currentAmount: 3000,
    targetDate: 'Dic 2026',
    timeLeftText: 'Faltan 2 meses',
    contributionInfo: '250 € aportados este mes',
    icon: 'plane',
    scope: 'shared'
  },
  {
    id: 'goal-2',
    title: 'Fondo de Emergencia',
    description: 'Colchón de seguridad para 3 meses de gastos',
    targetAmountCents: 300000, // 3,000.00 €
    currentAmountCents: 135000, // 1,350.00 €
    targetAmount: 3000,
    currentAmount: 1350,
    targetDate: 'Mar 2027',
    timeLeftText: 'Faltan 5 meses',
    contributionInfo: 'Ritmo: 150 € / mes',
    icon: 'shield',
    scope: 'personal'
  },
  {
    id: 'goal-3',
    title: 'Renovación Laptop Pro',
    description: 'Equipo de trabajo y diseño para el hogar',
    targetAmountCents: 250000, // 2,500.00 €
    currentAmountCents: 65000, // 650.00 €
    targetAmount: 2500,
    currentAmount: 650,
    targetDate: 'Ene 2027',
    timeLeftText: 'Faltan 3 meses',
    contributionInfo: 'Faltan 1.850 €',
    icon: 'laptop',
    scope: 'personal'
  }
];

export function FinAppProvider({ children }) {
  // Navigation active tab: 'dashboard' | 'gastos' | 'metas'
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('finapp_active_tab') || 'dashboard';
  });

  // Selected Currency
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('finapp_currency') || 'EUR';
  });

  // Balance visibility toggle
  const [showBalance, setShowBalance] = useState(() => {
    const saved = localStorage.getItem('finapp_show_balance');
    return saved !== null ? saved === 'true' : true;
  });

  // Time evolution filter for charts: 'Sem' | 'Mes' | 'Año'
  const [evolutionPeriod, setEvolutionPeriod] = useState('Mes');

  // Preview Mode: 'responsive' | 'mobile-mockup' | 'desktop-mockup'
  const [previewDevice, setPreviewDevice] = useState('responsive');

  // Members / Participants State
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('finapp_members');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return INITIAL_MEMBERS;
  });

  // Transactions State (with migration to integer cents)
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('finapp_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize and migrate
          return parsed.map(t => ({
            ...t,
            totalAmountCents: t.totalAmountCents ?? toCents(t.amount),
            amount: t.totalAmountCents !== null && t.totalAmountCents !== undefined
              ? fromCents(t.totalAmountCents)
              : Number(t.amount || 0),
            scope: t.scope || 'personal',
            paidBy: t.paidBy || 'member-1'
          }));
        }
      } catch (e) { /* ignore */ }
    }
    return DEMO_TRANSACTIONS;
  });

  // Goals State (with migration to integer cents)
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('finapp_goals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(g => ({
            ...g,
            targetAmountCents: g.targetAmountCents ?? toCents(g.targetAmount),
            currentAmountCents: g.currentAmountCents ?? toCents(g.currentAmount),
            targetAmount: g.targetAmountCents ? fromCents(g.targetAmountCents) : Number(g.targetAmount || 0),
            currentAmount: g.currentAmountCents ? fromCents(g.currentAmountCents) : Number(g.currentAmount || 0)
          }));
        }
      } catch (e) { /* ignore */ }
    }
    return DEMO_GOALS;
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('finapp_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('finapp_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('finapp_show_balance', String(showBalance));
  }, [showBalance]);

  useEffect(() => {
    localStorage.setItem('finapp_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('finapp_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finapp_goals', JSON.stringify(goals));
  }, [goals]);

  // Current active user
  const currentUser = useMemo(() => {
    return members.find(m => m.isCurrentUser) || members[0] || { id: 'member-1', name: 'Usuario' };
  }, [members]);

  // Partner user (second participant)
  const partnerUser = useMemo(() => {
    return members.find(m => !m.isCurrentUser) || members[1] || { id: 'member-2', name: 'Pareja' };
  }, [members]);

  // Core Financial Engine & Summaries
  const financialSummary = useMemo(() => {
    let totalIncomeCents = 0;
    let totalCashPaidCents = 0; // Total money out of active user's pocket
    let userPersonalExpenseCents = 0; // User's actual financial responsibility
    let totalSharedOverallCents = 0;

    // Category breakdown in cents (true dynamic calculation)
    const categoryTotalsCents = {};
    CATEGORIES.forEach(c => { categoryTotalsCents[c.groupName] = 0; });

    transactions.forEach(t => {
      const cents = Math.round(Number(t.totalAmountCents ?? toCents(t.amount)) || 0);

      if (t.type === 'ingreso') {
        if (t.paidBy === currentUser.id) {
          totalIncomeCents += cents;
        }
      } else if (t.type === 'gasto') {
        // Did the current user pay this bill?
        if (t.paidBy === currentUser.id) {
          totalCashPaidCents += cents;
        }

        // A settlement moves cash between members but is not a new expense.
        if (t.isSettlement) return;

        // What portion corresponds to current user?
        if (t.scope === 'personal') {
          if (t.paidBy === currentUser.id) {
            userPersonalExpenseCents += cents;
            const group = t.categoryName || 'Otros';
            categoryTotalsCents[group] = (categoryTotalsCents[group] || 0) + cents;
          }
        } else if (t.scope === 'shared') {
          totalSharedOverallCents += cents;
          // Look up user's share in splits
          let userShare = 0;
          if (Array.isArray(t.splits)) {
            const userSplit = t.splits.find(s => s.memberId === currentUser.id);
            userShare = userSplit ? userSplit.shareCents : Math.floor(cents / 2);
          } else {
            userShare = Math.floor(cents / 2);
          }
          userPersonalExpenseCents += userShare;
          const group = t.categoryName || 'Otros';
          categoryTotalsCents[group] = (categoryTotalsCents[group] || 0) + userShare;
        }
      }
    });

    // Available cash balance for the active user: Income - Actual Outflow Paid
    const availableBalanceCents = totalIncomeCents - totalCashPaidCents;

    // Debt Settlement
    const settlement = calculateSettlement(transactions, members);

    // Savings goals total in cents
    const totalGoalTargetCents = goals.reduce((sum, g) => sum + Number(g.targetAmountCents || g.targetAmount * 100 || 0), 0);
    const totalGoalSavedCents = goals.reduce((sum, g) => sum + Number(g.currentAmountCents || g.currentAmount * 100 || 0), 0);
    const goalPercentage = totalGoalTargetCents > 0 ? (totalGoalSavedCents / totalGoalTargetCents) * 100 : 0;
    const remainingToSaveCents = Math.max(0, totalGoalTargetCents - totalGoalSavedCents);

    return {
      availableBalanceCents,
      totalIncomeCents,
      totalCashPaidCents,
      userPersonalExpenseCents,
      totalSharedOverallCents,
      availableBalance: fromCents(availableBalanceCents),
      totalIncome: fromCents(totalIncomeCents),
      totalExpense: fromCents(userPersonalExpenseCents),
      netSavings: fromCents(availableBalanceCents),
      totalGoalTarget: fromCents(totalGoalTargetCents),
      totalGoalSaved: fromCents(totalGoalSavedCents),
      goalPercentage,
      remainingToSave: fromCents(remainingToSaveCents),
      categoryTotalsCents,
      settlement
    };
  }, [transactions, goals, members, currentUser]);

  // Formatter using integer cents
  const formatMoney = (val) => {
    const cents = toCents(val);
    return formatMoneyCents(cents, currency);
  };

  const formatRawMoney = (val) => {
    return (fromCents(toCents(val))).toLocaleString('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Add Movement (Expense or Income)
  const addTransaction = (tx) => {
    const totalCents = tx.totalAmountCents !== undefined && tx.totalAmountCents !== null
      ? Math.round(Number(tx.totalAmountCents) || 0)
      : toCents(tx.amount);
    const isShared = tx.scope === 'shared';
    const payerId = tx.paidBy || currentUser.id;

    let splits = [];
    if (isShared) {
      if (tx.splitMethod === '50_50') {
        splits = splitEqual(totalCents, members, payerId).splits;
      } else if (tx.splitMethod === 'proportional') {
        splits = splitProportional(totalCents, members, payerId).splits;
      } else if (tx.splitMethod === 'custom') {
        splits = splitCustom(totalCents, members, tx.customConfig, payerId).splits;
      }
    }

    const newTx = {
      id: tx.id || 'tx-' + Date.now(),
      concept: tx.concept || 'Movimiento sin concepto',
      note: tx.note || '',
      category: tx.category || 'otros',
      categoryName: tx.categoryName || 'Otros',
      method: tx.method || 'Débito',
      paymentType: tx.paymentType || 'debito',
      totalAmountCents: totalCents,
      amount: fromCents(totalCents),
      type: tx.type || 'gasto',
      scope: tx.scope || 'personal',
      paidBy: payerId,
      splitMethod: isShared ? (tx.splitMethod || '50_50') : null,
      customMode: tx.customConfig?.mode || null,
      splits: isShared ? splits : [],
      dateText: tx.dateText || 'Hoy, ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      fullDate: tx.fullDate || new Date().toISOString(),
      status: 'Completado'
    };

    setTransactions(prev => [newTx, ...prev]);
    return newTx;
  };

  // Update existing transaction
  const updateTransaction = (id, updatedFields) => {
    setTransactions(prev => prev.map(t => {
      if (t.id !== id) return t;
      const totalCents = updatedFields.totalAmountCents !== undefined && updatedFields.totalAmountCents !== null
        ? Math.round(Number(updatedFields.totalAmountCents) || 0)
        : updatedFields.amount !== undefined
          ? toCents(updatedFields.amount)
          : t.totalAmountCents;
      const isShared = updatedFields.scope !== undefined ? updatedFields.scope === 'shared' : t.scope === 'shared';
      const payerId = updatedFields.paidBy || t.paidBy || currentUser.id;
      const splitMethod = updatedFields.splitMethod || t.splitMethod || '50_50';

      let splits = t.splits;
      if (isShared) {
        if (splitMethod === '50_50') {
          splits = splitEqual(totalCents, members, payerId).splits;
        } else if (splitMethod === 'proportional') {
          splits = splitProportional(totalCents, members, payerId).splits;
        } else if (splitMethod === 'custom' && updatedFields.customConfig) {
          splits = splitCustom(totalCents, members, updatedFields.customConfig, payerId).splits;
        }
      } else {
        splits = [];
      }

      return {
        ...t,
        ...updatedFields,
        totalAmountCents: totalCents,
        amount: fromCents(totalCents),
        splits,
        splitMethod: isShared ? splitMethod : null
      };
    }));
  };

  // Delete transaction
  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Record a debt settlement payment between members
  const recordSettlement = (debtorId, creditorId, amountCents) => {
    const debtor = members.find(m => m.id === debtorId);
    const creditor = members.find(m => m.id === creditorId);
    const cents = Math.round(Number(amountCents) || 0);

    if (cents <= 0) return;

    const settlementTx = {
      id: 'settle-' + Date.now(),
      concept: `Liquidación: ${debtor?.name} liquidó deuda con ${creditor?.name}`,
      note: 'Pago de saldo pendiente compartido',
      category: 'otros',
      categoryName: 'Liquidación',
      method: 'Transferencia',
      paymentType: 'debito',
      totalAmountCents: cents,
      amount: fromCents(cents),
      type: 'gasto',
      scope: 'shared',
      isSettlement: true,
      paidBy: debtorId,
      receiverMemberId: creditorId,
      dateText: 'Hoy, ' + new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      fullDate: new Date().toISOString(),
      status: 'Completado'
    };

    setTransactions(prev => [settlementTx, ...prev]);
  };

  // Update member profile (name, monthly income)
  const updateMember = (id, fields) => {
    setMembers(prev => prev.map(m => {
      if (m.id !== id) return m;
      return {
        ...m,
        ...fields,
        monthlyIncomeCents: fields.monthlyIncome !== undefined ? toCents(fields.monthlyIncome) : m.monthlyIncomeCents
      };
    }));
  };

  // Add Goal
  const addGoal = (newGoal) => {
    const targetCents = toCents(newGoal.targetAmount);
    const currentCents = toCents(newGoal.currentAmount || 0);

    const goal = {
      id: 'goal-' + Date.now(),
      title: newGoal.title || 'Nueva Meta',
      description: newGoal.description || 'Objetivo personal',
      targetAmountCents: targetCents,
      currentAmountCents: currentCents,
      targetAmount: fromCents(targetCents),
      currentAmount: fromCents(currentCents),
      targetDate: newGoal.targetDate || 'Dic 2026',
      timeLeftText: newGoal.timeLeftText || 'En progreso',
      contributionInfo: '0 € aportados este mes',
      icon: newGoal.icon || 'shield',
      scope: newGoal.scope || 'personal'
    };
    setGoals(prev => [...prev, goal]);
  };

  // Edit Goal
  const updateGoal = (id, updates) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== id) return g;
      const targetCents = updates.targetAmount !== undefined ? toCents(updates.targetAmount) : g.targetAmountCents;
      const currentCents = updates.currentAmount !== undefined ? toCents(updates.currentAmount) : g.currentAmountCents;
      return {
        ...g,
        ...updates,
        targetAmountCents: targetCents,
        currentAmountCents: currentCents,
        targetAmount: fromCents(targetCents),
        currentAmount: fromCents(currentCents)
      };
    }));
  };

  // Contribute money to goal
  const contributeToGoal = (goalId, amount) => {
    const addCentsVal = toCents(amount);
    if (addCentsVal <= 0) return;

    setGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        const updatedCents = g.currentAmountCents + addCentsVal;
        return {
          ...g,
          currentAmountCents: updatedCents,
          currentAmount: fromCents(updatedCents),
          contributionInfo: `+${formatMoneyCents(addCentsVal, currency)} aportados hoy`
        };
      }
      return g;
    }));
  };

  // Delete Goal
  const deleteGoal = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Reset to demo data
  const resetDemoData = () => {
    setMembers(INITIAL_MEMBERS);
    setTransactions(DEMO_TRANSACTIONS);
    setGoals(DEMO_GOALS);
  };

  return (
    <FinAppContext.Provider value={{
      activeTab,
      setActiveTab,
      currency,
      setCurrency,
      showBalance,
      setShowBalance,
      evolutionPeriod,
      setEvolutionPeriod,
      previewDevice,
      setPreviewDevice,
      members,
      currentUser,
      partnerUser,
      updateMember,
      transactions,
      goals,
      financialSummary,
      formatMoney,
      formatRawMoney,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      recordSettlement,
      addGoal,
      updateGoal,
      contributeToGoal,
      deleteGoal,
      resetDemoData
    }}>
      {children}
    </FinAppContext.Provider>
  );
}

export function useFinApp() {
  const context = useContext(FinAppContext);
  if (!context) {
    throw new Error('useFinApp must be used within FinAppProvider');
  }
  return context;
}
