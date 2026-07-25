import { TABS } from './tabs';
import type { TabId } from './tabs';

interface TabNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export const TabNav = ({ activeTab, onChange }: TabNavProps) => (
  <nav className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[1.8rem] border border-slate-200 dark:border-white/5 backdrop-blur-sm overflow-x-auto gap-1">
    {TABS.map((tab) => {
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-8 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap ${
            isActive
              ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {tab.label}
        </button>
      );
    })}
  </nav>
);
