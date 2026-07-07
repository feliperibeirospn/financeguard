/**
 * Barrel da camada "shared" do Domain.
 * Centraliza reexports de constantes e utilitários puros compartilhados
 * entre features do domínio (transactions, categories, logging, ...).
 */

export { MONTHS } from './months';
export { PAYMENT_METHODS } from './paymentMethods';
export { generateUUID } from './generateUUID';
