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
} from '../../infrastructure/datasources/storage';
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
  const [isEncrypted] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>(() => [
    {
      timestamp: new Date().toLocaleTimeString(),
      layer: 'INFRASTRUCTURE',
      message: 'SQLCipher inicializado com AES-256 via hardware seguro Keystore/Keychain.',
    },
    {
      timestamp: new Date().toLocaleTimeString(),
      layer: 'DOMAIN',
      message: 'Entidades puras carregadas e prontas para uso.',
    },
  ]);

  // ---------- Banco simulado ----------
  const [db, setDb] = useState<SqliteDatabase>(() => loadDb() ?? getDefaultSeed());
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'success', visible: false });

  // Persistência automática sempre que o banco muda
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
    setLogs((prev) => [
      { timestamp: new Date().toLocaleTimeString(), layer, message },
      ...prev.slice(0, MAX_LOGS - 1),
    ]);
  }, []);

  // ---------- Filtered + summary (memo) ----------
  const filteredTransactions: Transacao[] = useMemo(() => {
    return db.transacoes.filter((t) => {
      const d = new Date(t.data);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [db.transacoes, selectedMonth, selectedYear]);

  const summary: FinanceSummary = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let investimento = 0;
    let creditCard = 0;
    const byCategory: Record<string, number> = {};

    for (const t of filteredTransactions) {
      const val = Math.abs(parseFloat(String(t.valor)));
      const cat = db.categorias.find((c) => c.id === t.categoria_id);
      if (!cat) continue;
      if (!byCategory[t.categoria_id]) byCategory[t.categoria_id] = 0;
      byCategory[t.categoria_id] += val;

      if (cat.type === 'income') {
        income += val;
      } else {
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
    return db.categorias
      .filter((c) => c.type !== 'income')
      .map((c) => ({
        name: c.name,
        value: summary.byCategory[c.id] || 0,
        fill: c.color,
      }))
      .filter((d) => d.value > 0);
  }, [summary.byCategory, db.categorias]);

  // ---------- Ações ----------
  const handleAddTransaction = useCallback(
    (input: NewTransactionInput) => {
      try {
        const { description, amount, category, paymentMethod, installments, date } = input;
        const cat = db.categorias.find(c => c.id === category);
        const isIncome = cat?.type === 'income';
        const finalAmount = isIncome ? Math.abs(amount) : -Math.abs(amount);
        const newTxId = `t_${Date.now()}`;
        const syncStatus: Transacao['status_sincronismo'] = isOnline ? 'SINCRONIZADO' : 'PENDENTE';
        const now = Date.now();

        if (paymentMethod === 'cartao' && installments > 1) {
          const { parcelamento, parcelas } = generateInstallments({
            descricao: description,
            valorTotal: finalAmount,
            qtdParcelas: installments,
            categoriaId: category,
            dataInicio: date,
            statusSincronismo: syncStatus,
            timestamp: now,
            idPrefix: newTxId,
          });
          setDb((prev) => ({
            ...prev,
            parcelamentos: [...prev.parcelamentos, parcelamento],
            transacoes: [...parcelas, ...prev.transacoes],
          }));
        } else {
          const tx: Transacao = {
            id: newTxId,
            id_remoto: generateUUID(),
            descricao: description,
            valor: finalAmount,
            categoria_id: category,
            data: date,
            forma_pagamento: paymentMethod as Transacao['forma_pagamento'],
            parcelamento_id: null,
            atualizado_em: now,
            status_sincronismo: syncStatus,
          };
          setDb((prev) => ({ ...prev, transacoes: [tx, ...prev.transacoes] }));
        }
        addLog('PRESENTATION (UI)', `Lançamento salvo: ${description}`);
        showToast('Lançamento salvo com sucesso!', 'success');
        setIsFormOpen(false);
      } catch (err) {
        addLog('INFRASTRUCTURE', 'Erro ao salvar transação.');
        showToast('Erro ao salvar lançamento.', 'error');
      }
    },
    [db.categorias, isOnline, showToast, addLog]
  );

  const handleDeleteTransaction = useCallback(
    (id: string) => {
      if (window.confirm('Deseja realmente excluir esta transação?')) {
        addLog('INFRASTRUCTURE', `Deletando transação ID: ${id}`);
        setDb((prev) => ({ ...prev, transacoes: prev.transacoes.filter((t) => t.id !== id) }));
        showToast('Transação excluída.', 'success');
      }
    },
    [showToast, addLog]
  );

  const handleSyncData = useCallback(() => {
    if (!isOnline) {
      showToast('Offline: Sincronização pendente.', 'error');
      return;
    }
    setTimeout(() => {
      setDb((prev) => ({
        ...prev,
        transacoes: prev.transacoes.map((t) => ({ ...t, status_sincronismo: 'SINCRONIZADO' })),
        parcelamentos: prev.parcelamentos.map((p) => ({ ...p, status_sincronismo: 'SINCRONIZADO' })),
      }));
      showToast('Dados sincronizados!', 'success');
    }, 800);
  }, [isOnline, showToast]);

  const handleExportCSV = useCallback(() => {
    exportTransactionsToCSV(db.transacoes);
    showToast('CSV Exportado!', 'success');
  }, [db.transacoes, showToast]);

  const handleToggleOnline = useCallback(() => {
    setIsOnline((prev) => !prev);
  }, []);

  const handleProcessAICommand = async (text: string) => {
    const config = db.config?.aiConfig;
    if (!config || !config.apiKey) throw new Error('Configure sua API Key nos Ajustes.');
    const categoriesPrompt = db.categorias.map(c => `ID: ${c.id}, Nome: ${c.name}, Tipo: ${c.type}`).join('\n');
    const systemPrompt = `Você é um extrator de dados financeiros. Categorias:\n${categoriesPrompt}\nExtraia JSON: {descricao, amount, category, paymentMethod, installments, date}`;
    try {
      let response;
      if (config.provider === 'groq') {
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: text }], response_format: { type: 'json_object' } })
        });
      } else if (config.provider === 'deepseek') {
        response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: 'deepseek-chat', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: text }], response_format: { type: 'json_object' } })
        });
      } else {
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: `${systemPrompt}\n\nUsuário disse: ${text}` }] }], generationConfig: { responseMimeType: 'application/json' } })
        });
      }
      const data = await response.json();
      const content = config.provider === 'gemini' ? data.candidates[0].content.parts[0].text : data.choices[0].message.content;
      return JSON.parse(content);
    } catch (err) {
      showToast('Erro na IA. Verifique sua chave.', 'error');
      throw err;
    }
  };

  return {
    activeTab, setActiveTab, selectedMonth, selectedYear, setSelectedMonth, setSelectedYear, isFormOpen, setIsFormOpen,
    isOnline, isEncrypted, logs, db, filteredTransactions, summary, chartData, toast,
    savingsTargetPct: db.config?.savingsTargetPct ?? 20,
    aiConfig: db.config?.aiConfig,
    handleAddTransaction, handleDeleteTransaction, handleSyncData, handleExportCSV, handleToggleOnline, handleProcessAICommand,
    handleUpdateAIConfig: (provider: AIProvider, apiKey: string) => {
      setDb(prev => ({ ...prev, config: { ...prev.config, aiConfig: { provider, apiKey } } }));
      showToast('Configuração IA salva!', 'success');
    },
    handleResetDatabase: () => {
      setDb(getDefaultSeed());
      showToast('Banco resetado.', 'success');
    },
    handleUpdateSavingsTarget: (pct: number) => {
      setDb(prev => ({ ...prev, config: { ...prev.config, savingsTargetPct: pct } }));
      showToast('Meta atualizada!', 'success');
    },
    handleUpdateCategories: (categories: typeof db.categorias) => {
      setDb(prev => ({ ...prev, categorias: categories }));
      showToast('Categorias salvas!', 'success');
    }
  };
};

export type UseFinanceAppReturn = ReturnType<typeof useFinanceApp>;
