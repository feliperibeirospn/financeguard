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

  /**
   * Determina em qual mês a transação deve ser contabilizada (Mês de Pagamento).
   * Resolve o bug de fuso horário e a lógica de virada de fatura.
   */
  const getBillingDateInfo = (dateStr: string, formaPagamento: string, cartaoId?: string | null) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    // Nota: month na string é 1-based (1=Janeiro), subtraímos 1 para o padrão JS (0-based)
    let billingMonth = month - 1;
    let billingYear = year;

    // Lógica especial apenas para Cartão de Crédito
    if (enableCreditCardStatement && formaPagamento === 'cartao') {
      const card = cartaoId ? cartoes.find(c => c.id === cartaoId) : cartoes[0];

      if (card) {
        // 1. Se comprou no dia do fechamento ou depois, vai para a fatura seguinte
        if (day >= card.diaFechamento) {
          billingMonth += 1;
        }

        // 2. Se o vencimento é no mês seguinte ao fechamento (ex: fecha 25, vence 05)
        // Adicionamos mais um mês para cair no mês de PAGAMENTO real
        if (card.diaVencimento < card.diaFechamento) {
          billingMonth += 1;
        }

        // Ajuste de virada de ano
        while (billingMonth > 11) {
          billingMonth -= 12;
          billingYear += 1;
        }
      }
    }

    return { month: billingMonth, year: billingYear };
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const billing = getBillingDateInfo(t.data, t.forma_pagamento, t.cartao_id);
      return billing.month === selectedMonth && billing.year === selectedYear;
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
