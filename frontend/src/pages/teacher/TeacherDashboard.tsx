import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, CheckCircle, Clock, Zap, TrendingUp, FolderOpen, ArrowRight } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { StatCard, Card } from '../../components/ui/Card';
import { StatCardSkeleton } from '../../components/shared/LoadingSkeleton';
import { teacherService } from '../../services/teacher.service';
import { useAuth } from '../../contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '../../store';
import { getAllBatches } from '../../store/batchSlice';
import type { DashboardStats, Assignment } from '../../types';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const { batches, loading: loadingBatches } = useAppSelector((state) => state.batch);

  const [stats, setStats] = useState<DashboardStats & { totalBatches?: number } | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  useEffect(() => {
    // 1. Fetch dashboard stats
    teacherService.getDashboardStats()
      .then((res) => setStats(res.stats))
      .catch(console.error)
      .finally(() => setLoadingStats(false));

    // 2. Fetch all batches for dropdowns/groups
    dispatch(getAllBatches());

    // 3. Fetch all assignments to group them by batch
    teacherService.getAssignments({ limit: '1000' })
      .then((res) => setAssignments(res.assignments || []))
      .catch(console.error)
      .finally(() => setLoadingAssignments(false));
  }, [dispatch]);

  // Group assignments by batch ID
  const assignmentsByBatch = React.useMemo(() => {
    const map: Record<string, { batchName: string; list: Assignment[] }> = {};
    
    // Initialize map with all existing batches to ensure even batches with 0 assignments show up
    batches.forEach((b) => {
      map[String(b.id)] = {
        batchName: b.batchName,
        list: [],
      };
    });

    // Populate assignments
    assignments.forEach((a) => {
      if (a.batchId) {
        if (!map[a.batchId]) {
          map[a.batchId] = {
            batchName: a.batchName || 'General Class',
            list: [],
          };
        }
        map[a.batchId].list.push(a);
      }
    });

    return Object.entries(map).map(([batchId, val]) => ({
      batchId,
      batchName: val.batchName,
      assignmentsCount: val.list.length,
      assignments: val.list,
    }));
  }, [batches, assignments]);

  const cards = stats ? [
    { title: 'Total Batches', value: batches.length, icon: <FolderOpen size={20} />, color: 'purple' as const },
    { title: 'Total Assignments', value: stats.totalAssignments, icon: <FileText size={20} />, color: 'teal' as const },
    { title: 'Active Assignments', value: stats.activeAssignments, icon: <Zap size={20} />, color: 'blue' as const },
    { title: 'Submitted', value: stats.submittedAssignments, icon: <CheckCircle size={20} />, color: 'green' as const },
    { title: 'Total Students', value: stats.totalStudents, icon: <Users size={20} />, color: 'amber' as const },
  ] : [];

  const loading = loadingStats || loadingBatches || loadingAssignments;

  return (
    <Layout role="teacher" title="Dashboard" subtitle={`Good day, ${user?.name?.split(' ')[0]}!`}>
      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#4A1F4F] via-[#5C195F] to-[#7B2C7B] rounded-[24px] p-8 mb-8 text-white border border-white/5 shadow-md shadow-purple-900/10">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-[#2563EB]/10 blur-2xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-white" />
            <span className="text-white/95 text-sm font-semibold tracking-wider uppercase">Overview</span>
          </div>
          <h2 className="text-2xl font-extrabold mb-1 tracking-tight">Welcome to your Teacher Portal</h2>
          <p className="text-white/85 text-sm leading-relaxed max-w-xl">
            Manage batches, publish assignments, grade submissions, and track student progress all in one place.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
          : cards.map((c) => (
              <StatCard key={c.title} title={c.title} value={c.value} icon={c.icon} color={c.color} />
            ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Quick Actions & Batch List */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Quick Actions */}
          <Card>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4A1F4F]" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <a href="/teacher/batches" className="flex items-center gap-3 p-3 rounded-xl border border-[var(--brand-border)] hover:border-[#4A1F4F] hover:bg-[#4A1F4F08] transition-all group">
                <div className="w-8 h-8 rounded-lg bg-[#4A1F4F] flex items-center justify-center shrink-0">
                  <FolderOpen size={15} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[#4A1F4F]">Manage Batches</p>
                  <p className="text-xs text-[var(--text-secondary)]">Create classes and view student counts</p>
                </div>
                <ArrowRight size={14} className="text-[var(--text-secondary)] group-hover:text-[#4A1F4F] transition-colors" />
              </a>

              <a href="/teacher/assignments/create" className="flex items-center gap-3 p-3 rounded-xl border border-[var(--brand-border)] hover:border-[#2563EB] hover:bg-[#2563EB08] transition-all group">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shrink-0">
                  <FileText size={15} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[#2563EB]">New Assignment</p>
                  <p className="text-xs text-[var(--text-secondary)]">Publish to a batch or save as draft</p>
                </div>
                <ArrowRight size={14} className="text-[var(--text-secondary)] group-hover:text-[#2563EB] transition-colors" />
              </a>
            </div>
          </Card>

          {/* Batch-wise Assignment Summary */}
          <Card>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              Batch Summary
            </h3>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="skeleton h-3.5 w-32 rounded" />
                    <div className="skeleton h-3.5 w-10 rounded" />
                  </div>
                ))}
              </div>
            ) : batches.length === 0 ? (
              <p className="text-xs text-[var(--text-secondary)] text-center py-4">No batches created yet.</p>
            ) : (
              <div className="space-y-3">
                {assignmentsByBatch.map((group) => (
                  <div
                    key={group.batchId}
                    className="flex items-center justify-between py-2.5 border-b border-[var(--brand-border)] last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{group.batchName}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{group.assignmentsCount} Assignments</p>
                    </div>
                    <button
                      onClick={() => navigate(`/teacher/assignments?search=${encodeURIComponent(group.batchName)}`)}
                      className="text-xs text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      View
                      <ArrowRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Grouped Assignments List */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="border-b border-[var(--brand-border)] pb-3 mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F5EAF8]0" />
                Assignments Grouped by Batch
              </h3>
              <span className="text-xs text-[var(--text-secondary)] font-medium">Total: {assignments.length}</span>
            </div>

            {loading ? (
              <div className="space-y-6">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="skeleton h-5 w-40 rounded" />
                    <div className="skeleton h-12 w-full rounded-xl" />
                    <div className="skeleton h-12 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : assignmentsByBatch.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen size={32} className="mx-auto text-[var(--text-secondary)] mb-2 opacity-50" />
                <p className="text-sm font-medium text-[var(--text-primary)]">No assignments created yet</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Create a batch and assign tasks to get started.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {assignmentsByBatch.map((group) => (
                  <div key={group.batchId} className="space-y-2">
                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 px-3 py-2 rounded-xl border border-[var(--brand-border)]">
                      <span className="text-xs font-bold text-[#4A1F4F] dark:text-purple-300 uppercase tracking-wide">
                        {group.batchName}
                      </span>
                      <span className="text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-[var(--text-secondary)] rounded-full px-2 py-0.5">
                        {group.assignmentsCount} assignments
                      </span>
                    </div>

                    {group.assignments.length === 0 ? (
                      <p className="text-xs text-[var(--text-secondary)] pl-3 py-1.5 italic">
                        No assignments published to this batch.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-1">
                        {group.assignments.map((a) => (
                          <div
                            key={a.id}
                            onClick={() => navigate(`/teacher/submitted?assignment=${a.id}`)}
                            className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] hover:border-[#4A1F4F] rounded-xl p-3.5 transition-all card-hover cursor-pointer flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">
                                  {a.title}
                                </h4>
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${
                                  a.status === 'published'
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                }`}>
                                  {a.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-[var(--text-secondary)] mt-1 line-clamp-2">
                                {a.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[var(--brand-border)] text-[9px] text-[var(--text-secondary)]">
                              <span>Due: {a.dueDate}</span>
                              <span className="font-semibold text-[#2563EB]">
                                Submissions: {a.submittedCount || 0}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};
