import React, { useState } from 'react';
import { useFinApp, CATEGORIES } from '../../context/FinAppContext';
import { fromCents, formatMoneyCents } from '../../utils/money';
import { 
  Eye, 
  EyeOff, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  Check, 
  Info, 
  ChevronRight, 
  Shield, 
  Plane, 
  Laptop, 
  Receipt,
  Download,
  Filter,
  Trash2,
  Edit3,
  TrendingUp,
  CreditCard,
  Building,
  Utensils,
  Car,
  Tv,
  HeartPulse,
  Users,
  User,
  Scale,
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';
import { DonutChart, EvolutionChart } from './FinancialCharts';

export default function DashboardView({ isMobile = false }) {
  const { 
    financialSummary, 
    formatMoney, 
    currency,
    showBalance, 
    setShowBalance, 
    setActiveTab,
    evolutionPeriod,
    setEvolutionPeriod,
    goals,
    transactions,
    deleteTransaction,
    members,
    currentUser,
    partnerUser,
    recordSettlement
  } = useFinApp();

  const [txSearch, setTxSearch] = useState('');
  const [txCategoryFilter, setTxCategoryFilter] = useState('all');
  const [txScopeFilter, setTxScopeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSettlementModal, setShowSettlementModal] = useState(false);

  // Settlement details
  const settlement = financialSummary.settlement;
  const debtSummary = settlement?.debtSummary;

  // Filter transactions for table
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.concept.toLowerCase().includes(txSearch.toLowerCase()) ||
                          t.note.toLowerCase().includes(txSearch.toLowerCase());
    const matchesCategory = txCategoryFilter === 'all' || t.category === txCategoryFilter;
    const matchesScope = txScopeFilter === 'all' || t.scope === txScopeFilter;
    return matchesSearch && matchesCategory && matchesScope;
  });

  const pageSize = 5;
  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedTransactions = filteredTransactions.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  // Dynamic Category breakdown data from real transactions
  const categoryChartData = Object.entries(financialSummary.categoryTotalsCents || {}).map(([label, cents]) => {
    let color = '#94a3b8';
    let icon = HeartPulse;
    if (label.includes('Vivienda')) { color = '#10b981'; icon = Building; }
    else if (label.includes('Aliment')) { color = '#4f46e5'; icon = Utensils; }
    else if (label.includes('Transporte')) { color = '#334155'; icon = Car; }
    else if (label.includes('Ocio')) { color = '#8b5cf6'; icon = Tv; }
    else if (label.includes('Salud')) { color = '#14b8a6'; icon = HeartPulse; }

    return {
      label,
      amount: fromCents(cents),
      cents,
      color,
      icon
    };
  }).filter(c => c.amount > 0);

  // Export report function
  const handleExportReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Fecha,Concepto,Categoria,Metodo,Tipo,Ambito,Pagador,Monto\n" +
      transactions.map(t => `"${t.dateText}","${t.concept}","${t.categoryName}","${t.method}","${t.type}","${t.scope}","${t.paidBy}",${t.amount}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `FinApp_Shared_Reporte_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ===================== MOBILE VIEW =====================
  if (isMobile) {
    return (
      <div className="space-y-4 pb-24 px-4 pt-1" data-testid="dashboard-view">
        {/* Card: Saldo Total Disponible Personal */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Saldo Disponible (Caja)</span>
              <button 
                type="button"
                onClick={() => setShowBalance(!showBalance)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
                title={showBalance ? "Ocultar saldo" : "Mostrar saldo"}
              >
                {showBalance ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {financialSummary.availableBalance >= 0 ? 'En superávit' : 'Saldo deudor'}
            </span>
          </div>

          {/* Main Amount */}
          <div className="mb-4">
            <div 
              data-testid="available-balance-display"
              className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-1.5"
            >
              <span>{showBalance ? formatMoney(financialSummary.availableBalance) : '••••••••'}</span>
              <span className="text-xs font-semibold text-slate-400 uppercase">{currency}</span>
            </div>
          </div>

          {/* Ingresos vs Gastos Sub-cards */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100/80">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span>Tus Ingresos</span>
                <span className="w-5 h-5 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center">
                  <ArrowDownLeft className="w-3 h-3 stroke-[2.5]" />
                </span>
              </div>
              <p className="text-base font-bold text-slate-900">
                {showBalance ? formatMoney(financialSummary.totalIncome) : '••••'}
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Nómina y otros</p>
            </div>

            <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100/80">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
                <span>Tu Gasto Real</span>
                <span className="w-5 h-5 rounded-full bg-rose-100/80 text-rose-600 flex items-center justify-center">
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                </span>
              </div>
              <p className="text-base font-bold text-slate-900">
                {showBalance ? formatMoney(financialSummary.totalExpense) : '••••'}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Personal + tu cuota</p>
            </div>
          </div>
        </div>

        {/* Card: Gastos Compartidos y Cuentas Claras (Settlement) */}
        <div className="bg-gradient-to-br from-indigo-50/80 via-white to-emerald-50/50 rounded-3xl p-5 border border-indigo-100/80 shadow-sm space-y-3" data-testid="settlement-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Cuentas Claras en Pareja</h3>
                <p className="text-[10px] text-slate-500">{currentUser.name} & {partnerUser.name}</p>
              </div>
            </div>

            {debtSummary && debtSummary.amountCents > 0 ? (
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                debtSummary.creditorId === currentUser.id 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {debtSummary.creditorId === currentUser.id ? 'Te deben dinero' : 'Debes dinero'}
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                Al día
              </span>
            )}
          </div>

          {/* Debt Summary Message */}
          <div className="p-3 bg-white/90 rounded-2xl border border-indigo-50 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">{debtSummary?.message}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Total compartido: {formatMoney(fromCents(settlement.totalSharedSpentCents))}
              </p>
            </div>
            {debtSummary && debtSummary.amountCents > 0 && (
              <span className="text-base font-extrabold text-slate-900">
                {formatMoneyCents(debtSummary.amountCents, currency)}
              </span>
            )}
          </div>

          {/* Action button: Settle debt */}
          {debtSummary && debtSummary.amountCents > 0 && (
            <button
              type="button"
              data-testid="btn-settle-debt"
              onClick={() => setShowSettlementModal(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Liquidar Saldo Pendiente</span>
            </button>
          )}
        </div>

        {/* Quick Action Banner */}
        <div className="bg-gradient-to-r from-[#0d2826] to-[#091e1d] text-white rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">¿Compraste algo hoy?</p>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">Personal o compartido en 1 clic</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setActiveTab('gastos')}
            className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors shadow-sm active:scale-95 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Nuevo</span>
          </button>
        </div>

        {/* Card: Evolución Ingresos vs Gastos */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Ingresos vs Gastos</h2>
              <p className="text-[11px] text-slate-400">Evolución en el tiempo</p>
            </div>

            <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs">
              {['Sem', 'Mes', 'Año'].map((period) => (
                <button
                  key={period}
                  type="button"
                  onClick={() => setEvolutionPeriod(period)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    evolutionPeriod === period 
                      ? 'bg-slate-900 text-white shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <EvolutionChart transactions={transactions} formatMoney={formatMoney} period={evolutionPeriod} />
        </div>

        {/* Card: Gastos por Categoría */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Gastos por Categoría</h2>
              <p className="text-[11px] text-slate-400">Distribución de tus gastos reales</p>
            </div>
          </div>

          <div className="flex items-center justify-center py-2">
            <DonutChart 
              categoryData={categoryChartData} 
              totalAmount={financialSummary.totalExpense} 
              formatMoney={formatMoney} 
            />
          </div>

          {/* Category progress list */}
          <div className="space-y-3 pt-1 border-t border-slate-50">
            {categoryChartData.map((cat, idx) => {
              const pct = financialSummary.totalExpense > 0 
                ? Math.round((cat.amount / financialSummary.totalExpense) * 100) 
                : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{cat.label}</span>
                    <span className="text-slate-900">{formatMoney(cat.amount)} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card: Metas de Ahorro Preview */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Metas de Ahorro</h2>
              <p className="text-[11px] text-slate-400">{goals.length} objetivos en curso</p>
            </div>
            <button 
              type="button"
              onClick={() => setActiveTab('metas')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
            >
              <span>Ver todas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {goals.slice(0, 2).map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div key={goal.id} className="p-3.5 bg-slate-50/70 border border-slate-100 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{goal.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {formatMoney(goal.currentAmount)} / {formatMoney(goal.targetAmount)}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-lg border border-slate-100">
                      {pct}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ===================== DESKTOP VIEW =====================
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn" data-testid="dashboard-view">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              FINAPP SHARED • CONCILIACIÓN
            </span>
            <span className="text-xs text-slate-400">• Finanzas personales y de pareja</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Panel de Control Financiero</h1>
          <p className="text-sm text-slate-500">Gestión de gastos personales, compartidos y balances de deuda</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={handleExportReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exportar CSV</span>
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('gastos')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md shadow-slate-900/10 transition-colors"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>+ Registrar Gasto</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Disponible */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>Saldo Disponible (Caja)</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span 
              data-testid="available-balance-display"
              className="text-2xl font-extrabold text-slate-900 tracking-tight"
            >
              {formatMoney(financialSummary.availableBalance)}
            </span>
            <span className="text-xs font-semibold text-slate-400 uppercase">{currency}</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Ingresos menos salidas reales de tu bolsillo
          </div>
        </div>

        {/* Card 2: Ingresos Totales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>Tus Ingresos Totales</span>
            <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatMoney(financialSummary.totalIncome)}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Nómina mensual de {currentUser.name}
          </div>
        </div>

        {/* Card 3: Gastos Reales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>Tu Responsabilidad de Gasto</span>
            <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatMoney(financialSummary.totalExpense)}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Gastos personales + tu cuota en compartidos
          </div>
        </div>

        {/* Card 4: Liquidación en Pareja */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm" data-testid="settlement-card">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
            <span>Cuentas con {partnerUser.name}</span>
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-2">
            <span className="text-2xl font-extrabold text-indigo-900 tracking-tight">
              {debtSummary ? formatMoneyCents(debtSummary.amountCents, currency) : formatMoney(0)}
            </span>
          </div>
          <div className="text-[11px] font-semibold text-slate-600">
            {debtSummary ? debtSummary.message : 'Al día'}
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (~65% / 8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Evolución de Ingresos vs Gastos */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Evolución de Ingresos vs. Gastos</h2>
                <p className="text-xs text-slate-400 mt-0.5">Histórico según tus movimientos registrados</p>
              </div>
              <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs" aria-label="Período del gráfico">
                {['Sem', 'Mes', 'Año'].map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setEvolutionPeriod(period)}
                    aria-pressed={evolutionPeriod === period}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      evolutionPeriod === period
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
            <EvolutionChart transactions={transactions} formatMoney={formatMoney} period={evolutionPeriod} />
          </div>

          {/* Últimas Transacciones y Registros (Table) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Historial de Movimientos</h2>
                <p className="text-xs text-slate-400">Registro con desglose de titularidad y método de reparto</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={txSearch}
                  onChange={(e) => { setTxSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Buscar concepto..."
                  className="pl-3 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36"
                />
                <select
                  value={txScopeFilter}
                  onChange={(e) => { setTxScopeFilter(e.target.value); setCurrentPage(1); }}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none"
                >
                  <option value="all">Todos los ámbitos</option>
                  <option value="personal">Solo Personales</option>
                  <option value="shared">Solo Compartidos</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold tracking-wider text-[11px] uppercase">
                    <th className="py-3 px-3">Fecha</th>
                    <th className="py-3 px-3">Concepto</th>
                    <th className="py-3 px-3">Ámbito</th>
                    <th className="py-3 px-3">Pagado Por</th>
                    <th className="py-3 px-3 text-right">Importe</th>
                    <th className="py-3 px-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedTransactions.map((tx) => {
                    const isIncome = tx.type === 'ingreso';
                    const isShared = tx.scope === 'shared';
                    const payerObj = members.find(m => m.id === tx.paidBy);

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                          {tx.dateText}
                        </td>
                        <td className="py-3.5 px-3">
                          <p className="font-semibold text-slate-800">{tx.concept}</p>
                          {tx.note && <p className="text-[11px] text-slate-400">{tx.note}</p>}
                        </td>
                        <td className="py-3.5 px-3">
                          {isShared ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700">
                              <Users className="w-3 h-3" /> Compartido ({tx.splitMethod || '50/50'})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600">
                              <User className="w-3 h-3" /> Personal
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">
                          {payerObj ? payerObj.name : 'Desconocido'}
                        </td>
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <span className={`font-bold ${isIncome ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {isIncome ? `+${formatMoney(tx.amount)}` : `-${formatMoney(tx.amount)}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => deleteTransaction(tx.id)}
                            className="p-1 text-slate-300 hover:text-rose-500 transition-colors rounded-md"
                            title="Eliminar registro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Mostrando {paginatedTransactions.length} de {filteredTransactions.length} movimientos</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 disabled:opacity-40"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                      safeCurrentPage === i + 1 ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (~35% / 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Distribución de Gastos */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-base font-bold text-slate-900">Distribución de Gastos</h2>
                <p className="text-xs text-slate-400">Total: {formatMoney(financialSummary.totalExpense)}</p>
              </div>
            </div>

            <div className="py-4">
              <DonutChart 
                categoryData={categoryChartData} 
                totalAmount={financialSummary.totalExpense} 
                formatMoney={formatMoney} 
                isDesktop={true}
              />
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-50">
              {categoryChartData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="font-semibold text-slate-800">{item.label}</span>
                  </div>
                  <span className="font-bold text-slate-900">{formatMoney(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Liquidación Rápida Card */}
          {debtSummary && debtSummary.amountCents > 0 && (
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-5 shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                <ArrowRightLeft className="w-4 h-4" />
                <span>Liquidación de Deuda Pendiente</span>
              </div>
              <p className="text-sm font-semibold">{debtSummary.message}</p>
              <div className="text-2xl font-extrabold text-emerald-400">
                {formatMoneyCents(debtSummary.amountCents, currency)}
              </div>
              <button
                type="button"
                data-testid="btn-settle-debt-desktop"
                onClick={() => {
                  recordSettlement(debtSummary.debtorId, debtSummary.creditorId, debtSummary.amountCents);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-md active:scale-95"
              >
                ✓ Marcar como Liquidado
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal Settlement Mobile */}
      {showSettlementModal && debtSummary && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-fadeIn space-y-4">
            <h4 className="text-base font-bold text-slate-900">Confirmar Liquidación</h4>
            <p className="text-xs text-slate-500">
              ¿Registrar pago de {formatMoneyCents(debtSummary.amountCents, currency)} para quedar al día con {partnerUser.name}?
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSettlementModal(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                data-testid="confirm-settlement-btn"
                onClick={() => {
                  recordSettlement(debtSummary.debtorId, debtSummary.creditorId, debtSummary.amountCents);
                  setShowSettlementModal(false);
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
