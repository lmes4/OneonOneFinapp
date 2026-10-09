import React, { useState } from 'react';
import { useFinApp, CATEGORIES, PAYMENT_METHODS, CURRENCIES } from '../../context/FinAppContext';
import { toCents, fromCents, formatMoneyCents } from '../../utils/money';
import { splitEqual, splitProportional, splitCustom } from '../../utils/splitEngine';
import { 
  Calendar as CalendarIcon, 
  Trash2, 
  Edit3,
  Check, 
  CreditCard, 
  Banknote, 
  Sparkles, 
  Delete,
  Receipt,
  Users,
  User,
  Scale,
  Sliders,
  AlertCircle,
  X
} from 'lucide-react';

export default function GastosView({ isMobile = false }) {
  const { 
    currency, 
    setCurrency, 
    addTransaction, 
    updateTransaction,
    deleteTransaction, 
    transactions, 
    formatMoney,
    members,
    currentUser,
    partnerUser
  } = useFinApp();

  // Mode: 'gasto' | 'ingreso'
  const [movementType, setMovementType] = useState('gasto');

  // Scope: 'personal' | 'shared'
  const [scope, setScope] = useState('personal');

  // Keypad & Amount state
  const [amountStr, setAmountStr] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState('comida');
  const [selectedPayment, setSelectedPayment] = useState('debito');
  const [note, setNote] = useState('');
  const [concept, setConcept] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const localMonth = String(today.getMonth() + 1).padStart(2, '0');
    const localDay = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${localMonth}-${localDay}`;
  });

  // Shared Split State
  const [paidBy, setPaidBy] = useState(currentUser.id);
  const [splitMethod, setSplitMethod] = useState('50_50'); // '50_50' | 'proportional' | 'custom'
  const [customMode, setCustomMode] = useState('percentage'); // 'percentage' | 'amount'
  const [customPercentages, setCustomPercentages] = useState({
    [currentUser.id]: 50,
    [partnerUser.id]: 50
  });

  // Edit Modal State
  const [editingTx, setEditingTx] = useState(null);
  const [deletingTxId, setDeletingTxId] = useState(null);

  // Filters and Feedback
  const [recentFilter, setRecentFilter] = useState('todos'); // 'todos' | 'personal' | 'shared'
  const [errorMessage, setErrorMessage] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Numerical calculations in cents
  const numericAmount = parseFloat(amountStr) || 0;
  const currentTotalCents = toCents(numericAmount);

  // Calculate live split preview for shared expenses
  let liveSplits = [];
  let splitError = null;

  if (scope === 'shared' && currentTotalCents > 0) {
    try {
      if (splitMethod === '50_50') {
        liveSplits = splitEqual(currentTotalCents, members, paidBy).splits;
      } else if (splitMethod === 'proportional') {
        liveSplits = splitProportional(currentTotalCents, members, paidBy).splits;
      } else if (splitMethod === 'custom') {
        liveSplits = splitCustom(currentTotalCents, members, {
          mode: 'percentage',
          percentages: customPercentages
        }, paidBy).splits;
      }
    } catch (err) {
      splitError = err.message;
    }
  }

  // Keypad handlers
  const handleKeypadPress = (val) => {
    setErrorMessage('');
    if (val === 'C') {
      setAmountStr('0');
    } else if (val === 'DEL') {
      if (amountStr.length <= 1) {
        setAmountStr('0');
      } else {
        setAmountStr(amountStr.slice(0, -1));
      }
    } else if (val === '+10') {
      setAmountStr((prev) => (parseFloat(prev || '0') + 10).toString());
    } else if (val === '+50') {
      setAmountStr((prev) => (parseFloat(prev || '0') + 50).toString());
    } else if (val === '+100') {
      setAmountStr((prev) => (parseFloat(prev || '0') + 100).toString());
    } else if (val === '.') {
      if (!amountStr.includes('.')) {
        setAmountStr(amountStr + '.');
      }
    } else {
      if (amountStr.length >= 8) return; // Prevent excessive input
      if (amountStr === '0') {
        setAmountStr(val);
      } else {
        if (amountStr.includes('.') && amountStr.split('.')[1].length >= 2) return;
        setAmountStr(amountStr + val);
      }
    }
  };

  // Submit Movement
  const handleSaveExpense = (e) => {
    e?.preventDefault();
    setErrorMessage('');

    if (currentTotalCents <= 0) {
      setErrorMessage('Por favor ingresa un importe mayor a cero.');
      return;
    }

    if (scope === 'shared' && splitMethod === 'custom') {
      const sum = Number(customPercentages[currentUser.id] || 0) + Number(customPercentages[partnerUser.id] || 0);
      if (Math.abs(sum - 100) > 0.05) {
        setErrorMessage(`Los porcentajes personalizados deben sumar 100% (Suma actual: ${sum}%).`);
        return;
      }
    }

    const catObj = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];
    const defaultTitle = concept.trim() || `${catObj.label} (${catObj.groupName})`;
    const methodObj = PAYMENT_METHODS.find(p => p.id === selectedPayment) || PAYMENT_METHODS[0];

    const now = new Date();
    const [year, month, day] = selectedDate.split('-').map(Number);
    const movementDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());
    const formattedDateText = movementDate.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    addTransaction({
      concept: defaultTitle,
      note: note.trim(),
      category: catObj.id,
      categoryName: movementType === 'ingreso' ? 'Ingreso' : catObj.groupName,
      method: methodObj.label,
      paymentType: selectedPayment,
      amount: fromCents(currentTotalCents),
      totalAmountCents: currentTotalCents,
      type: movementType,
      scope: movementType === 'ingreso' ? 'personal' : scope,
      paidBy: paidBy,
      splitMethod: scope === 'shared' ? splitMethod : null,
      customConfig: scope === 'shared' && splitMethod === 'custom' ? {
        mode: 'percentage',
        percentages: customPercentages
      } : null,
      dateText: formattedDateText,
      fullDate: movementDate.toISOString(),
    });

    // Reset Form
    setAmountStr('0');
    setConcept('');
    setNote('');
    setSuccessToast(movementType === 'ingreso' ? '¡Ingreso registrado con éxito!' : '¡Gasto registrado con éxito!');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Edit Transaction Handler
  const handleEditSave = (e) => {
    e.preventDefault();
    if (!editingTx) return;

    const newCents = toCents(editingTx.amount);
    if (newCents <= 0) {
      alert('El importe debe ser mayor a cero.');
      return;
    }

    updateTransaction(editingTx.id, {
      concept: editingTx.concept,
      note: editingTx.note,
      amount: fromCents(newCents),
      totalAmountCents: newCents,
      scope: editingTx.scope,
      paidBy: editingTx.paidBy,
      splitMethod: editingTx.splitMethod,
      customConfig: editingTx.splitMethod === 'custom' ? {
        mode: 'percentage',
        percentages: customPercentages
      } : null
    });

    setEditingTx(null);
    setSuccessToast('Movimiento actualizado con éxito.');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  // Filter recent expenses
  const filteredRecent = transactions.filter(t => {
    if (recentFilter === 'todos') return true;
    if (recentFilter === 'personal') return t.scope === 'personal';
    if (recentFilter === 'shared') return t.scope === 'shared';
    if (recentFilter === 'comida') return t.category === 'comida';
    if (recentFilter === 'hogar') return t.category === 'hogar';
    return true;
  });

  const recentList = filteredRecent.slice(0, 6);
  const selectedCategoryObj = CATEGORIES.find(c => c.id === selectedCategory) || CATEGORIES[0];

  return (
    <div className={`pb-24 ${isMobile ? 'px-4 pt-1 max-w-md mx-auto' : 'p-8 max-w-4xl mx-auto'}`} data-testid="gastos-view">
      {/* Toast Notification */}
      {successToast && (
        <div 
          role="status" 
          aria-live="polite"
          data-testid="success-toast"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-bounce"
        >
          <Check className="w-5 h-5 bg-white text-emerald-600 rounded-full p-0.5" />
          <span className="text-xs font-bold">{successToast}</span>
        </div>
      )}

      {/* Main Expense Registration Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 space-y-5">
        {/* Top Header: Badge, Movement Type & Currency Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Movement Type Toggle: Gasto vs Ingreso */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              data-testid="type-gasto-btn"
              onClick={() => { setMovementType('gasto'); setScope('personal'); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                movementType === 'gasto' 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              data-testid="type-ingreso-btn"
              onClick={() => { setMovementType('ingreso'); setScope('personal'); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                movementType === 'ingreso' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              + Ingreso
            </button>
          </div>

          {/* Currency Selector */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            {Object.keys(CURRENCIES).map((cKey) => (
              <button
                key={cKey}
                type="button"
                data-testid={`currency-${cKey}`}
                onClick={() => setCurrency(cKey)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                  currency === cKey
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {CURRENCIES[cKey].label}
              </button>
            ))}
          </div>
        </div>

        {/* Scope Selector: Personal vs Compartido (Only for Gastos) */}
        {movementType === 'gasto' && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Ámbito del Gasto</span>
              <span className="text-[11px] text-emerald-700 font-bold">
                {scope === 'shared' ? '👥 Compartido con ' + partnerUser.name : '👤 Solo para ti'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                data-testid="scope-personal-btn"
                onClick={() => setScope('personal')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  scope === 'personal'
                    ? 'bg-white border-emerald-600 text-emerald-700 shadow-xs'
                    : 'bg-slate-100/80 border-transparent text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Gasto Personal</span>
              </button>

              <button
                type="button"
                data-testid="scope-shared-btn"
                onClick={() => setScope('shared')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  scope === 'shared'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-100/80 border-transparent text-slate-600 hover:bg-slate-200/60'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Gasto Compartido</span>
              </button>
            </div>

            {/* Shared Configuration: Payer & Split Method */}
            {scope === 'shared' && (
              <div className="pt-2 border-t border-slate-200/60 space-y-3 animate-fadeIn">
                {/* Payer selector */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1.5">¿Quién ha pagado?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {members.map(m => (
                      <button
                        key={m.id}
                        type="button"
                        data-testid={`paidby-${m.id}`}
                        onClick={() => setPaidBy(m.id)}
                        className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                          paidBy === m.id
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: paidBy === m.id ? '#10b981' : '#cbd5e1' }}></span>
                        <span>{m.name} {m.isCurrentUser ? '(Tú)' : ''}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Split Method Tabs: 50/50, Proportional, Custom */}
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1.5">Método de Reparto</label>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      data-testid="split-method-5050"
                      onClick={() => setSplitMethod('50_50')}
                      className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                        splitMethod === '50_50'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      50 / 50
                    </button>
                    <button
                      type="button"
                      data-testid="split-method-proportional"
                      onClick={() => setSplitMethod('proportional')}
                      className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                        splitMethod === 'proportional'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Proporcional a ingresos mensuales de cada uno"
                    >
                      Proporcional
                    </button>
                    <button
                      type="button"
                      data-testid="split-method-custom"
                      onClick={() => setSplitMethod('custom')}
                      className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                        splitMethod === 'custom'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Personalizado
                    </button>
                  </div>
                </div>

                {/* Custom percentages inputs */}
                {splitMethod === 'custom' && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 animate-fadeIn">
                    <p className="text-[11px] font-bold text-slate-600">Porcentaje que asume cada participante:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {members.map(m => (
                        <div key={m.id} className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-700 w-16 truncate">{m.name}:</span>
                          <div className="relative flex-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              data-testid={`custom-pct-${m.id}`}
                              value={customPercentages[m.id] || 0}
                              onChange={(e) => {
                                const val = Number(e.target.value) || 0;
                                const otherMember = members.find(other => other.id !== m.id);
                                setCustomPercentages({
                                  [m.id]: val,
                                  [otherMember.id]: Math.max(0, 100 - val)
                                });
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 pr-6"
                            />
                            <span className="absolute right-2 top-1 text-xs text-slate-400">%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Split Preview Box */}
                {currentTotalCents > 0 && liveSplits.length > 0 && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl space-y-1.5" data-testid="live-split-preview">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                      <span>Desglose de reparto calculado:</span>
                      <span>Total: {formatMoney(numericAmount)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-100">
                      {liveSplits.map(s => (
                        <div key={s.memberId} className="text-xs bg-white/80 p-2 rounded-lg border border-emerald-100">
                          <p className="font-semibold text-slate-700">{s.name}</p>
                          <p className="font-extrabold text-slate-900 text-sm">{formatMoneyCents(s.shareCents, currency)}</p>
                          <p className="text-[10px] text-emerald-700 font-bold">{s.percentage}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Amount Display */}
        <div className="text-center py-2">
          <p className="text-xs font-semibold text-slate-400">
            {movementType === 'ingreso' ? 'Monto del Ingreso a registrar' : 'Monto del Gasto a registrar'}
          </p>
          <div 
            data-testid="amount-display"
            className="text-4xl sm:text-5xl font-extrabold text-emerald-600 tracking-tight my-1.5 flex items-center justify-center gap-1"
          >
            <span>{CURRENCIES[currency].symbol}</span>
            <span>{numericAmount > 0 ? parseFloat(amountStr).toFixed(2) : '0.00'}</span>
          </div>
          <p className="text-[11px] text-slate-400">Toca el teclado numérico abajo para ingresar</p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div role="alert" className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Keypad 4x4 Grid */}
        <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100 grid grid-cols-4 gap-2">
          {/* Row 1 */}
          <button type="button" onClick={() => handleKeypadPress('1')} className="h-12 rounded-xl bg-white text-base font-bold text-slate-800 shadow-xs hover:bg-slate-100 active:scale-95 transition-all">1</button>
          <button type="button" onClick={() => handleKeypadPress('2')} className="h-12 rounded-xl bg-white text-base font-bold text-slate-800 shadow-xs hover:bg-slate-100 active:scale-95 transition-all">2</button>
          <button type="button" onClick={() => handleKeypadPress('3')} className="h-12 rounded-xl bg-white text-base font-bold text-slate-800 shadow-xs hover:bg-slate-100 active:scale-95 transition-all">3</button>
          <button type="button" onClick={() => handleKeypadPress('+10')} className="h-12 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 active:scale-95 transition-all">+10</button>

          {/* Row 2 */}
          <button type="button" onClick={() => handleKeypadPress('4')} className="h-12 rounded-xl bg-white text-base font-bold text-slate-800 shadow-xs hover:bg-slate-100 active:scale-95 transition-all">4</button>
          <button type="button" onClick={() => handleKeypadPress('5')} className="h-12 rounded-xl bg-white text-base font-bold text-slate-800 shadow-xs hover:bg-slate-100 active:scale-95 transition-all">5</button>
          <button type="button" onClick={() => handleKeypadPress('6')} className="h-12 rounded-xl bg-white text-base font-bold text-slate-800 shadow-xs hover:bg-slate-100 active:scale-95 transition-all">6</button>
          <button type="button" onClick={() => handleKeypadPress('+50')} className="h-12 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 active:scale-95 transition-all">+50</button>

          {/* Row 3 */}
          <button type="button" onClick={() => handleKeypadPress('7')} className="h-12 rounded-xl bg-white text-base font-bold text-slate-800 shadow-xs hover:bg-slate-100 active:scale-95 transition-all">7</button>
          <button type="button" onClick={() => handleKeypadPress('8')} className="h-12 rounded-xl bg-white text-base font-bold text-slate-800 shadow-xs hover:bg-slate-100 active:scale-95 transition-all">8</button>
          <button type="button" onClick={() => handleKeypadPress('9')} className="h-12 rounded-xl bg-white text-base font-bold text-slate-800 shadow-xs hover:bg-slate-100 active:scale-95 transition-all">9</button>
          <button type="button" onClick={() => handleKeypadPress('+100')} className="h-12 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 active:scale-95 transition-all">+100</button>

          {/* Row 4 */}
          <button type="button" onClick={() => handleKeypadPress('.')} className="h-12 rounded-xl bg-white text-base font-bold text-slate-800 shadow-xs hover:bg-slate-100 active:scale-95 transition-all">.</button>
          <button type="button" onClick={() => handleKeypadPress('0')} className="h-12 rounded-xl bg-white text-base font-bold text-slate-800 shadow-xs hover:bg-slate-100 active:scale-95 transition-all">0</button>
          <button 
            type="button" 
            aria-label="Borrar último dígito" 
            onClick={() => handleKeypadPress('DEL')} 
            className="h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 active:scale-95 transition-all"
          >
            <Delete className="w-5 h-5" />
          </button>
          <button 
            type="button" 
            aria-label="Limpiar importe" 
            onClick={() => handleKeypadPress('C')} 
            className="h-12 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 active:scale-95 transition-all"
          >
            C
          </button>
        </div>

        {/* Fecha de Operación */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="operation-date" className="flex items-center gap-1.5 font-semibold text-slate-700">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
              <span>Fecha de Operación</span>
            </label>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Automático
            </span>
          </div>
          <input
            id="operation-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Clasificación (Categorías) - solo en gastos */}
        {movementType === 'gasto' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Clasificación del Gasto</span>
              <span className="text-[11px] font-medium text-emerald-600">
                {selectedCategoryObj.label} seleccionada
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-[1.02]'
                        : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-2xl mb-1">{cat.emoji}</span>
                    <span className={`text-[11px] font-semibold tracking-tight ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Método de Pago */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">Método de Pago</label>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = selectedPayment === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedPayment(method.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {method.id === 'efectivo' ? <Banknote className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                  <span>{method.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Concepto y Descripción */}
        <div className="space-y-2">
          <label htmlFor="tx-concept" className="text-xs font-semibold text-slate-700 block">
            Concepto / Descripción
          </label>
          <input
            id="tx-concept"
            type="text"
            data-testid="input-concept"
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            placeholder="Ej. Cena Bistro, Alquiler, Taxi al centro..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Botón Principal Guardar */}
        <button
          type="button"
          data-testid="btn-save-expense"
          onClick={handleSaveExpense}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{movementType === 'ingreso' ? 'Guardar Ingreso' : 'Guardar Gasto'}</span>
        </button>
      </div>

      {/* Historial de Movimientos Recientes con Edición y Eliminación */}
      <div className="space-y-3 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Movimientos Recientes</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">{transactions.length} registrados</span>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'personal', label: '👤 Personales' },
            { id: 'shared', label: '👥 Compartidos' },
            { id: 'comida', label: 'Comida' },
            { id: 'hogar', label: 'Hogar' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-testid={`filter-${tab.id}`}
              onClick={() => setRecentFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                recentFilter === tab.id
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transaction Cards List */}
        <div className="space-y-2" data-testid="recent-transactions-list">
          {recentList.map((tx) => {
            const catItem = CATEGORIES.find(c => c.id === tx.category) || CATEGORIES[0];
            const isShared = tx.scope === 'shared';
            const isIncome = tx.type === 'ingreso';

            return (
              <div 
                key={tx.id} 
                data-testid={`tx-item-${tx.id}`}
                className="bg-white rounded-2xl p-3.5 border border-slate-100 flex items-center justify-between shadow-xs hover:border-slate-200 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl shrink-0">
                    {isIncome ? '💰' : catItem.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-900 leading-tight">{tx.concept}</p>
                      {isShared && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 flex items-center gap-0.5">
                          <Users className="w-2.5 h-2.5" /> Compartido
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <span>{tx.dateText}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">{tx.method}</span>
                      <span>•</span>
                      <span>{tx.categoryName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-sm font-extrabold ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                    {isIncome ? '+' : '-'}{formatMoney(tx.amount)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingTx({ ...tx })}
                      className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Editar movimiento"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      data-testid={`delete-tx-${tx.id}`}
                      onClick={() => setDeletingTxId(tx.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Eliminar movimiento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal to Delete */}
      {deletingTxId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-fadeIn space-y-4">
            <h4 className="text-base font-bold text-slate-900">¿Eliminar este movimiento?</h4>
            <p className="text-xs text-slate-500">Esta acción actualizará inmediatamente los balances y saldos compartidos.</p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTxId(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                data-testid="confirm-delete-btn"
                onClick={() => {
                  deleteTransaction(deletingTxId);
                  setDeletingTxId(null);
                  setSuccessToast('Movimiento eliminado.');
                  setTimeout(() => setSuccessToast(''), 3000);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-base font-bold text-slate-900">Editar Movimiento</h4>
              <button type="button" onClick={() => setEditingTx(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Concepto</label>
                <input
                  type="text"
                  value={editingTx.concept}
                  onChange={(e) => setEditingTx({ ...editingTx, concept: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Importe ({currency})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={editingTx.amount}
                  onChange={(e) => setEditingTx({ ...editingTx, amount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
