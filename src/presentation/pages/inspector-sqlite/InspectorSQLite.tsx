import { Database } from 'lucide-react';
import type { SqliteDatabase } from '../../../infrastructure/datasources/storage/sqliteStorage';

interface InspectorSQLitePageProps {
  db: SqliteDatabase;
}

const TableHeader = ({ name, count }: { name: string; count: number }) => (
  <div className="flex justify-between items-center bg-slate-900 px-4 py-2 rounded-xl">
    <span className="text-xs font-mono font-bold text-slate-300">TABELA: {name}</span>
    <span className="text-[10px] text-slate-500 font-mono">COUNT: {count}</span>
  </div>
);

export const InspectorSQLitePage = ({ db }: InspectorSQLitePageProps) => (
  <div className="space-y-6">
    <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
        <Database className="text-indigo-400" /> Inspetor Interno de Tabelas (Simulador SQLite)
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-6">
        Toda a sua aplicação de finanças é alimentada por um banco de dados relacional offline
        embutido. Abaixo você pode auditar o conteúdo atual bruto das tabelas locais do SQLite em
        tempo real.
      </p>

      <div className="space-y-4">
        <TableHeader name="transacoes" count={db.transacoes.length} />
        <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl text-[11px]">
          <table className="w-full text-left font-mono text-slate-400">
            <thead className="bg-slate-950 sticky top-0 text-slate-500 border-b border-slate-800">
              <tr>
                <th className="p-3">id</th>
                <th className="p-3">id_remoto (UUID)</th>
                <th className="p-3">descricao</th>
                <th className="p-3">valor</th>
                <th className="p-3">status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {db.transacoes.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/30">
                  <td className="p-3 text-white font-bold">{t.id}</td>
                  <td className="p-3 text-slate-500 truncate max-w-xs">{t.id_remoto}</td>
                  <td className="p-3">{t.descricao}</td>
                  <td className="p-3 text-indigo-400">{t.valor}</td>
                  <td className="p-3 text-xs">{t.status_sincronismo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4 mt-8">
        <TableHeader name={`parcelamentos ("Compras Mãe")`} count={db.parcelamentos.length} />
        <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl text-[11px]">
          {db.parcelamentos.length === 0 ? (
            <div className="p-6 text-center text-slate-600 italic">
              Nenhum parcelamento ativo registrado na tabela.
            </div>
          ) : (
            <table className="w-full text-left font-mono text-slate-400">
              <thead className="bg-slate-950 sticky top-0 text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="p-3">id</th>
                  <th className="p-3">id_remoto</th>
                  <th className="p-3">descricao</th>
                  <th className="p-3">valor_total</th>
                  <th className="p-3">parcelas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {db.parcelamentos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/30">
                    <td className="p-3 text-white font-bold">{p.id}</td>
                    <td className="p-3 text-slate-500 truncate max-w-xs">{p.id_remoto}</td>
                    <td className="p-3">{p.descricao}</td>
                    <td className="p-3 text-indigo-400">{p.valor_total}</td>
                    <td className="p-3">{p.qtd_parcelas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  </div>
);
