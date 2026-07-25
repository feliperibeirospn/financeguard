import { create } from 'zustand';
import { db } from '../../infrastructure/db/AppDatabase';
import type { Category } from '../../domain/categories/entities/categories';
import { INITIAL_CATEGORIES } from '../../domain/categories/entities/categories';

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  loadCategories: () => Promise<void>;
  handleAddCategory: (category: Category) => Promise<void>;
  handleUpdateCategories: (categories: Category[]) => Promise<void>;
  handleDeleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
  categories: [],
  isLoading: true,

  loadCategories: async () => {
    let categories = await db.categorias.toArray();
    if (categories.length === 0) {
      await db.categorias.bulkAdd(INITIAL_CATEGORIES);
      categories = INITIAL_CATEGORIES;
    }
    set({ categories, isLoading: false });
  },

  handleAddCategory: async (category) => {
    await db.categorias.add(category);
    set((state) => ({ categories: [...state.categories, category] }));
  },

  handleUpdateCategories: async (categories) => {
    await db.categorias.clear();
    await db.categorias.bulkAdd(categories);
    set({ categories });
  },

  handleDeleteCategory: async (id) => {
    await db.categorias.delete(id);
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
  },
}));
