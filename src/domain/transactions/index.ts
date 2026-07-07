/**
 * Barrel da feature `transactions` no Domain.
 * Reexporta entidades e use cases para consumo simplificado:
 *   import { Transacao, generateInstallments } from '@/domain/transactions';
 */

export type { Transacao, StatusSincronismo, FormaPagamento } from './entities/Transacao';
export type { Parcelamento } from './entities/Parcelamento';
export { generateInstallments } from './usecases/generateInstallments';
