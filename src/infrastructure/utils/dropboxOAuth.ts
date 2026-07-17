import { DropboxAuth } from 'dropbox';

// Sua chave oficial registrada no Dropbox Console
const CLIENT_ID = 'npc2tq3cd3vhad6';

/**
 * Retorna a URL de redirecionamento baseada no ambiente.
 */
const getRedirectUri = () => {
  if (window.location.origin.includes('localhost') && !window.location.port) {
     return 'http://localhost/';
  }
  return window.location.origin + '/';
};

/**
 * Inicia o fluxo OAuth2 transparente para o usuário leigo.
 * Corrigido: Para response_type 'token', o token_access_type deve ser 'online'.
 */
export const startDropboxAuth = async () => {
  const dbxAuth = new DropboxAuth({ clientId: CLIENT_ID });
  const redirectUri = getRedirectUri();

  const authUrl = await dbxAuth.getAuthenticationUrl(
    redirectUri,
    undefined,
    'token',
    'online', // Alterado de 'offline' para 'online' para corrigir o erro de pedido inválido
    undefined,
    'none',
    false
  );

  window.location.href = authUrl.toString();
};

/**
 * Captura o token da URL após o redirecionamento
 */
export const getDropboxTokenFromUrl = (): string | null => {
  const hash = window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash.substring(1));
  const token = params.get('access_token');

  if (token) {
    window.history.replaceState({}, document.title, window.location.pathname);
    return token;
  }

  return null;
};
