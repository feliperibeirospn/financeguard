import { create } from 'zustand';
import type { TabId } from '../../presentation/components/ui/tabs';

interface ToastState {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
}

interface UIState {
  activeTab: TabId;
  selectedMonth: number;
  selectedYear: number;
  isFormOpen: boolean;
  isOnline: boolean;
  toast: ToastState;
  isAIAnalyzing: boolean;
  isCloudSyncing: boolean;

  setActiveTab: (tab: TabId) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  setIsFormOpen: (open: boolean) => void;
  setIsOnline: (online: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  hideToast: () => void;
  setIsAIAnalyzing: (analyzing: boolean) => void;
  setIsCloudSyncing: (syncing: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'dashboard',
  selectedMonth: new Date().getMonth(),
  selectedYear: new Date().getFullYear(),
  isFormOpen: false,
  isOnline: true,
  toast: { message: '', type: 'success', visible: false },
  isAIAnalyzing: false,
  isCloudSyncing: false,

  setActiveTab: (activeTab) => set({ activeTab }),
  setSelectedMonth: (selectedMonth) => set({ selectedMonth }),
  setSelectedYear: (selectedYear) => set({ selectedYear }),
  setIsFormOpen: (isFormOpen) => set({ isFormOpen }),
  setIsOnline: (isOnline) => set({ isOnline }),
  showToast: (message, type = 'success') => {
    set({ toast: { message, type, visible: true } });
    setTimeout(() => set((state) => ({ toast: { ...state.toast, visible: false } })), 3000);
  },
  hideToast: () => set((state) => ({ toast: { ...state.toast, visible: false } })),
  setIsAIAnalyzing: (isAIAnalyzing) => set({ isAIAnalyzing }),
  setIsCloudSyncing: (isCloudSyncing) => set({ isCloudSyncing }),
}));
