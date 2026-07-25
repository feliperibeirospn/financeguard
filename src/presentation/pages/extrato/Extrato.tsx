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
    <div className="glass-card overflow-hidden w-full max-w-full border-indigo-500/10">
      {/* Header - Corrigido contraste para não sumir no fundo claro ou escuro */}
      <div className="p-8 md:p-12 border-b border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-slate-100 dark:bg-[#0b0f21]">
        <div className="min-w-0">
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-500 mb-2 leading-none">Status de Lançamentos</h3>
          <p className="text-4xl md:text-6xl font-black text-main uppercase tracking-tighter italic leading-none">{MONTHS[selectedMonth]}</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <span className="flex-1 md:flex-none text-[10px] font-black bg-white dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-8 py-4 rounded-3xl border border-slate-200 dark:border-indigo-500/20 text-center uppercase tracking-widest whitespace-nowrap shadow-sm">
            {filteredTransactions.length} Registros
          </span>
        </div>
      </div>

      {/* List / Table */}
      <div className="flex flex-col w-full overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-32 text-center">
             <p className="text-dim font-black uppercase tracking-widest italic text-sm">Nenhuma atividade detectada.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100 dark:divide-white/5 w-full">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-12 py-5 bg-white dark:bg-[#020617]/50 text-[9px] font-black uppercase tracking-[0.4em] text-dim border-b border-slate-100 dark:border-white/5">
              <div className="col-span-1">Dia</div>
              <div className="col-span-7">Atividade</div>
              <div className="col-span-3 text-right">Valor Líquido</div>
              <div className="col-span-1 text-center">Gestão</div>
            </div>

            {/* Transaction Rows */}
            {filteredTransactions.map((t) => (
              <div key={t.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 px-6 md:px-12 py-8 hover:bg-indigo-500/[0.03] dark:hover:bg-indigo-500/[0.05] transition-all duration-500 group items-center w-full">

                {/* Mobile Top Row: Day + Value */}
                <div className="flex items-center justify-between w-full md:contents">
                  {/* Dia */}
                  <div className="md:col-span-1 flex items-baseline gap-2">
                    <span className="text-3xl md:text-2xl font-black text-main transition-all group-hover:text-indigo-500 leading-none">
                      {new Date(`${t.data}T12:00:00`).getDate()}
                    </span>
                    <span className="md:hidden text-[10px] font-black text-dim uppercase tracking-widest">{MONTHS[selectedMonth].substring(0, 3)}</span>
                  </div>

                  {/* Valor (Mobile) */}
                  <div className={`md:hidden text-xl font-black ${isIncome(t.categoria_id) ? 'text-emerald-500' : 'text-main'}`}>
                    {formatCurrency(t.valor)}
                  </div>
                </div>

                {/* Info Section (Icon + Description) */}
                <div className="md:col-span-7 flex items-center gap-6 w-full min-w-0">
                  <div className="p-4 bg-white dark:bg-[#161c33] rounded-[1.4rem] border border-slate-200 dark:border-white/5 shadow-sm shrink-0 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all duration-500">
                    {isCreditCard(t.forma_pagamento) ? (
                      <CreditCard className="size-6 text-rose-500" />
                    ) : (
                      <Banknote className="size-6 text-emerald-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-main text-lg truncate mb-1 tracking-tight">{t.descricao}</p>
                    <p className="text-[10px] text-dim font-black uppercase tracking-[0.2em] flex items-center gap-3 truncate">
                      <span className="inline-block size-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] shrink-0" />
                      {getCategoryName(t.categoria_id)}
                    </p>
                  </div>
                </div>

                {/* Valor (Desktop) */}
                <div className={`hidden md:block md:col-span-3 text-right font-black text-2xl md:text-xl ${isIncome(t.categoria_id) ? 'text-emerald-500' : 'text-main'}`}>
                  {formatCurrency(t.valor)}
                </div>

                {/* Actions Row (Mobile) / Column (Desktop) */}
                <div className="flex md:col-span-1 justify-end md:justify-center w-full md:w-auto mt-6 md:mt-0 pt-6 md:pt-0 border-t border-slate-100 dark:border-white/5 md:border-none shrink-0">
                  <button
                    onClick={() => handleDeleteTransaction(t.id)}
                    className="flex items-center justify-center gap-3 w-full md:w-auto p-4 text-dim hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all active:scale-95 border border-transparent hover:border-rose-500/20"
                  >
                    <Trash2 className="size-6 md:size-5" />
                    <span className="md:hidden text-[10px] font-black uppercase tracking-widest">Apagar</span>
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
