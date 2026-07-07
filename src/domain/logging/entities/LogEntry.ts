/**
 * Camadas lógicas da Clean Architecture.
 * Cada ação no app atravessa uma (ou mais) dessas camadas,
 * e cada log registra em qual camada a ação ocorreu.
 */
export type LogLayer =
  | 'PRESENTATION (UI)'
  | 'DOMAIN'
  | 'DATA (REPOSITORIES)'
  | 'INFRASTRUCTURE';

/**
 * Entrada de log do monitor de arquitetura.
 * Cada interação entre camadas produz um LogEntry
 * para auditoria e depuração em tempo de execução.
 */
export interface LogEntry {
  /** Timestamp formatado em pt-BR (HH:mm:ss) — pronto para exibição */
  timestamp: string;
  layer: LogLayer;
  message: string;
}
