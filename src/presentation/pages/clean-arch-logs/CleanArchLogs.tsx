import { Layers } from 'lucide-react';
import { LogEntryItem } from '../../components/logging/LogEntryItem';
import { useLogStore } from '../../../application/state/useLogStore';

export const CleanArchLogsPage = () => {
  const { logs } = useLogStore();

  return (
    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Layers className="text-indigo-400" /> Fluxo de Camadas: Clean Architecture Logs
        </h3>
        <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-indigo-950 border border-indigo-900 rounded text-indigo-400 animate-pulse">
          Monitor Ativo
        </span>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed mb-4">
        Rastreie as interações entre as camadas em tempo real.
      </p>

      <div className="flex-1 bg-slate-900 rounded-xl p-4 overflow-y-auto font-mono text-xs text-slate-400 space-y-2.5 border border-slate-800/80">
        {logs.map((log, index) => (
          <LogEntryItem key={`${log.timestamp}-${index}`} log={log} />
        ))}
      </div>
    </div>
  );
};
