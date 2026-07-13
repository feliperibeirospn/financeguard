# Implementação de Insights Financeiros com IA (Fase 2)

Adição de um assistente proativo que analisa os dados financeiros locais e fornece dicas estratégicas automáticas e sob demanda.

## User Review Required

- **Frequência Automática**: A análise automática ocorrerá uma vez por dia ao abrir o Dashboard (para economizar API).
- **Dados Enviados**: Apenas resumos numéricos por categoria são enviados para a IA (ex: "Lazer: R$ 500"), mantendo a privacidade das descrições das compras.

## Proposed Changes

### [Infraestrutura]

#### [sqliteStorage.ts](file:///C:/Users/Usuario/Documents/PROJETO_FINANCAS/src/infrastructure/datasources/storage/sqliteStorage.ts)
- Adicionar `lastAIAnalysis` e `lastAnalysisDate` ao objeto `config` para cache local.

### [Lógica Central]

#### [useFinanceApp.ts](file:///C:/Users/Usuario/Documents/PROJETO_FINANCAS/src/presentation/hooks/useFinanceApp.ts)
- Implementar `handleGenerateInsights`: Função que monta o cenário financeiro atual e solicita conselhos à IA.
- Adicionar lógica de auto-trigger para o Dashboard.

### [Interface]

#### [NEW] [AIInsights.tsx](file:///C:/Users/Usuario/Documents/PROJETO_FINANCAS/src/presentation/components/ui/feedback/AIInsights.tsx)
- Componente de exibição de cards de insight com visual glassmorphism.
- Botão de "Analisar Agora".

#### [Dashboard.tsx](file:///C:/Users/Usuario/Documents/PROJETO_FINANCAS/src/presentation/pages/dashboard/Dashboard.tsx)
- Integrar o componente `AIInsights` no topo da página.

## Verification Plan

### Manual Verification
- Verificar se a análise aparece automaticamente ao abrir o app.
- Testar o botão de análise manual.
- Confirmar se as dicas mudam conforme os gastos são adicionados.
