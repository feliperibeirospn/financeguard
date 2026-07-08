import React, { useState } from 'react';
import { Settings, Plus, Trash2, Save, Target, Tag } from 'lucide-react';
import type { Category, CategoryType } from '../../../domain/categories/entities/categories';
import { generateUUID } from '../../../domain/shared/generateUUID';

interface AdminPageProps {
  savingsTargetPct: number;
  categories: Category[];
  onUpdateSavingsTarget: (pct: number) => void;
  onUpdateCategories: (categories: Category[]) => void;
}

export const AdminPage = ({
  savingsTargetPct,
  categories,
  onUpdateSavingsTarget,
  onUpdateCategories,
}: AdminPageProps) => {
  const [newTarget, setNewTarget] = useState(savingsTargetPct);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  const handleAddCategory = () => {
    setEditingCategory({
      id: `cat_${Date.now()}`,
      name: '',
      color: '#6366f1',
      icon: '📦',
      type: 'expense',
    });
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

  const handleDeleteCategory = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria? Isso pode afetar lançamentos existentes.')) {
      onUpdateCategories(categories.filter(c => c.id !== id));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Meta de Poupança */}
        <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <Target className="text-indigo-400 size-5" />
            </div>
            <h3 className="font-black text-white text-lg tracking-tight">Meta de Poupança</h3>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-slate-400 font-medium">
              Defina a porcentagem da sua receita que você deseja investir mensalmente.
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={newTarget}
                onChange={(e) => setNewTarget(Number(e.target.value))}
                className="flex-1 accent-indigo-500"
              />
              <span className="text-2xl font-black text-indigo-400 w-16 text-right">{newTarget}%</span>
            </div>
            <button
              onClick={() => onUpdateSavingsTarget(newTarget)}
              className="btn-primary w-full py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Save className="size-4" /> Salvar Meta
            </button>
          </div>
        </section>

        {/* Categorias */}
        <section className="glass-card p-8 rounded-[2.5rem] space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-xl">
                <Tag className="text-emerald-400 size-5" />
              </div>
              <h3 className="font-black text-white text-lg tracking-tight">Categorias</h3>
            </div>
            <button
              onClick={handleAddCategory}
              className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
            >
              <Plus className="size-5" />
            </button>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-white">{cat.name}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{cat.type}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCategory(cat)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <Settings className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modal / Form de Edição de Categoria */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card p-8 rounded-[2.5rem] w-full max-w-md space-y-6">
            <h3 className="font-black text-white text-xl tracking-tight">
              {categories.find(c => c.id === editingCategory.id) ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Nome</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Ícone</label>
                  <input
                    type="text"
                    value={editingCategory.icon}
                    onChange={e => setEditingCategory({...editingCategory, icon: e.target.value})}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-center"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Tipo</label>
                  <select
                    value={editingCategory.type}
                    onChange={e => setEditingCategory({...editingCategory, type: e.target.value as CategoryType})}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none"
                  >
                    <option value="income">Receita</option>
                    <option value="expense">Despesa</option>
                    <option value="investment">Investimento</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Cor</label>
                <input
                  type="color"
                  value={editingCategory.color}
                  onChange={e => setEditingCategory({...editingCategory, color: e.target.value})}
                  className="w-full h-12 bg-transparent border-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingCategory(null)}
                className="flex-1 btn-secondary py-3 rounded-2xl text-xs font-bold uppercase tracking-wider"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCategory}
                className="flex-1 btn-primary py-3 rounded-2xl text-xs font-bold uppercase tracking-wider"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
