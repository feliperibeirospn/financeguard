import { RefreshCw, Wifi, WifiOff, ShieldCheck } from 'lucide-react';

interface StatusBarProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  onSync: () => void;
}

export const StatusBar = ({ isOnline, onToggleOnline, onSync }: StatusBarProps) => (
  <div className="bg-white dark:bg-slate-950/80 text-[10px] px-6 py-2.5 flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-white/5 gap-4 backdrop-blur-md sticky top-0 z-40">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <ShieldCheck className="size-3.5 text-emerald-500" />
        <span className="font-bold uppercase tracking-widest">Proteção Ativa</span>
      </div>
    </div>

    <div className="flex items-center gap-4 md:gap-6">
      <button
        onClick={onToggleOnline}
        className="flex items-center gap-2 hover:opacity-70 transition-all"
      >
        {isOnline ? (
          <>
            <Wifi className="size-3.5 text-emerald-500" />
            <span className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-tighter">Conectado</span>
          </>
        ) : (
          <>
            <WifiOff className="size-3.5 text-rose-500" />
            <span className="text-rose-500 font-black uppercase tracking-tighter">Offline</span>
          </>
        )}
      </button>

      <button
        onClick={onSync}
        className="flex items-center gap-2 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full font-black uppercase tracking-widest transition-all hover:bg-indigo-500 hover:text-white"
      >
        <RefreshCw className="size-3" />
        Atualizar
      </button>
    </div>
  </div>
);
