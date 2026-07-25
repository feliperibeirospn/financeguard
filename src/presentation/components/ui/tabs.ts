export type TabId = 'dashboard' | 'transacoes' | 'admin';

export interface TabConfig {
  id: TabId;
  label: string;
}

export const TABS: TabConfig[] = [
  { id: 'dashboard', label: 'Início' },
  { id: 'transacoes', label: 'Extrato' },
  { id: 'admin', label: 'Ajustes' },
];
