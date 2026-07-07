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
} from '../../infrastructure/datasources/storage';
import type { TabId } from '../components/ui/tabs';

const MAX_LOGS = 50;
const SAVINGS_TARGET_PCT = 20;
const CATEGORY_RECEITA = 'cat_receita';
const CATEGORY_ESSENCIAL = 'cat_essencial';
const CATEGORY_LAZER = 'cat_lazer';
const CATEGORY_INVESTIMENTO = 'cat_investimento';
const PAYMENT_CARTAO = 'cartao';

export interface FinanceSummary {
  income: number;
  expenses: number;
  essencial: number;
  estiloVida: number;
  investimento: number;
  creditCard: number;
  netBalance: number;
  savingsRate: number;
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
 *
 * Retorna um objeto "facade" — a `App.tsx` consome sem precisar
 * conhecer useState, useEffect, ou a forma do banco.
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
    let essencial = 0;
    let estiloVida = 0;
    let investimento = 0;
    let creditCard = 0;

    for (const t of filteredTransactions) {
      const val = parseFloat(String(t.valor));
      if (t.categoria_id === CATEGORY_RECEITA) {
        income += val;
      } else {
        const abs = Math.abs(val);
        expenses += abs;
        if (t.categoria_id === CATEGORY_ESSENCIAL) essencial += abs;
        if (t.categoria_id === CATEGORY_LAZER) estiloVida += abs;
        if (t.categoria_id === CATEGORY_INVESTIMENTO) investimento += abs;
        if (t.forma_pagamento === PAYMENT_CARTAO) creditCard += abs;
      }
    }

    const netBalance = income - expenses;
    const savingsRate = income > 0 ? (investimento / income) * 100 : 0;

    return { income, expenses, essencial, estiloVida, investimento, creditCard, netBalance, savingsRate };
  }, [filteredTransactions]);

  const chartData: ChartDatum[] = useMemo(
    () =>
      [
        { name: 'Essencial', value: summary.essencial, fill: '#3b82f6' },
        { name: 'Estilo de Vida', value: summary.estiloVida, fill: '#f59e0b' },
        { name: 'Investido', value: summary.investimento, fill: '#10b981' },
      ].filter((d) => d.value > 0),
    [summary],
  );

  // ---------- Ações ----------
  const handleAddTransaction = useCallback(
    (input: NewTransactionInput) => {
      const { description, amount, category, paymentMethod, installments, date } = input;

      addLog('PRESENTATION (UI)', `Usuário submeteu formulário: "${description}"`);

      const parsedAmount = amount;
      const finalAmount =
        category === CATEGORY_RECEITA ? Math.abs(parsedAmount) : -Math.abs(parsedAmount);
      const newTxId = `t_${Date.now()}`;
      const syncStatus: Transacao['status_sincronismo'] = isOnline ? 'SINCRONIZADO' : 'PENDENTE';
      const now = Date.now();

      addLog(
        'DOMAIN',
        `Validando transação e executando motor de parcelamento. Parcelas: ${installments}`,
      );

      if (paymentMethod === PAYMENT_CARTAO && installments > 1) {
        // Delega ao use case puro do Domain
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
        addLog(
          'DOMAIN',
          `Motor de parcelamento dividiu R$ ${Math.abs(parsedAmount)} em ${installments}x de R$ ${(Math.abs(parsedAmount) / installments).toFixed(2)}`,
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

      addLog(
        'INFRASTRUCTURE',
        `Gravando em lote na tabela transacoes com cifragem AES-256 ativa: ${isEncrypted}`,
      );
      addLog('PRESENTATION (UI)', 'Interface atualizada e sincronizada com banco SQLite local.');
      setIsFormOpen(false);
    },
    [addLog, isEncrypted, isOnline],
  );

  const handleDeleteTransaction = useCallback(
    (id: string) => {
      addLog('PRESENTATION (UI)', `Solicitação para remover transação ${id}`);
      addLog('INFRASTRUCTURE', `Executando DELETE FROM transacoes WHERE id = '${id}'`);
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

    const pendentesT = db.transacoes.filter((t) => t.status_sincronismo === 'PENDENTE').length;
    const pendentesP = db.parcelamentos.filter((p) => p.status_sincronismo === 'PENDENTE').length;
    if (pendentesT === 0 && pendentesP === 0) {
      addLog('DATA (REPOSITORIES)', 'Tudo limpo. Nenhum dado pendente de sincronização encontrado.');
      return;
    }

    addLog(
      'INFRASTRUCTURE',
      `Compactando payload de sincronismo (${pendentesT + pendentesP} itens) via HTTPS POST para o Append-Only Log...`,
    );

    // Simula latência de rede — espelha o setTimeout(800) do original
    setTimeout(() => {
      setDb((prev) => ({
        ...prev,
        transacoes: prev.transacoes.map((t) => ({ ...t, status_sincronismo: 'SINCRONIZADO' })),
        parcelamentos: prev.parcelamentos.map((p) => ({ ...p, status_sincronismo: 'SINCRONIZADO' })),
      }));
      addLog(
        'INFRASTRUCTURE',
        'Sincronização concluída com sucesso. Resiliência de rede confirmada (Idempotência garantida via id_remoto UUID).',
      );
    }, 800);
  }, [addLog, db.parcelamentos, db.transacoes, isOnline]);

  const handleExportCSV = useCallback(() => {
    addLog('DOMAIN', 'Iniciando rotina de exportação de dados para portabilidade do usuário.');
    addLog('INFRASTRUCTURE', 'Lendo e descriptografando tabelas transacoes e parcelamentos...');
    exportTransactionsToCSV(db.transacoes);
    addLog('INFRASTRUCTURE', 'Arquivo de exportação gerado com sucesso em formato padrão CSV.');
  }, [addLog, db.transacoes]);

  const handleToggleOnline = useCallback(() => {
    setIsOnline((prev) => {
      const next = !prev;
      addLog('INFRASTRUCTURE', `Status de conexão de rede alterado para: ${next ? 'ONLINE' : 'OFFLINE'}`);
      return next;
    });
  }, [addLog]);

  return {
    // estado de UI
    activeTab,
    setActiveTab,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    isFormOpen,
    setIsFormOpen,
    // infra
    isOnline,
    isEncrypted,
    logs,
    // dados derivados
    db,
    filteredTransactions,
    summary,
    chartData,
    savingsTargetPct: SAVINGS_TARGET_PCT,
    // ações
    handleAddTransaction,
    handleDeleteTransaction,
    handleSyncData,
    handleExportCSV,
    handleToggleOnline,
  };
};

export type UseFinanceAppReturn = ReturnType<typeof useFinanceApp>;
