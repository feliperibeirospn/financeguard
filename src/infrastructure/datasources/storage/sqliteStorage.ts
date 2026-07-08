import { INITIAL_CATEGORIES } from '../../../domain/categories/entities/categories';
import type { Transacao } from '../../../domain/transactions/entities/Transacao';
import type { Parcelamento } from '../../../domain/transactions/entities/Parcelamento';
import { generateUUID } from '../../../domain/shared/generateUUID';

/**
 * Estado completo do "banco SQLite" simulado, persistido em localStorage.
 * Reflete as 3 tabelas principais: categorias, transacoes, parcelamentos.
 *
 * Em produção este seria substituído por chamadas reais ao SQLCipher
 * via `@op-engineering/op-sqlite` ou similar — o contrato de tipos
 * permaneceria idêntico.
 */
export interface SqliteDatabase {
  categorias: typeof INITIAL_CATEGORIES;
  parcelamentos: Parcelamento[];
  transacoes: Transacao[];
  config: {
    savingsTargetPct: number;
  };
}

const STORAGE_KEY = 'sqlite_simulation_db';

/**
 * Seed inicial injetado na primeira execução (ou quando localStorage está vazio).
 * Espelha o seed do `app_de_produ_o.tsx` original:
 *  - 4 categorias (essencial, lazer, investimento, receita)
 *  - 2 transações de exemplo (salário + aluguel)
 *  - 0 parcelamentos
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
    config: {
      savingsTargetPct: 20,
    },
  };
};

/**
 * Carrega o banco simulado do localStorage.
 * Retorna `null` quando não há nada persistido — o chamador decide
 * se injeta o seed default.
 */
export const loadDb = (): SqliteDatabase | null => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SqliteDatabase;
  } catch {
    // localStorage corrompido — deixa o caller cair no seed default
    return null;
  }
};

/**
 * Persiste o estado completo do banco simulado em localStorage.
 * Operação idempotente — basta reescrever a chave inteira.
 */
export const saveDb = (db: SqliteDatabase): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
};

/**
 * Limpa completamente o banco simulado.
 * Útil em testes ou para um futuro "resetar app" do menu.
 */
export const clearDb = (): void => {
  if (typeof window === 'undefined' || !window.localStorage) return;
  window.localStorage.removeItem(STORAGE_KEY);
};
