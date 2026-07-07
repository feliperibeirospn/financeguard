import type { LogEntry, LogLayer } from '../../../domain/logging/entities/LogEntry';

const layerClasses: Record<LogLayer, string> = {
  'PRESENTATION (UI)': 'bg-blue-950 text-blue-400 border border-blue-900/50',
  DOMAIN: 'bg-purple-950 text-purple-400 border border-purple-900/50',
  'DATA (REPOSITORIES)': 'bg-amber-950 text-amber-400 border border-amber-900/50',
  INFRASTRUCTURE: 'bg-emerald-950 text-emerald-400 border border-emerald-900/50',
};

export const LogEntryItem = ({ log }: { log: LogEntry }) => (
  <div className="flex gap-2.5 items-start leading-normal animate-in fade-in slide-in-from-top-1">
    <span className="text-slate-500 font-bold select-none">[{log.timestamp}]</span>
    <span
      className={`font-black uppercase tracking-tight text-[10px] px-1.5 py-0.5 rounded min-w-[120px] text-center ${layerClasses[log.layer]}`}
    >
      {log.layer}
    </span>
    <span className="text-slate-200">{log.message}</span>
  </div>
);
