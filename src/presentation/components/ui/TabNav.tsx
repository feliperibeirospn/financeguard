import { TABS } from './tabs';
import type { TabId } from './tabs';

interface TabNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export const TabNav = ({ activeTab, onChange }: TabNavProps) => (
  <nav className="flex bg-slate-900/40 p-1 rounded-2xl border border-white/5 backdrop-blur-sm overflow-x-auto gap-1">
    {TABS.map((tab) => {
      const isActive = activeTab === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
            isActive
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
              : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          {tab.label}
        </button>
      );
    })}
  </nav>
);
