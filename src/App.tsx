import { useEffect, useState } from 'react';
import { Download, PlusCircle, Wallet } from 'lucide-react';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import { useUIStore } from './application/state/useUIStore';
import { useConfigStore } from './application/state/useConfigStore';
import { useCategoryStore } from './application/state/useCategoryStore';
import { useTransactionStore } from './application/state/useTransactionStore';
import { migrateFromLocalStorage } from './application/services/MigrationService';
import { processAICommand } from './application/services/AIService';

import { StatusBar } from './presentation/components/ui/StatusBar';
import { TabNav } from './presentation/components/ui/TabNav';
import { MonthYearPicker } from './presentation/components/ui/MonthYearPicker';
import { NewTransactionForm } from './presentation/components/transactions/NewTransactionForm';
import { MobileMenu } from './presentation/components/ui/navigation/MobileMenu';
import { Toast } from './presentation/components/ui/feedback/Toast';
import { extractToken } from './infrastructure/utils/dropboxOAuth';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);

  // Zustand Stores
  const {
    activeTab, setActiveTab, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear,
    isFormOpen, setIsFormOpen, isOnline, setIsOnline, toast
  } = useUIStore();

  const { loadConfig, handleUpdateBackupConfig, enableCreditCardStatement } = useConfigStore();
  const { loadCategories, categories } = useCategoryStore();
  const { loadData, cartoes, handleAddTransaction, handleExportCSV, handleSyncData } = useTransactionStore();

  // Inicialização
  useEffect(() => {
    const init = async () => {
      await migrateFromLocalStorage();
      await Promise.all([
        loadConfig(),
        loadCategories(),
        loadData()
      ]);
      setIsInitializing(false);
    };
    init();
  }, []);

  // Sincronizar activeTab com a rota
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveTab('dashboard');
    else if (path === '/extrato') setActiveTab('transacoes');
    else if (path === '/admin') setActiveTab('admin');
    else if (path === '/sqlite') setActiveTab('sqlite');
    else if (path === '/logs') setActiveTab('architecture');
  }, [location.pathname, setActiveTab]);

  const handleTabChange = (tab: any) => {
    if (tab === 'dashboard') navigate('/');
    else if (tab === 'transacoes') navigate('/extrato');
    else if (tab === 'admin') navigate('/admin');
    else if (tab === 'sqlite') navigate('/sqlite');
    else if (tab === 'architecture') navigate('/logs');
  };

  // Dropbox Logic (Capacitor)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const sub = CapApp.addListener('appUrlOpen', (data) => {
        if (data.url.includes('access_token')) {
          const token = extractToken(data.url);
          if (token) {
            handleUpdateBackupConfig(token);
            setTimeout(() => { Browser.close(); }, 500);
          }
        }
      });
      return () => { sub.then(h => h.remove()); };
    }
  }, [handleUpdateBackupConfig]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-indigo-500 animate-pulse font-black uppercase tracking-widest text-xs">Iniciando FinanceGuard Pro...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <StatusBar
        isOnline={isOnline}
        isEncrypted={true}
        onToggleOnline={() => setIsOnline(!isOnline)}
        onSync={handleSyncData}
      />

      <main className="max-w-6xl w-full mx-auto p-6 md:p-12 flex-1 flex flex-col gap-10">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-900/40"><Wallet className="text-white size-7 md:size-8" /></div>
              <span className="gradient-text">FinanceGuard Pro</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium ml-14">Clean Architecture • <span className="text-slate-400">v1.4.0</span></p>
          </div>
          <div className="hidden lg:block"><TabNav activeTab={activeTab} onChange={handleTabChange} /></div>
          <MobileMenu activeTab={activeTab} onChange={handleTabChange} />
        </header>

        <div className="glass-panel p-4 rounded-[2.5rem] flex flex-wrap items-center justify-between gap-4">
          <MonthYearPicker month={selectedMonth} year={selectedYear} onMonthChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }} />
          <div className="flex gap-3">
            <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider"><Download className="size-4" /> Exportar</button>
            <button onClick={() => setIsFormOpen(!isFormOpen)} className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider"><PlusCircle className="size-4" /> Novo Lançamento</button>
          </div>
        </div>

        <div className="flex-1">
          {isFormOpen && (
            <div className="mb-10 animate-in zoom-in-95 duration-300">
              <NewTransactionForm
                onSubmit={(input) => handleAddTransaction(input, isOnline)}
                onClose={() => setIsFormOpen(false)}
                categories={categories}
                cartoes={cartoes}
                enableCreditCardStatement={enableCreditCardStatement}
                onProcessAICommand={processAICommand}
              />
            </div>
          )}
          <section className="min-h-[400px]">
            <Outlet />
          </section>
        </div>
      </main>
      <footer className="p-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.4em]">&copy; 2026 FinanceGuard • Versão 1.4.0-Stable</footer>
      <Toast {...toast} />
    </div>
  );
}
