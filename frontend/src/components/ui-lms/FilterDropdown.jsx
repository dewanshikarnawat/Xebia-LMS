'use client';

import { SlidersHorizontal } from 'lucide-react';
import { cn } from '@/utils-lms';

export default function FilterDropdown({ label, value, options, onChange, className }) {
  return (
    <div className={cn('relative', className)}>
      <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary dark:text-slate-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="appearance-none rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-8 text-sm text-brand-text-primary dark:text-slate-100 hover:border-brand-primary/30 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="dark:bg-slate-900">{opt.label}</option>
        ))}
      </select>
    </div>
  );
}


