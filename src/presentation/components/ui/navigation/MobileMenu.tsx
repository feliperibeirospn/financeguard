import { useState } from 'react';
import { Menu, X, Wallet, LayoutDashboard, ReceiptText, Settings2, Database, Terminal } from 'lucide-react';
import { TABS, type TabId } from '../tabs';

interface MobileMenuProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export const MobileMenu = ({ activeTab, onChange }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (id: TabId) => {
    switch (id) {
      case 'dashboard': return <LayoutDashboard className="size-5" />;
      case 'transacoes': return <ReceiptText className="size-5" />;
      case 'admin': return <Settings2 className="size-5" />;
      case 'sqlite': return <Database className="size-5" />;
      case 'architecture': return <Terminal className="size-5" />;
    }
  };

  const handleSelect = (id: TabId) => {
    onChange(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Botão Hambúrguer */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/20 active:scale-95 transition-all"
      >
        <Menu className="size-6" />
      </button>

      {/* Overlay e Gaveta (Drawer) */}
      <div
        className={`fixed inset-0 z-[100] transition-all duration-500 ${
          isOpen ? 'visible' : 'invisible'
        }`}
      >
        {/* Backdrop escuro */}
        <div
          className={`absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-500 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Menu Lateral */}
        <div
          className={`absolute top-0 right-0 h-full w-[80%] max-w-sm bg-slate-900 border-l border-white/10 p-8 shadow-2xl transition-transform duration-500 ease-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl">
                <Wallet className="text-white size-6" />
              </div>
              <span className="text-xl font-black gradient-text">Menu</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 bg-white/5 rounded-xl text-slate-400"
            >
              <X className="size-6" />
            </button>
          </div>

          <nav className="space-y-4">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleSelect(tab.id)}
                  className={`w-full flex items-center gap-4 p-5 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40'
                      : 'text-slate-400 hover:bg-white/5'
                  }`}
                >
                  {getIcon(tab.id)}
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-8 left-8 right-8">
            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status</p>
              <p className="text-xs text-indigo-400 font-bold">Versão 1.0.0 Stable</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
