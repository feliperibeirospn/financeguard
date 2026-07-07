import type { Transacao } from '../entities/Transacao';
import type { Parcelamento } from '../entities/Parcelamento';
import { generateUUID } from '../../shared/generateUUID';

/**
 * Entrada para o motor de parcelamento.
 * Mantida como tipo puro de domínio — sem dependência de React.
 */
export interface GenerateInstallmentsInput {
  /** Descrição original (ex.: "Notebook Dell") */
  descricao: string;
  /**
   * Valor absoluto da compra (sempre positivo).
   * O sinal (negativo para despesa, positivo para receita) é controlado
   * pelo chamador em `valorParcela`.
   */
  valorTotal: number;
  /** Quantidade de parcelas (1 = à vista) */
  qtdParcelas: number;
  /** Categoria aplicada a cada parcela */
  categoriaId: string;
  /** Data de início no formato ISO yyyy-mm-dd */
  dataInicio: string;
  /** Status inicial de sincronização (PENDENTE se offline) */
  statusSincronismo: Transacao['status_sincronismo'];
  /** Timestamp em ms — usado em `atualizado_em` */
  timestamp: number;
  /** Prefixo do ID local (ex.: "t_1700000000"); cada parcela recebe sufixo _pN */
  idPrefix: string;
}

/**
 * Resultado do motor de parcelamento.
 * Sempre contém a Compra Mãe + o array de parcelas filhas.
 * Mesmo em qtdParcelas = 1, gera um parcelamento com 1 parcela
 * para manter a invariante: "toda transação no cartão vem de um parcelamento".
 */
export interface GenerateInstallmentsResult {
  parcelamento: Parcelamento;
  parcelas: Transacao[];
}

/**
 * Constrói a data da parcela N somando N meses à data de início.
 * Usa o dia 12:00:00 para evitar problemas de fuso horário
 * (espelha o comportamento do `app_de_produ_o.tsx` original).
 */
const buildParcelaDate = (dataInicio: string, mesesAdiante: number): string => {
  const d = new Date(`${dataInicio}T12:00:00`);
  d.setMonth(d.getMonth() + mesesAdiante);
  return d.toISOString().split('T')[0];
};

/**
 * Motor de Parcelamento — regra de domínio pura.
 *
 * Responsabilidades:
 *  1. Criar a "Compra Mãe" (`Parcelamento`) com valor_total e qtd_parcelas.
 *  2. Calcular o valor de cada parcela (valorTotal / qtdParcelas).
 *  3. Gerar N transações filhas, uma por mês subsequente.
 *
 * NÃO toca em storage, UI, logs ou sincronização — quem chama orquestra
 * (Application layer). Esta função é determinística dado o `input` +
 * `generateUUID` (única fonte de não-determinismo, por design).
 */
export const generateInstallments = (
  input: GenerateInstallmentsInput
): GenerateInstallmentsResult => {
  const { descricao, valorTotal, qtdParcelas, categoriaId, dataInicio, statusSincronismo, timestamp, idPrefix } = input;

  // Compra Mãe
  const parcelamentoId = `p_${timestamp}`;
  const parcelamento: Parcelamento = {
    id: parcelamentoId,
    id_remoto: generateUUID(),
    descricao,
    valor_total: valorTotal,
    qtd_parcelas: qtdParcelas,
    atualizado_em: timestamp,
    status_sincronismo: statusSincronismo,
  };

  // Parcelas filhas — uma por mês subsequente
  const valorParcela = valorTotal / qtdParcelas;
  const parcelas: Transacao[] = Array.from({ length: qtdParcelas }, (_, i) => ({
    id: `${idPrefix}_p${i + 1}`,
    id_remoto: generateUUID(),
    descricao: `${descricao} (${i + 1}/${qtdParcelas})`,
    valor: valorParcela,
    categoria_id: categoriaId,
    data: buildParcelaDate(dataInicio, i),
    forma_pagamento: 'cartao' as const,
    parcelamento_id: parcelamentoId,
    atualizado_em: timestamp,
    status_sincronismo: statusSincronismo,
  }));

  return { parcelamento, parcelas };
};
