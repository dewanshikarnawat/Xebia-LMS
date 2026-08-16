'use client';

import { motion } from 'framer-motion';
import {
  BookOpen, Layers, FileStack, Clock, Users, TrendingUp, CheckCircle, FileText,
} from 'lucide-react';
import { cn, countCourseStats, getCompletionPercentage } from '@/utils-lms';
import { CourseStatusBadge } from '@/components/ui-lms/Badge';

function StatCard({ icon: Icon, label, value, sub, color = 'primary' }) {
  const colors = {
    primary: 'bg-brand-primary/10 text-brand-primary',
    success: 'bg-brand-success/10 text-brand-success',
    cta: 'bg-brand-cta/10 text-brand-cta',
    secondary: 'bg-brand-secondary/10 text-brand-secondary',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-brand-border bg-white p-4 shadow-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-brand-text-secondary uppercase tracking-wide">{label}</p>
          <p className="mt-1 text-2xl font-bold text-brand-text-primary">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-brand-text-secondary">{sub}</p>}
        </div>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', colors[color])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

export default function CourseDashboardCards({ course, students = [] }) {
  const stats = countCourseStats(course);
  const completion = getCompletionPercentage(course);
  const enrolled = course.enrolledStudents || 0;
  const activeStudents = Math.round(enrolled * 0.72);
  const completedStudents = Math.round(enrolled * 0.28);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <CourseStatusBadge status={course.status} />
        <span className="text-sm text-brand-text-secondary">
          Last updated {new Date(course.updatedAt).toLocaleDateString()}
        </span>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={BookOpen} label="Modules" value={stats.moduleCount} color="primary" />
        <StatCard icon={Layers} label="Submodules" value={stats.submoduleCount} color="secondary" />
        <StatCard icon={FileStack} label="Content Items" value={stats.contentCount} color="success" />
        <StatCard icon={Clock} label="Duration" value={course.duration} sub={`${course.durationHours || 40}h total`} color="cta" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Students" value={enrolled} color="primary" />
        <StatCard icon={TrendingUp} label="Active Students" value={activeStudents} color="success" />
        <StatCard icon={CheckCircle} label="Completed" value={completedStudents} color="success" />
        <StatCard icon={FileText} label="Completion" value={`${completion}%`} sub="Content readiness" color="cta" />
      </div>
    </div>
  );
}

export function CourseStatistics({ course }) {
  const stats = countCourseStats(course);
  const completion = getCompletionPercentage(course);
  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between"><span className="text-brand-text-secondary">Modules</span><span className="font-medium">{stats.moduleCount}</span></div>
      <div className="flex justify-between"><span className="text-brand-text-secondary">Submodules</span><span className="font-medium">{stats.submoduleCount}</span></div>
      <div className="flex justify-between"><span className="text-brand-text-secondary">Content</span><span className="font-medium">{stats.contentCount}</span></div>
      <div className="flex justify-between"><span className="text-brand-text-secondary">Completion</span><span className="font-medium">{completion}%</span></div>
      <div className="h-2 rounded-full bg-brand-surface overflow-hidden">
        <div className="h-full rounded-full bg-brand-success transition-all" style={{ width: `${completion}%` }} />
      </div>
    </div>
  );
}


