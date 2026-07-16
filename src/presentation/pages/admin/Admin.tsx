import { useState } from 'react';
import { Settings, Plus, Trash2, Save, Target, Tag, Sparkles, Key, CalendarClock } from 'lucide-react';
import type { Category } from '../../../domain/categories/entities/categories';
import type { AIProvider, Recorrencia } from '../../../infrastructure/datasources/storage/sqliteStorage';

interface AdminPageProps {
  savingsTargetPct: number;
  categories: Category[];
  recorrencias: Recorrencia[];
  aiConfig?: { provider: AIProvider, apiKey: string };
  aiManageCategories: boolean;
  onUpdateSavingsTarget: (pct: number) => void;
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateAIConfig: (provider: AIProvider, apiKey: string) => void;
  onUpdateAIManageCategories: (active: boolean) => void;
  onAddRecurring: (rec: Omit<Recorrencia, 'id'>) => void;
  onDeleteRecurring: (id: string) => void;
  onResetDatabase: () => void;
}

export const AdminPage = ({
  savingsTargetPct,
  categories,
  recorrencias,
  aiConfig,
  aiManageCategories,
  onUpdateSavingsTarget,
  onUpdateCategories,
  onUpdateAIConfig,
  onUpdateAIManageCategories,
  onAddRecurring,
  onDeleteRecurring,
  onResetDatabase,
}: AdminPageProps) => {
  const [newTarget, setNewTarget] = useState(savingsTargetPct);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // Recurrence States
  const [isAddingRec, setIsAddingRec] = useState(false);
  const [recForm, setRecForm] = useState({
    descricao: '',
    valor: '',
    categoria_id: categories[0]?.id || '',
    dia: 1,
    forma_pagamento: 'dinheiro'
  });

  // IA States
  const [aiProvider, setAiProvider] = useState<AIProvider>(aiConfig?.provider || 'groq');
  const [aiKey, setAiKey] = useState(aiConfig?.apiKey || '');

  const handleAddCategory = () => {
    setEditingCategory({ id: `cat_${Date.now()}`, name: '', color: '#6366f1', icon: '📦', type: 'expense' });
  };

  const handleSaveCategory = () => {
    if (!editingCategory?.name) return;
    const exists = categories.find(c => c.id === editingCategory.id);
    if (exists) {
      onUpdateCategories(categories.map(c => c.id === editingCategory.id ? (editingCategory as Category) : c));
    } else {
      onUpdateCategories([...categories, editingCategory as Category]);
    }
    setEditingCategory(null);
  };

  const handleSaveRec = () => {
    if (!recForm.descricao || !recForm.valor) return;
    onAddRecurring({
      ...recForm,
      valor: parseFloat(recForm.valor),
      dia: Number(recForm.dia)
    });
    setIsAddingRec(false);
    setRecForm({ descricao: '', valor: '', categoria_id: categories[0]?.id || '', dia: 1, forma_pagamento: 'dinheiro' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Coluna 1: Metas e IA */}
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
              <button onClick={() => onUpdateSavingsTarget(newTarget)} className="btn-primary w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"><Save className="size-4" /> Salvar Meta</button>
            </div>
          </section>

          <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-violet-500/20 rounded-xl"><Sparkles className="text-violet-400 size-5" /></div>
              <h3 className="font-black text-white text-lg tracking-tight">Inteligência Artificial</h3>
            </div>
            <div className="space-y-4">
              <select value={aiProvider} onChange={(e) => setAiProvider(e.target.value as AIProvider)} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none">
                <option value="groq">Groq (Rápido & Grátis)</option>
                <option value="gemini">Google Gemini</option>
                <option value="deepseek">DeepSeek</option>
              </select>
              <div className="relative">
                <input type="password" value={aiKey} placeholder="Sua chave de API..." onChange={(e) => setAiKey(e.target.value)} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-white focus:outline-none focus:border-violet-500" />
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
              </div>
              <button onClick={() => onUpdateAIConfig(aiProvider, aiKey)} className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-violet-900/20"><Save className="size-4" /> Salvar IA</button>
            </div>
          </section>

          <section className="glass-card p-8 rounded-[2.5rem] border-rose-500/20">
             <button onClick={() => confirm("Apagar tudo?") && onResetDatabase()} className="w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white transition-all">Resetar Banco de Dados</button>
          </section>
        </div>

        {/* Coluna 2: Categorias */}
        <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-xl"><Tag className="text-emerald-400 size-5" /></div>
              <h3 className="font-black text-white text-lg tracking-tight">Categorias</h3>
            </div>
            <div className="flex gap-2">
              <button onClick={() => onUpdateAIManageCategories(!aiManageCategories)} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${aiManageCategories ? 'bg-violet-500/20 text-violet-400' : 'bg-slate-800 text-slate-500'}`}>IA Ativa</button>
              <button onClick={handleAddCategory} className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl"><Plus className="size-5" /></button>
            </div>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-white">{cat.name}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{cat.type}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditingCategory(cat)} className="p-2 text-slate-400 hover:text-white"><Settings className="size-4" /></button>
                  <button onClick={() => confirm('Excluir?') && onUpdateCategories(categories.filter(c => c.id !== cat.id))} className="p-2 text-slate-400 hover:text-rose-400"><Trash2 className="size-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Seção 3: Lançamentos Recorrentes (Largura Total) */}
      <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-xl"><CalendarClock className="text-amber-400 size-5" /></div>
            <h3 className="font-black text-white text-lg tracking-tight">Contas Fixas / Recorrências</h3>
          </div>
          <button onClick={() => setIsAddingRec(!isAddingRec)} className="btn-secondary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            {isAddingRec ? 'Cancelar' : <><Plus className="size-4" /> Nova Conta Fixa</>}
          </button>
        </div>

        {isAddingRec && (
          <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 grid grid-cols-1 md:grid-cols-5 gap-4 animate-in zoom-in-95 duration-300">
            <div className="md:col-span-2">
              <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block">Descrição</label>
              <input type="text" value={recForm.descricao} onChange={e => setRecForm({...recForm, descricao: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white" placeholder="Ex: Netflix, Aluguel..." />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block">Valor</label>
              <input type="number" value={recForm.valor} onChange={e => setRecForm({...recForm, valor: e.target.value})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white" placeholder="0,00" />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase mb-2 block">Dia</label>
              <input type="number" min="1" max="31" value={recForm.dia} onChange={e => setRecForm({...recForm, dia: Number(e.target.value)})} className="w-full bg-slate-900 border border-white/5 rounded-xl p-3 text-sm text-white text-center" />
            </div>
            <div className="flex items-end">
              <button onClick={handleSaveRec} className="btn-primary w-full py-3 rounded-xl text-[10px] font-black uppercase">Salvar Fixa</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recorrencias.map(rec => (
            <div key={rec.id} className="p-5 bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-2xl text-slate-400 group-hover:text-amber-400 transition-colors">
                  <CalendarClock className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{rec.descricao}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Todo dia {rec.dia}</span>
                    <span className="text-amber-500/50">•</span>
                    <span className="text-indigo-400">R$ {rec.valor.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => onDeleteRecurring(rec.id)} className="p-2 text-slate-600 hover:text-rose-400 transition-colors">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {recorrencias.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs italic">
              Nenhuma conta fixa cadastrada ainda.
            </div>
          )}
        </div>
      </section>

      {/* Modal Categoria (Reutilizado) */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-card p-8 rounded-[2.5rem] w-full max-w-md space-y-6">
            <h3 className="font-black text-white text-xl tracking-tight">Editar Categoria</h3>
            <div className="space-y-4">
              <input type="text" value={editingCategory.name} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={editingCategory.icon} onChange={e => setEditingCategory({...editingCategory, icon: e.target.value})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-center" />
                <select value={editingCategory.type} onChange={e => setEditingCategory({...editingCategory, type: e.target.value as any})} className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white">
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                  <option value="investment">Investimento</option>
                </select>
              </div>
              <input type="color" value={editingCategory.color} onChange={e => setEditingCategory({...editingCategory, color: e.target.value})} className="w-full h-12 bg-transparent border-none cursor-pointer" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditingCategory(null)} className="flex-1 btn-secondary py-3 rounded-2xl text-xs font-bold uppercase">Cancelar</button>
              <button onClick={handleSaveCategory} className="flex-1 btn-primary py-3 rounded-2xl text-xs font-bold uppercase">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
