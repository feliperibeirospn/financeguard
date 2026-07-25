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

  const categoriesPrompt = categories.map(c => `ID: ${c.id}, Nome: ${c.name}, Tipo: ${c.type}`).join('\n');

  const systemPrompt = `Extraia dados em JSON: {descricao, amount, category, paymentMethod, installments, date, suggestedCategory?}. Categorias Atuais:\n${categoriesPrompt}\n${aiManageCategories ? 'Se o gasto NÃO se encaixar, sugira em suggestedCategory: { name, icon, color, type }. O ícone DEVE ser um Emoji. category="NEW".' : 'Use apenas as existentes.'}`;

  return callAI(systemPrompt, text);
};

export const generateInsights = async (summary: any, force = false) => {
  const { savingsTargetPct, lastAIAnalysis, updateConfig } = useConfigStore.getState();
  const { setIsAIAnalyzing } = useUIStore.getState();

  const today = new Date().toISOString().split('T')[0];
  if (!force && lastAIAnalysis?.date === today) return;

  setIsAIAnalyzing(true);
  try {
    const systemPrompt = `Você é um consultor financeiro. Analise e dê 3 insights curtos (máx 12 palavras). JSON: { insights: ["dica1", "dica2", "dica3"] }`;
    const userPrompt = `Receita R$ ${summary.income}, Gastos R$ ${summary.expenses}, Meta ${savingsTargetPct}% de poupança.`;
    const data = await callAI(systemPrompt, userPrompt);
    await updateConfig({ lastAIAnalysis: { date: today, insights: data.insights } });
  } catch (err) {
    console.error(err);
  } finally {
    setIsAIAnalyzing(false);
  }
};
