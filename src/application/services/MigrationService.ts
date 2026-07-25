import { db } from '../../infrastructure/db/AppDatabase';
import { loadDb } from '../../infrastructure/datasources/storage/sqliteStorage';

export const migrateFromLocalStorage = async () => {
  const localData = loadDb();
  if (!localData) return;

  // Check if already migrated (e.g. appConfig exists)
  const existingConfig = await db.appConfig.get('global');
  if (existingConfig) return;

  console.log('Iniciando migração do localStorage para Dexie...');

  try {
    await db.transaction('rw', [db.categorias, db.transacoes, db.parcelamentos, db.recorrencias, db.cartoes, db.appConfig], async () => {
      if (localData.categorias.length > 0) {
        await db.categorias.clear();
        await db.categorias.bulkAdd(localData.categorias);
      }
      if (localData.transacoes.length > 0) {
        await db.transacoes.bulkAdd(localData.transacoes);
      }
      if (localData.parcelamentos.length > 0) {
        await db.parcelamentos.bulkAdd(localData.parcelamentos);
      }
      if (localData.recorrencias.length > 0) {
        await db.recorrencias.bulkAdd(localData.recorrencias);
      }
      if (localData.cartoes.length > 0) {
        await db.cartoes.bulkAdd(localData.cartoes);
      }

      await db.appConfig.put({
        id: 'global',
        savingsTargetPct: localData.config.savingsTargetPct,
        enableCreditCardStatement: localData.config.enableCreditCardStatement || false,
        aiManageCategories: localData.config.aiManageCategories || false,
        aiConfig: localData.config.aiConfig,
        lastAIAnalysis: localData.config.lastAIAnalysis,
        backupConfig: localData.config.backupConfig,
      });
    });

    console.log('Migração concluída com sucesso!');
    // Opcional: Limpar localStorage após migração bem-sucedida
    // window.localStorage.removeItem('sqlite_simulation_db');
  } catch (error) {
    console.error('Erro na migração:', error);
  }
};
