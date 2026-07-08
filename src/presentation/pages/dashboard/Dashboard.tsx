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
import { ArrowDownCircle, ArrowUpCircle, CreditCard, DollarSign, PiggyBank } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { formatCurrency } from '../../utils/formatCurrency';
import type { FinanceSummary, ChartDatum } from '../../hooks/useFinanceApp';

interface DashboardPageProps {
  summary: FinanceSummary;
  chartData: ChartDatum[];
  savingsTargetPct: number;
}

export const DashboardPage = ({ summary, chartData, savingsTargetPct }: DashboardPageProps) => {
  const savingsPct = summary.savingsRate;
  const progress = Math.min(Math.round((savingsPct / savingsTargetPct) * 100), 100);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card title="Receitas" value={formatCurrency(summary.income)} icon={<ArrowUpCircle className="text-emerald-400 size-5" />} color="text-emerald-50" />
        <Card title="Despesas" value={formatCurrency(summary.expenses)} icon={<ArrowDownCircle className="text-rose-400 size-5" />} color="text-rose-50" />
        <Card title="Cartão" value={formatCurrency(summary.creditCard)} icon={<CreditCard className="text-orange-400 size-5" />} color="text-orange-100" />
        <Card
          title="Balanço"
          value={formatCurrency(summary.netBalance)}
          icon={<DollarSign className="text-indigo-400 size-5" />}
          color={summary.netBalance >= 0 ? 'text-indigo-100' : 'text-rose-300'}
        />
      </div>

      {/* Gráfico + meta de poupança */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass-card p-8 rounded-[2.5rem]">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">
            Composição Mensal
          </h3>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="8 8" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    formatter={(v) => formatCurrency(Number(v))}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '16px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                    }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[10, 10, 10, 10]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} fillOpacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                Aguardando lançamentos...
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-between backdrop-blur-md">
          <div>
            <div className="size-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-6">
              <PiggyBank className="text-indigo-400 size-6" />
            </div>
            <h3 className="font-black text-white text-lg tracking-tight mb-3">
              Meta de Poupança
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Sua taxa atual é de <span className="text-indigo-300 font-bold">{summary.savingsRate.toFixed(1)}%</span>.
              {summary.savingsRate >= savingsTargetPct ? " Parabéns! Meta batida." : " Continue firme!"}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-indigo-300/60 uppercase tracking-widest">Progresso</span>
              <span className="text-2xl font-black text-white">{progress}%</span>
            </div>
            <div className="h-4 w-full bg-slate-950 rounded-full p-1 border border-white/5 overflow-hidden">
              <div
                style={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
