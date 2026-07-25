import { Banknote, CreditCard, Trash2 } from 'lucide-react';
import { MONTHS } from '../../../domain/shared/months';
import { formatCurrency } from '../../utils/formatCurrency';
import { useFinanceSummary } from '../../hooks/useFinanceSummary';
import { useUIStore } from '../../../application/state/useUIStore';
import { useTransactionStore } from '../../../application/state/useTransactionStore';
import { useCategoryStore } from '../../../application/state/useCategoryStore';

export const ExtratoPage = () => {
  const { filteredTransactions } = useFinanceSummary();
  const { selectedMonth } = useUIStore();
  const { handleDeleteTransaction } = useTransactionStore();
  const { categories } = useCategoryStore();

  const getCategoryName = (id: string): string =>
    categories.find((c) => c.id === id)?.name ?? 'Outro';

  const isCreditCard = (forma: string): boolean => forma === 'cartao';
  const isIncome = (catId: string): boolean => {
    const cat = categories.find(c => c.id === catId);
    return cat?.type === 'income';
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-6 md:p-10 bg-white/40 dark:bg-slate-900/40 border-b border-slate-200 dark:border-white/5 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Extrato Detalhado</h3>
          <p className="text-xl font-black text-slate-800 dark:text-white mt-1 uppercase tracking-tight">{MONTHS[selectedMonth]}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[11px] font-black bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-2xl border border-slate-200 dark:border-white/10">
            {filteredTransactions.length} Lançamentos
          </span>
        </div>
      </div>

      <div className="p-2 md:p-0 overflow-x-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-24 text-center">
             <p className="text-slate-400 dark:text-slate-600 font-bold italic text-sm">Nenhuma movimentação neste mês.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-white/5">
            {/* Cabeçalho oculto em mobile, visível em desktop */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-10 py-5 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <div className="col-span-1">Dia</div>
              <div className="col-span-7">Descrição / Categoria</div>
              <div className="col-span-3 text-right">Valor</div>
              <div className="col-span-1 text-center">Ações</div>
            </div>

            {filteredTransactions.map((t) => (
              <div key={t.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 md:px-10 py-6 hover:bg-indigo-500/[0.03] dark:hover:bg-white/[0.02] transition-colors group items-center">
                {/* Data - Mobile: Lado a lado com descrição | Desktop: Coluna 1 */}
                <div className="md:col-span-1 flex md:block items-center gap-2">
                   <span className="text-lg md:text-xl font-black text-slate-400 dark:text-slate-700 group-hover:text-indigo-500 transition-colors leading-none">
                    {new Date(`${t.data}T12:00:00`).getDate()}
                  </span>
                  <span className="md:hidden text-[10px] font-black text-slate-400 uppercase">{MONTHS[selectedMonth].substring(0, 3)}</span>
                </div>

                {/* Detalhes */}
                <div className="col-span-1 md:col-span-7 flex items-center gap-4">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5">
                    {isCreditCard(t.forma_pagamento) ? (
                      <CreditCard className="size-5 text-rose-500" />
                    ) : (
                      <Banknote className="size-5 text-emerald-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 dark:text-white text-base truncate mb-0.5">{t.descricao}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                      <span className="inline-block size-1.5 rounded-full bg-indigo-500/40" />
                      {getCategoryName(t.categoria_id)}
                    </p>
                  </div>
                </div>

                {/* Valor */}
                <div className={`md:col-span-3 text-left md:text-right font-black text-lg ${isIncome(t.categoria_id) ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
                  {formatCurrency(t.valor)}
                </div>

                {/* Ações */}
                <div className="md:col-span-1 flex justify-end md:justify-center">
                  <button
                    onClick={() => handleDeleteTransaction(t.id)}
                    className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all active:scale-90"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
