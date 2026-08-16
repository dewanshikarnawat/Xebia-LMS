import React from 'react';
import { StatCard } from './DashboardCards';

export default function DashboardOverview({ stats = [] }) {
  if (!stats || stats.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-brand-border bg-white dark:border-slate-800 dark:bg-slate-900"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat, idx) => (
        <StatCard
          key={stat.id || stat.title}
          title={stat.title}
          value={stat.value}
          trend={stat.trend}
          iconName={stat.icon}
          color={stat.color}
          index={idx}
        />
      ))}
    </div>
  );
}
