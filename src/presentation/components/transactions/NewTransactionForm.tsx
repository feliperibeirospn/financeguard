import { useState, type FormEvent, useEffect, useRef } from 'react';
import { X as XIcon, PlusCircle as PlusIcon, Sparkles, Mic, Loader2, MicOff } from 'lucide-react';
import { PAYMENT_METHODS } from '../../../domain/shared/paymentMethods';
import type { Category } from '../../../domain/categories/entities/categories';
import type { CartaoCredito } from '../../../infrastructure/datasources/storage/sqliteStorage';

export interface NewTransactionFormPayload {
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  installments: number;
  date: string;
  cartaoId?: string;
  newCategory?: Category;
}

interface NewTransactionFormProps {
  onSubmit: (payload: NewTransactionFormPayload) => void;
  onClose: () => void;
  categories: Category[];
  cartoes?: CartaoCredito[];
  enableCreditCardStatement?: boolean;
  onProcessAICommand: (text: string) => Promise<any>;
}

export const NewTransactionForm = ({
  onSubmit,
  onClose,
  categories,
  cartoes = [],
  enableCreditCardStatement = false,
  onProcessAICommand
}: NewTransactionFormProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');
  const [installments, setInstallments] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cartaoId, setCartaoId] = useState(cartoes[0]?.id || '');

  // IA States
  const [aiText, setAiText] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<Category | null>(null);

  const recognitionRef = useRef<any>(null);

  const initRecognition = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
      }
      if (finalTranscript) setAiText(prev => (prev ? prev + ' ' + finalTranscript : finalTranscript));
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => { if (isListening) { try { recognition.start(); } catch(e) {} } else { setIsListening(false); } };
    return recognition;
  };

  const handleVoiceInput = () => {
    if (isListening) { setIsListening(false); if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop(); } return; }
    setAiText('');
    const rec = initRecognition();
    if (!rec) { alert('Voz não suportada.'); return; }
    recognitionRef.current = rec;
    try { rec.start(); } catch (err) { setIsListening(false); }
  };

  useEffect(() => { return () => { if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop(); } }; }, []);

  const handleAIProcess = async () => {
    if (isListening) { setIsListening(false); if (recognitionRef.current) { recognitionRef.current.onend = null; recognitionRef.current.stop(); } }
    if (!aiText.trim()) return;
    setIsAIProcessing(true);
    try {
      const data = await onProcessAICommand(aiText);
      if (data) {
        setDescription(data.descricao || description);
        setAmount(String(data.amount) || amount);
        setPaymentMethod(data.paymentMethod || paymentMethod);
        setInstallments(data.installments || installments);
        setDate(data.date || date);
        if (data.category === 'NEW' && data.suggestedCategory) {
          const emojiFallback: Record<string, string> = { 'computer': '💻', 'car': '🚗', 'videogame': '🎮', 'food': '🍔', 'health': '💊', 'home': '🏠' };
          const rawIcon = data.suggestedCategory.icon?.toLowerCase() || '📦';
          const finalIcon = emojiFallback[rawIcon] || (rawIcon.length > 2 ? '📦' : rawIcon);
          const newCat: Category = { id: `cat_${Date.now()}`, ...data.suggestedCategory, icon: finalIcon };
          setSuggestedCategory(newCat);
          setCategory(newCat.id);
        } else { setCategory(data.category || category); }
        setAiText('');
      }
    } catch (err: any) { alert(err.message || 'Erro IA'); } finally { setIsAIProcessing(false); }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    onSubmit({ description, amount: parseFloat(amount), category, paymentMethod, installments, date, cartaoId: (paymentMethod === 'cartao' && enableCreditCardStatement) ? cartaoId : undefined, newCategory: suggestedCategory || undefined });
    setDescription(''); setAmount(''); setInstallments(1); setSuggestedCategory(null);
  };

  return (
    <div className="glass-card p-6 md:p-10 rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500 dark:bg-indigo-600 rounded-[1.2rem] shadow-lg shadow-indigo-500/30">
            <PlusIcon className="size-6 text-white" />
          </div>
          <h3 className="font-black text-slate-800 dark:text-white text-xl tracking-tight">Nova Movimentação</h3>
        </div>
        <button onClick={onClose} className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl text-slate-400 transition-all">
          <XIcon className="size-6" />
        </button>
      </div>

      <div className="mb-10 space-y-4">
        <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] ml-1">Entrada Inteligente</label>
        <div className="flex gap-3">
          <div className="relative flex-1 group">
            <input
              type="text"
              placeholder={isListening ? "Te ouvindo..." : "Diga ou digite o gasto..."}
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAIProcess()}
              className={`input-field pl-12 h-14 ${isListening ? 'ring-4 ring-rose-500/10 border-rose-500' : ''}`}
            />
            <Sparkles className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 transition-colors ${isListening ? 'text-rose-500' : 'text-indigo-400 opacity-50 group-focus-within:opacity-100'}`} />
          </div>
          <button type="button" onClick={handleVoiceInput} className={`p-4 rounded-2xl transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/20' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}>
            {isListening ? <MicOff className="size-6" /> : <Mic className="size-6" />}
          </button>
          <button type="button" onClick={handleAIProcess} disabled={isAIProcessing || !aiText.trim()} className="btn-primary h-14 px-8 hidden md:flex items-center justify-center">
            {isAIProcessing ? <Loader2 className="size-5 animate-spin" /> : 'Sugerir'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Descrição</label><input type="text" className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Valor (R$)</label><input type="number" step="0.01" className="input-field font-bold text-indigo-600 dark:text-indigo-400" value={amount} onChange={(e) => setAmount(e.target.value)} required /></div>
              <div><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Data</label><input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            </div>
          </div>
          <div className="space-y-6">
            <div><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Categoria</label><select className="input-field appearance-none cursor-pointer" value={category} onChange={(e) => setCategory(e.target.value)}>{suggestedCategory && <option value={suggestedCategory.id}>{suggestedCategory.icon} {suggestedCategory.name} (IA)</option>}{categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Pagamento</label><select className="input-field appearance-none cursor-pointer" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>{PAYMENT_METHODS.map((pm) => <option key={pm.id} value={pm.id}>{pm.name}</option>)}</select></div>
              {paymentMethod === 'cartao' ? (
                enableCreditCardStatement ? (
                  <div><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Qual Cartão?</label><select className="input-field appearance-none cursor-pointer" value={cartaoId} onChange={(e) => setCartaoId(e.target.value)}>{cartoes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
                ) : (
                  <div><label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Parcelas</label><input type="number" min="1" className="input-field font-bold" value={installments} onChange={(e) => setInstallments(parseInt(e.target.value) || 1)} /></div>
                )
              ) : <div className="flex flex-col justify-end"><div className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 text-[9px] font-black text-slate-400 uppercase rounded-2xl p-4 text-center">Pagamento à Vista</div></div>}
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4"><button type="submit" className="btn-primary w-full md:w-auto shadow-xl shadow-indigo-500/30">Confirmar Lançamento</button></div>
      </form>
    </div>
  );
};
