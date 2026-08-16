'use client';

import { motion } from 'framer-motion';
import { cn } from '@/utils-lms';

const accentBar = {
  teal: 'bg-accent-teal',
  orange: 'bg-accent-orange',
  purple: 'bg-accent-purple',
  pink: 'bg-accent-pink',
  plum: 'bg-brand-primary',
};

const accentText = {
  teal: 'text-accent-teal-dark',
  orange: 'text-accent-orange',
  purple: 'text-accent-purple',
  pink: 'text-accent-pink',
  plum: 'text-brand-primary',
};

const accentChip = {
  teal: 'bg-accent-teal/10 text-accent-teal-dark',
  orange: 'bg-accent-orange/10 text-accent-orange',
  purple: 'bg-accent-purple/10 text-accent-purple',
  pink: 'bg-accent-pink/10 text-accent-pink',
  plum: 'bg-brand-primary/10 text-brand-primary',
};

/**
 * A form/content section with a colored top accent bar and small icon + title
 * header — the recurring visual motif from the reference design
 * (Course Basics / Schedule / Learning Outcomes / etc).
 */
export default function SectionCard({ icon: Icon, title, subtitle, accent = 'teal', actions, children, delay = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        'overflow-hidden rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card',
        className
      )}
    >
      <div className={cn('h-1.5 rounded-t-2xl', accentBar[accent] || accentBar.teal)} />
      <div className="p-5">
        {(Icon || title) && (
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              {Icon && (
                <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0', accentChip[accent] || accentChip.teal)}>
                  <Icon className="h-4 w-4" />
                </span>
              )}
              <div>
                <h3 className={cn('text-sm font-semibold uppercase tracking-wide', accentText[accent] || accentText.teal)}>{title}</h3>
                {subtitle && <p className="text-xs text-brand-text-secondary dark:text-slate-400 mt-0.5">{subtitle}</p>}
              </div>
            </div>
            {actions}
          </div>
        )}
        {children}
      </div>
    </motion.div>
  );
}

