/**
 * Identificador de sincronização de uma transação.
 * - SINCRONIZADO: já replicado para o Append-Only Log remoto
 * - PENDENTE: aguardando próxima janela de sincronização
 */
export type StatusSincronismo = 'SINCRONIZADO' | 'PENDENTE';

/**
 * Forma de pagamento da transação.
 * Espelha os IDs de `src/domain/shared/paymentMethods.ts`.
 */
export type FormaPagamento = 'dinheiro' | 'cartao';

/**
 * Tabela `transacoes` do SQLite simulado.
 *
 * Pode existir de forma independente (transação à vista / receita) ou
 * vinculada a um parcelamento (parcela filha com `parcelamento_id` preenchido).
 */
export interface Transacao {
  /** ID local (gerado no cliente, ex.: "t_1700000000") */
  id: string;
  /** UUID remoto — chave de idempotência no Append-Only Log */
  id_remoto: string;
  /** Descrição legível da transação */
  descricao: string;
  /**
   * Valor com sinal:
   *  - positivo para receitas (categoria `cat_receita`)
   *  - negativo para despesas
   */
  valor: number;
  /** FK para `Category.id` */
  categoria_id: string;
  /** Data ISO yyyy-mm-dd */
  data: string;
  forma_pagamento: FormaPagamento;
  /**
   * FK para `Parcelamento.id` quando a transação é uma parcela filha.
   * `null` para transações à vista.
   */
  parcelamento_id: string | null;
  /** Timestamp ms desde epoch — controle de versionamento local */
  atualizado_em: number;
  status_sincronismo: StatusSincronismo;
}
