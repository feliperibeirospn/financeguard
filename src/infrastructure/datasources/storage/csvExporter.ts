import type { Transacao } from '../../../domain/transactions/entities/Transacao';
import { INITIAL_CATEGORIES } from '../../../domain/categories/entities/categories';

/**
 * Mapeia categoria_id → nome legível. Reutilizado tanto pelo CSV quanto
 * pela tabela de extrato na UI (Passo 5).
 */
const getCategoryName = (categoriaId: string): string => {
  return INITIAL_CATEGORIES.find((c) => c.id === categoriaId)?.name ?? 'Outro';
};

/**
 * Escapa aspas duplas para um valor CSV (padrão RFC 4180).
 * Ex.:  "Notebook Dell 14"" → """Notebook Dell 14"""" (a string exportada
 * mantém as aspas duplas em torno do valor, e cada aspa interna dobra).
 */
const escapeCsv = (raw: string | number): string => {
  const s = String(raw);
  return `"${s.replace(/"/g, '""')}"`;
};

/**
 * Serializa a tabela `transacoes` em uma string CSV (RFC 4180-ish).
 * Não toca em DOM — recebe os dados, devolve o conteúdo.
 * Separar a serialização da ação de "clicar no link" facilita testes.
 */
export const buildTransactionsCsv = (transacoes: Transacao[]): string => {
  const header = 'ID,UUID,Descricao,Valor,Categoria,Data,Pagamento,Sincronismo';
  const rows = transacoes.map((t) =>
    [
      escapeCsv(t.id),
      escapeCsv(t.id_remoto),
      escapeCsv(t.descricao),
      // valor numérico sem aspas para que a planilha reconheça como número
      String(t.valor),
      escapeCsv(getCategoryName(t.categoria_id)),
      escapeCsv(t.data ?? ''),
      escapeCsv(t.forma_pagamento),
      escapeCsv(t.status_sincronismo),
    ].join(',')
  );
  return [header, ...rows].join('\n');
};

/**
 * Aciona o download do CSV no browser, criando um <a> temporário
 * com URI `data:text/csv;charset=utf-8,...` e clicando programaticamente.
 * Espelha o comportamento do `app_de_produ_o.tsx` original.
 *
 * Idempotente em SSR: se `document` não existir, não faz nada.
 */
export const exportTransactionsToCSV = (transacoes: Transacao[]): void => {
  if (typeof document === 'undefined') return;

  const csv = buildTransactionsCsv(transacoes);
  const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csv}`);

  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `meu_banco_financeiro_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
