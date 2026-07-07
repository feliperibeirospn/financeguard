import { INITIAL_CATEGORIES } from './categories';

/**
 * Categoria de transação — equivalente a uma linha da tabela `categorias`
 * do SQLite simulado.
 *
 * Mantida como tipo puro de domínio. O `INITIAL_CATEGORIES` exportado
 * a partir de `./categories` é a semente padrão consumida pela UI.
 */
export interface Category {
  id: string;
  name: string;
  /** Cor hex usada nos gráficos e chips */
  color: string;
  /** Emoji curto exibido como ícone (opcional) */
  icon: string;
}

export { INITIAL_CATEGORIES };
