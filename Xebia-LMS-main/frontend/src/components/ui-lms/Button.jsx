import { cn } from '@/utils-lms';

const variants = {
  // Teal is the primary action color throughout the reference design
  // (Create Category, Create Course, Save, Add Module, etc.)
  primary: 'bg-accent-teal text-white hover:bg-accent-teal-dark shadow-sm shadow-accent-teal/20',
  secondary: 'bg-brand-primary text-white hover:bg-brand-primary-dark',
  cta: 'bg-accent-orange text-white hover:opacity-90',
  purple: 'bg-accent-purple text-white hover:opacity-90',
  outline: 'border border-brand-border bg-brand-surface text-brand-text-primary hover:bg-brand-surface/90 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900',
  ghost: 'text-brand-text-secondary hover:bg-brand-surface hover:text-brand-text-primary',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizes = {
  xs: 'h-7 px-2.5 text-xs gap-1',
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
  icon: 'h-9 w-9 p-0',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  loading = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

