/**
 * Formas de pagamento suportadas pelo domínio.
 * Mantida como constante pura (sem React) para que use cases e UI consumam o mesmo seed.
 */

export const PAYMENT_METHODS = [
  { id: 'dinheiro', name: 'Dinheiro / Pix' },
  { id: 'cartao', name: 'Cartão de Crédito' }
];
