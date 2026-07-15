# Gerenciamento Dinâmico de Categorias com IA (Fase 3)

Permitir que a IA crie e sugira novas categorias de gastos automaticamente durante o processo de entrada mágica, controlado por uma permissão no Admin.

## User Review Required

- **Autonomia da IA**: A IA poderá sugerir Nome, Ícone (Emoji), Cor e Tipo (Receita/Despesa) para novas categorias.
- **Controle do Usuário**: Mesmo com a opção ativa, o usuário sempre confirmará a criação da nova categoria antes dela ser salva definitivamente.

## Proposed Changes

### [Infraestrutura]

#### [sqliteStorage.ts](file:///C:/Users/Usuario/Documents/PROJETO_FINANCAS/src/infrastructure/datasources/storage/sqliteStorage.ts)
- Adicionar `aiManageCategories: boolean` ao objeto `config`.

### [Interface Admin]

#### [Admin.tsx](file:///C:/Users/Usuario/Documents/PROJETO_FINANCAS/src/presentation/pages/admin/Admin.tsx)
- Adicionar um Toggle (Switch) moderno na seção de Categorias para ativar/desativar o gerenciamento por IA.

### [Lógica Central]

#### [useFinanceApp.ts](file:///C:/Users/Usuario/Documents/PROJETO_FINANCAS/src/presentation/hooks/useFinanceApp.ts)
- Atualizar o `handleProcessAICommand` para instruir a IA que ela pode sugerir novas categorias se necessário.
- Modificar o retorno esperado da IA para incluir informações de categoria sugerida: `{ categorySuggestion: { name, icon, color, type } }`.

### [Formulário de Lançamento]

#### [NewTransactionForm.tsx](file:///C:/Users/Usuario/Documents/PROJETO_FINANCAS/src/presentation/components/transactions/NewTransactionForm.tsx)
- Adicionar lógica para detectar sugestões da IA.
- Exibir um alerta visual quando uma nova categoria for sugerida.
- Ao salvar o lançamento, persistir a nova categoria no banco se ela for aceita.

## Verification Plan

### Manual Verification
- Ativar a opção no Admin.
- Falar/Digitar algo que não tenha categoria (ex: "Remédio na farmácia 30 reais") se a categoria Saúde não existir.
- Verificar se a IA sugere "Saúde" ou "Farmácia" com um ícone apropriado.
- Confirmar se a nova categoria aparece permanentemente no Admin após o uso.
