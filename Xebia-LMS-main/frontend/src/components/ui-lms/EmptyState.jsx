import { motion } from 'framer-motion';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryAction,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E293B] px-6 py-16 text-center shadow-sm transition-colors duration-300"
    >
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary/10 dark:bg-purple-950/40 text-brand-primary dark:text-purple-400">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-800 dark:text-[#F8FAFC]">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">{description}</p>
      )}
      <div className="mt-6 flex gap-3">
        {actionLabel && onAction && (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
        {secondaryAction}
      </div>
    </motion.div>
  );
}
