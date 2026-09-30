import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, BookOpen, AlertCircle, Eye, LayoutGrid, List, FileText, Award } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/shared/EmptyState';
import { AssignmentCardSkeleton, TableRowSkeleton } from '../../components/shared/LoadingSkeleton';
import { Pagination } from '../../components/shared/Pagination';
import { studentService } from '../../services/student.service';
import { certificateService } from '../../services/certificate.service';
import type { Certificate } from '../../services/certificate.service';
import { CongratulatoryPopup } from '../../components/shared/CongratulatoryPopup';
import {
  formatDate,
  getDueDateCountdown,
  getDueDateColor,
  isOverdue,
  truncate,
  getInitials,
} from '../../utils/helpers';
import type { Assignment, PaginationMeta } from '../../types';

const SUBJECTS = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Geography', 'Economics', 'Other'];
const STATUS_FILTERS = [
  { value: '', label: 'All Status' },
  { value: 'not_submitted', label: 'Not Submitted' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'reviewed', label: 'Reviewed' },
];

export const StudentAssignments: React.FC = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [certificates, setCertificates] = useState<Record<string, string>>({});
  const [showCongrats, setShowCongrats] = useState(false);
  const [activeCert, setActiveCert] = useState<Certificate | null>(null);

  useEffect(() => {
    certificateService.getMyCertificates().then(certs => {
      const mapping: Record<string, string> = {};
      certs.forEach(c => {
        if (c.assignmentId) mapping[`assignment-${c.assignmentId}`] = c.certificateUrl;
        if (c.quizId) mapping[`quiz-${c.quizId}`] = c.certificateUrl;
      });
      setCertificates(mapping);

      const unshown = certs.find(c => c.certificateType === 'ASSIGNMENT' && !localStorage.getItem(`lms_cert_shown_asg_${c.id}`));
      if (unshown) {
        setActiveCert(unshown);
        setShowCongrats(true);
        localStorage.setItem(`lms_cert_shown_asg_${unshown.id}`, 'true');
      }
    }).catch(err => console.error("Error loading certificates", err));
  }, []);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { 
        page: String(page + 1), 
        limit: String(size),
        assignmentType: 'ASSIGNMENT'
      };
      if (search) params.search = search;
      if (subjectFilter) params.subject = subjectFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await studentService.getAssignments(params);
      setAssignments(res.assignments);
      setTotalPages(res.pagination.totalPages);
      setTotalElements(res.pagination.total);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [search, subjectFilter, statusFilter, page, size]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const getStatusBadgeVariant = (a: Assignment) => {
    if (isOverdue(a.dueDate) && a.submissionStatus === 'not_submitted') return 'overdue';
    return (a.submissionStatus || 'not_submitted') as any;
  };

  return (
    <Layout role="student" title="Assignments" subtitle="View and submit your assignments">
      {/* Top Bar - Identical layout & styling to Teacher Assignments */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search assignments..."
            className="w-full search-bar-modern"
          />
        </div>

        <div className="flex gap-2 shrink-0 flex-wrap items-center">
          <select
            value={subjectFilter}
            onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
            className="pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl text-[var(--text-primary)] cursor-pointer appearance-none"
          >
            {SUBJECTS.map((s) => <option key={s} value={s === 'All' ? '' : s}>{s}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl text-[var(--text-primary)] cursor-pointer appearance-none"
          >
            {STATUS_FILTERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#4A1F4F] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#4A1F4F] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--brand-border)]">
                  {['Assignment', 'Subject', 'Teacher', 'Due Date', 'Max Marks', 'Status', 'Your Score', 'Action'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--brand-border)]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
                ) : assignments.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState icon="file" title="No assignments found" description="No published assignments match your current filters." />
                    </td>
                  </tr>
                ) : (
                  assignments.map((a) => (
                    <tr key={a.id} className="table-row-hover">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#F5EAF8]0/10 flex items-center justify-center shrink-0">
                            <FileText size={13} className="text-[#4A1F4F] dark:text-purple-400" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-[var(--text-primary)] max-w-[180px] truncate block">{a.title}</span>
                            <div className="flex gap-1.5 items-center mt-0.5">
                              {a.assignmentType === 'QUIZ' && (
                                <span className="text-[9px] uppercase font-black text-[#4A1F4F] dark:text-purple-400 bg-[#F5EAF8] dark:bg-purple-950/20 px-1 rounded">Quiz</span>
                              )}
                              {a.topic && <span className="text-[10px] text-[#2563EB] font-semibold">{a.topic}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-[var(--text-secondary)] bg-slate-100 dark:bg-slate-700 rounded-full px-2 py-0.5">{a.subject}</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[var(--text-secondary)]">{a.teacher?.name}</td>
                      <td className="px-4 py-3.5">
                        <p className="text-xs text-[var(--text-primary)]">{formatDate(a.dueDate)} • {a.dueTime || '23:59:00'}</p>
                        <p className={`text-[10px] font-medium mt-0.5 ${getDueDateColor(a.dueDate)}`}>
                          {getDueDateCountdown(a.dueDate)}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-semibold text-[#4A1F4F] dark:text-purple-300">{a.maxMarks}</td>
                      <td className="px-4 py-3.5">
                        <Badge variant={getStatusBadgeVariant(a)} />
                      </td>
                      <td className="px-4 py-3.5">
                        {a.submission && a.submission.status === 'reviewed' && a.submission.marks !== null ? (
                          <span className="text-sm font-bold text-[#2563EB]">
                            {a.submission.marks}/{a.maxMarks}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--text-secondary)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/student/assignments/${a.id}`)}
                            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[#F5EAF8] hover:text-[#4A1F4F] dark:hover:bg-[#F5EAF8]0/10 transition-colors cursor-pointer"
                            title="View Assignment Detail"
                          >
                            <Eye size={15} />
                          </button>
                          {(() => {
                            const isEligible = a.submission && 
                                               (a.submission.status === 'reviewed' || a.submission.status === 'submitted') && 
                                               a.submission.marks !== null && 
                                               a.submission.marks !== undefined && 
                                               a.submission.marks >= (a.passingMarks || 0);
                            return isEligible ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/student/certificates/preview/${a.id}`);
                                }}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors cursor-pointer"
                                title="View Certificate"
                              >
                                <Award size={15} />
                              </button>
                            ) : null;
                          })()}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && assignments.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-[var(--brand-border)] px-4 py-3 gap-3">
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
        </div>
      ) : (
        /* Grid View */
        <>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <AssignmentCardSkeleton key={i} />)}
            </div>
          ) : assignments.length === 0 ? (
            <EmptyState icon="inbox" title="No assignments found" description="No assignments match your current filters." />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {assignments.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => navigate(`/student/assignments/${a.id}`)}
                    className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl p-5 card-hover group cursor-pointer flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] line-clamp-2 group-hover:text-[#4A1F4F] dark:group-hover:text-purple-300 transition-colors">
                          {a.title}
                        </h3>
                        {a.assignmentType === 'QUIZ' && (
                          <span className="inline-block text-[9px] uppercase font-black text-[#4A1F4F] dark:text-purple-400 bg-[#F5EAF8] dark:bg-purple-950/20 px-1 rounded mt-1">Quiz</span>
                        )}
                      </div>
                      <Badge variant={getStatusBadgeVariant(a)} />
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                        <BookOpen size={12} />
                        {a.subject}
                      </span>
                      {a.topic && (
                        <span className="text-[10px] font-bold text-[#2563EB] bg-blue-500/10 px-2 py-0.5 rounded-md">
                          Topic: {a.topic}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4 flex-1">
                      {truncate(a.description, 120)}
                    </p>

                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[var(--brand-border)]">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4A1F4F] to-[#622865] flex items-center justify-center text-white text-[9px] font-bold">
                        {getInitials(a.teacher?.name || 'T')}
                      </div>
                      <span className="text-xs text-[var(--text-secondary)]">{a.teacher?.name}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-[var(--text-secondary)]">Due: {formatDate(a.dueDate)} • {a.dueTime || '23:59:00'}</p>
                        <p className={`text-xs font-medium ${getDueDateColor(a.dueDate)}`}>
                          <Clock size={10} className="inline mr-1" />
                          {getDueDateCountdown(a.dueDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--text-secondary)]">Max Marks</p>
                        <p className="text-sm font-bold text-[#4A1F4F] dark:text-purple-300">{a.maxMarks}</p>
                      </div>
                    </div>

                    {a.submission && a.submission.status === 'reviewed' && a.submission.marks !== null && (
                      <div className="mt-3 pt-3 border-t border-[var(--brand-border)] font-sans">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[var(--text-secondary)]">Your Score</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#2563EB]">
                              {a.submission.marks}/{a.maxMarks}
                            </span>
                            {(() => {
                              const isEligible = a.submission && 
                                                 (a.submission.status === 'reviewed' || a.submission.status === 'submitted') && 
                                                 a.submission.marks !== null && 
                                                 a.submission.marks !== undefined && 
                                                 a.submission.marks >= (a.passingMarks || 0);
                              return isEligible ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/student/certificates/preview/${a.id}`);
                                  }}
                                  className="p-1 rounded bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                  title="View Certificate"
                                >
                                  <Award size={12} />
                                  <span>Cert</span>
                                </button>
                              ) : null;
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!loading && assignments.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl px-4 py-3 gap-3">
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
            </>
          )}
        </>
      )}
      {activeCert && (
        <CongratulatoryPopup
          isOpen={showCongrats}
          onClose={() => setShowCongrats(false)}
          certificate={activeCert}
          activityTitle={activeCert.assignmentTitle || activeCert.assignmentName || 'Assignment'}
          score={activeCert.marks}
          maxScore={activeCert.marks >= 100 ? activeCert.marks : 100}
          assignmentOrQuizId={String(activeCert.assignmentId || activeCert.quizId || activeCert.id)}
        />
      )}
    </Layout>
  );
};
