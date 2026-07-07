import type { ReactNode } from 'react';

/**
 * Card genérico de KPI do Dashboard.
 * Usado para Receitas, Despesas, Cartão, Balanço — e qualquer métrica futura.
 */
interface CardProps {
  title: string;
  value: string;
  icon: ReactNode;
  /** Classes Tailwind que controlam a cor do valor (ex.: "text-emerald-500") */
  color: string;
  subtitle?: string;
}

export const Card = ({ title, value, icon, color, subtitle }: CardProps) => (
  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-indigo-900 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-2">
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
      <div className="p-1.5 bg-slate-900 rounded-lg group-hover:bg-indigo-950 transition-colors">{icon}</div>
    </div>
    <div className={`text-lg font-black tracking-tight ${color}`}>{value}</div>
    {subtitle && <div className="text-[9px] text-slate-400 mt-1 font-bold uppercase truncate">{subtitle}</div>}
  </div>
);
