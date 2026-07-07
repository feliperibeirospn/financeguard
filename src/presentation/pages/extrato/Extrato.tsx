import { Banknote, CheckCircle, Clock, CreditCard, Trash2 } from 'lucide-react';
import type { Transacao } from '../../../domain/transactions/entities/Transacao';
import { INITIAL_CATEGORIES } from '../../../domain/categories/entities/categories';
import { MONTHS } from '../../../domain/shared/months';
import { formatCurrency } from '../../utils/formatCurrency';

interface ExtratoPageProps {
  filteredTransactions: Transacao[];
  selectedMonth: number;
  onDelete: (id: string) => void;
}

const getCategoryName = (id: string): string =>
  INITIAL_CATEGORIES.find((c) => c.id === id)?.name ?? 'Outro';

const isCreditCard = (t: Transacao): boolean => t.forma_pagamento === 'cartao';
const isReceita = (t: Transacao): boolean => t.categoria_id === 'cat_receita';

export const ExtratoPage = ({ filteredTransactions, selectedMonth, onDelete }: ExtratoPageProps) => (
  <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
    <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
      <h3 className="text-xs font-bold uppercase text-slate-400">Extrato Consolidado do Mês</h3>
      <span className="text-[10px] font-black bg-indigo-950 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded-full">
        {filteredTransactions.length} Lançamentos
      </span>
    </div>

    <div className="overflow-x-auto">
      {filteredTransactions.length === 0 ? (
        <div className="p-16 text-center text-slate-500 italic text-sm">
          Nenhum registro para {MONTHS[selectedMonth]}.
        </div>
      ) : (
        <table className="w-full text-left">
          <thead className="bg-slate-900/30 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800/60">
            <tr>
              <th className="px-6 py-3">Dia</th>
              <th className="px-6 py-3">Detalhes</th>
              <th className="px-6 py-3 text-right">Valor</th>
              <th className="px-6 py-3 text-center">Sincronismo</th>
              <th className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-xs text-slate-300">
            {filteredTransactions.map((t) => {
              const synced = t.status_sincronismo === 'SINCRONIZADO';
              return (
                <tr key={t.id} className="hover:bg-slate-900/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-500 group-hover:text-indigo-400 transition-colors">
                      {new Date(`${t.data}T12:00:00`).getDate()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{t.descricao}</span>
                      {isCreditCard(t) ? (
                        <CreditCard className="size-3.5 text-orange-400" />
                      ) : (
                        <Banknote className="size-3.5 text-emerald-400" />
                      )}
                    </div>
                    <div className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">
                      {getCategoryName(t.categoria_id)}
                    </div>
                  </td>
                  <td
                    className={`px-6 py-4 text-right font-black text-sm ${
                      isReceita(t) ? 'text-emerald-500' : 'text-slate-100'
                    }`}
                  >
                    {formatCurrency(t.valor)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        synced
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                          : 'bg-amber-950/40 text-amber-400 border-amber-900/50'
                      }`}
                    >
                      {synced ? <CheckCircle className="size-2.5" /> : <Clock className="size-2.5 animate-pulse" />}
                      {t.status_sincronismo}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onDelete(t.id)}
                      className="text-slate-500 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-900 transition-all"
                      aria-label="Remover transação"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  </div>
);
