/**
 * Geração de UUIDv4 simulado (alta colisão-zero para o app local).
 * Função pura, sem dependência de React — pode ser usada em qualquer camada.
 */
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
