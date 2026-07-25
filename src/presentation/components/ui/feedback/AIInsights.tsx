import { Sparkles, TrendingUp, Zap, Loader2, RefreshCw } from 'lucide-react';

interface AIInsightsProps {
  insights: string[];
  isAnalyzing: boolean;
  onRefresh: () => void;
}

export const AIInsights = ({ insights, isAnalyzing, onRefresh }: AIInsightsProps) => {
  return (
    <section className="animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500 dark:bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="text-white size-4" />
          </div>
          <h3 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Consultoria Inteligente</h3>
        </div>
        <button
          onClick={onRefresh}
          disabled={isAnalyzing}
          className="p-2.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 rounded-xl transition-all active:scale-95 disabled:opacity-30"
        >
          {isAnalyzing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {insights.length > 0 ? (
          insights.map((text, i) => (
            <div
              key={i}
              className="glass-card p-5 rounded-[2rem] border-l-4 border-l-indigo-500 flex items-start gap-4 hover:shadow-2xl transition-all"
            >
              <div className="mt-1 p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                {i === 0 ? <Zap className="size-3.5" /> : <TrendingUp className="size-3.5" />}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {text}
              </p>
            </div>
          ))
        ) : (
          <div className="md:col-span-3 glass-card p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
             <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-[1.8rem]">
                <Sparkles className="text-slate-300 dark:text-slate-600 size-8" />
             </div>
             <div>
                <p className="text-sm font-black text-slate-700 dark:text-white">Seu assistente está aguardando.</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1.5 font-bold">
                  Clique no ícone de atualização acima para analisar seus gastos.
                </p>
             </div>
          </div>
        )}
      </div>
    </section>
  );
};
