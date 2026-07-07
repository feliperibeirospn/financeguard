import { useState, type FormEvent } from 'react';
import { PlusCircle, X } from 'lucide-react';
import { INITIAL_CATEGORIES } from '../../../domain/categories/entities/categories';
import { PAYMENT_METHODS } from '../../../domain/shared/paymentMethods';

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
}

export const NewTransactionForm = ({ onSubmit, onClose }: NewTransactionFormProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('cat_essencial');
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
    // Reset apenas após o caller fechar o form (evita dois resets)
    setDescription('');
    setAmount('');
    setInstallments(1);
  };

  return (
    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-2xl animate-in fade-in duration-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-black text-white text-sm uppercase tracking-wider flex items-center gap-2">
          <PlusCircle className="size-5 text-indigo-500" /> Registrar Movimentação Local
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
          aria-label="Fechar formulário"
        >
          <X className="size-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Descrição (ex: Supermercado Assaí)"
              className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="Valor R$"
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white text-sm"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <input
                type="date"
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white text-sm text-center"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <select
              className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-indigo-500 outline-none text-white text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {INITIAL_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <select
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-indigo-500 outline-none text-white text-sm"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.name}
                  </option>
                ))}
              </select>

              {paymentMethod === 'cartao' ? (
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Dividido em</span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    className="w-12 bg-transparent outline-none text-white font-bold text-center"
                    value={installments}
                    onChange={(e) => setInstallments(parseInt(e.target.value) || 1)}
                  />
                  <span className="text-[10px] font-black text-slate-500">x</span>
                </div>
              ) : (
                <div className="flex items-center justify-center bg-slate-900/40 border border-slate-800/40 text-[9px] font-bold text-slate-500 uppercase rounded-xl">
                  À Vista
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-xs uppercase"
          >
            Salvar no SQLite
          </button>
        </div>
      </form>
    </div>
  );
};
