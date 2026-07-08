import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: string;
  subtitle?: string;
}

export const Card = ({ title, value, icon, color, subtitle }: CardProps) => (
  <div className="glass-card p-5 rounded-[2rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
    {/* Efeito de luz sutil no fundo */}
    <div className="absolute -right-4 -top-4 size-24 bg-indigo-500/5 blur-2xl group-hover:bg-indigo-500/10 transition-colors" />

    <div className="flex justify-between items-start mb-3">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{title}</span>
      <div className="p-2 bg-slate-800/50 rounded-2xl group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
    </div>

    <div className={`text-xl font-black tracking-tight ${color} drop-shadow-sm`}>
      {value}
    </div>

    {subtitle && (
      <div className="text-[10px] text-slate-500 mt-2 font-medium tracking-wide truncate">
        {subtitle}
      </div>
    )}
  </div>
);
