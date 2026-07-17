import { useState } from 'react';
import { Settings, Plus, Trash2, Save, Target, Tag, Sparkles, CalendarClock, Cloud, Lock, LogIn, DownloadCloud, UploadCloud, Loader2 } from 'lucide-react';
import { startDropboxAuth } from '../../../infrastructure/utils/dropboxOAuth';
import type { Category } from '../../../domain/categories/entities/categories';
import type { AIProvider, Recorrencia } from '../../../infrastructure/datasources/storage/sqliteStorage';

interface AdminPageProps {
  savingsTargetPct: number;
  categories: Category[];
  recorrencias: Recorrencia[];
  aiConfig?: { provider: AIProvider, apiKey: string };
  aiManageCategories: boolean;
  backupConfig?: { dropboxToken?: string, dropboxAppKey?: string, backupPassword?: string, lastCloudBackup?: string };
  isCloudSyncing: boolean;
  onUpdateSavingsTarget: (pct: number) => void;
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateAIConfig: (provider: AIProvider, apiKey: string) => void;
  onUpdateAIManageCategories: (active: boolean) => void;
  onUpdateBackupConfig: (token?: string, password?: string, appKey?: string) => void;
  onAddRecurring: (rec: Omit<Recorrencia, 'id'>) => void;
  onDeleteRecurring: (id: string) => void;
  onDropboxBackup: () => void;
  onDropboxRestore: (password?: string) => void;
  onResetDatabase: () => void;
}

