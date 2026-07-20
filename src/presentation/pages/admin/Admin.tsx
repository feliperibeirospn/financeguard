import { useState } from 'react';
import { Settings, Plus, Trash2, Save, Target, Tag, Sparkles, CalendarClock, Cloud, Lock, LogIn, DownloadCloud, UploadCloud, Loader2, CreditCard } from 'lucide-react';
import { startDropboxAuth } from '../../../infrastructure/utils/dropboxOAuth';
import type { Category } from '../../../domain/categories/entities/categories';
import type { AIProvider, Recorrencia, CartaoCredito } from '../../../infrastructure/datasources/storage/sqliteStorage';

interface AdminPageProps {
  savingsTargetPct: number;
  categories: Category[];
  recorrencias: Recorrencia[];
  cartoes: CartaoCredito[];
  enableCreditCardStatement: boolean;
  aiConfig?: { provider: AIProvider, apiKey: string };
  aiManageCategories: boolean;
  backupConfig?: { dropboxToken?: string, dropboxAppKey?: string, dropboxUserEmail?: string, backupPassword?: string, lastCloudBackup?: string };
  isCloudSyncing: boolean;
  onUpdateSavingsTarget: (pct: number) => void;
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateAIConfig: (provider: AIProvider, apiKey: string) => void;
  onUpdateAIManageCategories: (active: boolean) => void;
  onUpdateBackupConfig: (token?: string, password?: string, appKey?: string) => void;
  onUpdateCreditCardConfig: (enabled: boolean) => void;
  onAddCard: (card: Omit<CartaoCredito, 'id'>) => void;
  onDeleteCard: (id: string) => void;
  onAddRecurring: (rec: Omit<Recorrencia, 'id'>) => void;
  onDeleteRecurring: (id: string) => void;
  onDropboxBackup: () => void;
  onDropboxRestore: (password?: string) => void;
  onResetDatabase: () => void;
}

