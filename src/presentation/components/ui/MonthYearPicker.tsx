import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MONTHS } from '../../../domain/shared/months';

interface MonthYearPickerProps {
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
}

export const MonthYearPicker = ({ month, year, onMonthChange }: MonthYearPickerProps) => {
  const step = (delta: number) => {
    let next = month + delta;
    let nextYear = year;
    if (next < 0) {
      next = 11;
      nextYear -= 1;
    } else if (next > 11) {
      next = 0;
      nextYear += 1;
    }
    onMonthChange(next, nextYear);
  };

  return (
    <div className="flex items-center gap-2 md:gap-4">
      <button
        onClick={() => step(-1)}
        className="p-2 md:p-3 bg-white dark:bg-[#161c33] rounded-xl md:rounded-2xl transition-all hover:bg-indigo-500 hover:text-white text-dim border border-slate-200 dark:border-white/5 shadow-sm active:scale-95"
      >
        <ChevronLeft className="size-4 md:size-5" />
      </button>
      <div className="flex flex-col md:flex-row items-center gap-0 md:gap-2 px-2 min-w-[100px] text-center">
        <span className="text-main text-sm md:text-xl font-black uppercase tracking-tighter leading-none">{MONTHS[month]}</span>
        <span className="text-indigo-600 dark:text-indigo-400 text-[10px] md:text-lg font-black leading-none">{year}</span>
      </div>
      <button
        onClick={() => step(1)}
        className="p-2 md:p-3 bg-white dark:bg-[#161c33] rounded-xl md:rounded-2xl transition-all hover:bg-indigo-500 hover:text-white text-dim border border-slate-200 dark:border-white/5 shadow-sm active:scale-95"
      >
        <ChevronRight className="size-4 md:size-5" />
      </button>
    </div>
  );
};
