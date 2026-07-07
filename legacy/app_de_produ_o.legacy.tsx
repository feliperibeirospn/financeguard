import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlusCircle, 
  Trash2, 
  Wallet, 
  PieChart as PieChartIcon, 
  DollarSign,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  PiggyBank,
  Cloud,
  ChevronLeft,
  ChevronRight,
  Filter,
  CreditCard,
  Banknote,
  Repeat,
  X,
  Shield,
  ShieldCheck,
  Database,
  HardDrive,
  Wifi,
  WifiOff,
  RefreshCw,
  Layers,
  Download,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

// Semente de dados de categorias conforme a especificação técnica (Seed)
const INITIAL_CATEGORIES = [
  { id: 'cat_essencial', name: 'Essencial', color: '#3b82f6', icon: '🏠' },
  { id: 'cat_lazer', name: 'Estilo de Vida', color: '#f59e0b', icon: '🍿' },
  { id: 'cat_investimento', name: 'Investimento', color: '#10b981', icon: '📈' },
  { id: 'cat_receita', name: 'Receita / Salário', color: '#8b5cf6', icon: '💰' }
];

// Constantes globais em falta que causavam o erro de compilação
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const PAYMENT_METHODS = [
  { id: 'dinheiro', name: 'Dinheiro / Pix' },
  { id: 'cartao', name: 'Cartão de Crédito' }
];