export const AdminPage = ({
  savingsTargetPct,
  categories,
  recorrencias,
  aiConfig,
  aiManageCategories,
  backupConfig,
  isCloudSyncing,
  onUpdateSavingsTarget,
  onUpdateCategories,
  onUpdateAIConfig,
  onUpdateAIManageCategories,
  onUpdateBackupConfig,
  onAddRecurring,
  onDeleteRecurring,
  onDropboxBackup,
  onDropboxRestore,
  onResetDatabase,
}: AdminPageProps) => {
  const [newTarget, setNewTarget] = useState(savingsTargetPct);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // States
  const [isAddingRec, setIsAddingRec] = useState(false);
  const [recForm, setRecForm] = useState({
    descricao: '', valor: '', categoria_id: categories[0]?.id || '', dia: 1, forma_pagamento: 'dinheiro'
  });
  const [aiProvider, setAiProvider] = useState<AIProvider>(aiConfig?.provider || 'groq');
  const [aiKey, setAiKey] = useState(aiConfig?.apiKey || '');
  const [backupPass, setBackupPass] = useState(backupConfig?.backupPassword || '');

  const handleSaveRec = () => {
    if (!recForm.descricao || !recForm.valor) return;
    onAddRecurring({ ...recForm, valor: parseFloat(recForm.valor), dia: Number(recForm.dia) });
    setIsAddingRec(false);
    setRecForm({ descricao: '', valor: '', categoria_id: categories[0]?.id || '', dia: 1, forma_pagamento: 'dinheiro' });
  };

  const handleStartAddCategory = () => {
    setEditingCategory({ id: `cat_${Date.now()}`, name: '', color: '#6366f1', icon: '📦', type: 'expense' });
  };

  const handleSaveCategoryInline = () => {
    if (!editingCategory?.name) return;
    const exists = categories.find(c => c.id === editingCategory.id);
    if (exists) {
      onUpdateCategories(categories.map(c => c.id === editingCategory.id ? (editingCategory as Category) : c));
    } else {
      onUpdateCategories([...categories, editingCategory as Category]);
    }
    setEditingCategory(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* SEÇÃO 1: NUVEM E SEGURANÇA (Simplificada para leigos) */}
      <section className="glass-card p-8 rounded-[2.5rem] space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/20 rounded-xl"><Cloud className="text-blue-400 size-5" /></div>
          <h3 className="font-black text-white text-lg tracking-tight">Sincronização na Nuvem</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Login Dropbox */}
          <div className="space-y-4 p-6 bg-white/5 rounded-[2rem] border border-white/5 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-2">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Status da Conexão</label>
               {backupConfig?.dropboxToken ? (
                 <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">✓ Conectado ao Dropbox</span>
               ) : (
                 <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">Desconectado</span>
               )}
            </div>

            <button
              onClick={startDropboxAuth}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/40 active:scale-95"
            >
              <LogIn className="size-5" />
              {backupConfig?.dropboxToken ? 'Trocar Conta Dropbox' : 'Conectar com Dropbox'}
            </button>

            <p className="text-[9px] text-slate-500 leading-relaxed text-center mt-2 px-2">
              Seus dados serão criptografados e salvos em uma pasta privada no seu Dropbox.
              <strong> Ninguém</strong>, nem o Dropbox, terá acesso aos seus dados.
            </p>
          </div>

          {/* Senha de Backup */}
          <div className="space-y-4 p-6 bg-white/5 rounded-[2rem] border border-white/5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Sua Senha Mestra</label>
            <div className="relative">
              <input
                type="password"
                value={backupPass}
                onChange={(e) => setBackupPass(e.target.value)}
                placeholder="Crie uma senha de segurança..."
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white focus:outline-none focus:border-blue-500"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            </div>
            <button
              onClick={() => onUpdateBackupConfig(undefined, backupPass)}
              className="btn-primary w-full py-3 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2"
            >
              <Save className="size-4" /> Salvar Senha
            </button>
          </div>
        </div>

        {/* Ações de Backup */}
        <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-white/5">
          <button
            disabled={!backupConfig?.dropboxToken || !backupConfig?.backupPassword || isCloudSyncing}
            onClick={onDropboxBackup}
            className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-indigo-900/20"
          >
            {isCloudSyncing ? <Loader2 className="size-5 animate-spin" /> : <UploadCloud className="size-5" />} Enviar Backup
          </button>
          <button
            disabled={!backupConfig?.dropboxToken || !backupConfig?.backupPassword || isCloudSyncing}
            onClick={() => onDropboxRestore()}
            className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all border border-white/5 active:scale-95"
          >
            {isCloudSyncing ? <Loader2 className="size-5 animate-spin" /> : <DownloadCloud className="size-5" />} Restaurar
          </button>
        </div>
      </section>

      {/* SEÇÃO 2: IA E CATEGORIAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-500/20 rounded-xl"><Target className="text-indigo-400 size-5" /></div>
              <h3 className="font-black text-white text-lg tracking-tight">Meta de Poupança</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <input type="range" min="0" max="100" value={newTarget} onChange={(e) => setNewTarget(Number(e.target.value))} className="flex-1 accent-indigo-500" />
                <span className="text-2xl font-black text-indigo-400 w-16 text-right">{newTarget}%</span>
              </div>
              <button onClick={() => onUpdateSavingsTarget(newTarget)} className="btn-primary w-full py-3 rounded-2xl text-xs font-bold uppercase flex items-center justify-center gap-2"><Save className="size-4" /> Salvar Meta</button>
            </div>
          </section>

          <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-violet-500/20 rounded-xl"><Sparkles className="text-violet-400 size-5" /></div>
              <h3 className="font-black text-white text-lg tracking-tight">IA Assistant</h3>
            </div>
            <div className="space-y-4">
              <select value={aiProvider} onChange={(e) => setAiProvider(e.target.value as AIProvider)} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white">
                <option value="groq">Groq</option><option value="gemini">Gemini</option><option value="deepseek">DeepSeek</option>
              </select>
              <input type="password" value={aiKey} placeholder="API Key..." onChange={(e) => setAiKey(e.target.value)} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white" />
              <button onClick={() => onUpdateAIConfig(aiProvider, aiKey)} className="w-full py-3 bg-violet-600 text-white rounded-2xl text-xs font-bold uppercase">Salvar IA</button>
            </div>
          </section>
        </div>

        <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3"><Tag className="text-emerald-400 size-5" /><h3 className="font-black text-white text-lg tracking-tight">Categorias</h3></div>
            <div className="flex gap-2">
              <button onClick={() => onUpdateAIManageCategories(!aiManageCategories)} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${aiManageCategories ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-800 text-slate-500'}`}>IA Ativa</button>
              <button onClick={handleStartAddCategory} className="p-2 bg-white/5 text-white rounded-xl"><Plus className="size-5" /></button>
            </div>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3"><span className="text-xl">{cat.icon}</span><div><p className="text-sm font-bold text-white">{cat.name}</p><p className="text-[10px] text-slate-500 font-black uppercase">{cat.type}</p></div></div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingCategory(cat)} className="p-2 text-slate-400"><Settings className="size-4" /></button>
                  <button onClick={() => confirm('Excluir?') && onUpdateCategories(categories.filter(c => c.id !== cat.id))} className="p-2 text-slate-400 hover:text-rose-400"><Trash2 className="size-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* SEÇÃO 3: CONTAS FIXAS */}
      <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3"><CalendarClock className="text-amber-400 size-5" /><h3 className="font-black text-white text-lg tracking-tight">Contas Fixas</h3></div>
          <button onClick={() => setIsAddingRec(!isAddingRec)} className="btn-secondary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">{isAddingRec ? 'Cancelar' : 'Nova Conta'}</button>
        </div>
        {isAddingRec && (
          <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 grid grid-cols-1 md:grid-cols-5 gap-4 animate-in zoom-in-95">
            <div className="md:col-span-2"><input type="text" value={recForm.descricao} onChange={e => setRecForm({...recForm, descricao: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white" placeholder="Descrição..." /></div>
            <input type="number" value={recForm.valor} onChange={e => setRecForm({...recForm, valor: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white" placeholder="Valor..." />
            <input type="number" min="1" max="31" value={recForm.dia} onChange={e => setRecForm({...recForm, dia: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white text-center" />
            <button onClick={handleSaveRec} className="btn-primary py-3 rounded-xl text-[10px] font-black uppercase">Salvar</button>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recorrencias.map(rec => (
            <div key={rec.id} className="p-5 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4"><div className="p-3 bg-slate-800 rounded-2xl text-amber-400"><CalendarClock className="size-5" /></div><div><h4 className="font-bold text-white text-sm">{rec.descricao}</h4><p className="text-[10px] font-black text-slate-500 uppercase">Dia {rec.dia} • R$ {rec.valor.toFixed(2)}</p></div></div>
              <button onClick={() => onDeleteRecurring(rec.id)} className="p-2 text-slate-600 hover:text-rose-400"><Trash2 className="size-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <button onClick={() => confirm("Apagar tudo?") && onResetDatabase()} className="w-full py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.4em] border border-rose-500/20 text-rose-500/50 hover:bg-rose-500 hover:text-white transition-all">Limpar Todos os Dados Locais</button>

      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card p-8 rounded-[2.5rem] w-full max-w-md space-y-6">
            <h3 className="font-black text-white text-xl tracking-tight">Editar Categoria</h3>
            <div className="space-y-4">
              <input type="text" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={editingCategory.icon} onChange={e => setEditingCategory({...editingCategory, icon: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-center" />
                <select value={editingCategory.type} onChange={e => setEditingCategory({...editingCategory, type: e.target.value as any})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white"><option value="income">Receita</option><option value="expense">Despesa</option><option value="investment">Investimento</option></select>
              </div>
              <input type="color" value={editingCategory.color} onChange={e => setEditingCategory({...editingCategory, color: e.target.value})} className="w-full h-12 bg-transparent border-none cursor-pointer" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingCategory(null)} className="flex-1 btn-secondary py-3 rounded-2xl text-xs font-bold uppercase">Cancelar</button>
              <button onClick={handleSaveCategoryInline} className="flex-1 btn-primary py-3 rounded-2xl text-xs font-bold uppercase">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
