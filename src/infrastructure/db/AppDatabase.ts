import Dexie, { type Table } from 'dexie';
import type { Category } from '../../domain/categories/entities/categories';
import type { Transacao } from '../../domain/transactions/entities/Transacao';
import type { Parcelamento } from '../../domain/transactions/entities/Parcelamento';
import type { Recorrencia, CartaoCredito, AIProvider } from '../datasources/storage/sqliteStorage';

export interface AppConfig {
  id: 'global';
  savingsTargetPct: number;
  enableCreditCardStatement: boolean;
  aiManageCategories: boolean;
  aiConfig?: {
    provider: AIProvider;
    apiKey: string;
  };
  lastAIAnalysis?: {
    date: string;
    insights: string[];
  };
  backupConfig?: {
    dropboxToken?: string;
    dropboxRefreshToken?: string; // CHAVE PERMANENTE
    dropboxAppKey?: string;
    dropboxUserEmail?: string;
    backupPassword?: string;
    lastCloudBackup?: string;
  };
}

export class AppDatabase extends Dexie {
  categorias!: Table<Category>;
  transacoes!: Table<Transacao>;
  parcelamentos!: Table<Parcelamento>;
  recorrencias!: Table<Recorrencia>;
  cartoes!: Table<CartaoCredito>;
  appConfig!: Table<AppConfig>;

  constructor() {
    super('FinanceGuardDB');
    this.version(1).stores({
      categorias: 'id, name, type',
      transacoes: 'id, id_remoto, categoria_id, data, parcelamento_id, cartao_id',
      parcelamentos: 'id, id_remoto',
      recorrencias: 'id, categoria_id',
      cartoes: 'id, nome',
      appConfig: 'id',
    });
  }
}

export const db = new AppDatabase();
