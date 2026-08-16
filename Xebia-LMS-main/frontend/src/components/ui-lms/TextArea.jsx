import { cn } from '@/utils-lms';

export default function TextArea({ label, error, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-brand-text-primary dark:text-slate-200">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        className={cn(
          'w-full rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-brand-text-primary dark:text-slate-100 min-h-[100px] resize-y',
          'placeholder:text-brand-text-secondary/60 transition-colors',
          'hover:border-brand-primary/30 dark:hover:border-brand-primary/50 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20',
          error && 'border-red-400',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-650 dark:text-red-400">{error}</p>}
    </div>
  );
}


