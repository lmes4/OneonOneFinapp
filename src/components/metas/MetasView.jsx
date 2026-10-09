import React, { useState } from 'react';
import { useFinApp } from '../../context/FinAppContext';
import { toCents, fromCents, formatMoneyCents } from '../../utils/money';
import { 
  Plus, 
  Shield, 
  Plane, 
  Laptop, 
  Car, 
  Home, 
  Gift, 
  Calendar, 
  SlidersHorizontal, 
  Check, 
  X, 
  Trash2, 
  Edit3,
  Sparkles, 
  TrendingUp,
  Target,
  Users,
  User
} from 'lucide-react';

export default function MetasView({ isMobile = false }) {
  const { 
    goals, 
    addGoal, 
    updateGoal,
    contributeToGoal, 
    deleteGoal, 
    financialSummary, 
    formatMoney, 
    currency,
    currentUser,
    partnerUser
  } = useFinApp();

  // Modals state
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [contributeModalGoal, setContributeModalGoal] = useState(null);
  const [contributeAmount, setContributeAmount] = useState('100');
  const [successToast, setSuccessToast] = useState(null);

  // New Goal Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTargetAmount, setNewTargetAmount] = useState('');
  const [newCurrentAmount, setNewCurrentAmount] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('Dic 2026');
  const [newScope, setNewScope] = useState('shared');
  const [newIcon, setNewIcon] = useState('plane');

  const getGoalIcon = (iconName) => {
    switch (iconName) {
      case 'plane': return <Plane className="w-5 h-5 text-indigo-600" />;
      case 'shield': return <Shield className="w-5 h-5 text-emerald-600" />;
      case 'laptop': return <Laptop className="w-5 h-5 text-blue-600" />;
      case 'car': return <Car className="w-5 h-5 text-amber-600" />;
      case 'home': return <Home className="w-5 h-5 text-rose-600" />;
      case 'gift': return <Gift className="w-5 h-5 text-purple-600" />;
      default: return <Target className="w-5 h-5 text-emerald-600" />;
    }
  };

  const getIconBg = (iconName) => {
    switch (iconName) {
      case 'plane': return 'bg-indigo-50 text-indigo-600';
      case 'shield': return 'bg-emerald-50 text-emerald-600';
      case 'laptop': return 'bg-blue-50 text-blue-600';
      case 'car': return 'bg-amber-50 text-amber-600';
      case 'home': return 'bg-rose-50 text-rose-600';
      case 'gift': return 'bg-purple-50 text-purple-600';
      default: return 'bg-emerald-50 text-emerald-600';
    }
  };

  // Submit new goal
  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTargetAmount || Number(newTargetAmount) <= 0) {
      alert('Por favor ingresa un nombre y un importe objetivo válido.');
      return;
    }

    addGoal({
      title: newTitle.trim(),
      description: newDescription.trim() || 'Objetivo de ahorro',
      targetAmount: Number(newTargetAmount),
      currentAmount: Number(newCurrentAmount || 0),
      targetDate: newTargetDate,
      timeLeftText: 'En progreso',
      icon: newIcon,
      scope: newScope
    });

    setNewTitle('');
    setNewDescription('');
    setNewTargetAmount('');
    setNewCurrentAmount('');
    setShowNewGoalModal(false);

    setSuccessToast('¡Objetivo creado con éxito!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Submit contribution
  const handleContribute = (e) => {
    e.preventDefault();
    const val = Number(contributeAmount);
    if (!val || val <= 0 || !contributeModalGoal) {
      alert('Por favor ingresa un importe mayor a cero.');
      return;
    }

    contributeToGoal(contributeModalGoal.id, val);
    const updatedName = contributeModalGoal.title;
    setContributeModalGoal(null);
    setContributeAmount('100');

    setSuccessToast(`¡Aporte de ${formatMoney(val)} añadido a ${updatedName}!`);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className={`pb-24 ${isMobile ? 'px-4 pt-1 max-w-md mx-auto' : 'p-8 max-w-4xl mx-auto'}`} data-testid="metas-view">
      {/* Toast Notification */}
      {successToast && (
        <div 
          role="status"
          aria-live="polite"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce"
        >
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* Card: Progreso Financiero Global */}
      <div className="bg-gradient-to-br from-emerald-50/60 via-white to-blue-50/40 rounded-3xl p-5 sm:p-6 shadow-sm border border-emerald-100/60 mb-5 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white text-emerald-700 border border-emerald-200/60 shadow-xs mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Progreso Financiero Global
            </span>
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-baseline gap-1.5">
              <span>{formatMoney(financialSummary.totalGoalSaved)}</span>
              <span className="text-base font-semibold text-slate-400">
                / {formatMoney(financialSummary.totalGoalTarget)}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Llevas el <strong className="text-emerald-700 font-bold">{financialSummary.goalPercentage.toFixed(1)}%</strong> de tus metas alcanzadas
            </p>
          </div>

          {/* Circular Progress Gauge */}
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="26" stroke="#e2e8f0" strokeWidth="5" fill="transparent" />
              <circle
                cx="32"
                cy="32"
                r="26"
                stroke="#10b981"
                strokeWidth="5"
                strokeDasharray={`${(Math.min(100, financialSummary.goalPercentage) / 100) * 163.36} 163.36`}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700"
              />
            </svg>
            <span className="absolute text-sm font-extrabold text-slate-800">
              {Math.round(financialSummary.goalPercentage)}%
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 mb-3">
          <div className="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, financialSummary.goalPercentage)}%` }}
            ></div>
          </div>
        </div>

        {/* Status Line */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-1">
          <span>{formatMoney(financialSummary.remainingToSave)} restantes</span>
          <span className="flex items-center gap-1 text-emerald-700 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            {goals.length} metas en curso
          </span>
        </div>

        {/* Nueva Meta Button */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">Planifica ahorros personales o en pareja.</p>
          <button
            type="button"
            data-testid="btn-new-goal"
            onClick={() => setShowNewGoalModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all shrink-0 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Meta</span>
          </button>
        </div>
      </div>

      {/* Section: Objetivos Activos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-900">Objetivos de Ahorro</h2>
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {goals.length} activos
          </span>
        </div>

        {/* List of Goal Cards */}
        <div className="space-y-4">
          {goals.map((goal) => {
            const current = goal.currentAmount || 0;
            const target = goal.targetAmount || 1;
            const pct = Math.min(100, Math.round((current / target) * 100));
            const remaining = Math.max(0, target - current);
            const isShared = goal.scope === 'shared';

            return (
              <div 
                key={goal.id} 
                data-testid={`goal-card-${goal.id}`}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3.5 hover:border-slate-200 transition-all"
              >
                {/* Header: Icon, Title, Scope Badge, Trash */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${getIconBg(goal.icon)}`}>
                      {getGoalIcon(goal.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 leading-tight">{goal.title}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          pct >= 100 ? 'bg-emerald-100 text-emerald-800' :
                          pct >= 50 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {pct}%
                        </span>
                        {isShared ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 flex items-center gap-0.5">
                            <Users className="w-2.5 h-2.5" /> Pareja
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 flex items-center gap-0.5">
                            <User className="w-2.5 h-2.5" /> Personal
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{goal.description}</p>
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors"
                    title="Eliminar meta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Deadline Info Pill */}
                <div className="flex items-center justify-between text-xs py-1 px-3 bg-slate-50 rounded-xl text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Plazo: {goal.targetDate}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-100">
                    {goal.timeLeftText}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-emerald-600 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>

                {/* Amounts & Status */}
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-base font-extrabold text-slate-900">{formatMoney(current)}</span>
                    <span className="text-slate-400 font-medium ml-1">de {formatMoney(target)}</span>
                  </div>
                  <span className="text-emerald-700 font-semibold text-[11px]">
                    {pct >= 100 ? '🎉 ¡Meta cumplida!' : `Faltan ${formatMoney(remaining)}`}
                  </span>
                </div>

                {/* Action Button: Aportar Dinero */}
                <button
                  type="button"
                  data-testid={`btn-contribute-${goal.id}`}
                  onClick={() => setContributeModalGoal(goal)}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Aportar Dinero</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: NUEVA META */}
      {showNewGoalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Crear Objetivo de Ahorro</h3>
              </div>
              <button type="button" onClick={() => setShowNewGoalModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Nombre del Objetivo</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej. Vacaciones Europa, Entrada Piso..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>

              {/* Scope: Personal vs Compartido */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Ámbito</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewScope('shared')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      newScope === 'shared' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    👥 Conjunto (Pareja)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewScope('personal')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      newScope === 'personal' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-600'
                    }`}
                  >
                    👤 Solo Personal
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Meta Objetivo ({currency})</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="0.01"
                    value={newTargetAmount}
                    onChange={(e) => setNewTargetAmount(e.target.value)}
                    placeholder="2500"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Ahorro Inicial</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newCurrentAmount}
                    onChange={(e) => setNewCurrentAmount(e.target.value)}
                    placeholder="200"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Fecha Límite</label>
                <input
                  type="text"
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  placeholder="Ej. Dic 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewGoalModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  Crear Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APORTAR DINERO */}
      {contributeModalGoal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Aportar a Meta</h3>
                <p className="text-xs text-slate-400">{contributeModalGoal.title}</p>
              </div>
              <button type="button" onClick={() => setContributeModalGoal(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Importe a aportar ({currency})
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  className="w-full text-center text-2xl font-extrabold text-emerald-600 bg-slate-50 border border-slate-200 rounded-2xl py-2.5 focus:outline-none"
                />
              </div>

              {/* Quick Chips */}
              <div className="grid grid-cols-4 gap-2">
                {['25', '50', '100', '250'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setContributeAmount(chip)}
                    className="py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    +{chip}
                  </button>
                ))}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setContributeModalGoal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                >
                  ✓ Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
