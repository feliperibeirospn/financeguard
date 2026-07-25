import { create } from 'zustand';
import { db } from '../../infrastructure/db/AppDatabase';
import type { Transacao } from '../../domain/transactions/entities/Transacao';
import type { Parcelamento } from '../../domain/transactions/entities/Parcelamento';
import { useConfigStore } from './useConfigStore';
import { backupData, restoreData } from '../services/BackupService';

interface TransactionState {
  transactions: Transacao[];
  parcelamentos: Parcelamento[];
  cartoes: any[];
  recorrencias: any[];
  isLoading: boolean;
  loadData: () => Promise<void>;
  handleAddTransaction: (input: any, isOnline: boolean) => Promise<void>;
  handleDeleteTransaction: (id: string) => Promise<void>;
  handleExportCSV: () => void;
  handleSyncData: () => Promise<void>;
  handleApplyRecurring: (month: number, year: number, isOnline: boolean) => Promise<void>;
  addCard: (card: any) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  resetData: () => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  parcelamentos: [],
  cartoes: [],
  recorrencias: [],
  isLoading: true,

  loadData: async () => {
    const [txs, par, cards, rec] = await Promise.all([
      db.transacoes.toArray(),
      db.parcelamentos.toArray(),
      db.cartoes.toArray(),
      db.recorrencias.toArray()
    ]);
    set({ transactions: txs, parcelamentos: par, cartoes: cards, recorrencias: rec, isLoading: false });

    const { backupConfig, loadConfig } = useConfigStore.getState();
    if (backupConfig?.dropboxToken && backupConfig?.backupPassword) {
      try {
        await restoreData(backupConfig.dropboxToken, backupConfig.backupPassword);
        // Recarrega TUDO após restore (inclusive configurações de IA)
        await loadConfig();
        const [ntxs, npar, ncards, nrec] = await Promise.all([
          db.transacoes.toArray(),
          db.parcelamentos.toArray(),
          db.cartoes.toArray(),
          db.recorrencias.toArray()
        ]);
        set({ transactions: ntxs, parcelamentos: npar, cartoes: ncards, recorrencias: nrec });
      } catch (e) {
        console.warn('Auto-restore silencioso falhou ou não há dados novos.');
      }
    }
  },

  handleSyncData: async () => {
    const { backupConfig } = useConfigStore.getState();
    if (!backupConfig?.dropboxToken || !backupConfig?.backupPassword) return;
    try {
      await backupData(backupConfig.dropboxToken, backupConfig.backupPassword);
    } catch (e: any) {
      console.error("Erro na sincronização automática:", e);
    }
  },

  handleAddTransaction: async (input, isOnline) => {
    const id = Date.now().toString();
    const newTx: Transacao = {
      id,
      ...input,
      id_remoto: id,
      parcelamento_id: null,
      atualizado_em: Date.now(),
      status_sincronismo: 'PENDENTE'
    };
    await db.transacoes.add(newTx);
    set((state) => ({ transactions: [newTx, ...state.transactions] }));
    if (isOnline) get().handleSyncData();
  },

  handleDeleteTransaction: async (id) => {
    await db.transacoes.delete(id);
    set((state) => ({ transactions: state.transactions.filter(t => t.id !== id) }));
    get().handleSyncData();
  },

  handleApplyRecurring: async (month, year, isOnline) => {
    const { recorrencias } = get();
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;

    for (const rec of recorrencias) {
      const id = `${rec.id}_${month}_${year}`;
      const exists = await db.transacoes.get(id);
      if (!exists) {
        await db.transacoes.add({
          id,
          id_remoto: id,
          descricao: rec.descricao,
          valor: rec.valor,
          categoria_id: rec.categoria_id,
          forma_pagamento: 'dinheiro',
          data: dateStr,
          parcelamento_id: null,
          atualizado_em: Date.now(),
          status_sincronismo: 'PENDENTE'
        });
      }
    }
    const txs = await db.transacoes.toArray();
    set({ transactions: txs });
    if (isOnline) get().handleSyncData();
  },

  addCard: async (card) => {
    const id = Date.now().toString();
    const newCard = { ...card, id };
    await db.cartoes.add(newCard);
    set(state => ({ cartoes: [...state.cartoes, newCard] }));
  },

  deleteCard: async (id) => {
    await db.cartoes.delete(id);
    set(state => ({ cartoes: state.cartoes.filter(c => c.id !== id) }));
  },

  resetData: async () => {
    await Promise.all([
      db.transacoes.clear(),
      db.parcelamentos.clear(),
      db.cartoes.clear(),
      db.recorrencias.clear()
    ]);
    set({ transactions: [], parcelamentos: [], cartoes: [], recorrencias: [] });
  },

  handleExportCSV: () => {
    const { transactions } = get();
    const headers = ['Data', 'Descricao', 'Valor', 'Categoria', 'Metodo'];
    const rows = transactions.map(t => [t.data, t.descricao, t.valor, t.categoria_id, t.forma_pagamento]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `extrato_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  }
}));
