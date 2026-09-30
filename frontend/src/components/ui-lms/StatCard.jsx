'use client';

import { motion } from 'framer-motion';

const ICON_COLORS = {
  purple: { bg: '#6c1d5f15', text: '#6c1d5f' },
  teal:   { bg: '#01ac9f15', text: '#01ac9f' },
  orange: { bg: '#ff620015', text: '#ff6200' },
  plum:   { bg: '#84117c15', text: '#84117c' },
  pink:   { bg: '#db277715', text: '#db2777' },
};

export default function StatCard({ icon: Icon, label, value, color = 'teal', index = 0, className }) {
  const scheme = ICON_COLORS[color] || ICON_COLORS.teal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all ${className || ''}`}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: scheme.bg }}
      >
        <Icon className="h-[18px] w-[18px]" style={{ color: scheme.text }} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold leading-tight text-slate-900 dark:text-slate-100">{value}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{label}</p>
      </div>
    </motion.div>
  );
}
