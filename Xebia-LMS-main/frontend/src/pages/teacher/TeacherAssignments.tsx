import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, Filter, ChevronDown, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { EmptyState } from '../../components/shared/EmptyState';
import { Pagination } from '../../components/shared/Pagination';
import { TableRowSkeleton } from '../../components/shared/LoadingSkeleton';
import { Modal } from '../../components/ui/Modal';
import { teacherService } from '../../services/teacher.service';
import { formatDate, getDueDateCountdown, getDueDateColor, isOverdue } from '../../utils/helpers';
import type { Assignment, PaginationMeta } from '../../types';

const SUBJECTS = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Geography', 'Economics', 'Other'];

export const TeacherAssignments: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [deleteModal, setDeleteModal] = useState<Assignment | null>(null);
  const [deleting, setDeleting] = useState(false);

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
      const res = await teacherService.getAssignments(params);
      setAssignments(res.assignments);
      setTotalPages(res.pagination.totalPages);
      setTotalElements(res.pagination.total);
    } catch {
      toast.error('Failed to load assignments.');
    } finally {
      setLoading(false);
    }
  }, [search, subjectFilter, statusFilter, page, size]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await teacherService.deleteAssignment(deleteModal.id);
      toast.success('Assignment deleted.');
      setDeleteModal(null);
      fetchAssignments();
    } catch {
      toast.error('Failed to delete assignment.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout role="teacher" title="Assignments" subtitle="Create and manage your assignments">
      {/* Top Bar */}
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

        <div className="flex gap-2 shrink-0 flex-wrap">
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
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => navigate('/teacher/assignments/create')}
          >
            New Assignment
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--brand-border)]">
                {['Assignment', 'Subject', 'Due Date', 'Students', 'Submitted', 'Pending', 'Status', 'Actions'].map((h) => (
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
                    <EmptyState
                      icon="file"
                      title="No assignments yet"
                      description="Create your first assignment to get started."
                      action={{ label: 'Create Assignment', onClick: () => navigate('/teacher/assignments/create') }}
                    />
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
                          <span className="text-sm font-medium text-[var(--text-primary)] max-w-[160px] truncate">{a.title}</span>
                          {a.assignmentType === 'QUIZ' && (
                            <span className="self-start text-[9px] uppercase font-black text-[#4A1F4F] dark:text-purple-400 bg-[#F5EAF8] dark:bg-purple-950/20 px-1 rounded mt-0.5">Quiz</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-[var(--text-secondary)] bg-slate-100 dark:bg-slate-700 rounded-full px-2 py-0.5">{a.subject}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-[var(--text-primary)]">{formatDate(a.dueDate)}</p>
                      <p className={`text-[10px] font-medium mt-0.5 ${getDueDateColor(a.dueDate)}`}>
                        {getDueDateCountdown(a.dueDate)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[var(--text-secondary)]">{a.totalStudents ?? '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-[var(--text-secondary)]">{a.submittedCount ?? 0}</td>
                    <td className="px-4 py-3.5 text-sm text-[var(--text-secondary)]">{a.pendingCount ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={a.status as any} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/teacher/submitted?assignment=${a.id}`}
                          title="View Submissions"
                          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-blue-50 hover:text-[#2563EB] dark:hover:bg-blue-500/10 transition-colors"
                        >
                          <Eye size={15} />
                        </Link>
                        <Link
                          to={`/teacher/assignments/edit/${a.id}`}
                          title="Edit"
                          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-500/10 transition-colors"
                        >
                          <Edit size={15} />
                        </Link>
                        <button
                          title="Delete"
                          onClick={() => setDeleteModal(a)}
                          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[#F5EAF8] hover:text-red-500 dark:hover:bg-[#F5EAF8]0/10 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
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

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Assignment"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5EAF8] dark:bg-[#F5EAF8]0/10 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm text-[var(--text-primary)]">
              Are you sure you want to delete <strong>"{deleteModal?.title}"</strong>?
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              This will also delete all student submissions. This action cannot be undone.
            </p>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
