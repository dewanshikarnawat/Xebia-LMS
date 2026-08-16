'use client';

import { cn } from '@/utils-lms';

export default function Toggle({ checked, onChange, label, description, disabled, size = 'md' }) {
  const dims = size === 'sm'
    ? { track: 'h-5 w-9', thumb: 'h-3.5 w-3.5', translate: 'translate-x-4' }
    : { track: 'h-6 w-11', thumb: 'h-4.5 w-4.5', translate: 'translate-x-5' };

  const control = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        'relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal/30',
        dims.track,
        checked ? 'bg-accent-teal' : 'bg-gray-200 dark:bg-slate-700',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'inline-block rounded-full bg-white shadow-sm transition-transform duration-200',
          dims.thumb,
          checked ? dims.translate : 'translate-x-0.5'
        )}
      />
    </button>
  );

  if (!label) return control;

  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
      <span>
        <span className="block text-sm font-medium text-brand-text-primary dark:text-slate-200">{label}</span>
        {description && <span className="block text-xs text-brand-text-secondary dark:text-slate-400">{description}</span>}
      </span>
      {control}
    </label>
  );
}

