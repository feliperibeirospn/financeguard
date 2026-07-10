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
- 🤖 **Inteligência Artificial Nativa**: Suporte para Groq, Gemini e DeepSeek para lançamentos via voz ou texto.
- 🏛️ **Clean Architecture**: Código modularizado e fácil de manter, separando regras de negócio da interface.
- 💎 **Design Moderno (Glassmorphism)**: Interface ultra-moderna com efeitos de transparência, desfoque e gradientes profundos.
- ⚙️ **Customização Total**: Painel de Ajustes para criar suas próprias categorias, ícones e metas de poupança.
- 📄 **Exportação CSV**: Seus dados são seus. Exporte tudo a qualquer momento para Excel ou Google Sheets.

---

## 🚀 Funcionalidades Principais

- [x] **Entrada Mágica com IA**:
    - Suporte a **Groq (Llama 3)**, **Google Gemini** e **DeepSeek**.
    - Reconhecimento de Voz (Speech-to-Text) integrado.
    - NLP para extração automática de valor, categoria e data.
- [x] **Dashboard de Alta Fidelidade**: KPIs dinâmicos e gráficos que se adaptam às suas categorias.
- [x] **Gestão de Lançamentos**: Fluxo completo de receitas e despesas com validação de sinal automática.
- [x] **Motor de Parcelamento**: Inteligência para dividir compras no cartão automaticamente pelos meses futuros.
- [x] **Painel Administrativo**:
    - CRUD completo de Categorias com ícones e cores customizáveis.
    - Ajuste de Meta de Poupança com feedback visual de progresso.
    - Zona de Perigo para reset total do banco SQLite local.
- [x] **Navegação Adaptativa**: Menu hambúrguer moderno para Android e abas dinâmicas para Desktop.

---

## 📸 Screenshots

### Dashboard & Gráficos
<img width="1901" height="888" alt="Dashboard Moderno" src="https://github.com/user-attachments/assets/c3082edf-c62e-47a3-9fbf-5ddff9e12ec2" />

### Extrato Detalhado
<img width="1903" height="825" alt="Extrato de Transações" src="https://github.com/user-attachments/assets/9a2cadc8-ab64-4851-87dc-db6da1255045" />

### Painel Administrativo & IA
<img width="1900" height="839" alt="Configurações e IA" src="https://github.com/user-attachments/assets/f6dd4d83-8ebd-4575-ae13-91d5a8277631" />

---

## 🛠️ Tecnologias & Stack

- **Frontend**: React 18 + TypeScript (Strict Mode)
- **Estilização**: Tailwind CSS + Glassmorphism Effects
- **IA Integration**: Groq API, Gemini API, DeepSeek API
- **Mobile**: Capacitor (Native Bridge)
- **Charts**: Recharts (Responsive)
- **Icons**: Lucide React

---

## 📂 Estrutura de Pastas (Clean Architecture)

```bash
src/
├── domain/         # 🧠 Entidades e Casos de Uso (Regras puras)
├── infrastructure/ # 🔌 Persistência local (SQLite simulation) e Exportação
├── application/    # ⚙️ Orquestração de serviços
└── presentation/   # 🎨 UI React (Components, Hooks, Pages, Utils)
```

---

## 📥 Como Instalar e Rodar

### 📱 Android
1. Certifique-se de ter o **Android Studio** e o **JDK 17**.
2. Sincronize o projeto: `npm run prod:android`
3. Gere o APK: `cd android; .\gradlew assembleDebug`

---

## ⚖️ Licença e Soberania
Este projeto foi desenvolvido com foco em transparência técnica. Todo o estado é persistido em `localStorage` para garantir que o usuário tenha **Soberania Total de Dados**.

---

## 📜 Histórico de Evolução
O projeto evoluiu de um arquivo monolítico (`legacy/app_de_produ_o.legacy.tsx`) para uma estrutura profissional em Clean Architecture, demonstrando boas práticas de engenharia de software e refatoração.
