# 🛡️ Finance v1.4.0

> **Soberania Financeira na Palma da sua Mão.**
> 
> Aplicativo de finanças pessoais focado em **Privacidade Absoluta**, construído sob os princípios da **Clean Architecture** e portado para Android via **Capacitor**.

[![Download APK](https://img.shields.io/badge/Download-APK%20Android-brightgreen?style=for-the-badge&logo=android)](https://github.com/feliperibeirospn/financeguard/releases)
[![Version](https://img.shields.io/badge/Version-1.4.0--Stable-blue?style=flat-square)](https://github.com/feliperibeirospn/financeguard)
[![Security](https://img.shields.io/badge/Encryption-AES--256-orange?style=flat-square)](https://github.com/feliperibeirospn/financeguard)

---

## 🌟 Diferenciais Estratégicos (v1.4.0)

O **Finance** redefine o gerenciamento financeiro moderno ao unir **Inteligência Artificial** de ponta com a segurança inabalável do **Offline-First**.

- 🔒 **Segurança Bancária**: Criptografia AES-256 local para backups em nuvem. Nem o Dropbox, nem nós temos acesso aos seus dados.
- 🤖 **IA Agnóstica**: Escolha seu cérebro. Suporte nativo para **Groq (Llama 3.3)**, **Google Gemini** e **DeepSeek**.
- 🏛️ **Clean Architecture**: Design de software desacoplado que garante manutenibilidade e escalabilidade profissional.
- 💎 **Visual de Próxima Geração**: Estética *Glassmorphism* com camadas de transparência, desfoque e animações fluidas.
- 📱 **Experiência Nativa**: Integração total com Android via Deep Links e navegação fluida.

---

## 🚀 Funcionalidades de Elite

### 1. ☁️ Backup Híbrido & Gestão de Sessão (Novo!)
Sincronize seus dados com o **Dropbox** de forma inteligente e segura.
- **Cifragem Local**: O banco de dados é criptografado com sua **Senha Mestra** antes do upload.
- **Identificação de Conta**: O app exibe qual conta está conectada através de e-mail mascarado (ex: `fe****@example.com`), preservando sua privacidade.
- **Login OAuth2 Automático**: Fluxo de autenticação moderno que detecta automaticamente o retorno do login e volta para o app sozinho.
- **Deep Link Integration**: Sincronismo perfeito entre o navegador do celular e o aplicativo nativo.

### 2. 🤖 Ecossistema de IA Nativa
- **Entrada Mágica**: Lançamentos via voz ou texto com processamento de linguagem natural (NLP).
- **Insights Financeiros**: Consultoria diária proativa baseada no seu comportamento de gastos.
- **Categorização Inteligente**: Criação automática de categorias com sugestão de Emojis representativos.

### 3. 📅 Automação de Contas Fixas (Recorrências)
- **Gestão de Recorrências**: Cadastre aluguel, assinaturas e contas mensais.
- **Detecção Inteligente**: O Dashboard avisa proativamente sobre lançamentos pendentes no mês atual.
- **Lançamento Express**: Gere todos os lançamentos recorrentes com um único toque.

---

## 📂 Arquitetura do Sistema (Clean Architecture)

```bash
src/
├── domain/         # 🧠 Entidades e Casos de Uso (Regras Puras)
├── infrastructure/ # 🔌 Adaptadores: SQLite simulation, Crypto (AES-256), Dropbox API
├── application/    # ⚙️ Orquestradores: Lógica de Aplicação
└── presentation/   # 🎨 UI/UX: React, Tailwind, Custom Hooks, Glassmorphism
```

---

## 🛠️ Stack Tecnológica

- **Core**: React 18 + TypeScript (Strict Mode)
- **Segurança**: Crypto-JS (AES-256)
- **Cloud Interface**: Dropbox Direct API (Fetch) + Capacitor Browser/App
- **IA Engines**: Groq Cloud, Google Generative AI, DeepSeek API
- **Nativo**: Capacitor Framework

---

## 📥 Guia de Instalação

### 📱 Ambiente Android
1. Certifique-se de ter o **JDK 17** e **Android Studio**.
2. Sincronize o ecossistema:
   ```bash
   npm install --legacy-peer-deps
   npm run prod:android
   ```
3. Compile o binário final (APK):
   ```bash
   cd android
   .\gradlew assembleDebug
   ```

---

## ⚖️ Compromisso com a Privacidade
Este projeto foi desenvolvido sob a filosofia de que **seus dados financeiros são sagrados**. Não existem servidores intermediários e sua chave de criptografia nunca sai do seu dispositivo.

---

## 📜 Histórico de Versões
- **v1.0.0**: Clean Architecture Migration.
- **v1.1.0**: AI & Voice Integration.
- **v1.2.0**: Recurring Transactions & Glassmorphism.
- **v1.3.0**: Cloud Backup & Security Fixes.
- **v1.4.0**: Dropbox Session Tracking, Deep Links & UI Polish.