export const AdminPage = ({
  savingsTargetPct, categories, recorrencias, cartoes, enableCreditCardStatement,
  aiConfig, aiManageCategories, backupConfig, isCloudSyncing,
  onUpdateSavingsTarget, onUpdateCategories, onUpdateAIConfig, onUpdateAIManageCategories,
  onUpdateBackupConfig, onUpdateCreditCardConfig, onAddCard, onDeleteCard,
  onAddRecurring, onDeleteRecurring, onDropboxBackup, onDropboxRestore, onResetDatabase,
}: AdminPageProps) => {
  const [newTarget, setNewTarget] = useState(savingsTargetPct);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // States
  const [isAddingRec, setIsAddingRec] = useState(false);
  const [recForm, setRecForm] = useState({
    descricao: '', valor: '', categoria_id: categories[0]?.id || '', dia: 1, forma_pagamento: 'dinheiro'
  });

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardForm, setCardForm] = useState({
    nome: '', diaFechamento: 5, diaVencimento: 15, cor: '#6366f1'
  });

  const [aiProvider, setAiProvider] = useState<AIProvider>(aiConfig?.provider || 'groq');
  const [aiKey, setAiKey] = useState(aiConfig?.apiKey || '');
  const [backupPass, setBackupPass] = useState(backupConfig?.backupPassword || '');

  const maskEmail = (email?: string) => {
    if (!email) return '';
    const [user, domain] = email.split('@');
    if (user.length <= 2) return `***@${domain}`;
    return `${user.substring(0, 2)}***${user.substring(user.length - 2)}@${domain}`;
  };

  const handleSaveCard = () => {
    if (!cardForm.nome) return;
    onAddCard(cardForm);
    setIsAddingCard(false);
    setCardForm({ nome: '', diaFechamento: 5, diaVencimento: 15, cor: '#6366f1' });
  };

  const handleSaveRec = () => {
    if (!recForm.descricao || !recForm.valor) return;
    onAddRecurring({ ...recForm, valor: parseFloat(recForm.valor), dia: Number(recForm.dia) });
    setIsAddingRec(false);
    setRecForm({ descricao: '', valor: '', categoria_id: categories[0]?.id || '', dia: 1, forma_pagamento: 'dinheiro' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* SEÇÃO 1: NUVEM E SEGURANÇA */}
      <section className="glass-card p-8 rounded-[2.5rem] space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/20 rounded-xl"><Cloud className="text-blue-400 size-5" /></div>
          <h3 className="font-black text-white text-lg tracking-tight">Sincronização na Nuvem</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 p-6 bg-white/5 rounded-[2rem] border border-white/5 flex flex-col justify-center text-center">
            {backupConfig?.dropboxUserEmail && <p className="text-[10px] text-slate-400 font-bold mb-2">Conta: <span className="text-blue-400">{maskEmail(backupConfig.dropboxUserEmail)}</span></p>}
            <button onClick={startDropboxAuth} className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-2"><LogIn className="size-5" /> {backupConfig?.dropboxToken ? 'Trocar Conta' : 'Conectar Dropbox'}</button>
          </div>
          <div className="space-y-4 p-6 bg-white/5 rounded-[2rem] border border-white/5">
            <div className="relative">
              <input type="password" value={backupPass} onChange={(e) => setBackupPass(e.target.value)} placeholder="Senha mestre..." className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white focus:outline-none" />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            </div>
            <button onClick={() => onUpdateBackupConfig(undefined, backupPass)} className="btn-primary w-full py-3 rounded-2xl text-[10px] font-black uppercase">Salvar Senha</button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-white/5">
          <button disabled={!backupConfig?.dropboxToken || !backupConfig?.backupPassword || isCloudSyncing} onClick={onDropboxBackup} className="flex-1 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-900/20">
            {isCloudSyncing ? <Loader2 className="size-5 animate-spin" /> : <UploadCloud className="size-5" />} Enviar Backup
          </button>
          <button disabled={!backupConfig?.dropboxToken || !backupConfig?.backupPassword || isCloudSyncing} onClick={() => onDropboxRestore()} className="flex-1 py-4 bg-slate-800 text-white rounded-[1.5rem] font-black text-xs uppercase flex items-center justify-center gap-3 transition-all border border-white/5 active:scale-95">
            {isCloudSyncing ? <Loader2 className="size-5 animate-spin" /> : <DownloadCloud className="size-5" />} Restaurar
          </button>
        </div>
      </section>

      {/* SEÇÃO 2: FECHAMENTO DE FATURA (Multi-Cartão) */}
      <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 rounded-xl"><CreditCard className="text-rose-400 size-5" /></div>
            <h3 className="font-black text-white text-lg tracking-tight">Fechamento de Fatura</h3>
          </div>
          <button onClick={() => onUpdateCreditCardConfig(!enableCreditCardStatement)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${enableCreditCardStatement ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>
            {enableCreditCardStatement ? 'Ativado' : 'Desativado'}
          </button>
        </div>

        {enableCreditCardStatement && (
          <div className="space-y-6">
            <div className="flex justify-end"><button onClick={() => setIsAddingCard(!isAddingCard)} className="btn-secondary px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all active:scale-95">{isAddingCard ? 'Cancelar' : <><Plus className="size-4" /> Adicionar Cartão</>}</button></div>

            {isAddingCard && (
              <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in zoom-in-95 duration-300">
                <input type="text" value={cardForm.nome} onChange={e => setCardForm({...cardForm, nome: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white" placeholder="Nome do Cartão" />
                <input type="number" value={cardForm.diaFechamento} onChange={e => setCardForm({...cardForm, diaFechamento: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white" placeholder="Dia Fechamento" />
                <input type="number" value={cardForm.diaVencimento} onChange={e => setCardForm({...cardForm, diaVencimento: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white" placeholder="Dia Vencimento" />
                <button onClick={handleSaveCard} className="btn-primary py-3 rounded-xl text-[10px] font-black uppercase">Salvar Cartão</button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cartoes.map(card => (
                <div key={card.id} className="p-5 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between group transition-all hover:bg-white/10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-800 rounded-2xl text-rose-400 group-hover:text-rose-300 transition-colors"><CreditCard className="size-5" /></div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{card.nome}</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Fecha dia {card.diaFechamento} • Vence dia {card.diaVencimento}</p>
                    </div>
                  </div>
                  <button onClick={() => confirm(`Excluir ${card.nome}?`) && onDeleteCard(card.id)} className="p-2 text-slate-600 hover:text-rose-400 transition-colors"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* SEÇÃO 3: IA E CATEGORIAS (Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-3"><div className="p-2 bg-indigo-500/20 rounded-xl"><Target className="text-indigo-400 size-5" /></div><h3 className="font-black text-white text-lg tracking-tight">Meta de Poupança</h3></div>
            <div className="flex items-center gap-4">
              <input type="range" min="0" max="100" value={newTarget} onChange={(e) => setNewTarget(Number(e.target.value))} className="flex-1 accent-indigo-500" />
              <span className="text-2xl font-black text-indigo-400">{newTarget}%</span>
            </div>
            <button onClick={() => onUpdateSavingsTarget(newTarget)} className="btn-primary w-full py-3 rounded-2xl text-xs font-bold uppercase flex items-center justify-center gap-2"><Save className="size-4" /> Salvar Meta</button>
          </section>

          <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-3"><div className="p-2 bg-violet-500/20 rounded-xl"><Sparkles className="text-violet-400 size-5" /></div><h3 className="font-black text-white text-lg tracking-tight">IA Assistant</h3></div>
            <div className="space-y-4">
              <select value={aiProvider} onChange={(e) => setAiProvider(e.target.value as AIProvider)} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"><option value="groq">Groq</option><option value="gemini">Gemini</option><option value="deepseek">DeepSeek</option></select>
              <input type="password" value={aiKey} placeholder="API Key..." onChange={(e) => setAiKey(e.target.value)} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500" />
              <button onClick={() => onUpdateAIConfig(aiProvider, aiKey)} className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-xs font-bold uppercase flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-900/20"><Save className="size-4" /> Salvar IA</button>
            </div>
          </section>
        </div>

        <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3"><div className="p-2 bg-emerald-500/20 rounded-xl"><Tag className="text-emerald-400 size-5" /></div><h3 className="font-black text-white text-lg tracking-tight">Categorias</h3></div>
            <div className="flex gap-2">
              <button onClick={() => onUpdateAIManageCategories(!aiManageCategories)} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${aiManageCategories ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-800 text-slate-500'}`}>IA Ativa</button>
              <button onClick={() => setEditingCategory({ id: `cat_${Date.now()}`, name: '', color: '#6366f1', icon: '📦', type: 'expense' })} className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"><Plus className="size-5" /></button>
            </div>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3"><span className="text-xl">{cat.icon}</span><div><p className="text-sm font-bold text-white">{cat.name}</p><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{cat.type}</p></div></div>
                <div className="flex gap-1"><button onClick={() => setEditingCategory(cat)} className="p-2 text-slate-400 hover:text-white transition-colors"><Settings className="size-4" /></button><button onClick={() => confirm('Excluir?') && onUpdateCategories(categories.filter(c => c.id !== cat.id))} className="p-2 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 className="size-4" /></button></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* SEÇÃO 4: CONTAS FIXAS */}
      <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3"><div className="p-2 bg-amber-500/20 rounded-xl"><CalendarClock className="text-amber-400 size-5" /></div><h3 className="font-black text-white text-lg tracking-tight">Contas Fixas</h3></div>
          <button onClick={() => setIsAddingRec(!isAddingRec)} className="btn-secondary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95">{isAddingRec ? 'Cancelar' : <><Plus className="size-4" /> Nova Conta</>}</button>
        </div>
        {isAddingRec && (
          <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 grid grid-cols-1 md:grid-cols-5 gap-4 animate-in zoom-in-95 duration-300">
            <div className="md:col-span-2"><input type="text" value={recForm.descricao} onChange={e => setRecForm({...recForm, descricao: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white" placeholder="Descrição..." /></div>
            <input type="number" value={recForm.valor} onChange={e => setRecForm({...recForm, valor: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white" placeholder="Valor..." />
            <input type="number" min="1" max="31" value={recForm.dia} onChange={e => setRecForm({...recForm, dia: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white text-center" />
            <button onClick={handleSaveRec} className="btn-primary py-3 rounded-xl text-[10px] font-black uppercase">Salvar Fixa</button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recorrencias.map(rec => (
            <div key={rec.id} className="p-5 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between group transition-all hover:bg-white/10">
              <div className="flex items-center gap-4"><div className="p-3 bg-slate-800 rounded-2xl text-slate-400 group-hover:text-amber-400 transition-colors"><CalendarClock className="size-5" /></div><div><h4 className="font-bold text-white text-sm">{rec.descricao}</h4><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Dia {rec.dia} • R$ {rec.valor.toFixed(2)}</p></div></div>
              <button onClick={() => confirm(`Remover ${rec.descricao}?`) && onDeleteRecurring(rec.id)} className="p-2 text-slate-600 hover:text-rose-400 transition-colors"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <button onClick={() => confirm("ATENÇÃO: Apagar TODOS os dados locais permanentemente?") && onResetDatabase()} className="w-full py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.4em] border border-rose-500/20 text-rose-500/50 hover:bg-rose-500 hover:text-white transition-all duration-500">Limpar Banco de Dados Local</button>

      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card p-8 rounded-[2.5rem] w-full max-w-md space-y-6">
            <h3 className="font-black text-white text-xl tracking-tight">Editar Categoria</h3>
            <div className="space-y-4">
              <input type="text" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={editingCategory.icon} onChange={e => setEditingCategory({...editingCategory, icon: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-center" />
                <select value={editingCategory.type} onChange={e => setEditingCategory({...editingCategory, type: e.target.value as any})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"><option value="income">Receita</option><option value="expense">Despesa</option><option value="investment">Investimento</option></select>
              </div>
              <input type="color" value={editingCategory.color} onChange={e => setEditingCategory({...editingCategory, color: e.target.value})} className="w-full h-12 bg-transparent border-none cursor-pointer" />
            </div>
            <div className="flex gap-3"><button onClick={() => setEditingCategory(null)} className="flex-1 btn-secondary py-3 rounded-2xl text-xs font-bold uppercase transition-all">Cancelar</button><button onClick={() => { if (!editingCategory?.name) return; onUpdateCategories(categories.map(c => c.id === editingCategory.id ? (editingCategory as Category) : c).concat(categories.find(c => c.id === editingCategory.id) ? [] : [editingCategory as Category])); setEditingCategory(null); }} className="flex-1 btn-primary py-3 rounded-2xl text-xs font-bold uppercase transition-all">Salvar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};
