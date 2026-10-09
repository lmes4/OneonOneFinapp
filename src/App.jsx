import React from 'react';
import { FinAppProvider, useFinApp } from './context/FinAppContext';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import BottomNav from './components/common/BottomNav';
import DashboardView from './components/dashboard/DashboardView';
import GastosView from './components/gastos/GastosView';
import MetasView from './components/metas/MetasView';
import { Smartphone, Monitor, Sparkles, Wifi, Battery, Signal } from 'lucide-react';

function AppContent() {
  const { activeTab, previewDevice, setPreviewDevice } = useFinApp();
  const [isDesktop, setIsDesktop] = React.useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  });

  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render current view
  const renderView = (isMobile) => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView isMobile={isMobile} />;
      case 'gastos':
        return <GastosView isMobile={isMobile} />;
      case 'metas':
        return <MetasView isMobile={isMobile} />;
      default:
        return <DashboardView isMobile={isMobile} />;
    }
  };

  // 1. Mobile Phone Mockup Simulation (when user explicitly selects "mobile-mockup" on desktop)
  if (previewDevice === 'mobile-mockup') {
    return (
      <div className="min-h-screen bg-slate-900 py-8 px-4 flex flex-col items-center justify-center font-sans">
        {/* Floating Switcher Controls */}
        <div className="mb-4 bg-slate-800/90 backdrop-blur border border-slate-700 p-1.5 rounded-2xl flex items-center gap-2 shadow-xl z-50 text-xs">
          <button
            onClick={() => setPreviewDevice('responsive')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auto-Responsive</span>
          </button>
          <button
            onClick={() => setPreviewDevice('mobile-mockup')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Simulador Móvil (iPhone/Android)</span>
          </button>
          <button
            onClick={() => setPreviewDevice('desktop-mockup')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-300 hover:text-white transition-colors"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Escritorio</span>
          </button>
        </div>

        {/* Realistic Mobile Device Frame */}
        <div className="w-[390px] h-[844px] bg-[#f8fafc] rounded-[52px] shadow-[0_25px_70px_rgba(0,0,0,0.6)] border-[10px] border-slate-800 flex flex-col overflow-hidden relative">
          {/* Mobile Speaker / Dynamic Island */}
          <div className="absolute top-0 inset-x-0 h-10 flex items-center justify-between px-7 pt-2.5 z-40 bg-white/70 backdrop-blur pointer-events-none text-slate-800">
            <span className="text-[12px] font-bold tracking-tight">9:41</span>
            <div className="w-24 h-4 bg-black rounded-full mx-auto"></div>
            <div className="flex items-center gap-1.5 text-slate-800">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Mobile Header */}
          <div className="pt-8">
            <Header isMobile={true} />
          </div>

          {/* Scrollable Mobile Viewport */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            {renderView(true)}
          </main>

          {/* Mobile Bottom Navigation */}
          <div className="absolute bottom-0 inset-x-0 z-30">
            <BottomNav />
          </div>
        </div>
      </div>
    );
  }

  // 2. Forced Desktop Mockup
  if (previewDevice === 'desktop-mockup') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header isMobile={false} />
          <main className="flex-1 overflow-y-auto">
            {renderView(false)}
          </main>
        </div>
      </div>
    );
  }

  // 3. True Auto-Responsive (Clean single view rendering)
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans flex flex-col lg:flex-row">
      {/* Desktop Sidebar (only rendered on desktop) */}
      {isDesktop && <Sidebar />}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header based on viewport */}
        <Header isMobile={!isDesktop} />

        {/* Main Content Area */}
        <main className="flex-1">
          {renderView(!isDesktop)}
        </main>

        {/* Mobile Bottom Navigation (only rendered on mobile) */}
        {!isDesktop && <BottomNav />}
      </div>

      {/* Floating Device Mode Switcher on desktop screens */}
      <div className="hidden lg:flex fixed bottom-5 right-5 z-50 bg-slate-900/90 backdrop-blur-md text-white p-1.5 rounded-2xl shadow-xl border border-slate-700/80 items-center gap-1 text-xs">
        <button
          onClick={() => setPreviewDevice('responsive')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            previewDevice === 'responsive' 
              ? 'bg-emerald-600 text-white font-bold shadow-xs' 
              : 'text-slate-300 hover:text-white'
          }`}
          title="Vista Fluida"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Auto</span>
        </button>
        <button
          onClick={() => setPreviewDevice('mobile-mockup')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
            previewDevice === 'mobile-mockup' 
              ? 'bg-emerald-600 text-white font-bold shadow-xs' 
              : 'text-slate-300 hover:text-white'
          }`}
          title="Simulador Móvil"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Móvil iPhone/Android</span>
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <FinAppProvider>
      <AppContent />
    </FinAppProvider>
  );
}
