import { useState, useEffect, useMemo, useCallback } from 'react';
import type { LogEntry, LogLayer } from '../../domain/logging/entities/LogEntry';
import type { Transacao } from '../../domain/transactions/entities/Transacao';
import { generateInstallments } from '../../domain/transactions';
import { generateUUID } from '../../domain/shared/generateUUID';
import {
  loadDb,
  saveDb,
  getDefaultSeed,
  exportTransactionsToCSV,
  type SqliteDatabase,
  type AIProvider,
  type Recorrencia,
} from '../../infrastructure/datasources/storage';
import { encryptData, decryptData } from '../../infrastructure/utils/crypto';
import type { TabId } from '../components/ui/tabs';

const MAX_LOGS = 50;

export interface FinanceSummary {
  income: number;
  expenses: number;
  investimento: number;
  creditCard: number;
  netBalance: number;
  savingsRate: number;
  byCategory: Record<string, number>;
}

export interface ChartDatum {
  name: string;
  value: number;
  fill: string;
}

export interface NewTransactionInput {
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  installments: number;
  date: string;
  newCategory?: any;
}

export interface ToastState {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
}

/**
 * Hook raiz da aplicação. Concentra todo o estado de UI e a ponte
 * com o Domain e a Infrastructure.
 */
export const useFinanceApp = () => {
  // ---------- Infra / sync ----------
  const [isOnline, setIsOnline] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>(() => [
    { timestamp: new Date().toLocaleTimeString(), layer: 'INFRASTRUCTURE', message: 'SQLCipher inicializado.' },
    { timestamp: new Date().toLocaleTimeString(), layer: 'DOMAIN', message: 'Entidades prontas.' },
  ]);

  const [db, setDb] = useState<SqliteDatabase>(() => loadDb() ?? getDefaultSeed());
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Persistência automática
  useEffect(() => {
    saveDb(db);
  }, [db]);

  // ---------- UI State ----------
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isFormOpen, setIsFormOpen] = useState(false);

  // ---------- Helpers ----------
  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  const addLog = useCallback((layer: LogLayer, message: string) => {
    setLogs((prev) => [{ timestamp: new Date().toLocaleTimeString(), layer, message }, ...prev.slice(0, MAX_LOGS - 1)]);
  }, []);

  // ---------- Filtered + summary ----------
  const filteredTransactions: Transacao[] = useMemo(() => {
    return db.transacoes.filter((t) => {
      const d = new Date(t.data);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [db.transacoes, selectedMonth, selectedYear]);

  const summary: FinanceSummary = useMemo(() => {
    let income = 0; let expenses = 0; let investimento = 0; let creditCard = 0;
    const byCategory: Record<string, number> = {};
    for (const t of filteredTransactions) {
      const val = Math.abs(parseFloat(String(t.valor)));
      const cat = db.categorias.find((c) => c.id === t.categoria_id);
      if (!cat) continue;
      const catId = cat.id;
      if (!byCategory[catId]) byCategory[catId] = 0;
      byCategory[catId] += val;
      if (cat.type === 'income') { income += val; } else {
        expenses += val;
        if (cat.type === 'investment') investimento += val;
        if (t.forma_pagamento === 'cartao') creditCard += val;
      }
    }
    const netBalance = income - expenses;
    const savingsRate = income > 0 ? (investimento / income) * 100 : 0;
    return { income, expenses, investimento, creditCard, netBalance, savingsRate, byCategory };
  }, [filteredTransactions, db.categorias]);

  const chartData: ChartDatum[] = useMemo(() => {
    return db.categorias.filter((c) => c.type !== 'income').map((c) => ({
      name: c.name, value: summary.byCategory[c.id] || 0, fill: c.color,
    })).filter((d) => d.value > 0);
  }, [summary.byCategory, db.categorias]);

  // Recorrências Pendentes
  const pendingRecurring = useMemo(() => {
    const existingDescriptions = new Set(filteredTransactions.map(t => t.descricao.toLowerCase()));
    return db.recorrencias.filter(r => !existingDescriptions.has(r.descricao.toLowerCase()));
  }, [db.recorrencias, filteredTransactions]);

  // ---------- Ações ----------
  const handleAddTransaction = useCallback((input: NewTransactionInput) => {
    try {
      const { description, amount, category, paymentMethod, installments, date, newCategory } = input;
      if (newCategory) {
        setDb(prev => ({ ...prev, categorias: [...prev.categorias, newCategory] }));
        addLog('DOMAIN', `Nova categoria "${newCategory.name}" criada.`);
      }
      const cat = newCategory || db.categorias.find(c => c.id === category);
      const isIncome = cat?.type === 'income';
      const finalAmount = isIncome ? Math.abs(amount) : -Math.abs(amount);
      const newTxId = `t_${Date.now()}`;
      const syncStatus: Transacao['status_sincronismo'] = isOnline ? 'SINCRONIZADO' : 'PENDENTE';
      if (paymentMethod === 'cartao' && installments > 1) {
        const { parcelamento, parcelas } = generateInstallments({ descricao: description, valorTotal: finalAmount, qtdParcelas: installments, categoriaId: category, dataInicio: date, statusSincronismo: syncStatus, timestamp: Date.now(), idPrefix: newTxId });
        setDb((prev) => ({ ...prev, parcelamentos: [...prev.parcelamentos, parcelamento], transacoes: [...parcelas, ...prev.transacoes] }));
      } else {
        const tx: Transacao = { id: newTxId, id_remoto: generateUUID(), descricao: description, valor: finalAmount, categoria_id: category, data: date, forma_pagamento: paymentMethod as any, parcelamento_id: null, atualizado_em: Date.now(), status_sincronismo: syncStatus };
        setDb((prev) => ({ ...prev, transacoes: [tx, ...prev.transacoes] }));
      }
      showToast('Lançamento salvo!', 'success');
      setIsFormOpen(false);
    } catch (err) { showToast('Erro ao salvar.', 'error'); }
  }, [db.categorias, isOnline, showToast, addLog]);

  const handleDeleteTransaction = useCallback((id: string) => {
    if (window.confirm('Excluir transação?')) {
      setDb((prev) => ({ ...prev, transacoes: prev.transacoes.filter((t) => t.id !== id) }));
      showToast('Excluído.', 'success');
    }
  }, [showToast]);

  const handleSyncData = useCallback(() => {
    if (!isOnline) { showToast('Offline.', 'error'); return; }
    setTimeout(() => {
      setDb((prev) => ({
        ...prev,
        transacoes: prev.transacoes.map((t) => ({ ...t, status_sincronismo: 'SINCRONIZADO' })),
        parcelamentos: prev.parcelamentos.map((p) => ({ ...p, status_sincronismo: 'SINCRONIZADO' })),
      }));
      showToast('Sincronizado!', 'success');
    }, 800);
  }, [isOnline, showToast]);

  const handleExportCSV = useCallback(() => { exportTransactionsToCSV(db.transacoes); showToast('Exportado!', 'success'); }, [db.transacoes, showToast]);

  const handleToggleOnline = useCallback(() => {
    setIsOnline((prev) => !prev);
    addLog('INFRASTRUCTURE', `Rede: ${!isOnline ? 'ONLINE' : 'OFFLINE'}`);
  }, [isOnline, addLog]);

  // ---------- Recorrência Actions ----------
  const handleAddRecurring = (input: Omit<Recorrencia, 'id'>) => {
    const newRec: Recorrencia = { ...input, id: `rec_${Date.now()}` };
    setDb(prev => ({ ...prev, recorrencias: [...prev.recorrencias, newRec] }));
    showToast('Conta fixa salva!', 'success');
  };

  const handleDeleteRecurring = (id: string) => {
    if (window.confirm('Remover esta conta fixa?')) {
      setDb(prev => ({ ...prev, recorrencias: prev.recorrencias.filter(r => r.id !== id) }));
      showToast('Removida.', 'success');
    }
  };

  const handleApplyRecurring = () => {
    const newTxs: Transacao[] = pendingRecurring.map(r => {
      const date = new Date(selectedYear, selectedMonth, r.dia).toISOString().split('T')[0];
      const cat = db.categorias.find(c => c.id === r.categoria_id);
      const isIncome = cat?.type === 'income';
      const finalAmount = isIncome ? Math.abs(r.valor) : -Math.abs(r.valor);
      return {
        id: `t_rec_${r.id}_${Date.now()}`,
        id_remoto: generateUUID(),
        descricao: r.descricao,
        valor: finalAmount,
        categoria_id: r.categoria_id,
        data: date,
        forma_pagamento: r.forma_pagamento as any,
        parcelamento_id: null,
        atualizado_em: Date.now(),
        status_sincronismo: isOnline ? 'SINCRONIZADO' : 'PENDENTE' as any,
      };
    });
    setDb(prev => ({ ...prev, transacoes: [...newTxs, ...prev.transacoes] }));
    showToast(`${newTxs.length} contas fixas lançadas!`, 'success');
  };

  // ---------- Backup & Cloud ----------
  const handleDropboxBackup = async () => {
    const config = db.config?.backupConfig;
    if (!config?.dropboxToken) {
      showToast('Dropbox não conectado.', 'error');
      return;
    }
    if (!config.backupPassword) {
      showToast('Defina uma senha de backup.', 'error');
      return;
    }

    setIsCloudSyncing(true);
    addLog('INFRASTRUCTURE', 'Iniciando backup via API Direta...');

    try {
      const encrypted = encryptData(db, config.backupPassword);

      // MODO SEGURO: Usando fetch direto para ter controle total dos headers
      const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.dropboxToken}`,
          'Dropbox-API-Arg': JSON.stringify({
            path: '/financeguard_backup.enc',
            mode: 'overwrite',
            autorename: false,
            mute: true
          }),
          'Content-Type': 'application/octet-stream'
        },
        body: new TextEncoder().encode(encrypted)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Dropbox API Error (${response.status}): ${errorText}`);
      }

      const now = new Date().toLocaleString();
      setDb(prev => ({
        ...prev,
        config: { ...prev.config, backupConfig: { ...prev.config.backupConfig!, lastCloudBackup: now } }
      }));
      showToast('Backup enviado com sucesso!', 'success');
      addLog('INFRASTRUCTURE', `Cloud Backup concluído em ${now}`);
    } catch (err: any) {
      console.error('Dropbox API Error:', err);
      const errorMsg = err.message || 'Erro desconhecido no envio';
      addLog('INFRASTRUCTURE', `Falha no Backup: ${errorMsg}`);
      showToast('Erro no backup. Veja os Logs.', 'error');

      // Alerta especial para debugar o 400
      if (errorMsg.includes('400')) {
        alert(`Detalhe do Erro 400: ${errorMsg}`);
      }
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const handleDropboxRestore = async (inputPassword?: string) => {
    const config = db.config?.backupConfig;
    const password = inputPassword || config?.backupPassword;

    if (!config?.dropboxToken) {
      showToast('Dropbox não conectado.', 'error');
      return;
    }
    if (!password) {
      showToast('Senha necessária.', 'error');
      return;
    }

    setIsCloudSyncing(true);
    addLog('INFRASTRUCTURE', 'Baixando backup via API Direta...');

    try {
      // MODO SEGURO: Usando fetch direto para download
      const response = await fetch('https://content.dropboxapi.com/2/files/download', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.dropboxToken}`,
          'Dropbox-API-Arg': JSON.stringify({
            path: '/financeguard_backup.enc'
          })
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Dropbox API Error (${response.status}): ${errorText}`);
      }

      const ciphertext = await response.text();
      const decrypted = decryptData(ciphertext, password);

      if (decrypted) {
        setDb(decrypted);
        showToast('Dados restaurados com sucesso!', 'success');
        addLog('DOMAIN', 'Base de dados substituída via Cloud Restore.');
      } else {
        showToast('Senha de backup incorreta.', 'error');
        addLog('INFRASTRUCTURE', 'Falha na descriptografia: Senha inválida.');
        alert('Erro: Senha de backup incorreta ou arquivo corrompido.');
      }
    } catch (err: any) {
      console.error('Dropbox API Restore Error:', err);
      const errorMsg = err.message || 'Erro desconhecido ao baixar';
      addLog('INFRASTRUCTURE', `Falha no Restore: ${errorMsg}`);

      let userMsg = 'Erro ao baixar backup.';
      if (errorMsg.includes('404') || errorMsg.includes('path/not_found')) {
        userMsg = 'Erro: Nenhum backup encontrado na sua conta.';
      } else if (errorMsg.includes('401')) {
        userMsg = 'Erro: Conexão expirada. Refaça o login.';
      } else if (errorMsg.includes('insufficient_scope')) {
        userMsg = 'Erro: Falta permissão de leitura no Dropbox.';
      }

      showToast(userMsg, 'error');
      alert(`Detalhe do Erro no Restore: ${errorMsg}`);
    } finally {
      setIsCloudSyncing(false);
    }
  };

  // ---------- IA Core ----------
  const callAI = async (systemPrompt: string, userPrompt: string) => {
    const config = db.config?.aiConfig;
    if (!config || !config.apiKey) throw new Error('API Key ausente.');
    let response;
    if (config.provider === 'groq') {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], response_format: { type: 'json_object' } })
      });
    } else if (config.provider === 'deepseek') {
      response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }], response_format: { type: 'json_object' } })
      });
    } else {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }], generationConfig: { responseMimeType: 'application/json' } })
      });
    }
    const data = await response.json();
    const content = config.provider === 'gemini' ? data.candidates[0].content.parts[0].text : data.choices[0].message.content;
    return JSON.parse(content);
  };

  const handleGenerateInsights = async (force = false) => {
    const today = new Date().toISOString().split('T')[0];
    if (!force && db.config.lastAIAnalysis?.date === today) return;
    setIsAIAnalyzing(true);
    const categoriesInfo = db.categorias.map(c => `${c.name}: R$ ${summary.byCategory[c.id] || 0}`).join(', ');
    const systemPrompt = `Você é um consultor financeiro. Analise e dê 3 insights curtos (máx 12 palavras). JSON: { insights: ["dica1", "dica2", "dica3"] }`;
    const userPrompt = `Receita R$ ${summary.income}, Gastos R$ ${summary.expenses}, Meta ${db.config.savingsTargetPct}%. ${categoriesInfo}`;
    try {
      const data = await callAI(systemPrompt, userPrompt);
      setDb(prev => ({ ...prev, config: { ...prev.config, lastAIAnalysis: { date: today, insights: data.insights } } }));
    } catch (err) { console.error(err); } finally { setIsAIAnalyzing(false); }
  };

  const handleProcessAICommand = async (text: string) => {
    const categoriesPrompt = db.categorias.map(c => `ID: ${c.id}, Nome: ${c.name}, Tipo: ${c.type}`).join('\n');
    const aiManage = db.config.aiManageCategories;
    const systemPrompt = `Extraia dados em JSON: {descricao, amount, category, paymentMethod, installments, date, suggestedCategory?}. Categorias Atuais:\n${categoriesPrompt}\n${aiManage ? 'Se o gasto NÃO se encaixar, sugira em suggestedCategory: { name, icon, color, type }. O ícone DEVE ser um Emoji. category="NEW".' : 'Use apenas as existentes.'}`;
    return callAI(systemPrompt, text);
  };

  return {
    activeTab, setActiveTab, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear, isFormOpen, setIsFormOpen,
    isOnline, logs, db, filteredTransactions, summary, chartData, toast, isAIAnalyzing, isCloudSyncing,
    pendingRecurring,
    savingsTargetPct: db.config?.savingsTargetPct ?? 20,
    aiConfig: db.config?.aiConfig,
    aiInsights: db.config?.lastAIAnalysis?.insights || [],
    aiManageCategories: db.config?.aiManageCategories || false,
    backupConfig: db.config?.backupConfig,
    handleAddTransaction, handleDeleteTransaction, handleSyncData, handleExportCSV, handleToggleOnline,
    handleProcessAICommand, handleGenerateInsights, handleAddRecurring, handleDeleteRecurring, handleApplyRecurring,
    handleDropboxBackup, handleDropboxRestore,
    handleUpdateAIConfig: (provider: AIProvider, apiKey: string) => {
      setDb(prev => ({ ...prev, config: { ...prev.config, aiConfig: { provider, apiKey } } }));
      showToast('IA Configurada!', 'success');
    },
    handleUpdateBackupConfig: async (token?: string, password?: string, appKey?: string) => {
      let email = undefined;

      // Se um novo token foi fornecido, buscar o e-mail do usuário no Dropbox
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

      setDb(prev => ({
        ...prev,
        config: {
          ...prev.config,
          backupConfig: {
            ...(prev.config.backupConfig || {}),
            ...(token !== undefined ? { dropboxToken: token } : {}),
            ...(password !== undefined ? { backupPassword: password } : {}),
            ...(appKey !== undefined ? { dropboxAppKey: appKey } : {}),
            ...(email !== undefined ? { dropboxUserEmail: email } : {})
          }
        }
      }));
      showToast('Configurações salvas!', 'success');
    },
    handleResetDatabase: () => { setDb(getDefaultSeed()); showToast('Resetado.', 'success'); },
    handleUpdateSavingsTarget: (pct: number) => {
      setDb(prev => ({ ...prev, config: { ...prev.config, savingsTargetPct: pct } }));
      showToast('Meta salva!', 'success');
    },
    handleUpdateCategories: (categories: any) => {
      setDb(prev => ({ ...prev, categorias: categories }));
      showToast('Categorias salvas!', 'success');
    },
    handleUpdateAIManageCategories: (active: boolean) => {
      setDb(prev => ({ ...prev, config: { ...prev.config, aiManageCategories: active } }));
      showToast(active ? 'IA gerencia categorias!' : 'IA usa apenas existentes.', 'success');
    }
  };
};

export type UseFinanceAppReturn = ReturnType<typeof useFinanceApp>;
