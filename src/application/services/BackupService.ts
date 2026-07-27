import { db } from '../../infrastructure/db/AppDatabase';
import { encryptData, decryptData } from '../../infrastructure/utils/crypto';

const BACKUP_FILENAME = 'finance_guard_backup.enc';

export const backupData = async (token: string, password: string) => {
  const [txs, categories, parcelamentos, recorrencias, cards, appConfig] = await Promise.all([
    db.transacoes.toArray(),
    db.categorias.toArray(),
    db.parcelamentos.toArray(),
    db.recorrencias.toArray(),
    db.cartoes.toArray(),
    db.appConfig.get('global')
  ]);

  const payload = {
    txs,
    categories,
    parcelamentos,
    recorrencias,
    cards,
    config: {
      savingsTargetPct: appConfig?.savingsTargetPct,
      enableCreditCardStatement: appConfig?.enableCreditCardStatement,
      aiManageCategories: appConfig?.aiManageCategories,
      aiConfig: appConfig?.aiConfig
    },
    version: '1.4.0',
    timestamp: Date.now(),
  };

  const encrypted = encryptData(payload, password);

  const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
    method: 'POST',
    keepalive: true, // Garante que o upload termine mesmo se a aba fechar
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'Dropbox-API-Arg': JSON.stringify({
        path: `/${BACKUP_FILENAME}`,
        mode: 'overwrite',
        mute: true,
      }),
    },
    body: encrypted,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error_summary || 'Erro no upload');
  }

  // Atualiza o timestamp do último backup bem-sucedido
  const currentConfig = await db.appConfig.get('global');
  if (currentConfig) {
    await db.appConfig.put({
      ...currentConfig,
      backupConfig: {
        ...(currentConfig.backupConfig || {}),
        lastCloudBackup: new Date().toISOString()
      },
      id: 'global'
    });
  }
};

export const restoreData = async (token: string, password: string) => {
  const response = await fetch('https://content.dropboxapi.com/2/files/download', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Dropbox-API-Arg': JSON.stringify({ path: `/${BACKUP_FILENAME}` }),
    },
  });

  if (response.status === 409) return;
  if (!response.ok) return;

  const encrypted = await response.text();
  const data = decryptData(encrypted, password);
  if (!data) return;

  await db.transaction('rw', [db.transacoes, db.categorias, db.parcelamentos, db.recorrencias, db.cartoes, db.appConfig], async () => {
    if (data.categories) {
        await db.categorias.clear();
        await db.categorias.bulkAdd(data.categories);
    }
    if (data.txs) {
        await db.transacoes.clear();
        await db.transacoes.bulkAdd(data.txs);
    }
    if (data.parcelamentos) {
        await db.parcelamentos.clear();
        await db.parcelamentos.bulkAdd(data.parcelamentos);
    }
    if (data.recorrencias) {
        await db.recorrencias.clear();
        await db.recorrencias.bulkAdd(data.recorrencias);
    }
    if (data.cards) {
        await db.cartoes.clear();
        await db.cartoes.bulkAdd(data.cards);
    }
    if (data.config) {
        const currentConfig = await db.appConfig.get('global');
        await db.appConfig.put({
            ...currentConfig,
            ...data.config,
            id: 'global'
        });
    }
  });
};
