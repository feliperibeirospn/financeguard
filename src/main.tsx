import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './presentation/routes';
import { extractToken } from './infrastructure/utils/dropboxOAuth';
import './index.css';

// CORREÇÃO PARA O 404 DO DROPBOX:
// Se o Dropbox redirecionar com o token no hash, capturamos e limpamos
// ANTES do RouterProvider tentar processar como uma rota inválida.
const hash = window.location.hash;
if (hash.includes('access_token=')) {
  const token = extractToken(hash);
  if (token) {
    (window as any)._dbx_temp_token = token;
    // Limpa o hash para que o router veja apenas a página inicial '/'
    window.location.hash = '/';
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
