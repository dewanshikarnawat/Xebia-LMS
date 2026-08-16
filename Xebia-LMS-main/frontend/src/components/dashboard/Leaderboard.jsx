import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Target, Flame, Hourglass, Zap, ShieldCheck } from 'lucide-react';

const BADGE_ICONS = {
  '🥇 Gold Learner': { label: 'Gold Learner', icon: '🥇', desc: 'Top 5% of cohort', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  '🥈 Silver Learner': { label: 'Silver Learner', icon: '🥈', desc: 'Top 10% of cohort', color: 'bg-slate-300/20 text-slate-600 border-slate-300/30' },
  '🥉 Bronze Learner': { label: 'Bronze Learner', icon: '🥉', desc: 'Top 25% of cohort', color: 'bg-amber-600/10 text-amber-700 border-amber-600/20' },
  'Fast Learner': { label: 'Fast Learner', icon: '⚡', desc: 'Finished 3 lessons in a day', color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20' },
  'Quiz Champion': { label: 'Quiz Champion', icon: '🧠', desc: 'Scored 100% on 3 assessments', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  'Top Performer': { label: 'Top Performer', icon: '🌟', desc: 'Consistently high marks', color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' }
};

export default function Leaderboard({ ranking = null, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-brand-border bg-white p-6 animate-pulse dark:border-slate-800 dark:bg-slate-900">
        <div className="h-44 rounded-2xl bg-brand-surface" />
      </div>
    );
  }

  // Graceful hide if leaderboard ranking is null or hidden
  if (!ranking || ranking.visible === false) {
    return null;
  }

  const {
    currentRank,
    totalStudents,
    overallPoints,
    learningHours,
    completionPercentage,
    quizScore,
    badges = []
  } = ranking;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-brand-border/70 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 animate-fade-in"
    >
      <div className="flex items-center justify-between mb-5 border-b border-brand-border/50 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <Trophy className="h-5 w-5 text-brand-success" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">Cohort Leaderboard</p>
            <h3 className="text-lg font-bold text-brand-text-primary dark:text-slate-100 mt-0.5">My Standing</h3>
          </div>
        </div>
        <span className="rounded-full bg-brand-success/10 px-3 py-1 text-xs font-black text-brand-success">
          Rank #{currentRank}
        </span>
      </div>

      {/* ── Standings Grid ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Points', value: overallPoints, desc: 'Accumulated score', icon: Target, color: 'text-indigo-500 bg-indigo-500/5' },
          { label: 'Weekly Hours', value: `${learningHours}h`, desc: 'Learning hours', icon: Hourglass, color: 'text-amber-500 bg-amber-500/5' },
          { label: 'Avg Quiz Score', value: `${quizScore}%`, desc: 'Passing criteria', icon: ShieldCheck, color: 'text-brand-primary bg-brand-primary/5' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className={`rounded-2xl border border-brand-border/60 p-4 transition-all hover:bg-brand-surface/30 dark:border-slate-800 dark:hover:bg-slate-800/40`}
            >
              <div className="flex justify-between items-center text-brand-text-secondary mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                <div className={`p-1.5 rounded-lg ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <h4 className="text-xl font-extrabold text-brand-text-primary dark:text-slate-100">
                {item.value}
              </h4>
              <p className="text-[10px] text-brand-text-secondary mt-0.5">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Achievement Badges Section ── */}
      <div className="mt-6 border-t border-brand-border/50 pt-5 dark:border-slate-800">
        <h4 className="text-sm font-bold text-brand-text-primary dark:text-slate-100 mb-4 flex items-center gap-2">
          <Award className="h-4.5 w-4.5 text-brand-primary" />
          Achievement Badges ({badges.length})
        </h4>

        <div className="grid gap-3 sm:grid-cols-2">
          {badges.map((badge, idx) => {
            const mapped = BADGE_ICONS[badge.title] || BADGE_ICONS[badge.label] || {
              label: badge.title || badge.label,
              icon: badge.icon || '🏅',
              desc: badge.description || 'Achievement unlocked',
              color: 'bg-brand-surface text-brand-text-primary border-brand-border/60'
            };

            return (
              <motion.div
                key={badge.id || badge.title}
                whileHover={{ scale: 1.02 }}
                className={`flex items-start gap-3 rounded-2xl border p-3.5 shadow-sm transition-all ${mapped.color}`}
              >
                <span className="text-2xl select-none">{mapped.icon}</span>
                <div>
                  <h5 className="text-xs font-bold leading-tight">
                    {mapped.label}
                  </h5>
                  <p className="text-[10px] opacity-80 mt-1 font-medium leading-relaxed">
                    {mapped.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
