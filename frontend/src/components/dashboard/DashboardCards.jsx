import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

const COLOR_SCHEMES = {
  purple: 'from-brand-primary/10 to-accent-teal/10 text-brand-primary dark:from-brand-primary/20 dark:to-accent-teal/20',
  teal: 'from-accent-teal/10 to-emerald-500/10 text-accent-teal dark:from-accent-teal/20 dark:to-emerald-500/20',
  emerald: 'from-emerald-500/10 to-lime-500/10 text-emerald-600 dark:from-emerald-500/20 dark:to-lime-500/20',
  orange: 'from-accent-orange/10 to-amber-500/10 text-accent-orange dark:from-accent-orange/20 dark:to-amber-500/20',
  plum: 'from-brand-secondary/10 to-accent-pink/10 text-brand-secondary dark:from-brand-secondary/20 dark:to-accent-pink/20',
  pink: 'from-accent-pink/10 to-purple-500/10 text-accent-pink dark:from-accent-pink/20 dark:to-purple-500/20',
};

export function StatCard({ title, value, trend, iconName, color = 'teal', index = 0 }) {
  const Icon = Icons[iconName] || Icons.BookOpen;
  const gradientClass = COLOR_SCHEMES[color] || COLOR_SCHEMES.teal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      className="group relative overflow-hidden rounded-2xl border border-brand-border/70 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Decorative background glow on hover */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-brand-primary/5 to-accent-teal/5 opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div className="flex items-start justify-between">
        <div className={`inline-flex rounded-2xl bg-gradient-to-br p-3 ${gradientClass}`}>
          <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
        </div>
        
        {trend && (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-surface px-2.5 py-0.5 text-[10px] font-semibold text-brand-text-secondary dark:bg-slate-800 dark:text-slate-400">
            <Icons.TrendingUp className="h-3 w-3 text-brand-success" />
            {trend}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-text-secondary">
          {title}
        </p>
        <p className="mt-1.5 text-3xl font-extrabold text-brand-text-primary dark:text-slate-100 tracking-tight">
          {value}
        </p>
      </div>
    </motion.div>
  );
}
