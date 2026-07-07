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
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Receitas" value={formatCurrency(summary.income)} icon={<ArrowUpCircle className="text-emerald-500 size-4" />} color="text-white" />
        <Card title="Despesas" value={formatCurrency(summary.expenses)} icon={<ArrowDownCircle className="text-rose-500 size-4" />} color="text-white" />
        <Card title="Cartão de Crédito" value={formatCurrency(summary.creditCard)} icon={<CreditCard className="text-orange-500 size-4" />} color="text-orange-400" />
        <Card
          title="Balanço"
          value={formatCurrency(summary.netBalance)}
          icon={<DollarSign className="text-indigo-400 size-4" />}
          color={summary.netBalance >= 0 ? 'text-indigo-400' : 'text-rose-400'}
        />
      </div>

      {/* Gráfico + meta de poupança */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            Composição de Gastos (BRL)
          </h3>
          <div className="h-56">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    formatter={(v) => formatCurrency(Number(v))}
                    contentStyle={{ backgroundColor: '#090d16', border: 'none', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                Sem dados financeiros no período.
              </div>
            )}
          </div>
        </div>

        <div className="bg-indigo-950/40 p-6 rounded-2xl border border-indigo-900/50 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2 mb-2">
              <PiggyBank className="text-indigo-400" /> Meta de Economia
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sua taxa de investimento atual é de <strong>{summary.savingsRate.toFixed(1)}%</strong> da sua receita
              total do mês.
            </p>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-[10px] font-bold text-indigo-300 uppercase">
              <span>Meta de {savingsTargetPct}%</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-indigo-900/50">
              <div
                style={{ width: `${progress}%` }}
                className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
