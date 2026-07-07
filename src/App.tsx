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

/**
 * Componente raiz da aplicação.
 *
 * Responsabilidade: layout + roteamento entre abas.
 * Toda a lógica de estado, persistência e side effects vive em `useFinanceApp`.
 * Toda a regra de negócio vive em `src/domain/`.
 * Todo o I/O externo (localStorage, CSV) vive em `src/infrastructure/`.
 */
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
    isEncrypted,
    logs,
    db,
    filteredTransactions,
    summary,
    chartData,
    savingsTargetPct,
    handleAddTransaction,
    handleDeleteTransaction,
    handleSyncData,
    handleExportCSV,
    handleToggleOnline,
  } = useFinanceApp();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardPage
            summary={summary}
            chartData={chartData}
            savingsTargetPct={savingsTargetPct}
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
      case 'sqlite':
        return <InspectorSQLitePage db={db} />;
      case 'architecture':
        return <CleanArchLogsPage logs={logs} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <StatusBar
        isOnline={isOnline}
        isEncrypted={isEncrypted}
        onToggleOnline={handleToggleOnline}
        onSync={handleSyncData}
      />

      <div className="max-w-6xl w-full mx-auto p-4 md:p-8 flex-1 flex flex-col">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
              <Wallet className="text-indigo-500 size-8" /> FinanceGuard Pro
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Offline-First | Privacidade Absoluta
            </p>
          </div>
          <TabNav activeTab={activeTab} onChange={setActiveTab} />
        </header>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-slate-950/50 p-3 rounded-2xl border border-slate-800/80">
          <MonthYearPicker
            month={selectedMonth}
            year={selectedYear}
            onMonthChange={(m, y) => {
              setSelectedMonth(m);
              setSelectedYear(y);
            }}
          />

          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold uppercase transition-all"
            >
              <Download className="size-4" /> Exportar CSV
            </button>
            <button
              onClick={() => setIsFormOpen((v) => !v)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase transition-all"
            >
              <PlusCircle className="size-4" /> Novo Lançamento
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6">
          {isFormOpen && (
            <NewTransactionForm
              onSubmit={handleAddTransaction}
              onClose={() => setIsFormOpen(false)}
            />
          )}

          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}
