import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

const CLIENT_ID = 'npc2tq3cd3vhad6';
const REDIRECT_URI = Capacitor.isNativePlatform()
  ? 'db-npc2tq3cd3vhad6://2/token'
  : 'https://feliperibeirospn.github.io/financeguard/';

// Função para gerar uma string aleatória para segurança (PKCE)
const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

// Função para transformar a string em um desafio seguro (SHA-256)
const generateCodeChallenge = async (verifier: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const startDropboxAuth = async () => {
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  // Salvamos o verifier para completar a troca depois
  localStorage.setItem('dropbox_code_verifier', verifier);
  if (!Capacitor.isNativePlatform()) {
    localStorage.setItem('dropbox_return_path', window.location.hash);
  }

  // response_type=code + token_access_type=offline = LOGIN PERMANENTE
  const authUrl = `https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&code_challenge=${challenge}&code_challenge_method=S256&token_access_type=offline&force_reapprove=true`;

  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url: authUrl, windowName: '_blank' });
  } else {
    window.location.href = authUrl;
  }
};

export const exchangeCodeForToken = async (code: string) => {
  const verifier = localStorage.getItem('dropbox_code_verifier');
  if (!verifier) throw new Error('Segurança violada: Verifier ausente.');

  const params = new URLSearchParams();
  params.append('code', code);
  params.append('grant_type', 'authorization_code');
  params.append('client_id', CLIENT_ID);
  params.append('code_verifier', verifier);
  params.append('redirect_uri', REDIRECT_URI);

  const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  const data = await response.json();
  localStorage.removeItem('dropbox_code_verifier');

  if (data.error) throw new Error(data.error_description || 'Erro na troca de token');

  // Retorna access_token e o precioso refresh_token
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in
  };
};

export const refreshDropboxToken = async (refreshToken: string) => {
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refreshToken);
  params.append('client_id', CLIENT_ID);

  const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  const data = await response.json();
  if (data.error) throw new Error('Falha ao renovar acesso');

  return data.access_token;
};

export const extractCode = (url: string): string | null => {
  const matches = url.match(/code=([^&]*)/);
  return matches ? matches[1] : null;
};
