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
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-violet-500/20 rounded-lg">
            <Sparkles className="text-violet-400 size-4" />
          </div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assistente de IA</h3>
        </div>
        <button
          onClick={onRefresh}
          disabled={isAnalyzing}
          className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl transition-all active:scale-95 disabled:opacity-30"
        >
          {isAnalyzing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.length > 0 ? (
          insights.map((text, i) => (
            <div
              key={i}
              className="glass-card p-4 rounded-2xl border-l-4 border-l-violet-500/50 flex items-start gap-3 group hover:bg-white/[0.02] transition-colors"
            >
              <div className="mt-0.5 p-2 bg-violet-500/10 rounded-xl text-violet-400 group-hover:scale-110 transition-transform">
                {i === 0 ? <Zap className="size-3" /> : <TrendingUp className="size-3" />}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {text}
              </p>
            </div>
          ))
        ) : (
          <div className="md:col-span-3 glass-card p-8 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-3">
             <div className="p-4 bg-slate-800/50 rounded-[1.5rem]">
                <Sparkles className="text-slate-500 size-6" />
             </div>
             <div>
                <p className="text-sm font-bold text-white">Pronto para analisar seu mês?</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                  Clique no botão de atualizar para gerar insights personalizados.
                </p>
             </div>
          </div>
        )}
      </div>
    </section>
  );
};
