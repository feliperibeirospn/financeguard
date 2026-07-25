import { useEffect, useState } from 'react';
import { Download, PlusCircle, Wallet, Moon, Sun } from 'lucide-react';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

import { useUIStore } from './application/state/useUIStore';
import { useConfigStore } from './application/state/useConfigStore';
import { useCategoryStore } from './application/state/useCategoryStore';
import { useTransactionStore } from './application/state/useTransactionStore';
import { useThemeStore } from './application/state/useThemeStore';
import { migrateFromLocalStorage } from './application/services/MigrationService';
import { processAICommand } from './application/services/AIService';

import { TabNav } from './presentation/components/ui/TabNav';
import { MonthYearPicker } from './presentation/components/ui/MonthYearPicker';
import { NewTransactionForm } from './presentation/components/transactions/NewTransactionForm';
import { MobileMenu } from './presentation/components/ui/navigation/MobileMenu';
import { Toast } from './presentation/components/ui/feedback/Toast';
import { getDropboxTokenFromUrl, extractToken } from './infrastructure/utils/dropboxOAuth';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);

  const {
    activeTab, setActiveTab, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear,
    isFormOpen, setIsFormOpen, toast
  } = useUIStore();

  const { loadConfig, handleUpdateBackupConfig, enableCreditCardStatement } = useConfigStore();
  const { loadCategories, categories } = useCategoryStore();
  const { loadData, cartoes, handleAddTransaction, handleExportCSV } = useTransactionStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const init = async () => {
      await migrateFromLocalStorage();
      await Promise.all([loadConfig(), loadCategories(), loadData()]);
      setIsInitializing(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setActiveTab('dashboard');
    else if (path === '/extrato') setActiveTab('transacoes');
    else if (path === '/admin') setActiveTab('admin');
  }, [location.pathname, setActiveTab]);

  const handleTabChange = (tab: any) => {
    if (tab === 'dashboard') navigate('/');
    else if (tab === 'transacoes') navigate('/extrato');
    else if (tab === 'admin') navigate('/admin');
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

  // Dropbox Logic (Web / GitHub Pages)
  useEffect(() => {
    const token = (window as any)._dbx_temp_token || getDropboxTokenFromUrl();
    if (token) {
      handleUpdateBackupConfig(token);
      (window as any)._dbx_temp_token = null;
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [handleUpdateBackupConfig]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
        <div className="text-indigo-500 animate-pulse font-black uppercase tracking-widest text-xs">Finance</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-500">
      <main className="max-w-6xl w-full mx-auto p-6 md:p-12 flex-1 flex flex-col gap-8">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-center justify-between lg:justify-start gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-[1.2rem] shadow-xl shadow-indigo-600/30">
                <Wallet className="text-white size-7 md:size-8" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none select-none">
                <span className="text-main transition-colors">Fin</span>
                <span className="text-indigo-600 dark:text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">ance</span>
              </h1>
            </div>

            <button onClick={toggleTheme} className="p-3.5 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 text-slate-600 dark:text-indigo-400 transition-all hover:scale-110 active:scale-95">
              {theme === 'dark' ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>
          </div>
          <div className="hidden lg:block"><TabNav activeTab={activeTab} onChange={handleTabChange} /></div>
          <MobileMenu activeTab={activeTab} onChange={handleTabChange} />
        </header>
        <div className="glass-panel p-4 md:p-6 flex flex-wrap items-center justify-between gap-6 shadow-xl">
          <MonthYearPicker month={selectedMonth} year={selectedYear} onMonthChange={(m, y) => { setSelectedMonth(m); setSelectedYear(y); }} />
          <div className="flex gap-4 w-full md:w-auto">
            <button onClick={handleExportCSV} className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2 text-xs">
              <Download className="size-4" /> Exportar
            </button>
            <button onClick={() => setIsFormOpen(!isFormOpen)} className="btn-primary flex-1 md:flex-none flex items-center justify-center gap-2 text-xs">
              <PlusCircle className="size-4" /> Novo Lançamento
            </button>
          </div>
        </div>
        <div className="flex-1">
          {isFormOpen && (
            <div className="mb-10 animate-in zoom-in-95 duration-500">
              <NewTransactionForm onSubmit={(input) => handleAddTransaction(input, true)} onClose={() => setIsFormOpen(false)} categories={categories} cartoes={cartoes} enableCreditCardStatement={enableCreditCardStatement} onProcessAICommand={processAICommand} />
            </div>
          )}
          <section className="min-h-[400px]"><Outlet /></section>
        </div>
      </main>
      <footer className="p-10 text-center text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-[0.5em]">&copy; 2026 Finance • v1.4.0</footer>
      <Toast {...toast} />
    </div>
  );
}
