import { useState } from 'react';
import { Settings, Plus, Trash2, Lock, LogIn, CreditCard, Sparkles, BrainCircuit } from 'lucide-react';
import { startDropboxAuth } from '../../../infrastructure/utils/dropboxOAuth';
import type { Category } from '../../../domain/categories/entities/categories';
import { useConfigStore } from '../../../application/state/useConfigStore';
import { useCategoryStore } from '../../../application/state/useCategoryStore';
import { useTransactionStore } from '../../../application/state/useTransactionStore';
import { useUIStore } from '../../../application/state/useUIStore';

export const AdminPage = () => {
  const {
    savingsTargetPct, backupConfig, enableCreditCardStatement,
    aiConfig, aiManageCategories,
    handleUpdateSavingsTarget, handleUpdateBackupConfig,
    handleUpdateCreditCardConfig, handleUpdateAIConfig, handleUpdateAIManageCategories
  } = useConfigStore();

  const { categories, handleAddCategory, handleUpdateCategories, handleDeleteCategory } = useCategoryStore();
  const { cartoes, addCard, deleteCard, resetData } = useTransactionStore();
  const { showToast } = useUIStore();

  const [newTarget, setNewTarget] = useState(savingsTargetPct);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardForm, setCardForm] = useState({ nome: '', diaFechamento: 5, diaVencimento: 15, cor: '#6366f1' });

  const maskEmail = (email?: string) => {
    if (!email) return '';
    const [user, domain] = email.split('@');
    if (user.length <= 2) return `***@${domain}`;
    return `${user.substring(0, 2)}***${user.substring(user.length - 2)}@${domain}`;
  };

  const onSaveCard = () => {
    if (!cardForm.nome) return;
    addCard(cardForm);
    setIsAddingCard(false);
    setCardForm({ nome: '', diaFechamento: 5, diaVencimento: 15, cor: '#6366f1' });
  };

  const onResetAll = () => {
    if (confirm("ATENÇÃO: Isso apagará todos os seus registros locais. Deseja continuar?")) {
      resetData();
      showToast("Tudo limpo!", "success");
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Sincronização */}
      <section className="glass-card p-6 md:p-10 space-y-8">
        <div className="space-y-1">
          <h3 className="font-black text-main text-xl md:text-2xl tracking-tighter uppercase italic">Sincronização</h3>
          <p className="text-[9px] md:text-[10px] text-indigo-500 font-black uppercase tracking-[0.3em]">Segurança em Nuvem</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          <div className="space-y-4 p-6 md:p-8 bg-slate-50 dark:bg-[#161c33] rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col justify-center text-center">
            {backupConfig?.dropboxUserEmail ? (
              <p className="text-[10px] text-indigo-500 font-black mb-3 uppercase tracking-widest truncate px-2">
                CONECTADO: <span className="text-main underline underline-offset-4">{maskEmail(backupConfig.dropboxUserEmail)}</span>
              </p>
            ) : (
              <p className="text-[10px] text-dim font-black mb-3 uppercase tracking-widest">Dropbox Desconectado</p>
            )}
            <button onClick={startDropboxAuth} className="btn-primary py-4 md:py-5 flex items-center justify-center gap-3 text-xs">
              <LogIn className="size-4 md:size-5 shrink-0" /> {backupConfig?.dropboxToken ? 'Trocar Conta' : 'Vincular Dropbox'}
            </button>
          </div>

          <div className="space-y-4 p-6 md:p-8 bg-slate-50 dark:bg-[#161c33] rounded-3xl border border-slate-200 dark:border-white/5">
            <label className="text-[10px] font-black text-dim uppercase tracking-[0.3em] ml-1 mb-2 block">Chave de Segurança</label>
            <div className="relative">
              <input type="password" value={backupConfig?.backupPassword || ''} onChange={(e) => handleUpdateBackupConfig(undefined, e.target.value)} placeholder="Senha mestre..." className="input-field pl-12 md:pl-14 h-14 md:h-16 text-sm" />
              <Lock className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 size-4 md:size-5 text-indigo-500/50" />
            </div>
          </div>
        </div>
      </section>

      {/* Inteligência Artificial */}
      <section className="glass-card p-6 md:p-10 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <h3 className="font-black text-main text-xl md:text-2xl tracking-tighter uppercase italic text-indigo-500 truncate">Inteligência Artificial</h3>
            <p className="text-[9px] md:text-[10px] text-dim font-black uppercase tracking-[0.3em] truncate">Extração de dados e Insights</p>
          </div>
          <div className="p-3 md:p-4 bg-indigo-500/10 text-indigo-500 rounded-2xl md:rounded-3xl border border-indigo-500/20 shrink-0">
            <BrainCircuit className="size-6 md:size-8" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-dim uppercase tracking-[0.3em] ml-1 block">Motor de IA</label>
                <select
                  value={aiConfig?.provider || 'gemini'}
                  onChange={(e) => handleUpdateAIConfig(e.target.value as any, aiConfig?.apiKey || '')}
                  className="input-field appearance-none cursor-pointer h-14 md:h-16 font-bold text-sm"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="groq">Groq (Llama 3.3)</option>
                  <option value="deepseek">DeepSeek Chat</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-dim uppercase tracking-[0.3em] ml-1 block">Status da IA</label>
                <button
                  onClick={() => handleUpdateAIManageCategories(!aiManageCategories)}
                  className={`w-full h-14 md:h-16 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${aiManageCategories ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-slate-50 dark:bg-[#161c33] text-dim border border-slate-200 dark:border-white/5'}`}
                >
                  {aiManageCategories ? 'Analista Ativado' : 'Aguardando'}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-dim uppercase tracking-[0.3em] ml-1 block">Token de Acesso (API Key)</label>
              <div className="relative">
                <input
                  type="password"
                  value={aiConfig?.apiKey || ''}
                  onChange={(e) => handleUpdateAIConfig(aiConfig?.provider || 'gemini', e.target.value)}
                  placeholder="X-XXXX-XXXX"
                  className="input-field pl-12 md:pl-14 h-14 md:h-16 text-sm"
                />
                <Sparkles className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 size-4 md:size-5 text-amber-500/50" />
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8 bg-slate-50 dark:bg-[#161c33]/50 rounded-3xl border border-dashed border-slate-200 dark:border-white/10 flex flex-col justify-center">
             <p className="text-[10px] md:text-[11px] text-dim leading-relaxed italic text-center font-medium">
               "Seus dados financeiros são processados com privacidade absoluta. As chaves de API nunca saem do seu controle."
             </p>
          </div>
        </div>
      </section>

      {/* Cartões */}
      <section className="glass-card p-6 md:p-10 space-y-6 md:space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-black text-main text-xl md:text-2xl tracking-tighter uppercase italic">Cartões</h3>
            <p className="text-[9px] md:text-[10px] text-dim font-black uppercase tracking-[0.3em] mt-1 truncate">Gestão de faturas</p>
          </div>
          <button onClick={() => handleUpdateCreditCardConfig(!enableCreditCardStatement)} className={`px-4 md:px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${enableCreditCardStatement ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30' : 'bg-slate-50 dark:bg-[#161c33] text-dim border border-slate-200 dark:border-white/5'}`}>
            {enableCreditCardStatement ? 'Ativado' : 'Inativo'}
          </button>
        </div>

        {enableCreditCardStatement && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button onClick={() => setIsAddingCard(!isAddingCard)} className="btn-secondary py-3 px-6 text-[10px] flex items-center gap-3">
                {isAddingCard ? 'Fechar' : <><Plus className="size-4 shrink-0" /> Novo Cartão</>}
              </button>
            </div>
            {isAddingCard && (
              <div className="p-6 md:p-8 bg-slate-50 dark:bg-[#161c33] rounded-3xl border border-slate-200 dark:border-white/10 grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 animate-in zoom-in-95">
                <input type="text" value={cardForm.nome} onChange={e => setCardForm({...cardForm, nome: e.target.value})} className="input-field h-14 md:h-16" placeholder="Nome" />
                <input type="number" value={cardForm.diaFechamento} onChange={e => setCardForm({...cardForm, diaFechamento: Number(e.target.value)})} className="input-field text-center h-14 md:h-16" placeholder="Fechamento" />
                <input type="number" value={cardForm.diaVencimento} onChange={e => setCardForm({...cardForm, diaVencimento: Number(e.target.value)})} className="input-field text-center h-14 md:h-16" placeholder="Vencimento" />
                <button onClick={onSaveCard} className="btn-primary h-14 md:h-16 text-[10px]">Cadastrar</button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {cartoes.map(card => (
                <div key={card.id} className="p-6 md:p-8 bg-slate-50 dark:bg-[#161c33] rounded-3xl border border-slate-200 dark:border-white/5 flex items-center justify-between group hover:border-indigo-500/50 transition-all shadow-sm">
                  <div className="flex items-center gap-4 md:gap-5 min-w-0">
                    <div className="p-3 md:p-4 bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm shrink-0"><CreditCard className="size-5 md:size-6 text-indigo-500" /></div>
                    <div className="min-w-0">
                      <h4 className="font-black text-main text-base md:text-lg uppercase tracking-tighter leading-none mb-1 truncate">{card.nome}</h4>
                      <p className="text-[9px] md:text-[10px] text-dim font-black uppercase tracking-widest truncate">Fecha dia {card.diaFechamento}</p>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }} className="text-dim hover:text-rose-500 p-2 md:p-3 hover:bg-rose-500/10 rounded-xl md:rounded-2xl transition-all shrink-0"><Trash2 className="size-4 md:size-5" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Categorias e Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        <section className="glass-card p-6 md:p-10 space-y-6 md:space-y-8">
          <div className="space-y-1">
            <h3 className="font-black text-main text-xl md:text-2xl tracking-tighter uppercase italic">Meta Mensal</h3>
            <p className="text-[9px] md:text-[10px] text-dim font-black uppercase tracking-[0.3em]">Objetivo de Retenção</p>
          </div>
          <div className="p-6 md:p-10 bg-slate-50 dark:bg-[#161c33] rounded-3xl md:rounded-[2.5rem] border border-slate-200 dark:border-white/5 space-y-6 md:space-y-8 shadow-inner">
            <div className="flex items-center gap-6 md:gap-10">
              <input type="range" min="0" max="100" value={newTarget} onChange={(e) => setNewTarget(Number(e.target.value))} className="flex-1 h-2 md:h-3 accent-indigo-500 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer" />
              <span className="text-4xl md:text-5xl font-black text-indigo-500 tracking-tighter">{newTarget}%</span>
            </div>
            <button onClick={() => handleUpdateSavingsTarget(newTarget)} className="btn-primary w-full h-16 md:h-20 text-xs md:text-sm">Atualizar Objetivo</button>
          </div>
        </section>

        <section className="glass-card p-6 md:p-10 space-y-6 md:space-y-8">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <h3 className="font-black text-main text-xl md:text-2xl tracking-tighter uppercase italic truncate">Categorias</h3>
              <p className="text-[9px] md:text-[10px] text-dim font-black uppercase tracking-[0.3em] truncate">Organização de Fluxo</p>
            </div>
            <button onClick={() => setEditingCategory({ id: `cat_${Date.now()}`, name: '', color: '#6366f1', icon: '📦', type: 'expense' })} className="p-4 md:p-5 bg-indigo-500 text-white rounded-2xl md:rounded-3xl hover:bg-indigo-400 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 shrink-0"><Plus className="size-5 md:size-6" /></button>
          </div>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-4 md:p-6 bg-slate-50 dark:bg-[#161c33] rounded-2xl md:rounded-[2.5rem] border border-slate-200 dark:border-white/5 hover:border-indigo-500/50 transition-all group shadow-sm">
                <div className="flex items-center gap-4 md:gap-5 min-w-0">
                   <div className="text-2xl md:text-3xl p-3 md:p-4 bg-white dark:bg-slate-800 rounded-xl md:rounded-[1.4rem] border border-slate-100 dark:border-white/10 shadow-sm shrink-0">{cat.icon}</div>
                   <div className="min-w-0">
                      <p className="text-xs md:text-sm font-black text-main uppercase tracking-tighter leading-none mb-1 truncate">{cat.name}</p>
                      <p className="text-[8px] md:text-[10px] text-dim font-black uppercase tracking-[0.2em] truncate">{cat.type}</p>
                   </div>
                </div>
                <div className="flex gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => setEditingCategory(cat)} className="p-2 md:p-3 text-dim hover:text-indigo-500 hover:bg-indigo-500/10 rounded-xl md:rounded-2xl transition-all"><Settings className="size-4 md:size-5" /></button>
                  <button onClick={() => confirm('Deseja excluir?') && handleDeleteCategory(cat.id)} className="p-2 md:p-3 text-dim hover:text-rose-500 hover:bg-rose-500/10 rounded-xl md:rounded-2xl transition-all"><Trash2 className="size-4 md:size-5" /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="pt-10 flex flex-col items-center">
        <button onClick={onResetAll} className="px-6 md:px-10 py-5 md:py-6 text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-dim hover:text-rose-500 transition-all border-2 border-transparent hover:border-rose-500/20 rounded-[2rem]">Zerar Banco de Dados</button>
        <p className="text-[8px] md:text-[9px] text-dim/50 font-bold uppercase mt-4">Finance • v1.4.0 High-Impact UI</p>
      </div>

      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass-card p-8 md:p-12 w-full max-w-xl space-y-8 md:space-y-10 shadow-[0_0_100px_rgba(0,0,0,0.8)] border-indigo-500/30 overflow-y-auto max-h-[90vh]">
            <div className="space-y-2 text-center">
              <h3 className="font-black text-main text-2xl md:text-3xl tracking-tighter uppercase italic leading-none">Editar Categoria</h3>
              <p className="text-[9px] md:text-[10px] text-dim font-black uppercase tracking-[0.4em]">Personalização de Fluxo</p>
            </div>

            <div className="space-y-6 md:space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-dim uppercase tracking-[0.3em] ml-2">Nome amigável</label>
                <input type="text" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} className="input-field text-lg md:text-xl h-16 md:h-20" placeholder="Ex: Alimentação" />
              </div>

              <div className="grid grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-dim uppercase tracking-[0.3em] ml-2">Ícone (Emoji)</label>
                  <input type="text" value={editingCategory.icon} onChange={e => setEditingCategory({...editingCategory, icon: e.target.value})} className="input-field text-center text-3xl md:text-4xl h-16 md:h-20" placeholder="🍔" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-dim uppercase tracking-[0.3em] ml-2">Tipo de Fluxo</label>
                  <select value={editingCategory.type} onChange={e => setEditingCategory({...editingCategory, type: e.target.value as any})} className="input-field h-16 md:h-20 appearance-none font-black uppercase tracking-widest text-xs md:text-sm">
                    <option value="income">Receita (+)</option>
                    <option value="expense">Despesa (-)</option>
                    <option value="investment">Investimento ($)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 pt-4">
              <button onClick={() => setEditingCategory(null)} className="btn-secondary h-16 md:h-20 text-xs md:text-sm order-2 sm:order-1">Cancelar</button>
              <button onClick={() => { if (!editingCategory?.name) return; if (categories.find(c => c.id === editingCategory.id)) handleUpdateCategories(categories.map(c => c.id === editingCategory.id ? (editingCategory as Category) : c)); else handleAddCategory(editingCategory as Category); setEditingCategory(null); }} className="flex-1 btn-primary h-16 md:h-20 text-xs md:text-sm shadow-2xl order-1 sm:order-2">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
