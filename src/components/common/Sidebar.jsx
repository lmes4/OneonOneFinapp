import React, { useState } from 'react';
import { useFinApp } from '../../context/FinAppContext';
import { fromCents, toCents, formatMoneyCents } from '../../utils/money';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Target, 
  Settings, 
  HelpCircle,
  RotateCcw,
  Users,
  X,
  Check
} from 'lucide-react';

export default function Sidebar() {
  const { 
    activeTab, 
    setActiveTab, 
    resetDemoData, 
    members, 
    updateMember,
    currency 
  } = useFinApp();

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [member1Income, setMember1Income] = useState(() => fromCents(members[0]?.monthlyIncomeCents || 250000));
  const [member2Income, setMember2Income] = useState(() => fromCents(members[1]?.monthlyIncomeCents || 180000));
  const [member1Name, setMember1Name] = useState(() => members[0]?.name || 'Lucía');
  const [member2Name, setMember2Name] = useState(() => members[1]?.name || 'Carlos');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'gastos', label: 'Registrar Movimiento', icon: PlusCircle },
    { id: 'metas', label: 'Objetivos de Ahorro', icon: Target },
    { id: 'config', label: 'Participantes / Config', icon: Settings }
  ];

  const handleNavClick = (id) => {
    if (id === 'config') {
      setShowConfigModal(true);
      return;
    }
    setActiveTab(id);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (members[0]) {
      updateMember(members[0].id, {
        name: member1Name.trim() || 'Participante 1',
        monthlyIncome: Number(member1Income) || 0
      });
    }
    if (members[1]) {
      updateMember(members[1].id, {
        name: member2Name.trim() || 'Participante 2',
        monthlyIncome: Number(member2Income) || 0
      });
    }
    setShowConfigModal(false);
  };

  return (
    <>
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between h-screen sticky top-0 shrink-0" data-testid="sidebar">
        <div>
          {/* Brand Header */}
          <div className="p-6 pb-6 border-b border-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-600/20 text-white">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
              <div>
                <div className="text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Fin<span className="text-emerald-600">App</span> <span className="text-xs font-bold text-indigo-600 px-1.5 py-0.5 bg-indigo-50 rounded">Shared</span>
                </div>
                <div className="text-[10px] tracking-wider font-semibold text-slate-400 uppercase">
                  Gastos Compartidos
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="p-4">
            <p className="px-3 text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
              Navegación
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-testid={`nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-50 space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800">Participantes Activos</p>
              <p className="text-[11px] text-indigo-700 font-bold flex items-center gap-1">
                <Users className="w-3 h-3" /> {members[0]?.name} & {members[1]?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
            <span>v3.0.0 • FinApp Shared</span>
            <button 
              type="button"
              data-testid="btn-reset-demo"
              onClick={resetDemoData}
              title="Restaurar datos de demostración" 
              className="flex items-center gap-1 hover:text-slate-600 transition-colors font-medium text-emerald-700"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Participantes & Ingresos Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Configuración de Participantes</h3>
              </div>
              <button type="button" onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Los ingresos mensuales se utilizan exclusivamente para calcular el <strong>reparto proporcional</strong> en gastos compartidos.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              {/* Participante 1 */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-800">Participante 1 (Usuario Activo)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={member1Name}
                      onChange={(e) => setMember1Name(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Ingreso Mensual ({currency})</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={member1Income}
                      onChange={(e) => setMember1Income(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Participante 2 */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <p className="text-xs font-bold text-slate-800">Participante 2 (Pareja / Compañero)</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Nombre</label>
                    <input
                      type="text"
                      required
                      value={member2Name}
                      onChange={(e) => setMember2Name(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 block mb-1">Ingreso Mensual ({currency})</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={member2Income}
                      onChange={(e) => setMember2Income(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md"
                >
                  Guardar Configuración
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
