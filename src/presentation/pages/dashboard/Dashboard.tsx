import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { ArrowDownCircle, ArrowUpCircle, CreditCard, DollarSign, PiggyBank, CalendarClock, ChevronRight, PieChart as PieIcon } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { AIInsights } from '../../components/ui/feedback/AIInsights';
import { formatCurrency } from '../../utils/formatCurrency';
import { useFinanceSummary } from '../../hooks/useFinanceSummary';
import { useUIStore } from '../../../application/state/useUIStore';
import { useConfigStore } from '../../../application/state/useConfigStore';
import { useTransactionStore } from '../../../application/state/useTransactionStore';
import { useThemeStore } from '../../../application/state/useThemeStore';
import { generateInsights } from '../../../application/services/AIService';

export const DashboardPage = () => {
  const { summary, chartData } = useFinanceSummary();
  const { isAIAnalyzing, selectedMonth, selectedYear, isOnline } = useUIStore();
  const { savingsTargetPct, lastAIAnalysis } = useConfigStore();
  const aiInsights = lastAIAnalysis?.insights || [];
  const { recorrencias, transactions, handleApplyRecurring } = useTransactionStore();
  const { theme } = useThemeStore();

  const savingsPct = summary.savingsRate;
  const progress = Math.min(Math.round((savingsPct / savingsTargetPct) * 100), 100);

  const pendingRecurring = useMemo(() => {
    const existingDescriptions = new Set(
      transactions
        .filter(t => t && t.descricao)
        .map(t => t.descricao.toLowerCase())
    );
    return recorrencias.filter(r =>
      r && r.descricao && !existingDescriptions.has(r.descricao.toLowerCase())
    );
  }, [recorrencias, transactions]);

  const onRefreshInsights = () => {
    generateInsights(summary, true);
  };

  const isDark = theme === 'dark';

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
      {/* Banner de Recorrências - High Impact */}
      {pendingRecurring.length > 0 && (
        <div className="relative group overflow-hidden p-1 rounded-[2.5rem] bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-amber-500/30 shadow-2xl shadow-amber-500/10 transition-all">
          <div className="glass-card p-6 md:p-8 rounded-[2.4rem] flex flex-col md:flex-row items-center justify-between gap-6 border-none shadow-none backdrop-blur-none bg-white/80 dark:bg-slate-900/60">
            <div className="flex items-center gap-6">
              <div className="size-16 bg-amber-500/10 rounded-[1.5rem] flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <CalendarClock className="size-8" />
              </div>
              <div>
                <h4 className="font-black text-main text-xl tracking-tighter leading-none mb-1">Pagamentos Pendentes</h4>
                <p className="text-[11px] text-sub font-black uppercase tracking-[0.1em]">Você possui <span className="text-amber-500">{pendingRecurring.length} contas</span> fixas aguardando lançamento.</p>
              </div>
            </div>
            <button
              onClick={() => handleApplyRecurring(selectedMonth, selectedYear, isOnline)}
              className="w-full md:w-auto px-10 py-5 bg-amber-500 hover:bg-amber-400 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-amber-500/30"
            >
              Lançar Agora <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Insights com IA */}
      <AIInsights insights={aiInsights || []} isAnalyzing={isAIAnalyzing} onRefresh={onRefreshInsights} />

      {/* Grid de KPIs - 4 colunas desktop, 2 colunas mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        <Card title="Entradas" value={formatCurrency(summary.income)} icon={<ArrowUpCircle className="text-emerald-500 size-6" />} color="text-emerald-600 dark:text-emerald-400" />
        <Card title="Saídas" value={formatCurrency(summary.expenses)} icon={<ArrowDownCircle className="text-rose-500 size-6" />} color="text-rose-600 dark:text-rose-400" />
        <Card title="Cartão" value={formatCurrency(summary.creditCard)} icon={<CreditCard className="text-orange-500 size-6" />} color="text-orange-600 dark:text-orange-400" />
        <Card title="Disponível" value={formatCurrency(summary.netBalance)} icon={<DollarSign className="text-indigo-500 size-6" />} color={summary.netBalance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-500'} />
      </div>

      {/* Seção Principal: Gráfico e Poupança */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">

        {/* Gráfico Donut - Pro Level */}
        <div className="lg:col-span-8 glass-card p-8 md:p-12 flex flex-col relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-xl"><PieIcon className="size-5" /></div>
              <h3 className="text-[11px] font-black text-main uppercase tracking-[0.4em]">Distribuição de Fluxo</h3>
            </div>
            <div className="hidden sm:block text-[10px] font-black text-dim uppercase tracking-widest">Análise Mensal</div>
          </div>

          <div className="h-80 md:h-[400px] w-full relative">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="65%"
                    outerRadius="85%"
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                    animationBegin={200}
                    animationDuration={1800}
                    animationEasing="ease-out"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        className="hover:opacity-90 transition-all cursor-pointer outline-none filter drop-shadow-lg"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [formatCurrency(v), 'Total']}
                    contentStyle={{
                      backgroundColor: isDark ? 'rgba(11, 15, 33, 0.95)' : 'rgba(255, 255, 255, 0.98)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '24px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                      padding: '16px 24px',
                      fontWeight: 'bold'
                    }}
                    itemStyle={{ color: 'var(--text-primary)', fontSize: '14px' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    layout="horizontal"
                    wrapperStyle={{ paddingTop: '30px' }}
                    formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-sub mx-2 hover:text-main transition-colors">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                 <p className="text-dim font-bold italic text-sm border-2 border-dashed border-slate-200 dark:border-white/5 p-10 rounded-[2rem]">Aguardando dados para gerar o gráfico...</p>
              </div>
            )}

            {/* Center Label for Donut (Total Expenses) */}
            {chartData.length > 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-6 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[9px] font-black text-dim uppercase tracking-[0.3em] mb-1">Gasto Total</span>
                <span className="text-2xl md:text-3xl font-black text-main tracking-tighter">{formatCurrency(summary.expenses)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card de Poupança - Modern UX */}
        <div className="lg:col-span-4 glass-card p-10 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-indigo-600/5 to-violet-600/5 border-indigo-500/10">
          <div className="absolute -right-20 -top-20 size-64 bg-indigo-500/10 blur-[80px] rounded-full" />

          <div className="relative z-10">
            <div className="size-20 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-10 shadow-2xl border border-slate-100 dark:border-white/5 rotate-3 group-hover:rotate-0 transition-transform duration-700">
              <PiggyBank className="text-indigo-500 size-10" />
            </div>
            <h3 className="font-black text-main text-3xl tracking-tighter uppercase italic mb-2">Meta de Poupança</h3>
            <p className="text-sm text-sub leading-relaxed font-bold">Atualmente você está retendo <span className="text-indigo-600 dark:text-indigo-400 font-black text-xl ml-1">{summary.savingsRate.toFixed(1)}%</span> dos ganhos.</p>
          </div>

          <div className="mt-20 space-y-6 relative z-10">
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Progresso Global</span>
                <span className="text-5xl font-black text-main tracking-tighter">{progress}%</span>
              </div>
              <span className="text-[11px] font-black text-dim uppercase mb-2">Meta: {savingsTargetPct}%</span>
            </div>
            <div className="h-8 w-full bg-slate-100 dark:bg-slate-950 rounded-full p-2 border border-slate-200 dark:border-white/5 shadow-inner relative overflow-hidden">
               {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              <div
                style={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500 rounded-full transition-all duration-[2000ms] cubic-bezier(0.34, 1.56, 0.64, 1) shadow-[0_0_25px_rgba(99,102,241,0.6)] relative"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
