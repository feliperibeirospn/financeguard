import { TABS } from './tabs';
import type { TabId } from './tabs';

interface TabNavProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export const TabNav = ({ activeTab, onChange }: TabNavProps) => (
  <nav className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 overflow-x-auto gap-1">
    {TABS.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
          activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </nav>
);
