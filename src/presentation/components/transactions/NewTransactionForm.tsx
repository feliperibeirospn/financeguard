import { useState, type FormEvent, useEffect, useRef } from 'react';
import { X as XIcon, PlusCircle as PlusIcon, Sparkles, Mic, Loader2, MicOff, AlertCircle } from 'lucide-react';
import { PAYMENT_METHODS } from '../../../domain/shared/paymentMethods';
import type { Category } from '../../../domain/categories/entities/categories';

export interface NewTransactionFormPayload {
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  installments: number;
  date: string;
  newCategory?: Category;
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
  const [suggestedCategory, setSuggestedCategory] = useState<Category | null>(null);

  // Voice Recognition Ref
  const recognitionRef = useRef<any>(null);

  const initRecognition = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript) setAiText(prev => prev + ' ' + finalTranscript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    return recognition;
  };

  const handleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    setAiText('');
    const rec = initRecognition();
    if (!rec) {
      alert('Reconhecimento não suportado.');
      return;
    }
    recognitionRef.current = rec;
    try { rec.start(); } catch (err) { setIsListening(false); }
  };

  useEffect(() => {
    return () => { if (recognitionRef.current) recognitionRef.current.stop(); };
  }, []);

  const handleAIProcess = async () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    if (!aiText.trim()) return;
    setIsAIProcessing(true);
    setSuggestedCategory(null);

    try {
      const data = await onProcessAICommand(aiText);
      if (data) {
        setDescription(data.descricao || description);
        setAmount(String(data.amount) || amount);
        setPaymentMethod(data.paymentMethod || paymentMethod);
        setInstallments(data.installments || installments);
        setDate(data.date || date);

        if (data.category === 'NEW' && data.suggestedCategory) {
          const newCat: Category = {
            id: `cat_${Date.now()}`,
            ...data.suggestedCategory
          };
          setSuggestedCategory(newCat);
          setCategory(newCat.id);
        } else {
          setCategory(data.category || category);
        }
        setAiText('');
      }
    } catch (err: any) {
      alert(err.message || 'Erro IA');
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
      newCategory: suggestedCategory || undefined
    });
    setDescription('');
    setAmount('');
    setInstallments(1);
    setSuggestedCategory(null);
  };

  return (
    <div className="glass-card p-6 rounded-[2.5rem] border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-white text-lg tracking-tight flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl">
            <PlusIcon className="size-5 text-white" />
          </div>
          Nova Movimentação
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-all">
          <XIcon className="size-5" />
        </button>
      </div>

      {/* IA Section */}
      <div className="mb-6 space-y-3">
        <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 block">Entrada Mágica (IA)</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={isListening ? "Ouvindo... Clique no mic para parar" : "Ex: 'Gastei 50 no BK hoje'"}
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAIProcess()}
              className={`w-full bg-indigo-500/5 border p-4 pl-12 rounded-2xl focus:border-indigo-500 outline-none text-white text-sm transition-all placeholder:text-indigo-300/30 ${
                isListening ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-indigo-500/20'
              }`}
            />
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-indigo-500/50" />
          </div>
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-4 rounded-2xl border transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20'}`}
          >
            {isListening ? <MicOff className="size-5" /> : <Mic className="size-5" />}
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
      </div>

      {/* Suggested Category Alert */}
      {suggestedCategory && (
        <div className="mb-6 p-4 bg-violet-500/20 border border-violet-500/30 rounded-2xl flex items-center gap-3 animate-in slide-in-from-left-4">
          <div className="p-2 bg-violet-500/20 rounded-xl text-violet-400">
            <AlertCircle className="size-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-white">IA sugere criar categoria: {suggestedCategory.icon} {suggestedCategory.name}</p>
            <p className="text-[10px] text-slate-400 uppercase font-black mt-0.5">Ela será salva junto com este lançamento.</p>
          </div>
          <button
            onClick={() => setSuggestedCategory(null)}
            className="text-[10px] font-black text-rose-400 uppercase tracking-widest p-2 hover:bg-rose-500/10 rounded-lg"
          >
            Ignorar
          </button>
        </div>
      )}

      <div className="h-px bg-white/5 mb-6" />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Descrição</label>
              <input
                type="text"
                className="w-full bg-slate-800/50 border border-white/5 p-4 rounded-2xl focus:border-indigo-500 outline-none text-white text-sm"
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
                  className="w-full bg-slate-800/50 border border-white/5 p-4 rounded-2xl focus:border-indigo-500 outline-none text-white text-sm"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Data</label>
                <input
                  type="date"
                  className="w-full bg-slate-800/50 border border-white/5 p-4 rounded-2xl outline-none text-white text-sm"
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
                className="w-full bg-slate-800/50 border border-white/5 p-4 rounded-2xl focus:border-indigo-500 outline-none text-white text-sm appearance-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {suggestedCategory && (
                  <option value={suggestedCategory.id}>{suggestedCategory.icon} {suggestedCategory.name} (Nova)</option>
                )}
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Pagamento</label>
                <select
                  className="w-full bg-slate-800/50 border border-white/5 p-4 rounded-2xl focus:border-indigo-500 outline-none text-white text-sm appearance-none"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                  ))}
                </select>
              </div>
              {paymentMethod === 'cartao' ? (
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Parcelas</label>
                  <div className="bg-slate-800/50 border border-white/5 rounded-2xl px-4 py-3.5">
                    <input
                      type="number"
                      className="w-full bg-transparent outline-none text-white font-bold text-center"
                      value={installments}
                      onChange={(e) => setInstallments(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-end">
                   <div className="bg-slate-900/40 border border-white/5 text-[9px] font-black text-slate-600 uppercase rounded-2xl p-4 text-center">À Vista</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="btn-primary px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest">
            Confirmar Lançamento
          </button>
        </div>
      </form>
    </div>
  );
};
