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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">

      {/* Sincronização */}
      <section className="glass-card p-10 space-y-10">
        <div>
          <h3 className="font-black text-main text-2xl tracking-tighter uppercase italic">Sincronização</h3>
          <p className="text-xs text-sub mt-1 font-bold uppercase tracking-widest">Segurança e Backup em Nuvem</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 p-8 surface-container flex flex-col justify-center text-center">
            {backupConfig?.dropboxUserEmail ? (
              <p className="text-[10px] text-indigo-500 font-black mb-2 uppercase tracking-[0.2em]">
                CONECTADO: <span className="text-main underline decoration-indigo-500/30 underline-offset-4">{maskEmail(backupConfig.dropboxUserEmail)}</span>
              </p>
            ) : (
              <p className="text-[10px] text-sub font-black mb-2 uppercase tracking-[0.2em]">DROPBOX DESCONECTADO</p>
            )}
            <button onClick={startDropboxAuth} className="btn-primary flex items-center justify-center gap-3">
              <LogIn className="size-5" /> {backupConfig?.dropboxToken ? 'Trocar Conta' : 'Vincular Dropbox'}
            </button>
          </div>

          <div className="space-y-4 p-8 surface-container">
            <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-1 mb-2 block">Chave Mestra de Criptografia</label>
            <div className="relative">
              <input type="password" value={backupConfig?.backupPassword || ''} onChange={(e) => handleUpdateBackupConfig(undefined, e.target.value)} placeholder="Sua senha secreta..." className="input-field pl-14" />
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-indigo-500/50" />
            </div>
          </div>
        </div>
      </section>

      {/* Inteligência Artificial */}
      <section className="glass-card p-10 space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-main text-2xl tracking-tighter uppercase italic text-indigo-500">Inteligência Artificial</h3>
            <p className="text-xs text-sub mt-1 font-bold uppercase tracking-widest">Extração de dados e Insights</p>
          </div>
          <div className="p-4 bg-indigo-500/10 text-indigo-500 rounded-3xl border border-indigo-500/20">
            <BrainCircuit className="size-8" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-1 mb-2 block">Motor de IA</label>
                <select
                  value={aiConfig?.provider || 'gemini'}
                  onChange={(e) => handleUpdateAIConfig(e.target.value as any, aiConfig?.apiKey || '')}
                  className="input-field appearance-none cursor-pointer"
                >
                  <option value="gemini">Google Gemini (Flash)</option>
                  <option value="groq">Groq (Llama 3.3)</option>
                  <option value="deepseek">DeepSeek Chat</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-1 mb-2 block">Status da IA</label>
                <button
                  onClick={() => handleUpdateAIManageCategories(!aiManageCategories)}
                  className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${aiManageCategories ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 shadow-lg shadow-emerald-500/5' : 'surface-container text-sub'}`}
                >
                  {aiManageCategories ? 'Analista Ativado' : 'Aguardando Ativação'}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-1 mb-2 block">Token de Acesso (API Key)</label>
              <div className="relative">
                <input
                  type="password"
                  value={aiConfig?.apiKey || ''}
                  onChange={(e) => handleUpdateAIConfig(aiConfig?.provider || 'gemini', e.target.value)}
                  placeholder="X-XXXX-XXXX-XXXX"
                  className="input-field pl-14"
                />
                <Sparkles className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-amber-500/50" />
              </div>
            </div>
          </div>
          <div className="p-8 surface-container flex flex-col justify-center border-dashed">
             <p className="text-[11px] text-sub leading-relaxed italic text-center">
               "Seus dados financeiros são processados com privacidade absoluta. As chaves de API nunca saem do seu controle."
             </p>
          </div>
        </div>
      </section>

      {/* Cartões */}
      <section className="glass-card p-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-main text-2xl tracking-tighter uppercase italic">Cartões</h3>
            <p className="text-xs text-sub mt-1 font-bold uppercase tracking-widest">Gestão de faturas e limites</p>
          </div>
          <button onClick={() => handleUpdateCreditCardConfig(!enableCreditCardStatement)} className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${enableCreditCardStatement ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/30' : 'surface-container text-dim'}`}>
            {enableCreditCardStatement ? 'Ativado' : 'Desativado'}
          </button>
        </div>

        {enableCreditCardStatement && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button onClick={() => setIsAddingCard(!isAddingCard)} className="btn-secondary py-3 text-[10px] flex items-center gap-3">
                {isAddingCard ? 'Fechar' : <><Plus className="size-4" /> Adicionar Cartão</>}
              </button>
            </div>
            {isAddingCard && (
              <div className="p-8 surface-container grid grid-cols-1 md:grid-cols-4 gap-6 animate-in zoom-in-95">
                <input type="text" value={cardForm.nome} onChange={e => setCardForm({...cardForm, nome: e.target.value})} className="input-field" placeholder="Nome do Cartão" />
                <input type="number" value={cardForm.diaFechamento} onChange={e => setCardForm({...cardForm, diaFechamento: Number(e.target.value)})} className="input-field text-center" placeholder="Dia Fechamento" />
                <input type="number" value={cardForm.diaVencimento} onChange={e => setCardForm({...cardForm, diaVencimento: Number(e.target.value)})} className="input-field text-center" placeholder="Dia Vencimento" />
                <button onClick={onSaveCard} className="btn-primary py-4 text-[10px]">Cadastrar</button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cartoes.map(card => (
                <div key={card.id} className="p-8 surface-container flex items-center justify-between group hover:border-indigo-500/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-indigo-500/5 text-indigo-500 rounded-3xl border border-indigo-500/10"><CreditCard className="size-6" /></div>
                    <div>
                      <h4 className="font-black text-main text-lg uppercase tracking-tight leading-none mb-1">{card.nome}</h4>
                      <p className="text-[10px] text-sub font-bold uppercase tracking-widest">Fecha dia {card.diaFechamento}</p>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteCard(card.id); }} className="text-dim hover:text-rose-500 p-3 hover:bg-rose-500/10 rounded-2xl transition-all"><Trash2 className="size-5" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Categorias e Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="glass-card p-10 space-y-8">
          <div>
            <h3 className="font-black text-main text-2xl tracking-tighter uppercase italic">Meta Mensal</h3>
            <p className="text-xs text-sub mt-1 font-bold uppercase tracking-widest">Objetivo de Poupança</p>
          </div>
          <div className="p-10 surface-container space-y-8">
            <div className="flex items-center gap-10">
              <input type="range" min="0" max="100" value={newTarget} onChange={(e) => setNewTarget(Number(e.target.value))} className="flex-1 h-3 accent-indigo-500 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
              <span className="text-5xl font-black text-indigo-500 tracking-tighter">{newTarget}%</span>
            </div>
            <button onClick={() => handleUpdateSavingsTarget(newTarget)} className="btn-primary w-full py-5 text-xs shadow-xl shadow-indigo-500/30">Atualizar Objetivo</button>
          </div>
        </section>

        <section className="glass-card p-10 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-main text-2xl tracking-tighter uppercase italic">Categorias</h3>
              <p className="text-xs text-sub mt-1 font-bold uppercase tracking-widest">Organização de Fluxo</p>
            </div>
            <button onClick={() => setEditingCategory({ id: `cat_${Date.now()}`, name: '', color: '#6366f1', icon: '📦', type: 'expense' })} className="p-4 surface-container text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all shadow-lg active:scale-95"><Plus className="size-6" /></button>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-6 surface-container hover:border-indigo-500/50 transition-all group">
                <div className="flex items-center gap-5">
                   <div className="text-3xl p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5">{cat.icon}</div>
                   <div>
                      <p className="text-sm font-black text-main uppercase tracking-tighter leading-none mb-1">{cat.name}</p>
                      <p className="text-[10px] text-sub font-black uppercase tracking-[0.2em]">{cat.type}</p>
                   </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingCategory(cat)} className="p-3 text-sub hover:text-indigo-500 hover:bg-indigo-500/10 rounded-2xl transition-all"><Settings className="size-5" /></button>
                  <button onClick={() => confirm('Deseja excluir?') && handleDeleteCategory(cat.id)} className="p-3 text-sub hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"><Trash2 className="size-5" /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="pt-10 flex flex-col items-center">
        <button onClick={onResetAll} className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.5em] text-dim hover:text-rose-500 transition-all border-2 border-transparent hover:border-rose-500/20 rounded-[2rem]">Zerar todos os dados locais</button>
        <p className="text-[9px] text-dim/50 font-bold uppercase mt-4">Finance • v1.4.0 High-Fidelity UI</p>
      </div>

      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass-card p-12 w-full max-w-xl space-y-10 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            <div className="space-y-2">
              <h3 className="font-black text-main text-3xl tracking-tighter uppercase italic">Editar Categoria</h3>
              <p className="text-[10px] text-sub font-black uppercase tracking-[0.3em]">Personalize seu fluxo de caixa</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-1">Nome</label>
                <input type="text" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} className="input-field text-xl h-20" placeholder="Ex: Alimentação" />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-1">Emoji / Ícone</label>
                  <input type="text" value={editingCategory.icon} onChange={e => setEditingCategory({...editingCategory, icon: e.target.value})} className="input-field text-center text-4xl h-20" placeholder="🍔" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-sub uppercase tracking-[0.3em] ml-1">Tipo de Fluxo</label>
                  <select value={editingCategory.type} onChange={e => setEditingCategory({...editingCategory, type: e.target.value as any})} className="input-field h-20 appearance-none font-bold uppercase tracking-widest">
                    <option value="income">Receita</option>
                    <option value="expense">Despesa</option>
                    <option value="investment">Investimento</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-6 pt-4">
              <button onClick={() => setEditingCategory(null)} className="flex-1 btn-secondary h-16">Cancelar</button>
              <button onClick={() => { if (!editingCategory?.name) return; if (categories.find(c => c.id === editingCategory.id)) handleUpdateCategories(categories.map(c => c.id === editingCategory.id ? (editingCategory as Category) : c)); else handleAddCategory(editingCategory as Category); setEditingCategory(null); }} className="flex-1 btn-primary h-16 shadow-2xl">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
