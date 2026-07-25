import { create } from 'zustand';
import type { LogEntry, LogLayer } from '../../domain/logging/entities/LogEntry';

const MAX_LOGS = 50;

interface LogState {
  logs: LogEntry[];
  addLog: (layer: LogLayer, message: string) => void;
}

export const useLogStore = create<LogState>((set) => ({
  logs: [
    { timestamp: new Date().toLocaleTimeString(), layer: 'INFRASTRUCTURE', message: 'Dexie inicializado.' },
    { timestamp: new Date().toLocaleTimeString(), layer: 'DOMAIN', message: 'Entidades prontas.' },
  ],
  addLog: (layer, message) => set((state) => ({
    logs: [{ timestamp: new Date().toLocaleTimeString(), layer, message }, ...state.logs].slice(0, MAX_LOGS)
  })),
}));
