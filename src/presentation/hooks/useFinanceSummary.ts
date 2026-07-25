import { useMemo } from 'react';
import { useTransactionStore } from '../../application/state/useTransactionStore';
import { useCategoryStore } from '../../application/state/useCategoryStore';
import { useUIStore } from '../../application/state/useUIStore';
import { useConfigStore } from '../../application/state/useConfigStore';
import type { FinanceSummary, ChartDatum } from './useFinanceApp';

export const useFinanceSummary = () => {
  const { transactions, cartoes } = useTransactionStore();
  const { categories } = useCategoryStore();
  const { selectedMonth, selectedYear } = useUIStore();
  const { enableCreditCardStatement } = useConfigStore();

  const getBillingMonth = (dateStr: string, formaPagamento: string, cartaoId?: string | null) => {
    if (!enableCreditCardStatement || formaPagamento !== 'cartao') return new Date(dateStr);
    const card = cartaoId ? cartoes.find(c => c.id === cartaoId) : cartoes[0];
    if (!card) return new Date(dateStr);
    const date = new Date(dateStr);
    const day = parseInt(dateStr.split('-')[2]);
    if (day >= card.diaFechamento) {
      return new Date(date.getFullYear(), date.getMonth() + 1, 1);
    }
    return date;
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const billingDate = getBillingMonth(t.data, t.forma_pagamento, t.cartao_id);
      return billingDate.getMonth() === selectedMonth && billingDate.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear, enableCreditCardStatement, cartoes]);

  const summary: FinanceSummary = useMemo(() => {
    let income = 0; let expenses = 0; let investimento = 0; let creditCard = 0;
    const byCategory: Record<string, number> = {};

    for (const t of filteredTransactions) {
      const val = Math.abs(parseFloat(String(t.valor)));
      const cat = categories.find((c) => c.id === t.categoria_id);
      if (!cat) continue;

      const catId = cat.id;
      if (!byCategory[catId]) byCategory[catId] = 0;
      byCategory[catId] += val;

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
  }, [filteredTransactions, categories]);

  const chartData: ChartDatum[] = useMemo(() => {
    return categories.filter((c) => c.type !== 'income').map((c) => ({
      name: c.name, value: summary.byCategory[c.id] || 0, fill: c.color,
    })).filter((d) => d.value > 0);
  }, [summary.byCategory, categories]);

  return { filteredTransactions, summary, chartData };
};
