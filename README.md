# 🛡️ FinanceGuard Pro v1.3.0

> **Soberania Financeira na Palma da sua Mão.**
> 
> Aplicativo de finanças pessoais focado em **Privacidade Absoluta**, construído sob os princípios da **Clean Architecture** e portado para Android via **Capacitor**.

[![Download APK](https://img.shields.io/badge/Download-APK%20Android-brightgreen?style=for-the-badge&logo=android)](https://github.com/feliperibeirospn/financeguard/releases)
[![Version](https://img.shields.io/badge/Version-1.3.0--Stable-blue?style=flat-square)](https://github.com/feliperibeirospn/financeguard)
[![Security](https://img.shields.io/badge/Encryption-AES--256-orange?style=flat-square)](https://github.com/feliperibeirospn/financeguard)

---

## 🌟 Diferenciais Estratégicos

O **FinanceGuard Pro** redefine o gerenciamento financeiro moderno ao unir **Inteligência Artificial** de ponta com a segurança inabalável do **Offline-First**.

- 🔒 **Segurança Bancária**: Criptografia AES-256 local para backups em nuvem. Nem o Dropbox, nem nós temos acesso aos seus dados.
- 🤖 **IA Agnóstica**: Escolha seu cérebro. Suporte nativo para **Groq (Llama 3.3)**, **Google Gemini** e **DeepSeek**.
- 🏛️ **Clean Architecture**: Design de software desacoplado que garante manutenibilidade e escalabilidade profissional.
- 💎 **Visual de Próxima Geração**: Estética *Glassmorphism* com camadas de transparência, desfoque e animações fluidas.
- 📱 **Multiplataforma**: Experiência otimizada para Desktop e Mobile (Android) via Capacitor.

---

## 🚀 Funcionalidades de Elite

### 1. ☁️ Backup Híbrido & Criptografado (Fase 5)
Sincronize seus dados com o **Dropbox** sem abrir mão da privacidade.
- **Cifragem Local**: O banco de dados é criptografado com sua **Senha Mestra** ANTES de sair do dispositivo.
- **Login OAuth2**: Fluxo de autenticação moderno e seguro (Login direto ou via API Key).
- **Recuperação Instantânea**: Restaure seu ecossistema financeiro em qualquer novo dispositivo.

### 2. 🤖 Ecossistema de IA Nativa
- **Entrada Mágica**: Lançamentos via voz ou texto com processamento de linguagem natural (NLP).
- **Insights Financeiros**: Consultoria diária proativa. A IA analisa seu comportamento de gastos e sugere otimizações reais.
- **Auto-Categorização**: A IA aprende com seus gastos e pode criar categorias dinâmicas com ícones (Emojis) personalizados.

### 3. 📅 Automação de Contas Fixas (Recorrências)
Diga adeus ao preenchimento manual repetitivo.
- **Gestão de Recorrências**: Cadastre aluguel, assinaturas (Netflix, Spotify) e contas mensais.
- **Detecção de Pendências**: Banner inteligente no Dashboard avisa quando há contas fixas a serem lançadas no mês.
- **Lançamento em Massa**: Gere todas as transações fixas do mês com apenas um clique.

### 4. 📊 Dashboard & Analytics
- **KPIs Dinâmicos**: Visão clara de Receitas, Despesas, Investimentos e Gastos no Cartão.
- **Gráficos Adaptativos**: Composição mensal visual com Recharts.
- **Motor de Parcelamento**: Divisão automática de compras parceladas com projeção de caixa futuro.

---

## 📂 Arquitetura do Sistema (Clean Architecture)

Seguimos o padrão de camadas para garantir que a regra de negócio seja independente de frameworks e UI:

```bash
src/
├── domain/         # 🧠 Coração do App: Entidades e Lógica Pura (Regras de Negócio)
├── infrastructure/ # 🔌 Adaptadores: SQLite simulation, Crypto (AES-256), Cloud API
├── application/    # ⚙️ Orquestradores: Serviços e lógica de aplicação
└── presentation/   # 🎨 UI/UX: React, Tailwind, Hooks Reais, Componentes Glassmorphism
```

---

## 🛠️ Stack Tecnológica

- **Core**: React 18 + TypeScript (Strict Mode)
- **Segurança**: Crypto-JS (AES-256)
- **Cloud**: Dropbox SDK + Direct Fetch Integration
- **IA**: Groq Cloud, Google Generative AI, DeepSeek API
- **Estilo**: Tailwind CSS + Animate.css
- **Nativo**: Capacitor Framework

---

## 📥 Guia de Instalação Profissional

### 📱 Ambiente Android
1. Certifique-se de ter o **JDK 17** e **Android Studio** configurados.
2. Sincronize o ecossistema web:
   ```bash
   npm install --legacy-peer-deps
   npm run prod:android
   ```
3. Compile e gere o binário (APK):
   ```bash
   cd android
   .\gradlew assembleDebug
   ```

---

## ⚖️ Compromisso com a Privacidade
Este projeto foi desenvolvido sob a filosofia de que **seus dados financeiros são sagrados**. Não existem servidores intermediários, não coletamos telemetria e sua chave de criptografia nunca sai da sua cabeça ou do seu dispositivo.

---

## 📜 Histórico de Versões
- **v1.0.0**: Migração para Clean Architecture.
- **v1.1.0**: Integração de IA e Voz.
- **v1.2.0**: Lançamentos Recorrentes e UI Glassmorphism.
- **v1.3.0**: Cloud Backup Criptografado (Dropbox) e melhorias de segurança.
