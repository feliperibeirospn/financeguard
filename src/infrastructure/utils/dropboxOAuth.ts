import { DropboxAuth } from 'dropbox';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

// Sua chave oficial registrada no Dropbox Console
const CLIENT_ID = 'npc2tq3cd3vhad6';

/**
 * Retorna a URL de redirecionamento.
 * No Mobile, usamos o esquema customizado que o Android entende.
 */
const getRedirectUri = () => {
  if (Capacitor.isNativePlatform()) {
     return 'com.felipecleones.financeguard://oauth';
  }
  return window.location.origin + '/';
};

/**
 * Inicia o fluxo OAuth2.
 * No Mobile, abre o navegador do sistema em vez de mudar a URL atual.
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
    // Abre o navegador de forma que ele possa voltar para o app
    await Browser.open({ url: finalUrl });
  } else {
    window.location.href = finalUrl;
  }
};

/**
 * Captura o token de uma string (URL ou Hash)
 */
export const extractToken = (rawString: string): string | null => {
  const hash = rawString.includes('#') ? rawString.split('#')[1] : rawString;
  const params = new URLSearchParams(hash);
  return params.get('access_token');
};

/**
 * Captura o token da URL atual (Modo Web)
 */
export const getDropboxTokenFromUrl = (): string | null => {
  return extractToken(window.location.hash.substring(1));
};
