# Implementação de Lançamentos Recorrentes (Fase 4)

Adição de suporte para contas fixas que se repetem mensalmente, com sistema de lançamento automatizado e lembretes visuais.

## User Review Required

- **Automação**: O app sugerirá o lançamento das contas recorrentes ao detectar que o usuário mudou para um mês que ainda não possui esses registros.
- **Tipo de Recorrência**: Inicialmente focado em recorrência mensal simples (mesmo dia todo mês).

## Proposed Changes

### [Infraestrutura]

#### [sqliteStorage.ts](file:///C:/Users/Usuario/Documents/PROJETO_FINANCAS/src/infrastructure/datasources/storage/sqliteStorage.ts)
- Adicionar interface `Recorrencia` e a tabela `recorrencias` ao objeto `SqliteDatabase`.

### [Lógica Central]

#### [useFinanceApp.ts](file:///C:/Users/Usuario/Documents/PROJETO_FINANCAS/src/presentation/hooks/useFinanceApp.ts)
- Implementar CRUD para recorrências (`handleAddRecurring`, `handleDeleteRecurring`).
- Implementar `handleApplyRecurring`: Lógica que gera transações reais a partir dos modelos fixos para o mês selecionado.
- Adicionar verificação de "recorrências pendentes" para o mês atual.

### [Interface Admin]

#### [Admin.tsx](file:///C:/Users/Usuario/Documents/PROJETO_FINANCAS/src/presentation/pages/admin/Admin.tsx)
- Adicionar seção "Lançamentos Fixos" com listagem e formulário de cadastro.

### [Dashboard / Feedback]

#### [Dashboard.tsx](file:///C:/Users/Usuario/Documents/PROJETO_FINANCAS/src/presentation/pages/dashboard/Dashboard.tsx)
- Adicionar um Banner ou Modal de aviso caso existam contas recorrentes não lançadas no mês visualizado.

## Verification Plan

### Manual Verification
- Cadastrar uma conta fixa (ex: Internet, R$ 100, Dia 15).
- Mudar para o mês seguinte no seletor de data.
- Verificar se o app avisa sobre a conta pendente.
- Clicar em "Lançar" e conferir se o valor aparece no Extrato e Dashboard.
