import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, CheckCircle, Award, TrendingUp, ArrowRight, Star, FileText, Flame } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { StatCard, Card } from '../../components/ui/Card';
import { StatCardSkeleton } from '../../components/shared/LoadingSkeleton';
import { studentService } from '../../services/student.service';
import { useAuth } from '../../contexts/AuthContext';
import { useCatalog } from '../../hooks-lms/useCatalog';
import type { StudentDashboardStats, Assignment } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { getDueDateCountdown, getDueDateColor } from '../../utils/helpers';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { courses } = useCatalog() as any;
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Streak State
  const [loginStreak, setLoginStreak] = useState(1);
  const [submissionStreak, setSubmissionStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    // 1. Calculate Login Streak (from localStorage date checks)
    const todayStr = new Date().toISOString().split('T')[0];
    const lastLogin = localStorage.getItem('lms_last_login_date');
    const savedStreak = localStorage.getItem('lms_login_streak');
    
    let currentLoginStreak = 1;
    if (lastLogin && savedStreak) {
      const diffTime = new Date(todayStr).getTime() - new Date(lastLogin).getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentLoginStreak = parseInt(savedStreak) + 1;
      } else if (diffDays === 0) {
        currentLoginStreak = parseInt(savedStreak);
      }
    }
    localStorage.setItem('lms_last_login_date', todayStr);
    localStorage.setItem('lms_login_streak', String(currentLoginStreak));
    setLoginStreak(currentLoginStreak);

    // 2. Fetch stats, assignments, and submissions concurrently
    Promise.all([
      studentService.getDashboardStats(),
      studentService.getAssignments({ limit: '5' }),
      studentService.getSubmissions()
    ])
      .then(([statsRes, assignmentsRes, submissionsRes]) => {
        setStats(statsRes.stats);
        setAssignments(assignmentsRes.assignments || []);

        // Calculate Submission Streak in real-time
        if (submissionsRes && submissionsRes.length > 0) {
          const dates = submissionsRes
            .map((s: any) => {
              if (!s.submittedAt) return '';
              return s.submittedAt.split('T')[0];
            })
            .filter(Boolean);
            
          if (dates.length > 0) {
            const uniqueDates = Array.from(new Set(dates)).sort((a: any, b: any) => new Date(b).getTime() - new Date(a).getTime()) as string[];
            
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            const hasToday = uniqueDates.includes(todayStr);
            const hasYesterday = uniqueDates.includes(yesterdayStr);
            
            let curStreak = 0;
            if (hasToday || hasYesterday) {
              let checkDate = hasToday ? new Date() : yesterday;
              while (true) {
                const checkStr = checkDate.toISOString().split('T')[0];
                if (uniqueDates.includes(checkStr)) {
                  curStreak++;
                  checkDate.setDate(checkDate.getDate() - 1);
                } else {
                  break;
                }
              }
            }
            setSubmissionStreak(curStreak);
            
            // Best Streak
            let best = 0;
            let temp = 0;
            const uniqueDatesAsc = [...uniqueDates].reverse();
            let prevTime: number | null = null;
            
            uniqueDatesAsc.forEach((d) => {
              const curTime = new Date(d).getTime();
              if (prevTime === null) {
                temp = 1;
              } else {
                const diffDays = Math.round((curTime - prevTime) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                  temp++;
                } else if (diffDays > 1) {
                  temp = 1;
                }
              }
              prevTime = curTime;
              if (temp > best) {
                best = temp;
              }
            });
            setBestStreak(Math.max(best, currentLoginStreak));
          }
        } else {
          setBestStreak(currentLoginStreak);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = stats ? [
    { title: 'Total Courses', value: courses?.length || 0, icon: <BookOpen size={20} />, color: 'purple' as const },
    { title: 'Enrolled Courses', value: courses?.length || 0, icon: <CheckCircle size={20} />, color: 'blue' as const },
    { title: 'Pending Tasks', value: stats.pendingAssignments, icon: <Clock size={20} />, color: 'amber' as const },
    { title: 'Average Grade', value: `${stats.averageGrade}%`, icon: <Award size={20} />, color: 'green' as const },
    { title: 'Study Streak', value: `${loginStreak} Days`, icon: <Flame size={20} />, color: 'teal' as const },
  ] : [];

  const getStatusLabelAndColor = (status: string) => {
    switch (status) {
      case 'reviewed':
        return { label: 'Reviewed', variant: 'reviewed' as const };
      case 'submitted':
        return { label: 'Submitted', variant: 'submitted' as const };
      default:
        return { label: 'Pending', variant: 'not_submitted' as const };
    }
  };

  return (
    <Layout role="student" title="Dashboard" subtitle={`Welcome back, ${user?.name?.split(' ')[0]}!${stats?.batchName ? ` • ${stats.batchName}` : ''}`}>
      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#4A1F4F] via-[#5C195F] to-[#7B2C7B] rounded-[24px] p-8 mb-8 text-white border border-white/5 shadow-md shadow-purple-900/10">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-[#2563EB]/10 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-white" />
                <span className="text-white/95 text-sm font-semibold tracking-wider uppercase">Overview</span>
              </div>
              <h2 className="text-2xl font-extrabold mb-1 tracking-tight">Welcome to your Student Portal</h2>
              <p className="text-white/85 text-sm leading-relaxed max-w-xl">
                Track your published assignments, submit your work, and review teacher feedback.
              </p>
            </div>
            {stats?.batchName && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold backdrop-blur">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Assigned Batch: {stats.batchName}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
          : cards.map((c) => (
              <StatCard key={c.title} title={c.title} value={c.value} icon={c.icon} color={c.color} />
            ))}
      </div>

      {/* Quick Actions & Recent Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Daily Streak Card */}
          <Card className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/20 shadow-sm relative overflow-hidden select-none">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3.5 flex items-center gap-2">
              <Flame size={18} className="text-amber-500 fill-amber-500 animate-pulse" />
              Daily Study Streak
            </h3>
            
            <div className="grid grid-cols-2 gap-3.5">
              <div className="p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-[var(--brand-border)] text-center">
                <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">Login Streak</span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5 block">{loginStreak} Days</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800/40 rounded-xl border border-[var(--brand-border)] text-center">
                <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] tracking-wider block">Submits Streak</span>
                <span className="text-lg font-black text-orange-600 dark:text-orange-400 mt-0.5 block">{submissionStreak} Days</span>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-[var(--brand-border)] flex justify-between items-center text-xs text-[var(--text-secondary)] font-medium">
              <span>All-time Best Streak:</span>
              <span className="font-bold text-amber-500 flex items-center gap-1">
                <Flame size={12} className="fill-amber-500" /> {bestStreak} days
              </span>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <a href="/student/assignments" className="flex items-center gap-3 p-3 rounded-xl border border-[var(--brand-border)] hover:border-[#2563EB] hover:bg-[#2563EB08] transition-all group">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shrink-0">
                  <BookOpen size={15} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[#2563EB]">View Assignments</p>
                  <p className="text-xs text-[var(--text-secondary)]">Check pending due dates and submit work</p>
                </div>
                <ArrowRight size={14} className="text-[var(--text-secondary)] group-hover:text-[#2563EB] transition-colors" />
              </a>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4A1F4F]" />
              Overview Summary
            </h3>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="skeleton h-3 w-32 rounded" />
                    <div className="skeleton h-3 w-10 rounded" />
                  </div>
                ))}
              </div>
            ) : stats ? (
              <div className="space-y-3">
                {[
                  {
                    label: 'Completion Rate',
                    value: stats.totalAssignments > 0
                      ? `${Math.round((stats.submittedAssignments / stats.totalAssignments) * 100)}%`
                      : '0%',
                    color: 'text-[#2563EB]',
                  },
                  {
                    label: 'Submitted / Published',
                    value: `${stats.submittedAssignments}/${stats.totalAssignments}`,
                    color: 'text-[#4A1F4F] dark:text-purple-300',
                  },
                  {
                    label: 'Average Score',
                    value: `${stats.averageGrade}%`,
                    color: 'text-emerald-500',
                  },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-2 border-b border-[var(--brand-border)] last:border-0">
                    <span className="text-sm text-[var(--text-secondary)]">{row.label}</span>
                    <span className={`text-sm font-semibold ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        </div>

        {/* Recent Batch Assignments */}
        <div className="lg:col-span-2">
          <Card>
            <div className="border-b border-[var(--brand-border)] pb-3 mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4A1F4F]" />
                Recent Batch Assignments
              </h3>
              {stats?.batchName && (
                <span className="text-xs font-bold text-[#2563EB] dark:text-blue-400 uppercase tracking-wider bg-[#2563EB]/10 px-2 py-0.5 rounded-full">
                  {stats.batchName}
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border border-[var(--brand-border)] rounded-xl">
                    <div className="skeleton h-5 w-5 rounded shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-1/3 rounded" />
                      <div className="skeleton h-3 w-1/2 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={32} className="mx-auto text-[var(--text-secondary)] mb-2 opacity-50" />
                <p className="text-sm font-medium text-[var(--text-primary)]">No assignments found</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">There are no assignments published to your batch yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((a) => {
                  const statusInfo = getStatusLabelAndColor(a.submissionStatus || 'not_submitted');
                  return (
                    <div
                      key={a.id}
                      onClick={() => navigate(`/student/assignments/${a.id}`)}
                      className="flex flex-col md:flex-row justify-between gap-4 p-5 border border-[var(--brand-border)] rounded-2xl hover:border-[#2563EB] transition-all card-hover cursor-pointer bg-white dark:bg-[#1E293B]"
                    >
                      <div className="flex-1 space-y-3 min-w-0">
                        {/* Title & Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#F5EAF8]0/10 flex items-center justify-center shrink-0">
                              <FileText size={16} className="text-[#4A1F4F] dark:text-purple-400" />
                            </div>
                            <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">
                              {a.title}
                            </h4>
                          </div>
                          <div className="shrink-0 md:hidden">
                            <Badge variant={statusInfo.variant} label={statusInfo.label} />
                          </div>
                        </div>

                        {/* Subject, Topic, Teacher Info */}
                        <div className="flex items-center gap-2 flex-wrap text-xs text-[var(--text-secondary)]">
                          <span className="bg-slate-100 dark:bg-slate-800 rounded-full px-2.5 py-0.5 font-medium">{a.subject}</span>
                          {a.topic && <span className="bg-blue-500/10 text-[#2563EB] dark:text-blue-400 rounded-full px-2.5 py-0.5 font-medium">Topic: {a.topic}</span>}
                          <span>•</span>
                          <span>Taught by: <strong className="text-[var(--text-primary)] font-medium">{a.teacher?.name || 'Teacher'}</strong></span>
                        </div>

                        {/* Due Date & Marks Info */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-dashed border-[var(--brand-border)] text-xs text-[var(--text-secondary)]">
                          <div>
                            <p className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold tracking-wide">Due Date</p>
                            <p className="text-[var(--text-primary)] font-medium mt-0.5">{a.dueDate}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold tracking-wide">Due Time</p>
                            <p className="text-[var(--text-primary)] font-medium mt-0.5">{a.dueTime || '23:59:00'}</p>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <p className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold tracking-wide">Total Marks</p>
                            <p className="text-[var(--text-primary)] font-medium mt-0.5">{a.maxMarks} Marks</p>
                          </div>
                        </div>
                      </div>

                      {/* Right column: Status & Countdown */}
                      <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[var(--brand-border)]">
                        <div className="hidden md:block">
                          <Badge variant={statusInfo.variant} label={statusInfo.label} />
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-[var(--text-secondary)] uppercase font-semibold tracking-wide">Time Remaining</p>
                          <p className={`text-xs font-bold mt-0.5 ${getDueDateColor(a.dueDate)}`}>
                            {getDueDateCountdown(a.dueDate)}
                          </p>
                        </div>
                        <ArrowRight size={16} className="text-[var(--text-secondary)] hidden md:block mt-1" />
                      </div>
                    </div>
                  );
                })}
                <div className="text-right pt-1">
                  <button
                    onClick={() => navigate('/student/assignments')}
                    className="text-xs text-[#2563EB] font-semibold hover:underline flex items-center gap-1 ml-auto cursor-pointer"
                  >
                    View All Assignments
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </Card>
        </div>

      </div>
    </Layout>
  );
};
