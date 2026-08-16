import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Filter, Loader2, MessageSquare, Clock, ShieldAlert } from 'lucide-react';
import { studentService } from '../../services/student.service';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { Pagination } from '../../components/shared/Pagination';

export const AdminCourseEnrollmentsPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [submittingId, setSubmittingId] = useState<number | string | null>(null);
  
  // Remarks Modal/Prompt state
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);
  const [remarks, setRemarks] = useState('');
  const [modalAction, setModalAction] = useState<'APPROVE' | 'REJECT' | null>(null);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const apiStatus = statusFilter === 'ALL' ? undefined : statusFilter;
      const res = await studentService.getCourseEnrollments(apiStatus, page, pageSize);
      const data = res?.data || res;
      setEnrollments(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Error fetching enrollments:', err);
      toast.error('Failed to retrieve enrollment requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [statusFilter, page, pageSize]);

  const handleActionClick = (enrollment: any, action: 'APPROVE' | 'REJECT') => {
    setSelectedEnrollment(enrollment);
    setRemarks('');
    setModalAction(action);
  };

  const handleConfirmAction = async () => {
    if (!selectedEnrollment || !modalAction) return;
    
    setSubmittingId(selectedEnrollment.id);
    const actionName = modalAction.toLowerCase();
    
    try {
      if (modalAction === 'APPROVE') {
        await studentService.approveCourseEnrollment(selectedEnrollment.id, remarks);
        toast.success('Enrollment request approved successfully!');
      } else {
        await studentService.rejectCourseEnrollment(selectedEnrollment.id, remarks);
        toast.success('Enrollment request rejected successfully.');
      }
      setSelectedEnrollment(null);
      setModalAction(null);
      fetchEnrollments();
    } catch (err: any) {
      console.error(`Error performing ${actionName}:`, err);
      toast.error(err.response?.data?.message || `Failed to ${actionName} enrollment.`);
    } finally {
      setSubmittingId(null);
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
        return 'approved';
      case 'REJECTED':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800 dark:text-slate-100 min-h-[calc(100vh-100px)]">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-[#4a1e47] dark:text-purple-400" />
            Course Enrollment Requests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review, approve, or reject student requests to access catalog courses.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5" /> Filter Status:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold outline-none focus:border-[#4a1e47]"
          >
            <option value="ALL">All Requests</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 text-[#4a1e47] animate-spin" />
            <p className="text-xs text-slate-400 font-bold">Fetching enrollment requests...</p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="p-20 text-center max-w-sm mx-auto space-y-3">
            <Clock className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="text-sm font-bold">No Requests Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              There are no course enrollment requests in this status category.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-slate-450 dark:text-slate-500 text-[10px] font-extrabold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th className="px-6 py-4">Student Details</th>
                  <th className="px-6 py-4">Requested Course</th>
                  <th className="px-6 py-4">Request Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Remarks</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-semibold">
                {enrollments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                    <td className="px-6 py-4.5">
                      <p className="font-bold text-slate-900 dark:text-white">{item.studentName || 'Unknown Student'}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{item.studentEmail}</p>
                    </td>
                    <td className="px-6 py-4.5">
                      <p className="font-bold text-slate-850 dark:text-slate-200">{item.courseName}</p>
                    </td>
                    <td className="px-6 py-4.5 text-slate-500 dark:text-slate-400">
                      {item.enrollmentDate ? new Date(item.enrollmentDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4.5">
                      <Badge variant={getBadgeVariant(item.status)} />
                    </td>
                    <td className="px-6 py-4.5 max-w-xs truncate text-slate-500 dark:text-slate-400" title={item.remarks}>
                      {item.remarks || <span className="text-[10px] text-slate-350 dark:text-slate-650">—</span>}
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      {item.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleActionClick(item, 'APPROVE')}
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 text-emerald-600 rounded-lg transition-colors cursor-pointer"
                            title="Approve Request"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleActionClick(item, 'REJECT')}
                            className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="Reject Request"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800 p-4 sm:flex-row bg-slate-50 dark:bg-slate-950 text-xs select-none">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-450">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
                className="rounded-lg border border-slate-250 dark:border-slate-850 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
              >
                {[10, 20, 50, 100].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Pagination
              page={page + 1}
              totalPages={totalPages}
              total={totalElements}
              limit={pageSize}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                {modalAction === 'APPROVE' ? (
                  <span className="text-emerald-500">Approve Enrollment</span>
                ) : (
                  <span className="text-red-500">Reject Enrollment</span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Confirm your decision for <strong>{selectedEnrollment.studentName}</strong>'s request to enroll in <strong>{selectedEnrollment.courseName}</strong>.
              </p>
            </div>

            {/* Remarks Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> Add Remarks / Feedback (Optional)
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Write optional review feedback or guidelines here..."
                rows={3}
                className="w-full text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl p-3 outline-none focus:border-[#4a1e47] text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSelectedEnrollment(null); setModalAction(null); }}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant={modalAction === 'APPROVE' ? 'success' : 'danger'}
                size="sm"
                onClick={handleConfirmAction}
                loading={submittingId === selectedEnrollment.id}
                className="cursor-pointer"
              >
                Confirm {modalAction === 'APPROVE' ? 'Approval' : 'Rejection'}
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
