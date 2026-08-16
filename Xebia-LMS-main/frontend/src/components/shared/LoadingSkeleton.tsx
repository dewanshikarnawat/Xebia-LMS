import React from 'react';

export const LoadingSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton rounded-xl ${className}`} />
);

export const StatCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl p-5">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <LoadingSkeleton className="h-3 w-24 mb-2" />
        <LoadingSkeleton className="h-8 w-16" />
      </div>
      <LoadingSkeleton className="h-12 w-12 rounded-xl" />
    </div>
  </div>
);

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 6 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <LoadingSkeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

export const AssignmentCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl p-5 space-y-3">
    <div className="flex items-start justify-between">
      <LoadingSkeleton className="h-5 w-40" />
      <LoadingSkeleton className="h-5 w-20 rounded-full" />
    </div>
    <LoadingSkeleton className="h-3 w-24" />
    <LoadingSkeleton className="h-4 w-full" />
    <LoadingSkeleton className="h-4 w-3/4" />
    <div className="flex gap-2 pt-2">
      <LoadingSkeleton className="h-8 w-28 rounded-xl" />
      <LoadingSkeleton className="h-8 w-20 rounded-xl" />
    </div>
  </div>
);

export const PageSkeleton: React.FC = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="flex items-center justify-between">
      <LoadingSkeleton className="h-7 w-48" />
      <LoadingSkeleton className="h-10 w-36 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
    <div className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-4 py-4 border-b border-[var(--brand-border)] flex gap-4">
          <LoadingSkeleton className="h-4 w-1/4" />
          <LoadingSkeleton className="h-4 w-1/4" />
          <LoadingSkeleton className="h-4 w-1/6" />
          <LoadingSkeleton className="h-4 w-1/6" />
          <LoadingSkeleton className="h-4 w-1/12 ml-auto" />
        </div>
      ))}
    </div>
  </div>
);
