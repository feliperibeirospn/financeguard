export type CategoryType = 'income' | 'expense' | 'investment';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: CategoryType;
}

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat_essencial', name: 'Essencial', color: '#3b82f6', icon: '🏠', type: 'expense' },
  { id: 'cat_lazer', name: 'Estilo de Vida', color: '#f59e0b', icon: '🍿', type: 'expense' },
  { id: 'cat_investimento', name: 'Investimento', color: '#10b981', icon: '📈', type: 'investment' },
  { id: 'cat_receita', name: 'Receita / Salário', color: '#8b5cf6', icon: '💰', type: 'income' }
];
