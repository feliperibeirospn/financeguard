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
    <div className="glass-card overflow-hidden w-full max-w-full">
      {/* Header */}
      <div className="p-6 md:p-10 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white/30 dark:bg-slate-900/30">
        <div className="min-w-0">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 truncate">Fluxo Mensal</h3>
          <p className="text-2xl font-black text-main mt-1 uppercase tracking-tight">{MONTHS[selectedMonth]}</p>
        </div>
        <span className="hidden sm:inline-flex text-[11px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-2xl border border-indigo-500/20 whitespace-nowrap">
          {filteredTransactions.length} Lançamentos
        </span>
      </div>

      {/* List / Table */}
      <div className="flex flex-col w-full overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-24 text-center">
             <p className="text-dim font-bold italic text-sm">Nenhuma movimentação para este período.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-white/5 w-full">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-10 py-5 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-black uppercase tracking-widest text-dim border-b border-slate-100 dark:border-white/5">
              <div className="col-span-1">Dia</div>
              <div className="col-span-7">Descrição</div>
              <div className="col-span-3 text-right">Valor</div>
              <div className="col-span-1 text-center">Ações</div>
            </div>

            {/* Transaction Rows */}
            {filteredTransactions.map((t) => (
              <div key={t.id} className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 px-6 md:px-10 py-6 hover:bg-indigo-500/[0.03] dark:hover:bg-white/[0.02] transition-colors group items-center w-full">

                {/* Mobile Top Row: Day + Value */}
                <div className="flex items-center justify-between w-full md:contents">
                  {/* Dia */}
                  <div className="md:col-span-1 flex items-baseline gap-2">
                    <span className="text-2xl md:text-xl font-black text-main md:text-dim group-hover:text-indigo-500 transition-colors leading-none">
                      {new Date(`${t.data}T12:00:00`).getDate()}
                    </span>
                    <span className="md:hidden text-[10px] font-black text-dim uppercase">{MONTHS[selectedMonth].substring(0, 3)}</span>
                  </div>

                  {/* Valor (Mobile) */}
                  <div className={`md:hidden text-lg font-black ${isIncome(t.categoria_id) ? 'text-emerald-500' : 'text-main'}`}>
                    {formatCurrency(t.valor)}
                  </div>
                </div>

                {/* Info Section (Icon + Description) */}
                <div className="md:col-span-7 flex items-center gap-4 w-full min-w-0">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm shrink-0">
                    {isCreditCard(t.forma_pagamento) ? (
                      <CreditCard className="size-5 text-rose-500" />
                    ) : (
                      <Banknote className="size-5 text-emerald-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-main text-base truncate mb-0.5">{t.descricao}</p>
                    <p className="text-[10px] text-dim font-black uppercase tracking-widest flex items-center gap-2 truncate">
                      <span className="inline-block size-1.5 rounded-full bg-indigo-500/40 shrink-0" />
                      {getCategoryName(t.categoria_id)}
                    </p>
                  </div>
                </div>

                {/* Valor (Desktop) */}
                <div className={`hidden md:block md:col-span-3 text-right font-black text-lg ${isIncome(t.categoria_id) ? 'text-emerald-500' : 'text-main'}`}>
                  {formatCurrency(t.valor)}
                </div>

                {/* Actions Row (Mobile) / Column (Desktop) */}
                <div className="flex md:col-span-1 justify-end md:justify-center w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t border-slate-100 dark:border-white/5 md:border-none shrink-0">
                  <button
                    onClick={() => handleDeleteTransaction(t.id)}
                    className="flex items-center justify-center gap-2 w-full md:w-auto p-3 text-dim hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all active:scale-95"
                  >
                    <Trash2 className="size-5" />
                    <span className="md:hidden text-[10px] font-black uppercase tracking-widest">Remover Lançamento</span>
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
