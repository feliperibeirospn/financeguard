import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  value: string;
  icon: ReactNode;
  color: string;
}

export const Card = ({ title, value, icon, color }: CardProps) => (
  <div className="glass-card p-6 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] hover:shadow-2xl transition-all duration-500">
    {/* Background light effect */}
    <div className="absolute -right-4 -top-4 size-24 bg-indigo-500/5 dark:bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-colors" />

    <div className="flex justify-between items-start mb-6">
      <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">{title}</span>
      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl group-hover:scale-110 transition-all duration-500 border border-slate-100 dark:border-white/5">
        {icon}
      </div>
    </div>

    <div className={`text-2xl font-black tracking-tight ${color} drop-shadow-sm`}>
      {value}
    </div>
  </div>
);
