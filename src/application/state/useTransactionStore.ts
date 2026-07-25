import { create } from 'zustand';
import { db } from '../../infrastructure/db/AppDatabase';
import type { Transacao } from '../../domain/transactions/entities/Transacao';
import type { Parcelamento } from '../../domain/transactions/entities/Parcelamento';
import type { Recorrencia, CartaoCredito } from '../../infrastructure/datasources/storage/sqliteStorage';
import { exportTransactionsToCSV } from '../../infrastructure/datasources/storage';
import { generateUUID } from '../../domain/shared/generateUUID';
import { generateInstallments } from '../../domain/transactions';

interface TransactionState {
  transactions: Transacao[];
  parcelamentos: Parcelamento[];
  recorrencias: Recorrencia[];
  cartoes: CartaoCredito[];
  isLoading: boolean;

  loadData: () => Promise<void>;
  handleAddTransaction: (input: any, isOnline: boolean) => Promise<void>;
  handleDeleteTransaction: (id: string) => Promise<void>;
  handleSyncData: () => Promise<void>;
  handleExportCSV: () => void;

  addRecurring: (rec: Omit<Recorrencia, 'id'>) => Promise<void>;
  deleteRecurring: (id: string) => Promise<void>;
  handleApplyRecurring: (selectedMonth: number, selectedYear: number, isOnline: boolean) => Promise<void>;

  addCard: (card: Omit<CartaoCredito, 'id'>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;

  resetData: () => Promise<void>;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  parcelamentos: [],
  recorrencias: [],
  cartoes: [],
  isLoading: true,

  loadData: async () => {
    const [transactions, parcelamentos, recorrencias, cartoes] = await Promise.all([
      db.transacoes.reverse().toArray(),
      db.parcelamentos.toArray(),
      db.recorrencias.toArray(),
      db.cartoes.toArray(),
    ]);
    set({ transactions, parcelamentos, recorrencias, cartoes, isLoading: false });
  },

  handleAddTransaction: async (input, isOnline) => {
    const { description, amount, category, paymentMethod, installments, date, cartaoId } = input;
    const finalAmount = amount;
    const newTxId = `t_${Date.now()}`;
    const syncStatus = isOnline ? 'SINCRONIZADO' : 'PENDENTE';

    if (paymentMethod === 'cartao' && installments > 1) {
      const { parcelamento, parcelas } = generateInstallments({
        descricao: description,
        valorTotal: finalAmount,
        qtdParcelas: installments,
        categoriaId: category,
        dataInicio: date,
        statusSincronismo: syncStatus,
        timestamp: Date.now(),
        idPrefix: newTxId
      });
      const parcelasComCartao = parcelas.map(p => ({ ...p, cartao_id: cartaoId }));
      await db.transaction('rw', [db.parcelamentos, db.transacoes], async () => {
        await db.parcelamentos.add(parcelamento);
        await db.transacoes.bulkAdd(parcelasComCartao);
      });
      set(state => ({
        parcelamentos: [...state.parcelamentos, parcelamento],
        transactions: [...parcelasComCartao, ...state.transactions]
      }));
    } else {
      const tx: Transacao = {
        id: newTxId,
        id_remoto: generateUUID(),
        descricao: description,
        valor: finalAmount,
        categoria_id: category,
        data: date,
        forma_pagamento: paymentMethod,
        parcelamento_id: null,
        atualizado_em: Date.now(),
        status_sincronismo: syncStatus,
        cartao_id: cartaoId
      };
      await db.transacoes.add(tx);
      set(state => ({ transactions: [tx, ...state.transactions] }));
    }
  },

  handleDeleteTransaction: async (id) => {
    await db.transacoes.delete(id);
    set(state => ({ transactions: state.transactions.filter(t => t.id !== id) }));
  },

  handleSyncData: async () => {
    await db.transacoes.where('status_sincronismo').equals('PENDENTE').modify({ status_sincronismo: 'SINCRONIZADO' });
    const transactions = await db.transacoes.reverse().toArray();
    set({ transactions });
  },

  handleExportCSV: () => {
    exportTransactionsToCSV(get().transactions);
  },

  addRecurring: async (input) => {
    const newRec = { ...input, id: `rec_${Date.now()}` } as Recorrencia;
    await db.recorrencias.add(newRec);
    set(state => ({ recorrencias: [...state.recorrencias, newRec] }));
  },

  deleteRecurring: async (id) => {
    await db.recorrencias.delete(id);
    set(state => ({ recorrencias: state.recorrencias.filter(r => r.id !== id) }));
  },

  handleApplyRecurring: async (selectedMonth, selectedYear, isOnline) => {
    const { recorrencias, transactions } = get();
    const existingDescriptions = new Set(transactions.map(t => t.descricao.toLowerCase()));
    const pending = recorrencias.filter(r => !existingDescriptions.has(r.descricao.toLowerCase()));

    const newTxs: Transacao[] = pending.map(r => ({
      id: `t_rec_${r.id}_${Date.now()}`,
      id_remoto: generateUUID(),
      descricao: r.descricao,
      valor: r.valor,
      categoria_id: r.categoria_id,
      data: new Date(selectedYear, selectedMonth, r.dia).toISOString().split('T')[0],
      forma_pagamento: r.forma_pagamento as any,
      parcelamento_id: null,
      atualizado_em: Date.now(),
      status_sincronismo: isOnline ? 'SINCRONIZADO' : 'PENDENTE',
    }));

    await db.transacoes.bulkAdd(newTxs);
    set(state => ({ transactions: [...newTxs, ...state.transactions] }));
  },

  addCard: async (input) => {
    const newCard = { ...input, id: `card_${Date.now()}` } as CartaoCredito;
    await db.cartoes.add(newCard);
    set(state => ({ cartoes: [...state.cartoes, newCard] }));
  },

  deleteCard: async (id) => {
    await db.cartoes.delete(id);
    set(state => ({ cartoes: state.cartoes.filter(c => c.id !== id) }));
  },

  resetData: async () => {
    await Promise.all([db.transacoes.clear(), db.parcelamentos.clear(), db.recorrencias.clear(), db.cartoes.clear()]);
    set({ transactions: [], parcelamentos: [], recorrencias: [], cartoes: [] });
  }
}));
