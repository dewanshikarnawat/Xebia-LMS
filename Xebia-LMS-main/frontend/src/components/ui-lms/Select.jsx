import { cn } from '@/utils-lms';

export default function Select({ label, error, options = [], placeholder, className, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-brand-text-primary dark:text-slate-200">
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        className={cn(
          'w-full rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm appearance-none text-brand-text-primary dark:text-slate-100',
          'hover:border-brand-primary/30 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        {placeholder && <option value="" className="dark:bg-slate-900">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt} className="dark:bg-slate-900">
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-655 dark:text-red-400">{error}</p>}
    </div>
  );
}


