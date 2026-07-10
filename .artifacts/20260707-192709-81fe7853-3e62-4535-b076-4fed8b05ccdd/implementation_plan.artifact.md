# Implementação de Inteligência Artificial (Fase 1: Entrada Inteligente)

Adição de suporte a IA para processamento de linguagem natural (texto e áudio) para facilitar o lançamento de transações, mantendo a privacidade através do uso de chaves de API próprias do usuário.

## User Review Required

- **Provedores Suportados**: DeepSeek, Gemini e Groq.
- **Privacidade**: As chaves de API são armazenadas apenas localmente no dispositivo.
- **Fluxo**: A IA preenche o formulário e o usuário revisa antes de salvar.

## Proposed Changes

### [Infraestrutura]

#### [sqliteStorage.ts](file:///C:/Users/Usuario/Documents/PROJETO_FINANCAS/src/infrastructure/datasources/storage/sqliteStorage.ts)
- Atualizar a interface `SqliteDatabase` para incluir `aiConfig`.
- Atualizar `getDefaultSeed` com valores padrão para IA.

### [Interface Admin]

#### [Admin.tsx](file:///C:/Users/Usuario/Documents/PROJETO_FINANCAS/src/presentation/pages/admin/Admin.tsx)
- Adicionar seção "Configurações de IA".
- Campos para seleção de Provedor e input de API Key (tipo password).

### [Lógica Central]

#### [useFinanceApp.ts](file:///C:/Users/Usuario/Documents/PROJETO_FINANCAS/src/presentation/hooks/useFinanceApp.ts)
- Adicionar estados e handlers para `aiConfig`.
- Implementar `handleProcessAICommand`: Função que orquestra a chamada para o provedor selecionado e retorna os dados estruturados.

### [Formulário de Lançamento]

#### [NewTransactionForm.tsx](file:///C:/Users/Usuario/Documents/PROJETO_FINANCAS/src/presentation/components/transactions/NewTransactionForm.tsx)
- Adicionar campo "Entrada Rápida com IA" no topo do modal.
- Adicionar botão de microfone (usando Web Speech API).
- Lógica para preencher os campos do formulário com a resposta da IA.

## Verification Plan

### Automated Tests
- `npm run typecheck` para garantir que as novas interfaces estão corretas.

### Manual Verification
- Testar salvamento de chave no Admin.
- Testar comando de texto (ex: "50 reais no BK") e verificar se o formulário preenche Categoria e Valor.
- Testar comando de voz (clicar no microfone e falar).
