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
    <div className="flex items-center gap-3">
      <button
        onClick={() => step(-1)}
        className="p-3 bg-white dark:bg-slate-800 rounded-2xl transition-all hover:bg-indigo-500 hover:text-white text-slate-400 border border-slate-100 dark:border-white/5 shadow-sm active:scale-95"
      >
        <ChevronLeft className="size-5" />
      </button>
      <div className="flex gap-2 text-sm md:text-lg font-black px-4">
        <span className="text-slate-800 dark:text-white uppercase tracking-tighter">{MONTHS[month]}</span>
        <span className="text-indigo-600 dark:text-indigo-400">{year}</span>
      </div>
      <button
        onClick={() => step(1)}
        className="p-3 bg-white dark:bg-slate-800 rounded-2xl transition-all hover:bg-indigo-500 hover:text-white text-slate-400 border border-slate-100 dark:border-white/5 shadow-sm active:scale-95"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
};
