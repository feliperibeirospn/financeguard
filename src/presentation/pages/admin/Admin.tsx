import { useState } from 'react';
import { Settings, Plus, Trash2, Lock, LogIn, CreditCard } from 'lucide-react';
import { startDropboxAuth } from '../../../infrastructure/utils/dropboxOAuth';
import type { Category } from '../../../domain/categories/entities/categories';
import { useConfigStore } from '../../../application/state/useConfigStore';
import { useCategoryStore } from '../../../application/state/useCategoryStore';
import { useTransactionStore } from '../../../application/state/useTransactionStore';
import { useUIStore } from '../../../application/state/useUIStore';

export const AdminPage = () => {
  const {
    savingsTargetPct, backupConfig, enableCreditCardStatement,
    handleUpdateSavingsTarget, handleUpdateBackupConfig,
    handleUpdateCreditCardConfig
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
      <section className="glass-card p-8 rounded-[2.5rem] space-y-8">
        <div>
          <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight">Sincronização em Nuvem</h3>
          <p className="text-xs text-slate-400 mt-1">Mantenha seus dados seguros e acessíveis em outros dispositivos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 flex flex-col justify-center text-center">
            {backupConfig?.dropboxUserEmail && (
              <p className="text-[10px] text-slate-400 font-bold mb-2 uppercase tracking-tighter">
                Conectado como: <span className="text-indigo-600 dark:text-indigo-400">{maskEmail(backupConfig.dropboxUserEmail)}</span>
              </p>
            )}
            <button onClick={startDropboxAuth} className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20">
              <LogIn className="size-5" /> {backupConfig?.dropboxToken ? 'Trocar Conta' : 'Conectar Dropbox'}
            </button>
          </div>

          <div className="space-y-4 p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Sua Chave de Segurança</label>
            <div className="relative">
              <input type="password" value={backupConfig?.backupPassword || ''} onChange={(e) => handleUpdateBackupConfig(undefined, e.target.value)} placeholder="Senha mestre..." className="input-field pl-11" />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Cartões */}
      <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight">Cartões de Crédito</h3>
            <p className="text-xs text-slate-400 mt-1">Configure o dia de fechamento para organizar sua fatura.</p>
          </div>
          <button onClick={() => handleUpdateCreditCardConfig(!enableCreditCardStatement)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${enableCreditCardStatement ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
            {enableCreditCardStatement ? 'Ativo' : 'Desativado'}
          </button>
        </div>

        {enableCreditCardStatement && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button onClick={() => setIsAddingCard(!isAddingCard)} className="btn-secondary py-2 text-[10px] flex items-center gap-2">
                {isAddingCard ? 'Cancelar' : <><Plus className="size-4" /> Novo Cartão</>}
              </button>
            </div>
            {isAddingCard && (
              <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/10 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in zoom-in-95 duration-300">
                <input type="text" value={cardForm.nome} onChange={e => setCardForm({...cardForm, nome: e.target.value})} className="input-field" placeholder="Nome (ex: Nubank)" />
                <input type="number" value={cardForm.diaFechamento} onChange={e => setCardForm({...cardForm, diaFechamento: Number(e.target.value)})} className="input-field text-center" placeholder="Dia Fecha" />
                <input type="number" value={cardForm.diaVencimento} onChange={e => setCardForm({...cardForm, diaVencimento: Number(e.target.value)})} className="input-field text-center" placeholder="Dia Vence" />
                <button onClick={onSaveCard} className="btn-primary py-3 rounded-xl text-[10px]">Salvar</button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cartoes.map(card => (
                <div key={card.id} className="p-6 bg-slate-50 dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-indigo-500"><CreditCard className="size-5" /></div>
                    <div>
                      <h4 className="font-black text-slate-700 dark:text-white text-sm">{card.nome}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Fecha todo dia {card.diaFechamento}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteCard(card.id)} className="text-slate-300 hover:text-rose-500 p-2 transition-all"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Categorias e Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
          <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight">Objetivo Mensal</h3>
          <p className="text-xs text-slate-400">Quanto da sua renda você pretende poupar?</p>
          <div className="flex items-center gap-6">
            <input type="range" min="0" max="100" value={newTarget} onChange={(e) => setNewTarget(Number(e.target.value))} className="flex-1 accent-indigo-500" />
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{newTarget}%</span>
          </div>
          <button onClick={() => handleUpdateSavingsTarget(newTarget)} className="btn-primary w-full py-4 text-xs">Salvar Objetivo</button>
        </section>

        <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-800 dark:text-white text-lg tracking-tight">Categorias</h3>
            <button onClick={() => setEditingCategory({ id: `cat_${Date.now()}`, name: '', color: '#6366f1', icon: '📦', type: 'expense' })} className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-indigo-500"><Plus className="size-5" /></button>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-indigo-500/20 transition-all">
                <div className="flex items-center gap-3"><span className="text-xl">{cat.icon}</span><div><p className="text-sm font-black text-slate-700 dark:text-white">{cat.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{cat.type}</p></div></div>
                <div className="flex gap-1"><button onClick={() => setEditingCategory(cat)} className="p-2 text-slate-400 hover:text-indigo-500 transition-all"><Settings className="size-4" /></button><button onClick={() => confirm('Excluir?') && handleDeleteCategory(cat.id)} className="p-2 text-slate-400 hover:text-rose-400 transition-all"><Trash2 className="size-4" /></button></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <button onClick={onResetAll} className="w-full py-5 text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-700 hover:text-rose-500 transition-all">Limpar todos os dados do dispositivo</button>

      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card p-10 rounded-[3rem] w-full max-w-md space-y-8">
            <h3 className="font-black text-slate-800 dark:text-white text-2xl tracking-tight">Configurar Categoria</h3>
            <div className="space-y-6">
              <input type="text" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} className="input-field h-14" placeholder="Nome da Categoria" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={editingCategory.icon} onChange={e => setEditingCategory({...editingCategory, icon: e.target.value})} className="input-field text-center text-xl h-14" placeholder="Emoji" />
                <select value={editingCategory.type} onChange={e => setEditingCategory({...editingCategory, type: e.target.value as any})} className="input-field h-14 appearance-none"><option value="income">Receita</option><option value="expense">Despesa</option><option value="investment">Investimento</option></select>
              </div>
            </div>
            <div className="flex gap-4"><button onClick={() => setEditingCategory(null)} className="flex-1 btn-secondary py-4 text-xs">Cancelar</button><button onClick={() => { if (!editingCategory?.name) return; if (categories.find(c => c.id === editingCategory.id)) handleUpdateCategories(categories.map(c => c.id === editingCategory.id ? (editingCategory as Category) : c)); else handleAddCategory(editingCategory as Category); setEditingCategory(null); }} className="flex-1 btn-primary py-4 text-xs shadow-xl shadow-indigo-500/30">Salvar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};
