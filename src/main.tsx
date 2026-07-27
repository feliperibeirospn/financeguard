import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './presentation/routes';
import { extractCode } from './infrastructure/utils/dropboxOAuth';
import './index.css';

// CORREÇÃO PARA O RETORNO DO DROPBOX (MODO PERMANENTE):
const search = window.location.search;
const hash = window.location.hash;

// O Dropbox pode retornar o 'code' na query string ou no hash dependendo do navegador
const code = extractCode(search) || extractCode(hash);

if (code) {
  (window as any)._dbx_temp_code = code;

  const returnPath = localStorage.getItem('dropbox_return_path') || '#/admin';
  localStorage.removeItem('dropbox_return_path');

  // Limpa a URL e mantém o usuário onde ele estava
  window.location.search = '';
  window.location.hash = returnPath;
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
