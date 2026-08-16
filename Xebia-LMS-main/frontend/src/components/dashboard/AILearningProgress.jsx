import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Compass, CheckCircle2, TrendingUp, HelpCircle, Activity, Award } from 'lucide-react';
import { ProgressRing } from './Charts';

export default function AILearningProgress({ aiData = null, isLoading = false }) {
  if (isLoading || !aiData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 rounded-3xl bg-white border border-brand-border dark:bg-slate-900 dark:border-slate-800" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 rounded-3xl bg-white border border-brand-border dark:bg-slate-900 dark:border-slate-800" />
          <div className="h-64 rounded-3xl bg-white border border-brand-border dark:bg-slate-900 dark:border-slate-800" />
        </div>
      </div>
    );
  }

  const {
    score,
    summary,
    consistency,
    completionTrend,
    quizPerformance,
    assignmentPerformance,
    learningEfficiency,
    insights,
    strengths,
    improvements,
    recommendations
  } = aiData;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* ── AI Learning Header Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-[#84117C]/20 bg-gradient-to-r from-[#6C1D5F] to-[#84117C] p-6 text-white shadow-lg md:p-8"
      >
        {/* Background glow animations */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-10 bottom-0 h-40 w-40 rounded-full bg-purple-500/20 blur-2xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300 animate-pulse" />
              AI Learning Coach
            </div>
            <h3 className="text-2xl font-black md:text-3xl tracking-tight">
              GenAI Analytics & Learning Score
            </h3>
            <p className="text-sm text-purple-100/90 leading-relaxed">
              {summary}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-md md:p-5 border border-white/10">
            <ProgressRing progress={score} size={80} strokeWidth={6} colorClass="stroke-cyan-300" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-200 block">AI Score</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-4xl font-black tracking-tight">{score}</span>
                <span className="text-sm text-purple-200">/100</span>
              </div>
              <span className="text-[10px] text-purple-100/80 block mt-1">Excellent standing</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── AI Core Insights Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: 'Consistency', val: consistency, color: 'text-indigo-500' },
          { label: 'Completion Trend', val: completionTrend, color: 'text-emerald-500' },
          { label: 'Quiz Performance', val: quizPerformance, color: 'text-purple-500' },
          { label: 'Assignment Perf.', val: assignmentPerformance, color: 'text-pink-500' },
          { label: 'Learning Efficiency', val: learningEfficiency, color: 'text-amber-500' }
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            className="rounded-2xl border border-brand-border/70 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block">
              {item.label}
            </span>
            <span className={`text-sm font-extrabold mt-1.5 block leading-tight ${item.color}`}>
              {item.val}
            </span>
          </motion.div>
        ))}
      </div>

      {/* ── Deep Insights & Recommendation Splits ── */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Column: Strengths vs Improvements & Weekly Insights */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-brand-border/70 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-brand-primary" />
              <h4 className="font-bold text-brand-text-primary dark:text-slate-100">Learning Characteristics</h4>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 p-4 border border-emerald-500/10">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">
                  Learning Strengths
                </p>
                <ul className="space-y-3">
                  {strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs font-medium text-brand-text-primary dark:text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 p-4 border border-amber-500/10">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-3">
                  Areas for Improvement
                </p>
                <ul className="space-y-3">
                  {improvements.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs font-medium text-brand-text-primary dark:text-slate-200">
                      <Compass className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-brand-border/70 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-accent-teal" />
              <h4 className="font-bold text-brand-text-primary dark:text-slate-100">Weekly AI Insights</h4>
            </div>
            <ul className="space-y-3">
              {insights.map((insight, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 border-b border-brand-border/40 pb-3 last:border-0 last:pb-0 dark:border-slate-800"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-[10px] font-bold text-accent-teal dark:bg-cyan-950/30">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-brand-text-secondary dark:text-slate-300 leading-relaxed font-medium">
                    {insight}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Right Column: AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-brand-border/70 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-accent-orange" />
              <h4 className="font-bold text-brand-text-primary dark:text-slate-100">Recommended Action Plan</h4>
            </div>
            <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-600">
              Prescriptive
            </span>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div
                key={rec.id}
                className="flex items-start gap-3 rounded-2xl border border-brand-border/60 bg-brand-surface/40 p-4 transition-colors hover:bg-brand-surface/80 dark:border-slate-800 dark:bg-slate-800/20 dark:hover:bg-slate-800/40"
              >
                <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-primary/10 text-xs font-bold text-brand-primary">
                  {idx + 1}
                </div>
                <div>
                  <h5 className="text-sm font-bold text-brand-text-primary dark:text-slate-100">
                    {rec.action}
                  </h5>
                  <p className="text-xs text-brand-text-secondary mt-1 font-medium">
                    {rec.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 p-4 border border-indigo-500/10 text-center">
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              💡 Complete these actions to raise your AI learning score to 95+ and stay ahead of your team goals!
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
