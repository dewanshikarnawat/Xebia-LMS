'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils-lms';

export const ICON_OPTIONS = [
  '💻', '🤖', '📊', '☁️', '⚙️', '🔒', '📱', '🎨', '💼', '🧠', '🚀', '📚',
];

export default function IconPicker({ value, onChange, label = 'Icon' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="space-y-1.5" ref={ref}>
      {label && <label className="block text-sm font-medium text-brand-text-primary dark:text-slate-200">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm hover:border-accent-teal/40 focus:border-accent-teal focus:ring-2 focus:ring-accent-teal/20"
        >
          <span className="flex items-center gap-2">
            <span className="text-lg leading-none">{value || '💻'}</span>
            <span className="text-brand-text-secondary dark:text-slate-400">Choose an icon</span>
          </span>
          <ChevronDown className="h-4 w-4 text-brand-text-secondary dark:text-slate-400" />
        </button>
        {open && (
          <div className="absolute left-0 top-full z-20 mt-1.5 grid grid-cols-6 gap-1.5 rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 shadow-card">
            {ICON_OPTIONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => { onChange(icon); setOpen(false); }}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg text-lg hover:bg-brand-surface dark:hover:bg-slate-800',
                  value === icon && 'bg-accent-teal/10 ring-1 ring-accent-teal'
                )}
              >
                {icon}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

