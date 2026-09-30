import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, BookOpen, AlertCircle, Award, Calendar, ArrowRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/shared/EmptyState';
import { TableRowSkeleton } from '../../components/shared/LoadingSkeleton';
import { Pagination } from '../../components/shared/Pagination';
import { studentService } from '../../services/student.service';
import { certificateService } from '../../services/certificate.service';
import { formatDate, formatDateTime, isOverdue } from '../../utils/helpers';
import type { Assignment, PaginationMeta } from '../../types';

export const StudentQuizzes: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [certificates, setCertificates] = useState<Record<string, string>>({});

  useEffect(() => {
    certificateService.getMyCertificates().then(certs => {
      const mapping: Record<string, string> = {};
      certs.forEach(c => {
        if (c.assignmentId) mapping[`assignment-${c.assignmentId}`] = c.certificateUrl;
        if (c.quizId) mapping[`quiz-${c.quizId}`] = c.certificateUrl;
      });
      setCertificates(mapping);
    }).catch(err => console.error("Error loading certificates", err));
  }, []);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { 
        page: String(page + 1), 
        limit: String(size),
        assignmentType: 'QUIZ'
      };
      if (search) params.search = search;
      if (subjectFilter) params.subject = subjectFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await studentService.getAssignments(params);
      setQuizzes(res.assignments);
      setTotalPages(res.pagination.totalPages);
      setTotalElements(res.pagination.total);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [search, subjectFilter, statusFilter, page, size]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Helper: Get Quiz Status
  const getQuizStatus = (q: Assignment): 'upcoming' | 'active' | 'submitted' | 'reviewed' | 'closed' => {
    if (q.submissionStatus === 'reviewed') return 'reviewed';
    if (q.submissionStatus === 'submitted') return 'submitted';
    
    // Check deadline
    const overdue = isOverdue(q.dueDate);
    if (overdue) return 'closed';
    
    return 'active';
  };

  const getStatusBadge = (status: 'upcoming' | 'active' | 'submitted' | 'reviewed' | 'closed') => {
    switch (status) {
      case 'reviewed':
        return <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30">Reviewed</span>;
      case 'submitted':
        return <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-blue-100 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30">Submitted</span>;
      case 'active':
        return <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30">Active</span>;
      case 'closed':
        return <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30">Closed</span>;
      default:
        return <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)] border border-[var(--brand-border)]">Upcoming</span>;
    }
  };

  // Filter subjects for selector
  const subjects = useMemo(() => {
    const subs = quizzes.map((q) => q.subject);
    return ['All', ...Array.from(new Set(subs))];
  }, [quizzes]);

  return (
    <Layout role="student" title="Quizzes" subtitle="Attempt and review your online quizzes">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5 select-none">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search quizzes..."
            className="w-full search-bar-modern"
          />
        </div>

        <div className="flex gap-2 shrink-0 flex-wrap items-center">
          <select
            value={subjectFilter}
            onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
            className="pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl text-[var(--text-primary)] cursor-pointer appearance-none"
          >
            {subjects.map((s) => <option key={s} value={s === 'All' ? '' : s}>{s}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl text-[var(--text-primary)] cursor-pointer appearance-none"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="submitted">Submitted</option>
            <option value="reviewed">Reviewed</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Quizzes list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse space-y-4">
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-16 w-full bg-slate-200 dark:bg-slate-700 rounded" />
            </Card>
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <Card className="py-16 text-center">
          <EmptyState
            icon="inbox"
            title="No quizzes assigned"
            description="You don't have any online quizzes scheduled or assigned to your batch."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {quizzes.map((q) => {
            const status = getQuizStatus(q);
            const durationMins = q.questions ? q.questions.length * 5 : 30;

            return (
              <Card
                key={q.id}
                className="hover:shadow-md transition-all duration-200 flex flex-col justify-between border border-[var(--brand-border)]"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <h4 className="text-base font-bold text-[var(--text-primary)] truncate">{q.title}</h4>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium">{q.subject}</span>
                        {q.topic && <span>• {q.topic}</span>}
                      </div>
                    </div>
                    <div className="shrink-0">
                      {getStatusBadge(status)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {q.description || 'No description provided.'}
                    </p>
                    {q.instructions && (
                      <p className="text-[11px] text-[var(--text-secondary)] italic truncate">
                        Instructions: {q.instructions}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--brand-border)]">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-[var(--brand-border)]">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block mb-0.5">Start Date & Time</span>
                      <span className="text-[11px] text-[var(--text-primary)] font-medium flex items-center gap-1">
                        <Calendar size={11} /> {formatDateTime(q.createdAt)}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-[var(--brand-border)]">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block mb-0.5">End Date & Time</span>
                      <span className="text-[11px] text-rose-500 font-medium flex items-center gap-1">
                        <Calendar size={11} /> {formatDate(q.dueDate)} {q.dueTime || '23:59:00'}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-[var(--brand-border)]">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block mb-0.5">Total Marks</span>
                      <span className="text-[11px] text-[#4A1F4F] dark:text-purple-400 font-bold flex items-center gap-1">
                        <Award size={11} /> {q.maxMarks} Marks
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-[var(--brand-border)]">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-secondary)] block mb-0.5">Duration</span>
                      <span className="text-[11px] text-[#2563EB] font-bold flex items-center gap-1">
                        <Clock size={11} /> {durationMins} Mins
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--brand-border)]">
                  {status === 'active' ? (
                    <Button
                      variant="primary"
                      className="w-full flex items-center justify-center gap-1.5 text-xs py-2"
                      onClick={() => navigate(`/student/quizzes/${q.id}/attempt`)}
                    >
                      <span>Start Quiz</span>
                      <ArrowRight size={13} />
                    </Button>
                  ) : (status === 'submitted' || status === 'reviewed') ? (
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="outline"
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB]/5"
                        onClick={() => navigate(`/student/quizzes/${q.id}/review`)}
                      >
                        <span>View Review</span>
                        <CheckCircle2 size={13} className="text-[#2563EB]" />
                      </Button>
                      {(() => {
                        const isEligible = q.submission && 
                                           (q.submission.status === 'reviewed' || q.submission.status === 'submitted') && 
                                           q.submission.marks !== null && 
                                           q.submission.marks !== undefined && 
                                           q.submission.marks >= (q.passingMarks || 0);
                        return isEligible ? (
                          <Button
                            variant="primary"
                            className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2"
                            onClick={() => navigate(`/student/certificates/preview/${q.id}`)}
                          >
                            <span>View Certificate</span>
                            <Award size={13} />
                          </Button>
                        ) : null;
                      })()}
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      disabled
                      className="w-full text-xs py-2 bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)]"
                    >
                      Quiz Closed
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && quizzes.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl px-4 py-3 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)]">Items per page:</span>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className="pl-2 pr-6 py-1 text-xs bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-lg text-[var(--text-primary)] cursor-pointer"
            >
              {[10, 20, 50, 100].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <Pagination
              page={page + 1}
              totalPages={totalPages}
              total={totalElements}
              limit={size}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
        </div>
      )}
    </Layout>
  );
};
