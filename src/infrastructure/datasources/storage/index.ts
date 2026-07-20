/**
 * Barrel do datasource de storage.
 * Centraliza reexports para consumo simplificado:
 *   import { loadDb, saveDb, exportTransactionsToCSV } from '@/infrastructure/datasources/storage';
 */

export type { SqliteDatabase, AIProvider, Recorrencia, CartaoCredito } from './sqliteStorage';
export { loadDb, saveDb, clearDb, getDefaultSeed } from './sqliteStorage';
export { buildTransactionsCsv, exportTransactionsToCSV } from './csvExporter';
