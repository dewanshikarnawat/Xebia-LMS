'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils-lms';

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'items',
}) {
  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-brand-text-secondary">
        Showing <span className="font-medium text-slate-800">{start}–{end}</span> of{' '}
        <span className="font-medium text-slate-800">{total}</span> {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-xl border border-brand-border bg-white px-2 py-1.5 text-sm text-slate-800"
            aria-label="Items per page"
          >
            {[8, 10, 25, 50].map((n) => (
              <option key={n} value={n}>{n} / page</option>
            ))}
          </select>
        )}
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-text-secondary disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={cn(
              'flex h-9 min-w-[2.25rem] items-center justify-center rounded-xl text-sm font-semibold',
              p === page
                ? 'bg-brand-primary-dark text-white'
                : 'border border-brand-border bg-white text-brand-text-secondary hover:bg-brand-surface'
            )}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border bg-white text-brand-text-secondary disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

