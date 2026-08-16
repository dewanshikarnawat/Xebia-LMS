import { cn } from '@/utils-lms';

export function Skeleton({ className }) {
  return <div className={cn('animate-pulse rounded-xl bg-brand-border/60', className)} />;
}

export function SkeletonLoader({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-brand-border bg-white p-5 shadow-card space-y-3">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}

