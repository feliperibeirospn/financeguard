# FinanceGuard Pro

> **Offline-First** · **Clean Architecture** · **Privacidade Absoluta**

Aplicativo de finanças pessoais com persistência local simulando SQLCipher, motor de parcelamento puro, e telemetria de arquitetura em tempo real.

---

## 🏛️ Estrutura

O código segue **Clean Architecture estrita** com 4 camadas radiais + organização **feature-based** dentro de cada camada:

```
src/
├── domain/                      ← 🧠 Regras de negócio puras (zero dependências externas)
│   ├── shared/                  ← constantes e utilitários compartilhados
│   │   ├── months.ts
│   │   ├── paymentMethods.ts
│   │   └── generateUUID.ts
│   ├── categories/entities/
│   │   ├── categories.ts        ← INITIAL_CATEGORIES (seed)
│   │   └── Category.ts          ← interface Category
│   ├── transactions/
│   │   ├── entities/
│   │   │   ├── Transacao.ts
│   │   │   └── Parcelamento.ts
│   │   └── usecases/
│   │       └── generateInstallments.ts   ← motor de parcelamento
│   └── logging/entities/
│       └── LogEntry.ts
│
├── infrastructure/              ← 🔌 Adaptadores de mundo externo
│   └── datasources/storage/
│       ├── sqliteStorage.ts     ← loadDb / saveDb / getDefaultSeed
│       └── csvExporter.ts       ← exportTransactionsToCSV
│
└── presentation/                ← 🎨 UI React
    ├── App.tsx                  ← layout esqueleto
    ├── main.tsx                 ← entry point (ReactDOM.createRoot)
    ├── index.css                ← diretivas Tailwind + base
    ├── hooks/
    │   └── useFinanceApp.ts     ← estado + ações da app
    ├── components/
    │   ├── ui/                  ← Card, StatusBar, TabNav, MonthYearPicker
    │   ├── transactions/        ← NewTransactionForm
    │   └── logging/             ← LogEntryItem
    ├── pages/
    │   ├── dashboard/Dashboard.tsx
    │   ├── extrato/Extrato.tsx
    │   ├── inspector-sqlite/InspectorSQLite.tsx
    │   └── clean-arch-logs/CleanArchLogs.tsx
    └── utils/
        └── formatCurrency.ts    ← formatação BRL (i18n)
```

### 📐 Fluxo de dependências

```
Presentation ──▶ Application ──▶ Domain
       │                            ▲
       ▼                            │
   Infrastructure ──────────────────┘
```

- **Domain** não importa nada de fora dele mesmo.
- **Infrastructure** conhece o Domain (entidades) e abstrai I/O (localStorage, CSV).
- **Presentation** conhece Domain (entidades, use cases) e Infrastructure (storage, CSV).
- A `Application` layer existe como **espaço reservado** para futuros use cases compostos (ex.: `addTransactionUseCase` que orquestra validação + persistência + log).

---

## 🚀 Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Dev server
npm run dev          # http://localhost:5173

# 3. Build de produção
npm run build

# 4. Typecheck
npm run typecheck
```

---

## 🧪 Como o estado é organizado

- **`useFinanceApp`** (em `src/presentation/hooks/`) concentra **todo** o estado da app e a ponte com as outras camadas.
- Componentes e páginas são **stateless**: recebem props tipadas, emitem eventos.
- O `useEffect` que persiste o banco roda **uma única vez por mudança** dentro do hook — nenhuma página toca `localStorage` diretamente.

---

## 🔐 Soberania de Dados

- Tudo é persistido em `localStorage` sob a chave `sqlite_simulation_db` (em produção, isso seria substituído por SQLCipher via `op-sqlite` ou similar).
- Exportação CSV vive em `src/infrastructure/datasources/storage/csvExporter.ts` — pode ser auditada sem rodar a UI.
- Os logs de "Clean Architecture" são gerados em **4 camadas** e exibidos em tempo real, permitindo visualizar o fluxo Presentation → Domain → Data → Infrastructure.

---

## 📜 Histórico

- `app_de_produ_o.legacy.tsx` — arquivo monolítico original, **intocado**, mantido para referência histórica.

---

## 🛠️ Stack

- **React 18** + **TypeScript** (strict)
- **Vite** (build + dev server)
- **Tailwind CSS** (estilização)
- **Lucide React** (ícones)
- **Recharts** (gráficos)
