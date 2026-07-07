/**
 * Formatação monetária brasileira (BRL).
 * Mora em Presentation porque é uma decisão de *como exibir*,
 * não uma regra de domínio. O Domain devolve números puros.
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};
