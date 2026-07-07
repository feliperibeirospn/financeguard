# FinanceGuard Pro

> **Offline-First** · **Clean Architecture** · **Privacidade Absoluta**

Aplicativo de finanças pessoais com persistência local simulando SQLCipher, motor de parcelamento puro, e telemetria de arquitetura em tempo real. Desenvolvido com React + Vite e portado para Android via Capacitor.

---

## 🏛️ Estrutura do Projeto

O código segue **Clean Architecture estrita** com 4 camadas radiais + organização **feature-based**:

```
src/
├── domain/                      ← 🧠 Regras de negócio puras (Entity, UseCases)
├── infrastructure/              ← 🔌 Adaptadores (Storage, Exportação CSV)
└── presentation/                ← 🎨 UI React (Hooks, Components, Pages)

android/                         ← 🤖 Projeto Nativo Android (Capacitor)
```

---

## 🚀 Como rodar (Web)

```bash
# 1. Instalar dependências
npm install

# 2. Rodar em modo desenvolvimento
npm run dev

# 3. Gerar build de produção (Web)
npm run build
```

---

## 📱 Mobile (Android)

Este projeto utiliza **Capacitor** para rodar como um app nativo.

### Pré-requisitos
*   **Android Studio** instalado.
*   **JDK 17** (Obrigatório). O projeto está configurado para usar o JDK embutido do Android Studio em `C:\Program Files\Android\Android Studio\jbr`.

### Sincronizar e Abrir
Para enviar as alterações do código Web para o Android:
```bash
npm run prod:android
npx cap open android
```

### Gerar o APK
Para gerar o arquivo de instalação (`.apk`) via terminal:
```bash
cd android
.\gradlew assembleDebug
```
O arquivo será gerado em:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔐 Soberania de Dados e Tecnologia

*   **React 18 + TypeScript**: Interface robusta e tipada.
*   **Tailwind CSS**: Design responsivo e moderno.
*   **Persistence**: Simulação de banco de dados via `localStorage` (Offline-first).
*   **Logs Clean Arch**: Visualização em tempo real das camadas de arquitetura sendo acessadas.
*   **Exportação**: Suporte nativo para exportação de dados em CSV.

---

## 🛠️ Stack Principal
React, Vite, Tailwind CSS, Lucide React, Recharts, Capacitor.

---

## 📜 Histórico
- `app_de_produ_o.legacy.tsx` — arquivo monolítico original mantido para referência histórica de evolução da arquitetura.
