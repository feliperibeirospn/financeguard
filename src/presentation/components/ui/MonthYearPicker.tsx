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
    <div className="flex items-center gap-2">
      <button
        onClick={() => step(-1)}
        className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="size-5" />
      </button>
      <div className="flex gap-1.5 text-sm md:text-base font-black px-2">
        <span className="text-white">{MONTHS[month]}</span>
        <span className="text-indigo-400">{year}</span>
      </div>
      <button
        onClick={() => step(1)}
        className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
        aria-label="Próximo mês"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
};
