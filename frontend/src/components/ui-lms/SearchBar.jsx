'use client';

import { Search, X } from 'lucide-react';
import { cn } from '@/utils-lms';

export default function SearchBar({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary dark:text-slate-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-10 text-sm text-brand-text-primary dark:text-slate-100 placeholder:text-brand-text-secondary/60 hover:border-brand-primary/30 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-brand-text-secondary dark:text-slate-400 hover:text-brand-text-primary dark:hover:text-slate-150"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}


