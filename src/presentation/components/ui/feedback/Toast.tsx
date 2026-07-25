import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
}

export const Toast = ({ message, type, visible }: ToastProps) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className={`flex items-center gap-4 px-8 py-5 rounded-[2rem] shadow-2xl backdrop-blur-2xl border transition-all ${
        type === 'success'
          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
          : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400'
      }`}>
        {type === 'success' ? <CheckCircle2 className="size-5" /> : <AlertCircle className="size-5" />}
        <span className="text-xs font-black uppercase tracking-[0.2em]">{message}</span>
      </div>
    </div>
  );
};
