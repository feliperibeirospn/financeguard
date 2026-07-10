import { useState, type FormEvent, useEffect, useRef } from 'react';
import { X as XIcon, PlusCircle as PlusIcon, Sparkles, Mic, Loader2 } from 'lucide-react';
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
  onProcessAICommand: (text: string) => Promise<any>;
}

export const NewTransactionForm = ({ onSubmit, onClose, categories, onProcessAICommand }: NewTransactionFormProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');
  const [installments, setInstallments] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // IA States
  const [aiText, setAiText] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Voice Recognition Ref
  const recognitionRef = useRef<any>(null);

  const initRecognition = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = false; // Importante para mobile: parar após a frase
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      console.log('Microfone ativado...');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setAiText(transcript);
      console.log('Texto capturado:', transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Erro no reconhecimento:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert('Permissão de microfone negada.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Microfone desligado.');
    };

    return recognition;
  };

  const handleVoiceInput = () => {
    // No Mobile/WebView, é melhor recriar a instância no clique para garantir permissões
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      return;
    }

    const rec = initRecognition();
    if (!rec) {
      alert('Reconhecimento de voz não suportado neste dispositivo.');
      return;
    }

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      console.error('Falha ao iniciar:', err);
      setIsListening(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const handleAIProcess = async () => {
    if (!aiText.trim()) return;
    setIsAIProcessing(true);
    try {
      const data = await onProcessAICommand(aiText);
      if (data) {
        setDescription(data.descricao || description);
        setAmount(String(data.amount) || amount);
        setCategory(data.category || category);
        setPaymentMethod(data.paymentMethod || paymentMethod);
        setInstallments(data.installments || installments);
        setDate(data.date || date);
        setAiText('');
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao processar comando IA');
    } finally {
      setIsAIProcessing(false);
    }
  };

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
          className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-all"
        >
          <XIcon className="size-5" />
        </button>
      </div>

      <div className="mb-6 space-y-3">
        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 block">
          Entrada Mágica (IA)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={isListening ? "Ouvindo... Pode falar!" : "Ex: 'Gastei 50 no BK hoje'"}
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAIProcess()}
              className={`w-full bg-indigo-500/5 border p-4 pl-12 rounded-2xl focus:border-indigo-500 outline-none text-white text-sm transition-all placeholder:text-indigo-300/30 ${
                isListening ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'border-indigo-500/20'
              }`}
            />
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-indigo-500/50" />
          </div>

          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-4 rounded-2xl border transition-all ${
              isListening
                ? 'bg-rose-500/20 border-rose-500 text-rose-500 animate-pulse'
                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20'
            }`}
          >
            <Mic className="size-5" />
          </button>

          <button
            type="button"
            onClick={handleAIProcess}
            disabled={isAIProcessing || !aiText.trim()}
            className="btn-primary px-6 rounded-2xl flex items-center justify-center disabled:opacity-50"
          >
            {isAIProcessing ? <Loader2 className="size-5 animate-spin" /> : 'Processar'}
          </button>
        </div>
        <p className="text-[9px] text-slate-500 font-medium px-2">
          {isListening ? "Estou te ouvindo agora..." : "Clique no microfone e diga o que gastou."}
        </p>
      </div>

      <div className="h-px bg-white/5 mb-6" />

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
