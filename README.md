# 🛡️ FinanceGuard Pro v1.2.0

> **Soberania Financeira na Palma da sua Mão.**
> 
> Aplicativo de finanças pessoais focado em **Privacidade Absoluta**, construído com **Clean Architecture** e portado para Android via **Capacitor**.

[![Download APK](https://img.shields.io/badge/Download-APK%20Android-brightgreen?style=for-the-badge&logo=android)](https://github.com/feliperibeirospn/financeguard/releases)
[![Version](https://img.shields.io/badge/Version-1.2.0--Stable-blue?style=flat-square)](https://github.com/feliperibeirospn/financeguard)

---

## 🌟 Diferenciais

O **FinanceGuard Pro** não é apenas mais um gerenciador financeiro. Ele foi projetado para usuários que valorizam o controle total sobre seus dados.

- 🔒 **Offline-First & Local Storage**: Seus dados nunca saem do seu dispositivo. Sem nuvem, sem rastreadores.
- 🏛️ **Clean Architecture**: Código modularizado e fácil de manter, separando regras de negócio da interface.
- 💎 **Design Glassmorphism**: Interface ultra-moderna com efeitos de transparência, desfoque e gradientes profundos.
- ⚙️ **Customização Total**: Painel de Ajustes para criar suas próprias categorias, ícones e metas de poupança.
- 📈 **Visualização Avançada**: Gráficos dinâmicos que se adaptam às suas categorias customizadas.
- 📄 **Exportação CSV**: Seus dados são seus. Exporte tudo a qualquer momento para Excel ou Google Sheets.

---

## 🚀 Funcionalidades Principais

- [x] **Dashboard Inteligente**: KPIs de Receitas, Despesas e Balanço em tempo real.
- [x] **Gestão de Lançamentos**: Cadastro de gastos e ganhos com suporte a parcelamento automático.
- [x] **Motor de Parcelamento**: Divide compras no cartão automaticamente pelos meses futuros.
- [x] **Painel Administrativo**:
    - Gerenciamento de Categorias (Crie "Lazer", "Pet", "Investimentos", etc).
    - Definição de Meta de Poupança mensal com barra de progresso.
- [x] **Navegação Adaptativa**: Menu hambúrguer moderno para Mobile e abas para Desktop.
- [x] **Logs de Arquitetura**: Veja em tempo real como as camadas (Domain, Infra, Presentation) se comunicam.

---

## 🛠️ Tecnologias & Stack

- **Frontend**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Mobile Bridge**: [Capacitor](https://capacitorjs.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Arquitetura**: Clean Architecture (Domain-Driven Design principles)

---

## 📂 Estrutura de Pastas

```bash
PROJETO_FINANCAS/
├── src/
│   ├── domain/         # 🧠 Entidades e Casos de Uso (Regras puras)
│   ├── infrastructure/ # 🔌 Persistência e Adaptadores Externos
│   ├── application/    # ⚙️ Orquestração (Reserved)
│   └── presentation/   # 🎨 UI React (Components, Hooks, Pages, Utils)
├── android/            # 🤖 Projeto Nativo Android
├── legacy/             # 📜 Arquivos históricos (Evolução do projeto)
└── dist/               # 📦 Bundle Web final
```

---

## 📥 Como Instalar e Rodar

### 💻 Web (Desenvolvimento)
```bash
# Instale as dependências
npm install

# Inicie o servidor local
npm run dev
```

### 📱 Android (Produção)
Para gerar o seu próprio APK:
1. Certifique-se de ter o **Android Studio** e o **JDK 17** instalados.
2. Execute o comando de sincronização:
   ```bash
   npm run prod:android
   ```
3. Gere o instalador via Gradle:
   ```bash
   cd android
   .\gradlew assembleDebug
   ```
O APK estará disponível em: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## ⚖️ Licença e Soberania
Este projeto foi desenvolvido com foco em transparência técnica. Todo o estado é persistido em `localStorage` (simulando um SQLite local) para garantir que o usuário tenha **Soberania de Dados**.

dashboard
<img width="1889" height="891" alt="image" src="https://github.com/user-attachments/assets/09095657-0e5e-4716-b44a-52bdaa9b95fb" />



---

## 📜 Histórico
O arquivo `legacy/app_de_produ_o.legacy.tsx` contém a versão monolítica inicial do projeto, mantida para demonstrar a evolução da refatoração para a arquitetura atual.
