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
  // Detalhes por categoria dinâmica
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

/**
 * Hook raiz da aplicação. Concentra todo o estado de UI e a ponte
 * com o Domain (use cases) e a Infrastructure (storage, CSV).
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

  // Persistência automática sempre que o banco muda
  useEffect(() => {
    saveDb(db);
  }, [db]);

  // ---------- UI ----------
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isFormOpen, setIsFormOpen] = useState(false);

  // ---------- Helpers ----------
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
      const { description, amount, category, paymentMethod, installments, date } = input;

      addLog('PRESENTATION (UI)', `Usuário submeteu formulário: "${description}"`);

      const cat = db.categorias.find(c => c.id === category);
      const isIncome = cat?.type === 'income';
      const parsedAmount = amount;
      const finalAmount = isIncome ? Math.abs(parsedAmount) : -Math.abs(parsedAmount);
      const newTxId = `t_${Date.now()}`;
      const syncStatus: Transacao['status_sincronismo'] = isOnline ? 'SINCRONIZADO' : 'PENDENTE';
      const now = Date.now();

      addLog(
        'DOMAIN',
        `Validando transação e executando motor de parcelamento. Parcelas: ${installments}`,
      );

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

        addLog(
          'DATA (REPOSITORIES)',
          `Criando Compra Mãe no repositório de parcelamentos. UUID: ${parcelamento.id_remoto}`,
        );

        setDb((prev) => ({
          ...prev,
          parcelamentos: [...prev.parcelamentos, parcelamento],
          transacoes: [...parcelas, ...prev.transacoes],
        }));
      } else {
        addLog('DATA (REPOSITORIES)', 'Processando transação à vista.');
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

      addLog('PRESENTATION (UI)', 'Interface atualizada e sincronizada com banco SQLite local.');
      setIsFormOpen(false);
    },
    [addLog, isOnline, db.categorias],
  );

  const handleDeleteTransaction = useCallback(
    (id: string) => {
      addLog('PRESENTATION (UI)', `Solicitação para remover transação ${id}`);
      setDb((prev) => ({ ...prev, transacoes: prev.transacoes.filter((t) => t.id !== id) }));
      addLog('DOMAIN', 'Saldos locais recalculados com sucesso.');
    },
    [addLog],
  );

  const handleSyncData = useCallback(() => {
    if (!isOnline) {
      addLog('INFRASTRUCTURE', 'Erro de sincronismo: Dispositivo desconectado.');
      return;
    }
    addLog('DOMAIN', 'Iniciando varredura de registros com status_sincronismo = "PENDENTE"');

    setTimeout(() => {
      setDb((prev) => ({
        ...prev,
        transacoes: prev.transacoes.map((t) => ({ ...t, status_sincronismo: 'SINCRONIZADO' })),
        parcelamentos: prev.parcelamentos.map((p) => ({ ...p, status_sincronismo: 'SINCRONIZADO' })),
      }));
      addLog('INFRASTRUCTURE', 'Sincronização concluída com sucesso.');
    }, 800);
  }, [addLog, isOnline]);

  const handleExportCSV = useCallback(() => {
    addLog('DOMAIN', 'Iniciando rotina de exportação de dados.');
    exportTransactionsToCSV(db.transacoes);
    addLog('INFRASTRUCTURE', 'Arquivo de exportação gerado com sucesso.');
  }, [addLog, db.transacoes]);

  const handleToggleOnline = useCallback(() => {
    setIsOnline((prev) => {
      const next = !prev;
      addLog('INFRASTRUCTURE', `Status de conexão alterado para: ${next ? 'ONLINE' : 'OFFLINE'}`);
      return next;
    });
  }, [addLog]);

  // ---------- IA Logic ----------
  const handleProcessAICommand = async (text: string) => {
    const config = db.config?.aiConfig;
    if (!config || !config.apiKey) {
      addLog('PRESENTATION (UI)', 'Erro: Chave de API de IA não configurada.');
      throw new Error('Configure sua API Key nos Ajustes.');
    }

    addLog('DOMAIN', `Processando comando IA via ${config.provider.toUpperCase()}...`);

    const categoriesPrompt = db.categorias
      .map(c => `ID: ${c.id}, Nome: ${c.name}, Tipo: ${c.type}`)
      .join('\n');

    const systemPrompt = `Você é um extrator de dados financeiros.
O usuário possui estas categorias:
${categoriesPrompt}

Com base na frase do usuário, extraia:
1. descricao (String amigável)
2. amount (Number positivo)
3. category (O ID da categoria que melhor se encaixa)
4. paymentMethod ('dinheiro' ou 'cartao')
5. installments (Número de parcelas, default 1)
6. date (ISO date YYYY-MM-DD, hoje é ${new Date().toISOString().split('T')[0]})

Responda APENAS um objeto JSON puro.`;

    try {
      let response;
      if (config.provider === 'groq') {
        response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: text }
            ],
            response_format: { type: 'json_object' }
          })
        });
      } else if (config.provider === 'deepseek') {
        response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: text }
            ],
            response_format: { type: 'json_object' }
          })
        });
      } else {
        // Gemini
        response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemPrompt}\n\nUsuário disse: ${text}` }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });
      }

      const data = await response.json();
      let content;
      if (config.provider === 'gemini') {
        content = data.candidates[0].content.parts[0].text;
      } else {
        content = data.choices[0].message.content;
      }

      addLog('DOMAIN', 'IA interpretou o comando com sucesso.');
      return JSON.parse(content);
    } catch (err) {
      addLog('INFRASTRUCTURE', 'Falha na comunicação com o provedor de IA.');
      throw err;
    }
  };

  return {
    activeTab,
    setActiveTab,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    isFormOpen,
    setIsFormOpen,
    isOnline,
    isEncrypted,
    logs,
    db,
    filteredTransactions,
    summary,
    chartData,
    savingsTargetPct: db.config?.savingsTargetPct ?? 20,
    aiConfig: db.config?.aiConfig,
    handleAddTransaction,
    handleDeleteTransaction,
    handleSyncData,
    handleExportCSV,
    handleToggleOnline,
    handleProcessAICommand,
    handleUpdateAIConfig: (provider: AIProvider, apiKey: string) => {
      setDb(prev => ({
        ...prev,
        config: { ...prev.config, aiConfig: { provider, apiKey } }
      }));
      addLog('DOMAIN', `Configuração de IA atualizada: ${provider.toUpperCase()}`);
    },
    handleResetDatabase: () => {
      const seed = getDefaultSeed();
      setDb(seed);
      addLog('INFRASTRUCTURE', 'Banco de dados resetado.');
    },
    handleUpdateSavingsTarget: (pct: number) => {
      setDb(prev => ({ ...prev, config: { ...prev.config, savingsTargetPct: pct } }));
      addLog('DOMAIN', `Meta de poupança: ${pct}%`);
    },
    handleUpdateCategories: (categories: typeof db.categorias) => {
      setDb(prev => ({ ...prev, categorias: categories }));
      addLog('DOMAIN', 'Categorias atualizadas.');
    }
  };
};

export type UseFinanceAppReturn = ReturnType<typeof useFinanceApp>;
