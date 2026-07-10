import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { ToastState } from '../../../hooks/useFinanceApp';

export const Toast = ({ message, type, visible }: ToastState) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-10 duration-300">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
        type === 'success'
          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100'
          : 'bg-rose-500/20 border-rose-500/50 text-rose-100'
      }`}>
        {type === 'success' ? <CheckCircle2 className="size-5" /> : <AlertCircle className="size-5" />}
        <span className="text-sm font-black uppercase tracking-widest">{message}</span>
      </div>
    </div>
  );
};
