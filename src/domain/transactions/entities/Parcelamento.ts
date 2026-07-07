import type { StatusSincronismo } from './Transacao';

/**
 * Tabela `parcelamentos` do SQLite simulado — "Compra Mãe".
 * Uma entrada aqui representa a compra original no cartão de crédito
 * e gera N `Transacao` filhas (uma por parcela) via motor de parcelamento.
 */
export interface Parcelamento {
  /** ID local, ex.: "p_1700000000" */
  id: string;
  /** UUID remoto — chave de idempotência no Append-Only Log */
  id_remoto: string;
  descricao: string;
  /** Valor total da compra (sempre positivo — sinal fica nas filhas) */
  valor_total: number;
  qtd_parcelas: number;
  atualizado_em: number;
  status_sincronismo: StatusSincronismo;
}
