import { useConfigStore } from '../state/useConfigStore';
import { useCategoryStore } from '../state/useCategoryStore';
import { useUIStore } from '../state/useUIStore';

export const callAI = async (systemPrompt: string, userPrompt: string) => {
  const { aiConfig } = useConfigStore.getState();
  if (!aiConfig || !aiConfig.apiKey) throw new Error('API Key ausente.');

  let response;
  if (aiConfig.provider === 'groq') {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${aiConfig.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        response_format: { type: 'json_object' }
      })
    });
  } else if (aiConfig.provider === 'deepseek') {
    response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${aiConfig.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        response_format: { type: 'json_object' }
      })
    });
  } else {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${aiConfig.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });
  }

  const data = await response.json();
  const content = aiConfig.provider === 'gemini' ? data.candidates[0].content.parts[0].text : data.choices[0].message.content;
  return JSON.parse(content);
};

export const processAICommand = async (text: string) => {
  const { categories } = useCategoryStore.getState();
  const { aiManageCategories } = useConfigStore.getState();

  // Data de referência para a IA saber o que é "hoje"
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const dayOfWeek = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(now);

  const categoriesPrompt = categories.map(c => `- ID: "${c.id}", Nome: "${c.name}", Tipo: "${c.type}"`).join('\n');

  const systemPrompt = `Você é um Analista Financeiro especializado em extrair dados de transações.
Seu objetivo é processar uma entrada de texto/voz em português e retornar um JSON puro.

DATA DE REFERÊNCIA (HOJE): ${todayStr} (${dayOfWeek}).

REGRAS DE EXTRAÇÃO:
1. "descricao": Nome limpo do gasto (ex: "Gás de Cozinha", "Ifood", "Salário").
2. "amount": Valor absoluto da transação como número (float).
3. "category": Deve ser o ID de uma das categorias abaixo. ANALISE o contexto do gasto para escolher a melhor.
4. "paymentMethod": "dinheiro" (para dinheiro, pix, débito) ou "cartao" (para crédito).
5. "installments": Número de parcelas (padrão 1).
6. "date": Data da transação em YYYY-MM-DD. OBRIGATÓRIO: Se o usuário não mencionar uma data específica, use SEMPRE "${todayStr}".

CATEGORIAS ATUAIS:
${categoriesPrompt}

LÓGICA DE CATEGORIZAÇÃO:
- Supermercado, Aluguel, Gás, Energia, Internet -> Essencial (ID: cat_essencial)
- Restaurantes, Cinema, Streaming, Viagens -> Estilo de Vida (ID: cat_lazer)
- Compra de Ações, Cripto, Poupança -> Investimento (ID: cat_investimento)
- Salário, Dividendos, Vendas -> Receita (ID: cat_receita)

${aiManageCategories ? 'Se o gasto NÃO se encaixar em NENHUMA das categorias acima, retorne "category": "NEW" e sugira uma nova em "suggestedCategory": { "name": string, "icon": string (Emoji), "type": "expense" | "income" }.' : 'Obrigatório usar apenas os IDs das categorias listadas.'}

RETORNE APENAS O JSON.`;

  return callAI(systemPrompt, `Texto do Usuário: "${text}"`);
};

export const generateInsights = async (summary: any, force = false) => {
  const { savingsTargetPct, lastAIAnalysis, updateConfig } = useConfigStore.getState();
  const { setIsAIAnalyzing } = useUIStore.getState();

  const today = new Date().toISOString().split('T')[0];
  if (!force && lastAIAnalysis?.date === today) return;

  setIsAIAnalyzing(true);
  try {
    const systemPrompt = `Você é um estrategista financeiro pessoal. Analise os números abaixo e dê 3 insights práticos e diretos (máx 12 palavras cada). Retorne JSON: { "insights": ["...", "...", "..."] }`;
    const userPrompt = `Receita R$ ${summary.income}, Gastos R$ ${summary.expenses}, Meta ${savingsTargetPct}% de poupança mensal.`;
    const data = await callAI(systemPrompt, userPrompt);
    await updateConfig({ lastAIAnalysis: { date: today, insights: data.insights } });
  } catch (err) {
    console.error(err);
  } finally {
    setIsAIAnalyzing(false);
  }
};
