import { useState, type FormEvent } from 'react';
import { X as XIcon, PlusCircle as PlusIcon } from 'lucide-react';
import { PAYMENT_METHODS } from '../../../domain/shared/paymentMethods';
import type { Category } from '../../../domain/categories/entities/categories';

export interface NewTransactionFormPayload {
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  installments: number;
  date: string;
}

interface NewTransactionFormProps {
  onSubmit: (payload: NewTransactionFormPayload) => void;
  onClose: () => void;
  categories: Category[];
}

export const NewTransactionForm = ({ onSubmit, onClose, categories }: NewTransactionFormProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');
  const [installments, setInstallments] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    onSubmit({
      description,
      amount: parseFloat(amount),
      category,
      paymentMethod,
      installments,
      date,
    });
    setDescription('');
    setAmount('');
    setInstallments(1);
  };

  return (
    <div className="glass-card p-6 rounded-[2.5rem] border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-white text-lg tracking-tight flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl">
            <PlusIcon className="size-5 text-indigo-400" />
          </div>
          Nova Movimentação
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <XIcon className="size-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">O que você comprou/recebeu?</label>
              <input
                type="text"
                placeholder="Ex: Supermercado, Salário..."
                className="w-full bg-slate-800/50 border border-white/5 p-4 rounded-2xl focus:border-indigo-500 outline-none text-white text-sm transition-all"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="w-full bg-slate-800/50 border border-white/5 p-4 rounded-2xl focus:border-indigo-500 outline-none text-white text-sm transition-all"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Data</label>
                <input
                  type="date"
                  className="w-full bg-slate-800/50 border border-white/5 p-4 rounded-2xl focus:border-indigo-500 outline-none text-white text-sm transition-all"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Categoria</label>
              <select
                className="w-full bg-slate-800/50 border border-white/5 p-4 rounded-2xl focus:border-indigo-500 outline-none text-white text-sm transition-all appearance-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Pagamento</label>
                <select
                  className="w-full bg-slate-800/50 border border-white/5 p-4 rounded-2xl focus:border-indigo-500 outline-none text-white text-sm transition-all appearance-none"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm.id} value={pm.id}>
                      {pm.name}
                    </option>
                  ))}
                </select>
              </div>

              {paymentMethod === 'cartao' ? (
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Parcelas</label>
                  <div className="flex items-center gap-2 bg-slate-800/50 border border-white/5 rounded-2xl px-4 py-3.5">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      className="w-full bg-transparent outline-none text-white font-bold text-center"
                      value={installments}
                      onChange={(e) => setInstallments(parseInt(e.target.value) || 1)}
                    />
                    <span className="text-[10px] font-black text-slate-500 uppercase">x</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-end">
                   <div className="bg-slate-900/40 border border-white/5 text-[9px] font-black text-slate-600 uppercase rounded-2xl p-4 text-center">
                    Pagamento à Vista
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="btn-primary px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest"
          >
            Confirmar Lançamento
          </button>
        </div>
      </form>
    </div>
  );
};
