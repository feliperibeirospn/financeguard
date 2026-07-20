import { useState, type FormEvent, useEffect, useRef } from 'react';
import { X as XIcon, PlusCircle as PlusIcon, Sparkles, Mic, Loader2, MicOff, AlertCircle } from 'lucide-react';
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
  onProcessAICommand: (text: string) => Promise<any>;
}

export const NewTransactionForm = ({ onSubmit, onClose, categories, cartoes = [], onProcessAICommand }: NewTransactionFormProps) => {
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

  // Inicialização do reconhecimento de voz melhorada
  const initRecognition = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';

    // CONFIGURAÇÃO CRÍTICA:
    // continuous: true impede que o microfone feche sozinho após uma pausa curta
    recognition.continuous = true;
    // interimResults: false foca apenas no resultado final processado
    recognition.interimResults = false;
    // Precisão máxima
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      console.log('Microfone ativado...');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setAiText(prev => (prev ? prev + ' ' + finalTranscript : finalTranscript));
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Erro no microfone:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert('Permissão de microfone negada.');
      }
    };

    recognition.onend = () => {
      // Se parou sozinho mas o estado ainda diz que devia estar ouvindo, reiniciamos
      // Isso acontece em alguns navegadores Android após silêncio longo
      if (isListening) {
        try { recognition.start(); } catch(e) {}
      } else {
        setIsListening(false);
      }
    };

    return recognition;
  };

  const handleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // Remove o auto-restart
        recognitionRef.current.stop();
      }
      return;
    }

    setAiText('');
    const rec = initRecognition();
    if (!rec) {
      alert('Seu navegador ou dispositivo não suporta comandos de voz.');
      return;
    }
    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      console.error('Falha ao iniciar voz:', err);
      setIsListening(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleAIProcess = async () => {
    if (isListening) {
      setIsListening(false);
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
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
          const emojiFallback: Record<string, string> = { 'computer': '💻', 'car': '🚗', 'videogame': '🎮', 'food': '🍔', 'health': '💊', 'home': '🏠' };
          const rawIcon = data.suggestedCategory.icon?.toLowerCase() || '📦';
          const finalIcon = emojiFallback[rawIcon] || (rawIcon.length > 2 ? '📦' : rawIcon);
          const newCat: Category = { id: `cat_${Date.now()}`, ...data.suggestedCategory, icon: finalIcon };
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
      cartaoId: paymentMethod === 'cartao' ? cartaoId : undefined,
      newCategory: suggestedCategory || undefined
    });
    setDescription(''); setAmount(''); setInstallments(1); setSuggestedCategory(null);
  };

  return (
    <div className="glass-card p-6 rounded-[2.5rem] border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-white text-lg tracking-tight flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl"><PlusIcon className="size-5 text-white" /></div>
          Nova Movimentação
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-all"><XIcon className="size-5" /></button>
      </div>

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
              className={`w-full bg-indigo-500/5 border p-4 pl-12 rounded-2xl focus:border-indigo-500 outline-none text-white text-sm transition-all ${
                isListening ? 'border-rose-500 ring-4 ring-rose-500/10' : 'border-indigo-500/20'
              }`}
            />
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-indigo-500/50" />
          </div>
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-4 rounded-2xl border transition-all ${
              isListening ? 'bg-rose-500 text-white animate-pulse border-rose-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20'
            }`}
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

      {suggestedCategory && (
        <div className="mb-6 p-4 bg-violet-500/20 border border-violet-500/30 rounded-2xl flex items-center gap-3 animate-in slide-in-from-left-4">
          <AlertCircle className="size-5 text-violet-400" />
          <div className="flex-1">
            <p className="text-xs font-bold text-white">IA sugere criar categoria: {suggestedCategory.icon} {suggestedCategory.name}</p>
          </div>
          <button onClick={() => setSuggestedCategory(null)} className="text-[10px] font-black text-rose-400 uppercase">Ignorar</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Descrição</label><input type="text" className="w-full bg-slate-800/50 border border-white/5 p-4 rounded-2xl text-white text-sm" value={description} onChange={(e) => setDescription(e.target.value)} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Valor (R$)</label><input type="number" step="0.01" className="w-full bg-slate-800/50 border border-white/5 p-4 rounded-2xl text-white text-sm" value={amount} onChange={(e) => setAmount(e.target.value)} required /></div>
              <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Data</label><input type="date" className="w-full bg-slate-800/50 border border-white/5 p-4 rounded-2xl text-white text-sm" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            </div>
          </div>
          <div className="space-y-4">
            <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Categoria</label><select className="w-full bg-slate-800/50 border border-white/5 p-4 rounded-2xl text-white text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>{suggestedCategory && <option value={suggestedCategory.id}>{suggestedCategory.icon} {suggestedCategory.name}</option>}{categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Pagamento</label><select className="w-full bg-slate-800/50 border border-white/5 p-4 rounded-2xl text-white text-sm" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>{PAYMENT_METHODS.map((pm) => <option key={pm.id} value={pm.id}>{pm.name}</option>)}</select></div>
              {paymentMethod === 'cartao' ? (
                <div><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Qual Cartão?</label><select className="w-full bg-slate-800/50 border border-white/5 p-4 rounded-2xl text-white text-sm" value={cartaoId} onChange={(e) => setCartaoId(e.target.value)}>{cartoes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
              ) : (
                <div className="flex flex-col justify-end"><div className="bg-slate-900/40 border border-white/5 text-[9px] font-black text-slate-600 uppercase rounded-2xl p-4 text-center">À Vista</div></div>
              )}
            </div>
          </div>
        </div>
        {paymentMethod === 'cartao' && (
           <div className="max-w-xs"><label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Parcelas</label><input type="number" min="1" className="w-full bg-slate-800/50 border border-white/5 p-4 rounded-2xl text-white text-sm font-bold" value={installments} onChange={(e) => setInstallments(parseInt(e.target.value) || 1)} /></div>
        )}
        <div className="flex justify-end pt-4"><button type="submit" className="btn-primary px-8 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest">Confirmar Lançamento</button></div>
      </form>
    </div>
  );
};
