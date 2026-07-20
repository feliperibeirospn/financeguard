import { INITIAL_CATEGORIES } from '../../../domain/categories/entities/categories';
import type { Transacao } from '../../../domain/transactions/entities/Transacao';
import type { Parcelamento } from '../../../domain/transactions/entities/Parcelamento';
import { generateUUID } from '../../../domain/shared/generateUUID';

/**
 * Estado completo do "banco SQLite" simulado, persistido em localStorage.
 * Reflete as 3 tabelas principais: categorias, transacoes, parcelamentos.
 */
export type AIProvider = 'groq' | 'gemini' | 'deepseek';

export interface Recorrencia {
  id: string;
  descricao: string;
  valor: number;
  categoria_id: string;
  dia: number;
  forma_pagamento: string;
}

export interface CartaoCredito {
  id: string;
  nome: string;
  diaFechamento: number;
  diaVencimento: number;
  cor: string;
}

export interface SqliteDatabase {
  categorias: typeof INITIAL_CATEGORIES;
  parcelamentos: Parcelamento[];
  transacoes: Transacao[];
  recorrencias: Recorrencia[];
  cartoes: CartaoCredito[];
  config: {
    savingsTargetPct: number;
    enableCreditCardStatement?: boolean;
    aiConfig?: {
      provider: AIProvider;
      apiKey: string;
    };
    lastAIAnalysis?: {
      date: string;
      insights: string[];
    };
    aiManageCategories?: boolean;
    backupConfig?: {
      dropboxToken?: string;
      dropboxAppKey?: string;
      dropboxUserEmail?: string;
      backupPassword?: string;
      lastCloudBackup?: string;
    };
  };
}

const STORAGE_KEY = 'sqlite_simulation_db';

/**
 * Seed inicial injetado na primeira execução.
 */
export const getDefaultSeed = (): SqliteDatabase => {
  const today = new Date().toISOString().split('T')[0];
  return {
    categorias: INITIAL_CATEGORIES,
    parcelamentos: [],
    transacoes: [
      {
        id: 't_seed_1',
        id_remoto: generateUUID(),
        descricao: 'Salário Mensal',
        valor: 5000.0,
        categoria_id: 'cat_receita',
        data: today,
        forma_pagamento: 'dinheiro',
        parcelamento_id: null,
        atualizado_em: Date.now(),
        status_sincronismo: 'SINCRONIZADO',
      },
      {
        id: 't_seed_2',
        id_remoto: generateUUID(),
        descricao: 'Aluguel de Março',
        valor: -1500.0,
        categoria_id: 'cat_essencial',
        data: today,
        forma_pagamento: 'dinheiro',
        parcelamento_id: null,
        atualizado_em: Date.now(),
        status_sincronismo: 'SINCRONIZADO',
      },
    ],
    recorrencias: [],
    cartoes: [],
    config: {
      savingsTargetPct: 20,
    },
  };
};

/**
 * Carrega o banco simulado com migração de esquema automática.
 */
export const loadDb = (): SqliteDatabase | null => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);

    // MIGRAÇÃO DE DADOS: Se o banco existir mas faltar a nova tabela de recorrencias,
    // nós injetamos ela vazia para evitar que o React quebre ao tentar ler undefined.
    if (data && !data.recorrencias) {
      data.recorrencias = [];
      console.log('Migração: Tabela de recorrencias adicionada ao banco local.');
    }
    if (data && !data.cartoes) {
      data.cartoes = [];
      console.log('Migração: Tabela de cartoes adicionada.');
    }

    return data as SqliteDatabase;
  } catch (e) {
    console.error('Erro ao carregar banco local:', e);
    return null;
  }
};

/**
 * Persiste o estado completo do banco simulado em localStorage.
 */
export const saveDb = (db: SqliteDatabase): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

/**
 * Limpa o banco.
 */
export const clearDb = (): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.removeItem(STORAGE_KEY);
};
