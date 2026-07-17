import { DropboxAuth } from 'dropbox';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

// Sua chave oficial registrada no Dropbox Console
const CLIENT_ID = 'npc2tq3cd3vhad6';

/**
 * Retorna a URL de redirecionamento.
 */
const getRedirectUri = () => {
  if (Capacitor.isNativePlatform()) {
     return `db-${CLIENT_ID}://2/token`;
  }
  return 'http://localhost:5173/';
};

/**
 * Inicia o fluxo OAuth2.
 */
export const startDropboxAuth = async () => {
  const dbxAuth = new DropboxAuth({ clientId: CLIENT_ID });
  const redirectUri = getRedirectUri();

  const authUrl = await dbxAuth.getAuthenticationUrl(
    redirectUri,
    undefined,
    'token',
    'online',
    undefined,
    'none',
    false
  );

  const finalUrl = authUrl.toString();

  if (Capacitor.isNativePlatform()) {
    // No Android, usamos o Browser nativo para abrir o login
    await Browser.open({ url: finalUrl });
  } else {
    window.location.href = finalUrl;
  }
};

/**
 * Extrai o token de forma segura, tratando variações de URI nativas
 */
export const extractToken = (rawString: string): string | null => {
  try {
    console.log('Tentando extrair token de:', rawString);
    const url = new URL(rawString.replace('#', '?'));
    // Tenta pegar do hash (fragment) ou da query string
    const token = new URLSearchParams(url.search).get('access_token');
    return token;
  } catch (e) {
    // Fallback para regex caso o formato da URL seja inválido para o construtor URL
    const match = rawString.match(/access_token=([^&]+)/);
    return match ? match[1] : null;
  }
};

/**
 * Captura o token da URL atual (Modo Web)
 */
export const getDropboxTokenFromUrl = (): string | null => {
  if (!window.location.hash) return null;
  return extractToken(window.location.href);
};
