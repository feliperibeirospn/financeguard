export type TabId = 'dashboard' | 'transacoes' | 'sqlite' | 'architecture' | 'admin';

export interface TabConfig {
  id: TabId;
  label: string;
}

export const TABS: TabConfig[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'transacoes', label: 'Extrato' },
  { id: 'admin', label: 'Ajustes' },
  { id: 'sqlite', label: 'DB' },
  { id: 'architecture', label: 'Logs' },
];
