'use client';

import { cn } from '@/utils-lms';

export default function PageHeader({ title, subtitle, action, className }) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div>
        <h1 className="text-2xl lg:text-[1.75rem] font-bold text-slate-900 dark:text-slate-50 tracking-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-brand-text-secondary dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

