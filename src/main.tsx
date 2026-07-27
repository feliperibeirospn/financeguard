import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './presentation/routes';
import { extractToken } from './infrastructure/utils/dropboxOAuth';
import './index.css';

// CORREÇÃO PARA O RETORNO DO DROPBOX:
const hash = window.location.hash;
if (hash.includes('access_token=')) {
  const token = extractToken(hash);
  if (token) {
    (window as any)._dbx_temp_token = token;

    // Recupera onde o usuário estava ou vai para admin por padrão se for retorno de token
    const returnPath = sessionStorage.getItem('dropbox_return_path') || '#/admin';
    sessionStorage.removeItem('dropbox_return_path');

    // Redireciona para o path correto sem o token na URL
    window.location.hash = returnPath;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
    },
  },
});

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Elemento #root não encontrado em index.html');
}

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
