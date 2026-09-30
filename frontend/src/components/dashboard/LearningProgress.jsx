import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, CheckSquare, BarChart, ChevronRight } from 'lucide-react';
import { WeeklyActivityChart, LearningHoursTrendChart } from './Charts';
import Button from '@/components/ui-lms/Button';

export default function LearningProgress({ progressData = null, isLoading = false }) {
  if (isLoading || !progressData) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white border border-brand-border dark:bg-slate-900 dark:border-slate-800" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="h-96 rounded-2xl bg-white border border-brand-border dark:bg-slate-900 dark:border-slate-800" />
          <div className="space-y-6">
            <div className="h-44 rounded-2xl bg-white border border-brand-border dark:bg-slate-900 dark:border-slate-800" />
            <div className="h-44 rounded-2xl bg-white border border-brand-border dark:bg-slate-900 dark:border-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  const { metrics, enrolledCourses, charts } = progressData;

  // Mini cards for overall percentage stats
  const metricCards = [
    { label: 'Course Completion', value: `${metrics.overallCourseCompletion}%`, icon: BookOpen, color: 'text-brand-primary bg-brand-primary/10' },
    { label: 'Module Completion', value: `${metrics.moduleCompletion}%`, icon: BarChart, color: 'text-accent-teal bg-accent-teal/10' },
    { label: 'Assignment Completion', value: `${metrics.assignmentCompletion}%`, icon: CheckSquare, color: 'text-emerald-600 bg-emerald-500/10' },
    { label: 'Quiz Completion', value: `${metrics.quizCompletion}%`, icon: Award, color: 'text-accent-orange bg-accent-orange/10' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Summary Progress Metrics ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((m, idx) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-4 rounded-2xl border border-brand-border/70 bg-white p-4 shadow-card dark:border-slate-800 dark:bg-slate-900"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${m.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-brand-text-primary dark:text-slate-100">{m.value}</p>
                <p className="text-xs font-medium text-brand-text-secondary">{m.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Two Column Details ── */}
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        
        {/* Left Column: Enrolled Courses List */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-brand-border/70 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">My Courses</p>
              <h3 className="text-lg font-bold text-brand-text-primary dark:text-slate-100 mt-1">Course Tracker</h3>
            </div>
            <span className="text-xs font-semibold text-brand-text-secondary">
              {enrolledCourses.length} Courses Enrolled
            </span>
          </div>

          <div className="space-y-4">
            {enrolledCourses.map((course) => (
              <div
                key={course.id}
                className="group relative flex flex-col gap-4 rounded-2xl border border-brand-border/70 bg-brand-surface/30 p-4 transition-all hover:bg-brand-surface/70 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={course.thumbnail}
                    alt={course.name}
                    className="h-16 w-24 shrink-0 rounded-xl object-cover shadow-sm border border-brand-border/40 dark:border-slate-700"
                  />
                  <div className="min-w-0">
                    <span className="inline-flex rounded-full bg-brand-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-primary dark:bg-brand-primary/20">
                      {course.category}
                    </span>
                    <h4 className="font-bold text-brand-text-primary dark:text-slate-100 mt-1 text-sm md:text-base truncate">
                      {course.name}
                    </h4>
                    <p className="text-xs text-brand-text-secondary mt-0.5">
                      Trainer: {course.trainer}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6 shrink-0">
                  <div className="w-full md:w-32">
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-brand-text-secondary">
                      <span>{course.progress}% Completed</span>
                      <span className="text-[10px] text-brand-text-secondary">
                        {course.lessonsCompleted} / {course.lessonsCompleted + course.remainingLessons} lessons
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-brand-border/70 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-primary to-accent-teal transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    className="w-full md:w-auto shadow-sm"
                  >
                    Continue Learning
                    <ChevronRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Column: Weekly Activity & Cumulative Hours */}
        <div className="space-y-6">
          <WeeklyActivityChart data={charts.weeklyActivity} />
          
          <LearningHoursTrendChart data={charts.monthlyHours} />

          {/* Core Hours Stat Summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-brand-border/70 bg-gradient-to-br from-brand-primary/5 to-accent-teal/5 p-5 shadow-card dark:border-slate-800/80 dark:from-slate-900 dark:to-slate-800"
          >
            <h4 className="text-sm font-bold text-brand-text-primary dark:text-slate-100 mb-3">Learning Pace Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-brand-border/50 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary block">This Week</span>
                <span className="text-xl font-black text-brand-primary dark:text-slate-200 mt-1 block">{metrics.weeklyLearningHours} hrs</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/60 p-3 rounded-xl border border-brand-border/50 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary block">This Month</span>
                <span className="text-xl font-black text-brand-success mt-1 block">{metrics.monthlyLearningHours} hrs</span>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

