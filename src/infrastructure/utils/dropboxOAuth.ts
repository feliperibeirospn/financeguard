import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

const CLIENT_ID = 'npc2tq3cd3vhad6';
// No mobile usamos o scheme do app, na web usamos a URL do GitHub Pages
const REDIRECT_URI = Capacitor.isNativePlatform()
  ? 'db-npc2tq3cd3vhad6://2/token'
  : 'https://feliperibeirospn.github.io/financeguard/';

export const startDropboxAuth = async () => {
  // SALVAR ONDE O USUÁRIO ESTAVA ANTES DE SAIR (ex: #/admin)
  if (!Capacitor.isNativePlatform()) {
    sessionStorage.setItem('dropbox_return_path', window.location.hash);
  }

  const authUrl = `https://www.dropbox.com/oauth2/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&token_access_type=online`;

  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url: authUrl, windowName: '_blank' });
  } else {
    window.location.href = authUrl;
  }
};

export const extractToken = (url: string): string | null => {
  const matches = url.match(/access_token=([^&]*)/);
  return matches ? matches[1] : null;
};

export const getDropboxTokenFromUrl = (): string | null => {
  return extractToken(window.location.hash || window.location.search);
};
