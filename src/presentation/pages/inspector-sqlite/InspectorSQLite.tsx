import { Database } from 'lucide-react';
import { useTransactionStore } from '../../../application/state/useTransactionStore';

const TableHeader = ({ name, count }: { name: string; count: number }) => (
  <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 px-5 py-3 rounded-2xl">
    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Tabela: {name}</span>
    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black">{count} registros</span>
  </div>
);

export const InspectorSQLitePage = () => {
  const { transactions } = useTransactionStore();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="glass-card p-8 rounded-[2.5rem]">
        <h3 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-3">
          <Database className="text-indigo-500 size-5" /> Inspetor de Dados
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-8">
          Auditando banco de dados local IndexedDB via Dexie.
        </p>

        <div className="space-y-6">
          <div className="space-y-4">
            <TableHeader name="transacoes" count={transactions.length} />
            <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-white/5 rounded-[2rem] custom-scrollbar">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-50 dark:bg-slate-950 sticky top-0 text-slate-400 border-b border-slate-200 dark:border-white/5">
                  <tr><th className="p-4">ID</th><th className="p-4">Descrição</th><th className="p-4 text-right">Valor</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-indigo-500/5 transition-colors">
                      <td className="p-4 text-slate-400 font-mono">{t.id}</td>
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{t.descricao}</td>
                      <td className="p-4 text-right font-black text-indigo-500">{t.valor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
