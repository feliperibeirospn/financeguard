/**
 * Tipos de aba da aplicação. Centraliza o contrato para TabNav
 * e para o switch do `useFinanceApp`.
 */
export type TabId = 'dashboard' | 'transacoes' | 'sqlite' | 'architecture';

export interface TabConfig {
  id: TabId;
  label: string;
}

export const TABS: TabConfig[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'transacoes', label: 'Extrato' },
  { id: 'sqlite', label: 'Inspetor SQLite' },
  { id: 'architecture', label: 'Clean Arch Logs' },
];
