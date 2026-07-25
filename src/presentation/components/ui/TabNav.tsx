import { TABS } from './tabs';
import type { TabId } from './tabs';

interface TabNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export const TabNav = ({ activeTab, onChange }: TabNavProps) => (
  <nav className="flex bg-white dark:bg-[#161c33] p-1.5 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-lg overflow-x-auto gap-1">
    {TABS.map((tab) => {
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap ${
            isActive
              ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/40 scale-105'
              : 'text-slate-400 dark:text-slate-500 hover:text-indigo-500 dark:hover:text-indigo-400'
          }`}
        >
          {tab.label}
        </button>
      );
    })}
  </nav>
);
