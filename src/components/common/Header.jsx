import React from 'react';
import { useFinApp } from '../../context/FinAppContext';
import { Search, Calendar, Bell, Smartphone, Monitor, Sparkles } from 'lucide-react';

export default function Header({ isMobile = false }) {
  const { previewDevice, setPreviewDevice, setActiveTab, currentUser } = useFinApp();

  // Avatar image matching the reference screenshot
  const avatarUrl = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80";

  if (isMobile) {
    return (
      <header className="flex items-center justify-between px-5 pt-4 pb-2 bg-white/80 backdrop-blur sticky top-0 z-20">
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          {/* Logo icon */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-sm shadow-emerald-500/20 text-white">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Fin<span className="text-emerald-600">App</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <img 
              src={avatarUrl} 
              alt="Lucía Fernández" 
              className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/30 shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
        </div>
      </header>
    );
  }

  // Desktop Header
  return (
    <header className="h-16 px-8 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20">
      {/* Search Bar */}
      <div className="relative w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Buscar transacciones o metas..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 placeholder-slate-400 transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Device Mode Switcher for pair-programming preview */}
        <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
          <button 
            onClick={() => setPreviewDevice('responsive')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
              previewDevice === 'responsive' 
                ? 'bg-white text-emerald-700 shadow-sm font-semibold' 
                : 'hover:text-slate-900'
            }`}
            title="Vista responsiva fluida"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Auto</span>
          </button>
          <button 
            onClick={() => setPreviewDevice('mobile-mockup')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
              previewDevice === 'mobile-mockup' 
                ? 'bg-white text-emerald-700 shadow-sm font-semibold' 
                : 'hover:text-slate-900'
            }`}
            title="Simular Móvil iPhone / Android"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Móvil</span>
          </button>
          <button 
            onClick={() => setPreviewDevice('desktop-mockup')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
              previewDevice === 'desktop-mockup' 
                ? 'bg-white text-emerald-700 shadow-sm font-semibold' 
                : 'hover:text-slate-900'
            }`}
            title="Vista Escritorio Completa"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Escritorio</span>
          </button>
        </div>

        {/* Date Filter Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>01 Oct - 31 Oct, 2024</span>
          <span className="text-slate-400">▾</span>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{currentUser?.name || 'Lucía'}</p>
            <p className="text-[10px] text-emerald-600 font-medium">FinApp Shared</p>
          </div>
          <img 
            src={avatarUrl} 
            alt={currentUser?.name || 'Usuario'} 
            className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/20"
          />
        </div>
      </div>
    </header>
  );
}
