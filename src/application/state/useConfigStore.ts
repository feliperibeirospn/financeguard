import { create } from 'zustand';
import { db, type AppConfig } from '../../infrastructure/db/AppDatabase';

interface ConfigState extends Omit<AppConfig, 'id'> {
  isLoading: boolean;
  loadConfig: () => Promise<void>;
  updateConfig: (updates: Partial<Omit<AppConfig, 'id'>>) => Promise<void>;
  handleUpdateBackupConfig: (token?: string, password?: string, appKey?: string) => Promise<void>;
  handleUpdateAIConfig: (provider: any, apiKey: string) => Promise<void>;
  handleUpdateAIManageCategories: (active: boolean) => Promise<void>;
  handleUpdateSavingsTarget: (pct: number) => Promise<void>;
  handleUpdateCreditCardConfig: (enabled: boolean) => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  savingsTargetPct: 20,
  enableCreditCardStatement: false,
  aiManageCategories: false,
  isLoading: true,

  loadConfig: async () => {
    let config = await db.appConfig.get('global');
    if (!config) {
      config = {
        id: 'global',
        savingsTargetPct: 20,
        enableCreditCardStatement: false,
        aiManageCategories: false,
      };
      await db.appConfig.add(config);
    }
    const { id, ...rest } = config;
    set({ ...rest, isLoading: false });
  },

  updateConfig: async (updates) => {
    const current = await db.appConfig.get('global');
    const updated = { ...current, ...updates, id: 'global' } as AppConfig;
    await db.appConfig.put(updated);
    const { id, ...rest } = updated;
    set({ ...rest });
  },

  handleUpdateBackupConfig: async (token, password, appKey) => {
    const { backupConfig } = get();
    let email = backupConfig?.dropboxUserEmail;

    // Se um novo token foi fornecido, buscar o e-mail do usuário no Dropbox para deixar o "lastro"
    if (token) {
      try {
        const response = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = await response.json();
          email = userData.email;
        }
      } catch (e) {
        console.error('Erro ao buscar e-mail do Dropbox:', e);
      }
    }

    const newBackupConfig = {
      ...(backupConfig || {}),
      ...(token !== undefined ? { dropboxToken: token } : {}),
      ...(password !== undefined ? { backupPassword: password } : {}),
      ...(appKey !== undefined ? { dropboxAppKey: appKey } : {}),
      ...(email !== undefined ? { dropboxUserEmail: email } : {}),
    };
    await get().updateConfig({ backupConfig: newBackupConfig });
  },

  handleUpdateAIConfig: async (provider, apiKey) => {
    await get().updateConfig({ aiConfig: { provider, apiKey } });
  },

  handleUpdateAIManageCategories: async (active) => {
    await get().updateConfig({ aiManageCategories: active });
  },

  handleUpdateSavingsTarget: async (pct) => {
    await get().updateConfig({ savingsTargetPct: pct });
  },

  handleUpdateCreditCardConfig: async (enabled) => {
    await get().updateConfig({ enableCreditCardStatement: enabled });
  },
}));
