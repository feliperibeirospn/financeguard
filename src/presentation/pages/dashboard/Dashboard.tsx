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

export const DashboardPage = () => {
  const { summary, chartData } = useFinanceSummary();
  const { isAIAnalyzing, selectedMonth, selectedYear, isOnline } = useUIStore();
  const { savingsTargetPct, aiInsights } = useConfigStore();
  const { recorrencias, transactions, handleApplyRecurring } = useTransactionStore();

  const savingsPct = summary.savingsRate;
  const progress = Math.min(Math.round((savingsPct / savingsTargetPct) * 100), 100);

  const pendingRecurring = useMemo(() => {
    const existingDescriptions = new Set(transactions.map(t => t.descricao.toLowerCase()));
    return recorrencias.filter(r => !existingDescriptions.has(r.descricao.toLowerCase()));
  }, [recorrencias, transactions]);

  const onRefreshInsights = () => {
    // TODO: Implement IA Insight generation
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {pendingRecurring.length > 0 && (
        <div className="p-1 rounded-[2rem] bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/20 shadow-2xl shadow-amber-900/10">
          <div className="glass-card p-6 rounded-[1.9rem] flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="size-14 bg-amber-500/20 rounded-[1.2rem] flex items-center justify-center text-amber-400">
                <CalendarClock className="size-7" />
              </div>
              <div>
                <h4 className="font-black text-white text-lg tracking-tight">Contas Fixas Pendentes</h4>
                <p className="text-sm text-slate-400 font-medium">Você possui {pendingRecurring.length} lançamentos fixos para este mês.</p>
              </div>
            </div>
            <button
              onClick={() => handleApplyRecurring(selectedMonth, selectedYear, isOnline)}
              className="w-full md:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-amber-900/20"
            >
              Lançar Agora <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      <AIInsights insights={aiInsights || []} isAnalyzing={isAIAnalyzing} onRefresh={onRefreshInsights} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card title="Receitas" value={formatCurrency(summary.income)} icon={<ArrowUpCircle className="text-emerald-400 size-5" />} color="text-emerald-50" />
        <Card title="Despesas" value={formatCurrency(summary.expenses)} icon={<ArrowDownCircle className="text-rose-400 size-5" />} color="text-rose-50" />
        <Card title="Cartão" value={formatCurrency(summary.creditCard)} icon={<CreditCard className="text-orange-400 size-5" />} color="text-orange-100" />
        <Card title="Balanço" value={formatCurrency(summary.netBalance)} icon={<DollarSign className="text-indigo-400 size-5" />} color={summary.netBalance >= 0 ? 'text-indigo-100' : 'text-rose-300'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass-card p-8 rounded-[2.5rem]">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Composição Mensal</h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="8 8" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} formatter={(v) => formatCurrency(Number(v))} contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[10, 10, 10, 10]} barSize={32}>
                    {chartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.9} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">Aguardando lançamentos...</div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between backdrop-blur-md">
          <div><div className="size-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6"><PiggyBank className="text-indigo-400 size-6" /></div><h3 className="font-black text-white text-lg tracking-tight mb-3">Meta de Poupança</h3><p className="text-sm text-slate-400 leading-relaxed font-medium">Sua taxa atual é de <span className="text-indigo-300 font-bold">{summary.savingsRate.toFixed(1)}%</span>. {summary.savingsRate >= savingsTargetPct ? " Parabéns!" : " Continue firme!"}</p></div>
          <div className="mt-8 space-y-4"><div className="flex justify-between items-end"><span className="text-[10px] font-black text-indigo-300/60 uppercase tracking-widest">Progresso</span><span className="text-2xl font-black text-white">{progress}%</span></div><div className="h-4 w-full bg-slate-950 rounded-full p-1 border border-white/5 overflow-hidden"><div style={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.4)]" /></div></div>
        </div>
      </div>
    </div>
  );
};
