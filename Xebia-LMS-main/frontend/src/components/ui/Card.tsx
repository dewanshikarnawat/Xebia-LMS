import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
}) => {
  const paddingMap = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' };

  return (
    <div
      className={`
        bg-white dark:bg-[#1E293B]
        border border-slate-100 dark:border-slate-800/80
        rounded-[18px] shadow-sm
        ${hover ? 'card-hover cursor-pointer' : ''}
        ${paddingMap[padding]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Stat Card for dashboard
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: 'purple' | 'teal' | 'blue' | 'amber' | 'red' | 'green';
  subtitle?: string;
}

const colorMap = {
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    iconColor: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-100 dark:border-purple-900/30',
  },
  teal: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/20',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-100 dark:border-cyan-900/30',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-900/30',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-900/30',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    iconColor: 'text-red-600 dark:text-red-400',
    border: 'border-red-100 dark:border-red-900/30',
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-900/30',
  },
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'purple', subtitle }) => {
  const c = colorMap[color];
  return (
    <div className="bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800/80 rounded-[18px] p-6 shadow-sm card-hover flex flex-col justify-between min-h-[128px]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight mt-2">{value}</p>
        </div>
        <div className={`${c.bg} ${c.iconColor} rounded-[14px] p-3 shadow-sm border ${c.border} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-[var(--text-secondary)] mt-3 pt-2.5 border-t border-slate-50 dark:border-slate-800/40">
          {subtitle}
        </p>
      )}
    </div>
  );
};
