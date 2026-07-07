import { Database, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import type { LogLayer } from '../../../domain/logging/entities/LogEntry';

interface StatusBarProps {
  isOnline: boolean;
  isEncrypted: boolean;
  onToggleOnline: () => void;
  onSync: () => void;
  /** Mantido na assinatura para futura telemetria — log helper. */
  onLog?: (layer: LogLayer, message: string) => void;
}

export const StatusBar = ({ isOnline, isEncrypted, onToggleOnline, onSync }: StatusBarProps) => (
  <div className="bg-slate-950 text-xs px-4 py-2 flex flex-wrap items-center justify-between border-b border-slate-800 gap-2">
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <Database className="size-3.5 text-indigo-400" />
        <span className="font-semibold text-slate-400">Motor SQLite (Local)</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className={`inline-block size-2 rounded-full ${isEncrypted ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
        <span className="text-slate-400 font-mono">SQLCipher AES-256</span>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <button
        onClick={onToggleOnline}
        className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-slate-800 transition-colors"
        title="Clique para alternar o status da internet"
      >
        {isOnline ? (
          <>
            <Wifi className="size-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-bold uppercase text-[10px]">Rede Online</span>
          </>
        ) : (
          <>
            <WifiOff className="size-3.5 text-rose-400" />
            <span className="text-rose-400 font-bold uppercase text-[10px]">Modo Offline</span>
          </>
        )}
      </button>

      <button
        onClick={onSync}
        className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] transition-colors"
      >
        <RefreshCw className="size-3" />
        Sincronizar
      </button>
    </div>
  </div>
);