// Função utilitária para gerar UUIDv4 simulado de alta colisão-zero
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function App() {
  // Configurações de Rede e Segurança (Soberania de Dados & Offline-First)
  const [isOnline, setIsOnline] = useState(true);
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [architectureLogs, setArchitectureLogs] = useState([
    { timestamp: new Date().toLocaleTimeString(), layer: 'INFRASTRUCTURE', message: 'SQLCipher inicializado com AES-256 via hardware seguro Keystore/Keychain.' },
    { timestamp: new Date().toLocaleTimeString(), layer: 'DOMAIN', message: 'Entidades puras carregadas e prontas para uso.' }
  ]);

  // Simulador de tabelas SQLite Internas (Aba de visualização técnica do DB)
  const [dbTables, setDbTables] = useState(() => {
    const saved = localStorage.getItem('sqlite_simulation_db');
    if (saved) return JSON.parse(saved);
    
    // Seed Inicial
    return {
      categorias: INITIAL_CATEGORIES,
      parcelamentos: [],
      transacoes: [
        {
          id: 't_seed_1',
          id_remoto: generateUUID(),
          descricao: 'Salário Mensal',
          valor: 5000.00,
          categoria_id: 'cat_receita',
          data: new Date().toISOString().split('T')[0],
          forma_pagamento: 'dinheiro',
          parcelamento_id: null,
          atualizado_em: Date.now(),
          status_sincronismo: 'SINCRONIZADO'
        },
        {
          id: 't_seed_2',
          id_remoto: generateUUID(),
          descricao: 'Aluguel de Março',
          valor: -1500.00,
          categoria_id: 'cat_essencial',
          data: new Date().toISOString().split('T')[0],
          forma_pagamento: 'dinheiro',
          parcelamento_id: null,
          atualizado_em: Date.now(),
          status_sincronismo: 'SINCRONIZADO'
        }
      ]
    };
  });

  // Estados de Interface Comum
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | transacoes | sqlite | architecture
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Estados do Formulário
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('cat_essencial');
  const [paymentMethod, setPaymentMethod] = useState('dinheiro');
  const [installments, setInstallments] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Salvar no "disco local" criptografado (simulação via localStorage)
  useEffect(() => {
    localStorage.setItem('sqlite_simulation_db', JSON.stringify(dbTables));
  }, [dbTables]);

  // Função para adicionar Logs da Clean Architecture
  const addLog = (layer, message) => {
    setArchitectureLogs(prev => [
      { timestamp: new Date().toLocaleTimeString(), layer, message },
      ...prev.slice(0, 49) // Limite de 50 logs para performance
    ]);
  };

  // LÓGICA DE NEGÓCIO (DOMAIN LAYER): Motor de Parcelamento
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!description || !amount) return;

    addLog('PRESENTATION (UI)', `Usuário submeteu formulário: "${description}"`);

    const parsedAmount = parseFloat(amount);
    const finalAmount = category === 'cat_receita' ? Math.abs(parsedAmount) : -Math.abs(parsedAmount);
    const newTxId = 't_' + Date.now();
    const syncStatus = isOnline ? 'SINCRONIZADO' : 'PENDENTE';
    const currentTimestamp = Date.now();

    addLog('DOMAIN', `Validando transação e executando motor de parcelamento. Parcelas: ${installments}`);

    let updatedParcelamentos = [...dbTables.parcelamentos];
    let newTransactions = [];

    if (paymentMethod === 'cartao' && installments > 1) {
      // É uma compra parcelada (Cria "Compra Mãe" e "Parcelas Filhas")
      const parcelamentoId = 'p_' + Date.now();
      const maeUuid = generateUUID();

      updatedParcelamentos.push({
        id: parcelamentoId,
        id_remoto: maeUuid,
        descricao: description,
        valor_total: Math.abs(parsedAmount),
        qtd_parcelas: installments,
        atualizado_em: currentTimestamp,
        status_sincronismo: syncStatus
      });

      addLog('DATA (REPOSITORIES)', `Criando Compra Mãe no repositório de parcelamentos. UUID: ${maeUuid}`);

      // Geração das parcelas filhas
      const valorParcela = finalAmount / installments;
      for (let i = 0; i < installments; i++) {
        const transacaoDate = new Date(date + 'T12:00:00');
        transacaoDate.setMonth(transacaoDate.getMonth() + i);

        newTransactions.push({
          id: `${newTxId}_p${i + 1}`,
          id_remoto: generateUUID(),
          descricao: `${description} (${i + 1}/${installments})`,
          valor: valorParcela,
          categoria_id: category,
          data: transacaoDate.toISOString().split('T')[0],
          forma_pagamento: 'cartao',
          parcelamento_id: parcelamentoId,
          atualizado_em: currentTimestamp,
          status_sincronismo: syncStatus
        });
      }
      addLog('DOMAIN', `Motor de parcelamento dividiu R$ ${Math.abs(parsedAmount)} em ${installments}x de R$ ${Math.abs(valorParcela).toFixed(2)}`);
    } else {
      // Transação comum à vista ou receita
      newTransactions.push({
        id: newTxId,
        id_remoto: generateUUID(),
        descricao: description,
        valor: finalAmount,
        categoria_id: category,
        data: date,
        forma_pagamento: paymentMethod,
        parcelamento_id: null,
        atualizado_em: currentTimestamp,
        status_sincronismo: syncStatus
      });
      addLog('DATA (REPOSITORIES)', 'Processando transação à vista.');
    }

    // INFRASTRUCTURE LAYER: Gravação segura (SQLCipher)
    addLog('INFRASTRUCTURE', `Gravando em lote na tabela transacoes com cifragem AES-256 ativa: ${isEncrypted}`);
    
    setDbTables(prev => ({
      ...prev,
      parcelamentos: updatedParcelamentos,
      transacoes: [...newTransactions, ...prev.transacoes]
    }));

    // Reset formulário
    setDescription('');
    setAmount('');
    setInstallments(1);
    setIsFormOpen(false);

    addLog('PRESENTATION (UI)', 'Interface atualizada e sincronizada com banco SQLite local.');
  };

  // Deletar transação local
  const handleDeleteTransaction = (id) => {
    addLog('PRESENTATION (UI)', `Solicitação para remover transação ${id}`);
    addLog('INFRASTRUCTURE', `Executando DELETE FROM transacoes WHERE id = '${id}'`);
    
    setDbTables(prev => ({
      ...prev,
      transacoes: prev.transacoes.filter(t => t.id !== id)
    }));

    addLog('DOMAIN', 'Saldos locais recalculados com sucesso.');
  };

  // Sincronizar dados pendentes (Simulação do background worker Append-Only Log)
  const handleSyncData = () => {
    if (!isOnline) {
      addLog('INFRASTRUCTURE', 'Erro de sincronismo: Dispositivo desconectado.');
      return;
    }

    addLog('DOMAIN', 'Iniciando varredura de registros com status_sincronismo = "PENDENTE"');

    const pendentesTransacoes = dbTables.transacoes.filter(t => t.status_sincronismo === 'PENDENTE');
    const pendentesParcelas = dbTables.parcelamentos.filter(p => p.status_sincronismo === 'PENDENTE');

    if (pendentesTransacoes.length === 0 && pendentesParcelas.length === 0) {
      addLog('DATA (REPOSITORIES)', 'Tudo limpo. Nenhum dado pendente de sincronização encontrado.');
      return;
    }

    addLog('INFRASTRUCTURE', `Compactando payload de sincronismo (${pendentesTransacoes.length + pendentesParcelas.length} itens) via HTTPS POST para o Append-Only Log...`);

    // Sincronizando e atualizando status
    setTimeout(() => {
      setDbTables(prev => {
        const updatedTxs = prev.transacoes.map(t => ({
          ...t,
          status_sincronismo: 'SINCRONIZADO'
        }));
        const updatedParts = prev.parcelamentos.map(p => ({
          ...p,
          status_sincronismo: 'SINCRONIZADO'
        }));

        return {
          ...prev,
          transacoes: updatedTxs,
          parcelamentos: updatedParts
        };
      });
      addLog('INFRASTRUCTURE', 'Sincronização concluída com sucesso. Resiliência de rede confirmada (Idempotência garantida via id_remoto UUID).');
    }, 800);
  };

  // Filtrar dados para o Mês e Ano Selecionados
  const filteredTransactions = useMemo(() => {
    return dbTables.transacoes.filter(t => {
      const tDate = new Date(t.date || t.data);
      return tDate.getMonth() === selectedMonth && tDate.getFullYear() === selectedYear;
    });
  }, [dbTables.transacoes, selectedMonth, selectedYear]);

  // Cálculos consolidados para exibição
  const summary = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let essencial = 0;
    let estiloVida = 0;
    let investimento = 0;
    let creditCard = 0;

    filteredTransactions.forEach(t => {
      const val = parseFloat(t.valor);
      if (t.categoria_id === 'cat_receita') {
        income += val;
      } else {
        const absVal = Math.abs(val);
        expenses += absVal;
        
        if (t.categoria_id === 'cat_essencial') essencial += absVal;
        if (t.categoria_id === 'cat_lazer') estiloVida += absVal;
        if (t.categoria_id === 'cat_investimento') investimento += absVal;
        
        if (t.forma_pagamento === 'cartao') {
          creditCard += absVal;
        }
      }
    });

    const netBalance = income - expenses;
    const savingsRate = income > 0 ? ((investimento / income) * 100).toFixed(1) : '0.0';

    return { income, expenses, essencial, estiloVida, investimento, creditCard, netBalance, savingsRate };
  }, [filteredTransactions]);

  // Estrutura de dados para gráficos
  const chartData = [
    { name: 'Essencial', value: summary.essencial, fill: '#3b82f6' },
    { name: 'Estilo de Vida', value: summary.estiloVida, fill: '#f59e0b' },
    { name: 'Investido', value: summary.investimento, fill: '#10b981' }
  ].filter(item => item.value > 0);

  // Exportar dados em formato CSV simulando a Soberania de Dados
  const handleExportCSV = () => {
    addLog('DOMAIN', 'Iniciando rotina de exportação de dados para portabilidade do usuário.');
    addLog('INFRASTRUCTURE', 'Lendo e descriptografando tabelas transacoes e parcelamentos...');

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,UUID,Descricao,Valor,Categoria,Data,Pagamento,Sincronismo\n";

    dbTables.transacoes.forEach(t => {
      const catName = INITIAL_CATEGORIES.find(c => c.id === t.categoria_id)?.name || 'Outro';
      csvContent += `"${t.id}","${t.id_remoto}","${t.descricao}",${t.valor},"${catName}","${t.data || t.date}","${t.forma_pagamento}","${t.status_sincronismo}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `meu_banco_financeiro_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addLog('INFRASTRUCTURE', 'Arquivo de exportação gerado com sucesso em formato padrão CSV.');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Barra de Status de Infraestrutura (Offline/Crypt indicators) */}
      <div className="bg-slate-950 text-xs px-4 py-2 flex flex-wrap items-center justify-between border-b border-slate-800 gap-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Database className="size-3.5 text-indigo-400" />
            <span className="font-semibold text-slate-400">Motor SQLite (Local)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`inline-block size-2 rounded-full ${isEncrypted ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-slate-400 font-mono">SQLCipher AES-256</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Toggle de Simulação de Rede */}
          <button 
            onClick={() => {
              setIsOnline(!isOnline);
              addLog('INFRASTRUCTURE', `Status de conexão de rede alterado para: ${!isOnline ? 'ONLINE' : 'OFFLINE'}`);
            }}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded-md hover:bg-slate-800 transition-colors"
            title="Clique para alternar o status da internet"
          >
            {isOnline ? (
              <>
                <Wifi className="size-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold uppercase text-[10px]">Rede Online</span>
              </>
            ) : (
              <>
                <WifiOff className="size-3.5 text-rose-400" />
                <span className="text-rose-400 font-bold uppercase text-[10px]">Modo Offline</span>
              </>
            )}
          </button>

          {/* Botão de Sync */}
          <button 
            onClick={handleSyncData}
            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] transition-colors"
          >
            <RefreshCw className="size-3" />
            Sincronizar
          </button>
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto p-4 md:p-8 flex-1 flex flex-col">
        {/* Cabeçalho */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
              <Wallet className="text-indigo-500 size-8" /> FinanceGuard Pro
            </h1>
            <p className="text-slate-400 text-xs md:text-sm">
              Offline-First | Arquitetura Limpa | Privacidade Absoluta
            </p>
          </div>

          {/* Navegação entre abas */}
          <nav className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 overflow-x-auto gap-1">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('transacoes')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'transacoes' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Extrato
            </button>
            <button 
              onClick={() => setActiveTab('sqlite')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'sqlite' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Inspetor SQLite
            </button>
            <button 
              onClick={() => setActiveTab('architecture')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'architecture' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Clean Arch Logs
            </button>
          </nav>
        </header>

        {/* Seleção de Mês/Ano */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-slate-950/50 p-3 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (selectedMonth === 0) {
                  setSelectedMonth(11);
                  setSelectedYear(v => v - 1);
                } else {
                  setSelectedMonth(v => v - 1);
                }
              }}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <ChevronLeft className="size-5" />
            </button>
            <div className="flex gap-1.5 text-sm md:text-base font-black px-2">
              <span className="text-white">{MONTHS[selectedMonth]}</span>
              <span className="text-indigo-400">{selectedYear}</span>
            </div>
            <button 
              onClick={() => {
                if (selectedMonth === 11) {
                  setSelectedMonth(0);
                  setSelectedYear(v => v + 1);
                } else {
                  setSelectedMonth(v => v + 1);
                }
              }}
              className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold uppercase transition-all"
            >
              <Download className="size-4" /> Exportar CSV
            </button>
            <button 
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase transition-all"
            >
              <PlusCircle className="size-4" /> Novo Lançamento
            </button>
          </div>
        </div>

        {/* Painel Central */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Formulário de Novo Lançamento (Surgimento Inteligente) */}
          {isFormOpen && (
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-2xl animate-in fade-in duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-white text-sm uppercase tracking-wider flex items-center gap-2">
                  <PlusCircle className="size-5 text-indigo-500" /> Registrar Movimentação Local
                </h3>
                <button onClick={() => setIsFormOpen(false)} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleAddTransaction} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Descrição (ex: Supermercado Assaí)"
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white text-sm"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Valor R$"
                        className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white text-sm"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                      <input
                        type="date"
                        className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white text-sm text-center"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <select 
                      className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-indigo-500 outline-none text-white text-sm"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {INITIAL_CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>

                    <div className="grid grid-cols-2 gap-2">
                      <select 
                        className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl focus:border-indigo-500 outline-none text-white text-sm"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        {PAYMENT_METHODS.map(pm => <option key={pm.id} value={pm.id}>{pm.name}</option>)}
                      </select>

                      {paymentMethod === 'cartao' ? (
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3">
                          <span className="text-[10px] font-black text-slate-500 uppercase">Dividido em</span>
                          <input 
                            type="number"
                            min="1"
                            max="60"
                            className="w-12 bg-transparent outline-none text-white font-bold text-center"
                            value={installments}
                            onChange={(e) => setInstallments(parseInt(e.target.value) || 1)}
                          />
                          <span className="text-[10px] font-black text-slate-500">x</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center bg-slate-900/40 border border-slate-800/40 text-[9px] font-bold text-slate-500 uppercase rounded-xl">
                          À Vista
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-xs uppercase"
                  >
                    Salvar no SQLite
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CONTEÚDO DA TAB DE ACORDO COM A ABA SELECIONADA */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Dashboard Resumos (KPIs) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card title="Receitas" value={formatCurrency(summary.income)} icon={<ArrowUpCircle className="text-emerald-500 size-4" />} color="text-white" />
                <Card title="Despesas" value={formatCurrency(summary.expenses)} icon={<ArrowDownCircle className="text-rose-500 size-4" />} color="text-white" />
                <Card title="Cartão de Crédito" value={formatCurrency(summary.creditCard)} icon={<CreditCard className="text-orange-500 size-4" />} color="text-orange-400" />
                <Card title="Balanço" value={formatCurrency(summary.netBalance)} icon={<DollarSign className="text-indigo-400 size-4" />} color={summary.netBalance >= 0 ? 'text-indigo-400' : 'text-rose-400'} />
              </div>

              {/* Gráficos e Alocações */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Composição de Gastos (BRL)</h3>
                  <div className="h-56">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                          <YAxis stroke="#64748b" fontSize={11} />
                          <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ backgroundColor: '#090d16', border: 'none', borderRadius: '8px' }} />
                          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">Sem dados financeiros no período.</div>
                    )}
                  </div>
                </div>

                {/* Meta de Poupança (Domain Rule) */}
                <div className="bg-indigo-950/40 p-6 rounded-2xl border border-indigo-900/50 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm uppercase flex items-center gap-2 mb-2">
                      <PiggyBank className="text-indigo-400" /> Meta de Economia
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Sua taxa de investimento atual é de <strong>{summary.savingsRate}%</strong> da sua receita total do mês.
                    </p>
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-indigo-300 uppercase">
                      <span>Meta de 20%</span>
                      <span>{Math.min(Math.round((parseFloat(summary.savingsRate) / 20) * 100), 100)}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-indigo-900/50">
                      <div 
                        style={{ width: `${Math.min((parseFloat(summary.savingsRate) / 20) * 100), 100}%` }} 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transacoes' && (
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase text-slate-400">Extrato Consolidado do Mês</h3>
                <span className="text-[10px] font-black bg-indigo-950 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded-full">
                  {filteredTransactions.length} Lançamentos
                </span>
              </div>

              {/* Tabela do Extrato */}
              <div className="overflow-x-auto">
                {filteredTransactions.length === 0 ? (
                  <div className="p-16 text-center text-slate-500 italic text-sm">
                    Nenhum registro para {MONTHS[selectedMonth]}.
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-slate-900/30 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800/60">
                      <tr>
                        <th className="px-6 py-3">Dia</th>
                        <th className="px-6 py-3">Detalhes</th>
                        <th className="px-6 py-3 text-right">Valor</th>
                        <th className="px-6 py-3 text-center">Sincronismo</th>
                        <th className="px-6 py-3 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-xs text-slate-300">
                      {filteredTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-900/30 transition-colors group">
                          <td className="px-6 py-4">
                            <span className="text-sm font-black text-slate-500 group-hover:text-indigo-400 transition-colors">
                              {new Date((t.date || t.data) + 'T12:00:00').getDate()}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{t.descricao}</span>
                              {t.forma_pagamento === 'cartao' ? (
                                <CreditCard className="size-3.5 text-orange-400" />
                              ) : (
                                <Banknote className="size-3.5 text-emerald-400" />
                              )}
                            </div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">
                              {INITIAL_CATEGORIES.find(c => c.id === t.categoria_id)?.name}
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-right font-black text-sm ${t.categoria_id === 'cat_receita' ? 'text-emerald-500' : 'text-slate-100'}`}>
                            {formatCurrency(t.valor)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              t.status_sincronismo === 'SINCRONIZADO' 
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50' 
                                : 'bg-amber-950/40 text-amber-400 border-amber-900/50'
                            }`}>
                              {t.status_sincronismo === 'SINCRONIZADO' ? (
                                <CheckCircle className="size-2.5" />
                              ) : (
                                <Clock className="size-2.5 animate-pulse" />
                              )}
                              {t.status_sincronismo}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button 
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="text-slate-500 hover:text-rose-500 p-1.5 rounded-lg hover:bg-slate-900 transition-all"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sqlite' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Database className="text-indigo-400" /> Inspetor Interno de Tabelas (Simulador SQLite)
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Toda a sua aplicação de finanças é alimentada por um banco de dados relacional offline embutido. Abaixo você pode auditar o conteúdo atual bruto das tabelas locais do SQLite em tempo real.
                </p>

                {/* Tabela transacoes SQLite */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-slate-900 px-4 py-2 rounded-xl">
                    <span className="text-xs font-mono font-bold text-slate-300">TABELA: transacoes</span>
                    <span className="text-[10px] text-slate-500 font-mono">COUNT: {dbTables.transacoes.length}</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl text-[11px]">
                    <table className="w-full text-left font-mono text-slate-400">
                      <thead className="bg-slate-950 sticky top-0 text-slate-500 border-b border-slate-800">
                        <tr>
                          <th className="p-3">id</th>
                          <th className="p-3">id_remoto (UUID)</th>
                          <th className="p-3">descricao</th>
                          <th className="p-3">valor</th>
                          <th className="p-3">status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {dbTables.transacoes.map(t => (
                          <tr key={t.id} className="hover:bg-slate-900/30">
                            <td className="p-3 text-white font-bold">{t.id}</td>
                            <td className="p-3 text-slate-500 truncate max-w-xs">{t.id_remoto}</td>
                            <td className="p-3">{t.descricao}</td>
                            <td className="p-3 text-indigo-400">{t.valor}</td>
                            <td className="p-3 text-xs">{t.status_sincronismo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Tabela parcelamentos SQLite */}
                <div className="space-y-4 mt-8">
                  <div className="flex justify-between items-center bg-slate-900 px-4 py-2 rounded-xl">
                    <span className="text-xs font-mono font-bold text-slate-300">TABELA: parcelamentos ("Compras Mãe")</span>
                    <span className="text-[10px] text-slate-500 font-mono">COUNT: {dbTables.parcelamentos.length}</span>
                  </div>
                  <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-xl text-[11px]">
                    {dbTables.parcelamentos.length === 0 ? (
                      <div className="p-6 text-center text-slate-600 italic">Nenhum parcelamento ativo registrado na tabela.</div>
                    ) : (
                      <table className="w-full text-left font-mono text-slate-400">
                        <thead className="bg-slate-950 sticky top-0 text-slate-500 border-b border-slate-800">
                          <tr>
                            <th className="p-3">id</th>
                            <th className="p-3">id_remoto</th>
                            <th className="p-3">descricao</th>
                            <th className="p-3">valor_total</th>
                            <th className="p-3">parcelas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {dbTables.parcelamentos.map(p => (
                            <tr key={p.id} className="hover:bg-slate-900/30">
                              <td className="p-3 text-white font-bold">{p.id}</td>
                              <td className="p-3 text-slate-500 truncate max-w-xs">{p.id_remoto}</td>
                              <td className="p-3">{p.descricao}</td>
                              <td className="p-3 text-indigo-400">{p.valor_total}</td>
                              <td className="p-3">{p.qtd_parcelas}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col h-[500px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Layers className="text-indigo-400" /> Fluxo de Camadas: Clean Architecture Logs
                </h3>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-indigo-950 border border-indigo-900 rounded text-indigo-400 animate-pulse">Monitor Ativo</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Cada ação executada no aplicativo atravessa as camadas de software isoladamente. Os logs abaixo registram as interações entre as camadas **Presentation**, **Domain**, **Data** e **Infrastructure**.
              </p>

              <div className="flex-1 bg-slate-900 rounded-xl p-4 overflow-y-auto font-mono text-xs text-slate-400 space-y-2.5 border border-slate-800/80">
                {architectureLogs.map((log, index) => (
                  <div key={index} className="flex gap-2.5 items-start leading-normal animate-in fade-in slide-in-from-top-1">
                    <span className="text-slate-500 font-bold select-none">[{log.timestamp}]</span>
                    <span className={`font-black uppercase tracking-tight text-[10px] px-1.5 py-0.5 rounded min-w-[120px] text-center ${
                      log.layer.includes('PRESENTATION') ? 'bg-blue-950 text-blue-400 border border-blue-900/50' :
                      log.layer.includes('DOMAIN') ? 'bg-purple-950 text-purple-400 border border-purple-900/50' :
                      log.layer.includes('DATA') ? 'bg-amber-950 text-amber-400 border border-amber-900/50' :
                      'bg-emerald-950 text-emerald-400 border border-emerald-900/50'
                    }`}>
                      {log.layer}
                    </span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-componente de Cartão de Dashboard genérico
const Card = ({ title, value, icon, color, subtitle }) => (
  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-indigo-900 transition-all duration-300 group">
    <div className="flex justify-between items-start mb-2">
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
      <div className="p-1.5 bg-slate-900 rounded-lg group-hover:bg-indigo-950 transition-colors">{icon}</div>
    </div>
    <div className={`text-lg font-black tracking-tight ${color}`}>{value}</div>
    {subtitle && <div className="text-[9px] text-slate-400 mt-1 font-bold uppercase truncate">{subtitle}</div>}
  </div>
);

// Formatação monetária brasileira
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};