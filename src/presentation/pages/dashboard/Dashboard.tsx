import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowDownCircle, ArrowUpCircle, CreditCard, DollarSign, PiggyBank, CalendarClock, ChevronRight } from 'lucide-react';
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
  const { savingsTargetPct, aiInsights } = useConfigStore();
  const { recorrencias, transactions, handleApplyRecurring } = useTransactionStore();
  const { theme } = useThemeStore();

  const savingsPct = summary.savingsRate;
  const progress = Math.min(Math.round((savingsPct / savingsTargetPct) * 100), 100);

  const pendingRecurring = useMemo(() => {
    const existingDescriptions = new Set(transactions.map(t => t.descricao.toLowerCase()));
    return recorrencias.filter(r => !existingDescriptions.has(r.descricao.toLowerCase()));
  }, [recorrencias, transactions]);

  const onRefreshInsights = () => {
    generateInsights(summary, true);
  };

  const isDark = theme === 'dark';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {pendingRecurring.length > 0 && (
        <div className="p-1 rounded-[2.5rem] bg-gradient-to-r from-amber-400/20 to-orange-500/20 border border-amber-200 dark:border-amber-500/10 shadow-xl">
          <div className="glass-card p-6 rounded-[2.4rem] flex flex-col md:flex-row items-center justify-between gap-6 border-none shadow-none">
            <div className="flex items-center gap-5">
              <div className="size-14 bg-amber-100 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-500 border border-amber-200 dark:border-white/5">
                <CalendarClock className="size-7" />
              </div>
              <div>
                <h4 className="font-black text-main text-lg tracking-tight leading-none mb-1">Pagamentos Pendentes</h4>
                <p className="text-xs text-dim font-bold uppercase tracking-tighter">Você possui {pendingRecurring.length} contas fixas para lançar.</p>
              </div>
            </div>
            <button
              onClick={() => handleApplyRecurring(selectedMonth, selectedYear, isOnline)}
              className="w-full md:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-amber-500/20"
            >
              Lançar Agora <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      <AIInsights insights={aiInsights || []} isAnalyzing={isAIAnalyzing} onRefresh={onRefreshInsights} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        <Card title="Receitas" value={formatCurrency(summary.income)} icon={<ArrowUpCircle className="text-emerald-500 size-5" />} color="text-emerald-600 dark:text-emerald-400" />
        <Card title="Despesas" value={formatCurrency(summary.expenses)} icon={<ArrowDownCircle className="text-rose-500 size-5" />} color="text-rose-600 dark:text-rose-400" />
        <Card title="Cartão" value={formatCurrency(summary.creditCard)} icon={<CreditCard className="text-orange-500 size-5" />} color="text-orange-600 dark:text-orange-400" />
        <Card title="Balanço" value={formatCurrency(summary.netBalance)} icon={<DollarSign className="text-indigo-500 size-5" />} color={summary.netBalance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass-card p-8 rounded-[2.5rem]">
          <h3 className="text-[10px] font-black text-dim uppercase tracking-[0.3em] mb-12 ml-1">Análise Estratégica de Gastos</h3>
          <div className="h-72">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="8 8" stroke={isDark ? '#1e293b' : '#e2e8f0'} vertical={false} />
                  <XAxis dataKey="name" stroke={isDark ? '#475569' : '#94a3b8'} fontSize={10} axisLine={false} tickLine={false} dy={10} fontWeight="bold" />
                  <YAxis stroke={isDark ? '#475569' : '#94a3b8'} fontSize={10} axisLine={false} tickLine={false} fontWeight="bold" />
                  <Tooltip
                    cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                    formatter={(v) => formatCurrency(Number(v))}
                    contentStyle={{
                      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(12px)',
                      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                      borderRadius: '24px',
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[14, 14, 14, 14]} barSize={36}>
                    {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.8} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-dim italic text-xs">Aguardando novos lançamentos...</div>
            )}
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border-indigo-500/10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="size-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/10 border border-slate-100 dark:border-white/5">
              <PiggyBank className="text-indigo-500 size-8" />
            </div>
            <h3 className="font-black text-main text-2xl tracking-tight mb-2">Sua Poupança</h3>
            <p className="text-sm text-dim leading-relaxed font-bold">Taxa atual: <span className="text-indigo-600 dark:text-indigo-400 font-black text-lg ml-1">{summary.savingsRate.toFixed(1)}%</span></p>
          </div>

          <div className="mt-12 space-y-5 relative z-10">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Meta: {savingsTargetPct}%</span>
              <span className="text-3xl font-black text-main">{progress}%</span>
            </div>
            <div className="h-6 w-full bg-slate-100 dark:bg-slate-950 rounded-full p-1.5 border border-slate-200 dark:border-white/5 shadow-inner">
              <div style={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(99,102,241,0.4)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
