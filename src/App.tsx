import { Download, PlusCircle, Wallet } from 'lucide-react';
import { useFinanceApp } from './presentation/hooks/useFinanceApp';
import { StatusBar } from './presentation/components/ui/StatusBar';
import { TabNav } from './presentation/components/ui/TabNav';
import { MonthYearPicker } from './presentation/components/ui/MonthYearPicker';
import { NewTransactionForm } from './presentation/components/transactions/NewTransactionForm';
import { DashboardPage } from './presentation/pages/dashboard/Dashboard';
import { ExtratoPage } from './presentation/pages/extrato/Extrato';
import { InspectorSQLitePage } from './presentation/pages/inspector-sqlite/InspectorSQLite';
import { CleanArchLogsPage } from './presentation/pages/clean-arch-logs/CleanArchLogs';
import { AdminPage } from './presentation/pages/admin/Admin';
import { MobileMenu } from './presentation/components/ui/navigation/MobileMenu';
import { Toast } from './presentation/components/ui/feedback/Toast';

export default function App() {
  const {
    activeTab,
    setActiveTab,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    isFormOpen,
    setIsFormOpen,
    isOnline,
    logs,
    db,
    filteredTransactions,
    summary,
    chartData,
    savingsTargetPct,
    toast,
    isAIAnalyzing,
    aiInsights,
    aiManageCategories,
    pendingRecurring,
    handleAddTransaction,
    handleDeleteTransaction,
    handleSyncData,
    handleExportCSV,
    handleToggleOnline,
    handleProcessAICommand,
    handleGenerateInsights,
    handleUpdateAIConfig,
    handleUpdateAIManageCategories,
    handleResetDatabase,
    handleUpdateSavingsTarget,
    handleUpdateCategories,
    handleAddRecurring,
    handleDeleteRecurring,
    handleApplyRecurring,
  } = useFinanceApp();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            summary={summary}
            chartData={chartData}
            savingsTargetPct={savingsTargetPct}
            aiInsights={aiInsights}
            isAIAnalyzing={isAIAnalyzing}
            pendingRecurring={pendingRecurring}
            onRefreshInsights={() => handleGenerateInsights(true)}
            onApplyRecurring={handleApplyRecurring}
          />
        );
      case 'transacoes':
        return (
          <ExtratoPage
            filteredTransactions={filteredTransactions}
            selectedMonth={selectedMonth}
            onDelete={handleDeleteTransaction}
          />
        );
      case 'admin':
        return (
          <AdminPage
            savingsTargetPct={savingsTargetPct}
            categories={db.categorias}
            recorrencias={db.recorrencias}
            aiConfig={db.config?.aiConfig}
            aiManageCategories={aiManageCategories}
            onUpdateSavingsTarget={handleUpdateSavingsTarget}
            onUpdateCategories={handleUpdateCategories}
            onUpdateAIConfig={handleUpdateAIConfig}
            onUpdateAIManageCategories={handleUpdateAIManageCategories}
            onAddRecurring={handleAddRecurring}
            onDeleteRecurring={handleDeleteRecurring}
            onResetDatabase={handleResetDatabase}
          />
        );
      case 'sqlite':
        return <InspectorSQLitePage db={db} />;
      case 'architecture':
        return <CleanArchLogsPage logs={logs} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <StatusBar
        isOnline={isOnline}
        isEncrypted={true}
        onToggleOnline={handleToggleOnline}
        onSync={handleSyncData}
      />

      <main className="max-w-6xl w-full mx-auto p-6 md:p-12 flex-1 flex flex-col gap-10">
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-900/40">
                <Wallet className="text-white size-7 md:size-8" />
              </div>
              <span className="gradient-text">FinanceGuard Pro</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium ml-14">
              Arquitetura Limpa • <span className="text-slate-400">Privacidade Absoluta</span>
            </p>
          </div>
          <div className="hidden lg:block"><TabNav activeTab={activeTab} onChange={setActiveTab} /></div>
          <MobileMenu activeTab={activeTab} onChange={setActiveTab} />
        </header>

        <div className="glass-panel p-4 rounded-[2.5rem] flex flex-wrap items-center justify-between gap-4">
          <MonthYearPicker
            month={selectedMonth}
            year={selectedYear}
            onMonthChange={(m, y) => {
              setSelectedMonth(m);
              setSelectedYear(y);
            }}
          />
          <div className="flex gap-3">
            <button onClick={handleExportCSV} className="btn-secondary flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider"><Download className="size-4" /> Exportar</button>
            <button onClick={() => setIsFormOpen((v) => !v)} className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider"><PlusCircle className="size-4" /> Novo Lançamento</button>
          </div>
        </div>

        <div className="flex-1">
          {isFormOpen && (
            <div className="mb-10 animate-in zoom-in-95 duration-300">
              <NewTransactionForm
                onSubmit={handleAddTransaction}
                onClose={() => setIsFormOpen(false)}
                categories={db.categorias}
                onProcessAICommand={handleProcessAICommand}
              />
            </div>
          )}
          <section className="min-h-[400px]">{renderActiveTab()}</section>
        </div>
      </main>

      <footer className="p-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.4em]">
        &copy; 2026 FinanceGuard • Versão 1.2.0-Stable
      </footer>
      <Toast {...toast} />
    </div>
  );
}
