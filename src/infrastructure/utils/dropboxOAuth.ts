import { DropboxAuth } from 'dropbox';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

// Sua chave oficial registrada no Dropbox Console
const CLIENT_ID = 'npc2tq3cd3vhad6';

/**
 * Retorna a URL de redirecionamento exata.
 */
const getRedirectUri = () => {
  if (Capacitor.isNativePlatform()) {
     return `db-${CLIENT_ID}://2/token`;
  }

  // Se estiver no computador (Localhost)
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:5173/';
  }

  // Se estiver no link do GitHub (Produção)
  // Forçamos a URL exata que você salvou no Dropbox Console
  return 'https://feliperibeirospn.github.io/financeguard/';
};

/**
 * Inicia o fluxo OAuth2.
 */
export const startDropboxAuth = async () => {
  const dbxAuth = new DropboxAuth({ clientId: CLIENT_ID });
  const redirectUri = getRedirectUri();

  console.log('Iniciando login Dropbox com Redirect URI:', redirectUri);

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
    await Browser.open({ url: finalUrl });
  } else {
    window.location.href = finalUrl;
  }
};

/**
 * Extrai o token de forma segura
 */
export const extractToken = (rawString: string): string | null => {
  try {
    const hash = rawString.includes('#') ? rawString.split('#')[1] : rawString;
    const params = new URLSearchParams(hash);
    return params.get('access_token');
  } catch (e) {
    return null;
  }
};

/**
 * Captura o token da URL atual (Modo Web)
 */
export const getDropboxTokenFromUrl = (): string | null => {
  if (!window.location.hash) return null;
  return extractToken(window.location.href);
};
