import { Sparkles, TrendingUp, Zap, Loader2, RefreshCw } from 'lucide-react';

interface AIInsightsProps {
  insights: string[];
  isAnalyzing: boolean;
  onRefresh: () => void;
}

export const AIInsights = ({ insights, isAnalyzing, onRefresh }: AIInsightsProps) => {
  return (
    <section className="animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white size-4" />
          </div>
          <h3 className="text-[11px] font-black text-main uppercase tracking-[0.2em]">Assistente de Inteligência</h3>
        </div>
        <button
          onClick={onRefresh}
          disabled={isAnalyzing}
          className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-dim hover:text-main rounded-xl transition-all active:scale-95 disabled:opacity-30 border border-slate-200 dark:border-white/5"
        >
          {isAnalyzing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.length > 0 ? (
          insights.map((text, i) => (
            <div
              key={i}
              className="glass-card p-6 rounded-[2rem] border-l-4 border-l-indigo-500 flex items-start gap-4 hover:shadow-2xl transition-all"
            >
              <div className="mt-1 p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                {i === 0 ? <Zap className="size-4" /> : <TrendingUp className="size-4" />}
              </div>
              <p className="text-sm text-sub leading-relaxed font-bold">
                {text}
              </p>
            </div>
          ))
        ) : (
          <div className="md:col-span-3 glass-card p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
             <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem] border border-slate-100 dark:border-white/5">
                <Sparkles className="text-dim size-8" />
             </div>
             <div>
                <p className="text-base font-black text-main uppercase tracking-tighter">Análise Pendente</p>
                <p className="text-[10px] text-dim uppercase tracking-widest mt-1.5 font-bold">
                  Sincronize ou clique no ícone acima para gerar insights.
                </p>
             </div>
          </div>
        )}
      </div>
    </section>
  );
};
