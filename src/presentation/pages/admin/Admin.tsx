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
    savingsTargetPct, aiManageCategories, backupConfig, enableCreditCardStatement,
    handleUpdateSavingsTarget, handleUpdateAIManageCategories, handleUpdateBackupConfig,
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
    if (confirm("ATENÇÃO: Apagar TODOS os dados locais permanentemente?")) {
      resetData();
      showToast("Dados apagados.", "success");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="glass-card p-8 rounded-[2.5rem] space-y-8">
        <h3 className="font-black text-white text-lg tracking-tight">Sincronização na Nuvem</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4 p-6 bg-white/5 rounded-[2rem] border border-white/5 flex flex-col justify-center text-center">
            {backupConfig?.dropboxUserEmail && <p className="text-[10px] text-slate-400 font-bold mb-2">Conta: <span className="text-blue-400">{maskEmail(backupConfig.dropboxUserEmail)}</span></p>}
            <button onClick={startDropboxAuth} className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase flex items-center justify-center gap-2"><LogIn className="size-5" /> {backupConfig?.dropboxToken ? 'Trocar Conta' : 'Conectar Dropbox'}</button>
          </div>
          <div className="space-y-4 p-6 bg-white/5 rounded-[2rem] border border-white/5">
            <div className="relative">
              <input type="password" value={backupConfig?.backupPassword || ''} onChange={(e) => handleUpdateBackupConfig(undefined, e.target.value)} placeholder="Senha mestre..." className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white focus:outline-none" />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-white text-lg tracking-tight">Fechamento de Fatura</h3>
          <button onClick={() => handleUpdateCreditCardConfig(!enableCreditCardStatement)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${enableCreditCardStatement ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>{enableCreditCardStatement ? 'Ativado' : 'Desativado'}</button>
        </div>
        {enableCreditCardStatement && (
          <div className="space-y-6">
            <div className="flex justify-end"><button onClick={() => setIsAddingCard(!isAddingCard)} className="btn-secondary px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2">{isAddingCard ? 'Cancelar' : <><Plus className="size-4" /> Adicionar Cartão</>}</button></div>
            {isAddingCard && (
              <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 grid grid-cols-1 md:grid-cols-4 gap-4 animate-in zoom-in-95">
                <input type="text" value={cardForm.nome} onChange={e => setCardForm({...cardForm, nome: e.target.value})} className="w-full bg-slate-900 rounded-xl p-3 text-sm text-white" placeholder="Nome do Cartão" />
                <input type="number" value={cardForm.diaFechamento} onChange={e => setCardForm({...cardForm, diaFechamento: Number(e.target.value)})} className="w-full bg-slate-900 rounded-xl p-3 text-sm text-white" placeholder="Dia Fechamento" />
                <input type="number" value={cardForm.diaVencimento} onChange={e => setCardForm({...cardForm, diaVencimento: Number(e.target.value)})} className="w-full bg-slate-900 rounded-xl p-3 text-sm text-white" placeholder="Dia Vencimento" />
                <button onClick={onSaveCard} className="btn-primary py-3 rounded-xl text-[10px] font-black uppercase">Salvar Cartão</button>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cartoes.map(card => (
                <div key={card.id} className="p-5 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between group transition-all hover:bg-white/10">
                  <div className="flex items-center gap-4"><div className="p-3 bg-slate-800 rounded-2xl text-rose-400 group-hover:text-rose-300 transition-colors"><CreditCard className="size-5" /></div><div><h4 className="font-bold text-white text-sm">{card.nome}</h4><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Fecha dia {card.diaFechamento}</p></div></div>
                  <button onClick={() => deleteCard(card.id)} className="p-2 text-slate-600 hover:text-rose-400 transition-colors"><Trash2 className="size-4" /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
            <h3 className="font-black text-white text-lg tracking-tight">Meta de Poupança</h3>
            <div className="flex items-center gap-4"><input type="range" min="0" max="100" value={newTarget} onChange={(e) => setNewTarget(Number(e.target.value))} className="flex-1 accent-indigo-500" /><span className="text-2xl font-black text-indigo-400">{newTarget}%</span></div>
            <button onClick={() => handleUpdateSavingsTarget(newTarget)} className="btn-primary w-full py-3 rounded-2xl text-xs font-bold uppercase">Salvar Meta</button>
          </section>
        </div>
        <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center justify-between"><h3 className="font-black text-white text-lg tracking-tight">Categorias</h3><div className="flex gap-2"><button onClick={() => handleUpdateAIManageCategories(!aiManageCategories)} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase ${aiManageCategories ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-800 text-slate-500'}`}>IA Ativa</button><button onClick={() => setEditingCategory({ id: `cat_${Date.now()}`, name: '', color: '#6366f1', icon: '📦', type: 'expense' })} className="p-2 bg-white/5 text-white rounded-xl transition-colors"><Plus className="size-5" /></button></div></div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between"><div className="flex items-center gap-3"><span className="text-xl">{cat.icon}</span><div><p className="text-sm font-bold text-white">{cat.name}</p><p className="text-[10px] text-slate-500 uppercase">{cat.type}</p></div></div><div className="flex gap-1"><button onClick={() => setEditingCategory(cat)} className="p-2 text-slate-400 hover:text-white transition-colors"><Settings className="size-4" /></button><button onClick={() => confirm('Excluir?') && handleDeleteCategory(cat.id)} className="p-2 text-slate-400 hover:text-rose-400 transition-colors"><Trash2 className="size-4" /></button></div></div>
            ))}
          </div>
        </section>
      </div>

      <button onClick={onResetAll} className="w-full py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.4em] border border-rose-500/20 text-rose-500/50 hover:bg-rose-500 hover:text-white transition-all duration-500">Limpar Banco de Dados Local</button>

      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card p-8 rounded-[2.5rem] w-full max-w-md space-y-6">
            <h3 className="font-black text-white text-xl tracking-tight">Editar Categoria</h3>
            <div className="space-y-4">
              <input type="text" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} className="w-full bg-slate-800/50 rounded-xl px-4 py-3 text-white focus:outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={editingCategory.icon} onChange={e => setEditingCategory({...editingCategory, icon: e.target.value})} className="w-full bg-slate-800/50 rounded-xl px-4 py-3 text-white text-center" />
                <select value={editingCategory.type} onChange={e => setEditingCategory({...editingCategory, type: e.target.value as any})} className="w-full bg-slate-800/50 rounded-xl px-4 py-3 text-white focus:outline-none"><option value="income">Receita</option><option value="expense">Despesa</option><option value="investment">Investimento</option></select>
              </div>
              <input type="color" value={editingCategory.color} onChange={e => setEditingCategory({...editingCategory, color: e.target.value})} className="w-full h-12 bg-transparent border-none cursor-pointer" />
            </div>
            <div className="flex gap-3"><button onClick={() => setEditingCategory(null)} className="flex-1 btn-secondary py-3 rounded-2xl text-xs font-bold uppercase transition-all">Cancelar</button><button onClick={() => { if (!editingCategory?.name) return; if (categories.find(c => c.id === editingCategory.id)) handleUpdateCategories(categories.map(c => c.id === editingCategory.id ? (editingCategory as Category) : c)); else handleAddCategory(editingCategory as Category); setEditingCategory(null); }} className="flex-1 btn-primary py-3 rounded-2xl text-xs font-bold uppercase transition-all">Salvar</button></div>
          </div>
        </div>
      )}
    </div>
  );
};
