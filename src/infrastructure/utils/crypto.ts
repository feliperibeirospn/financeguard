import CryptoJS from 'crypto-js';

/**
 * Criptografa dados (JSON) usando AES-256 com uma senha mestra.
 */
export const encryptData = (data: any, password: string): string => {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, password).toString();
};

/**
 * Descriptografa dados (Ciphertext) para JSON original.
 * Retorna null se a senha estiver incorreta ou dados corrompidos.
 */
export const decryptData = (ciphertext: string, password: string): any | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, password);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedData) return null;
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Erro na descriptografia:', error);
    return null;
  }
};
