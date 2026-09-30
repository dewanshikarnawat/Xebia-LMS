import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useEvents } from './EventsContext';
import { useToast } from '@/hooks-lms/useToast';
import { ArrowLeft, Search, Eye, CheckCircle2, XCircle, ChevronLeft, ChevronRight, ChevronRight as BreadcrumbRight } from 'lucide-react';

export default function AdminEnrollmentsPage() {
  const navigate = useNavigate();
  const { events, registrations, updateEnrollmentStatus } = useEvents();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterEvent, setFilterEvent] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAttendance, setFilterAttendance] = useState('All');
  const [sortField, setSortField] = useState('enrollmentDateTime');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected registration for View Modal
  const [selectedReg, setSelectedReg] = useState(null);

  const getEventDate = (eventId) => {
    const ev = events.find((e) => String(e.id) === String(eventId));
    return ev && ev.eventDate ? new Date(ev.eventDate).toLocaleDateString() : 'N/A';
  };

  const handleAction = async (id, type, value, label) => {
    await updateEnrollmentStatus(id, type, value);
    showToast(`Roster updated: ${label}`, 'success');
    if (selectedReg && String(selectedReg.id) === String(id)) {
      setSelectedReg((prev) => ({ ...prev, [type]: value }));
    }
  };

  const uniqueEventNames = useMemo(() => {
    const names = new Set(events.map((ev) => ev.title));
    return ['All', ...Array.from(names)];
  }, [events]);

  // Processed list (Search, Filter, Sort)
  const processedRegs = useMemo(() => {
    let result = registrations.map((reg) => ({
      ...reg,
      eventName: reg.eventTitle || reg.eventName || 'Event',
      studentId: reg.studentId || reg.batchName || 'STU-N/A',
      enrollmentStatus: reg.status || reg.enrollmentStatus || 'REGISTERED',
      enrollmentDateTime: reg.registrationDate || reg.enrollmentDateTime || new Date().toISOString(),
      attendanceStatus: reg.attendanceStatus || 'Pending',
      eventDate: getEventDate(reg.eventId),
    }));

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (reg) =>
          reg.studentName.toLowerCase().includes(q) ||
          reg.studentEmail.toLowerCase().includes(q) ||
          reg.studentId.toLowerCase().includes(q) ||
          reg.eventName.toLowerCase().includes(q)
      );
    }

    // Event filter
    if (filterEvent !== 'All') {
      result = result.filter((reg) => reg.eventName === filterEvent);
    }

    // Status filter
    if (filterStatus !== 'All') {
      result = result.filter((reg) => reg.enrollmentStatus === filterStatus);
    }

    // Attendance filter
    if (filterAttendance !== 'All') {
      result = result.filter((reg) => reg.attendanceStatus === filterAttendance);
    }

    // Sort
    result.sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';

      if (sortField === 'enrollmentDateTime') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else {
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [registrations, events, searchQuery, filterEvent, filterStatus, filterAttendance, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(processedRegs.length / itemsPerPage) || 1;
  const paginatedRegs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedRegs.slice(startIndex, startIndex + itemsPerPage);
  }, [processedRegs, currentPage]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, processedRegs.length);

  return (
    <div className="flex min-h-screen flex-col bg-brand-surface text-brand-text-primary transition-colors duration-200">
      
      {/* 1. Page Header (Full-Width, aligned with rest of portal) */}
      <div className="flex items-center justify-between px-8 py-5 bg-white dark:bg-slate-900 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/events')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-205 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <span>Events</span>
              <BreadcrumbRight className="h-2.5 w-2.5" />
              <span className="text-[#6C1D5F] dark:text-purple-400">Enrollments</span>
            </div>
            
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Event Enrollments</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track student admissions, approve registers, and manage attendance status.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Content Area (Aligned padding: 32px px-8, 28px py-7) */}
      <div className="flex-1 px-8 py-7 space-y-6">
        
        {/* Filter Control Box */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-202 dark:border-slate-800 shadow-sm space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search by student or event..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-xs font-semibold text-slate-700 dark:text-white placeholder-slate-400 focus:border-[#6C1D5F] focus:outline-none"
              />
            </div>

            {/* Event Filter */}
            <div className="space-y-1">
              <select
                value={filterEvent}
                onChange={(e) => {
                  setFilterEvent(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-705 dark:text-white focus:border-[#6C1D5F] focus:outline-none"
              >
                <option disabled>Select Event Filter</option>
                {uniqueEventNames.map((name) => (
                  <option key={name} value={name}>
                    {name === 'All' ? 'All Events' : name}
                  </option>
                ))}
              </select>
            </div>

            {/* Enrollment Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-705 dark:text-white focus:border-[#6C1D5F] focus:outline-none"
              >
                <option value="All">All Enrollment Statuses</option>
                <option value="Enrolled">Enrolled</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Attendance Status Filter */}
            <div>
              <select
                value={filterAttendance}
                onChange={(e) => {
                  setFilterAttendance(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-705 dark:text-white focus:border-[#6C1D5F] focus:outline-none"
              >
                <option value="All">All Attendance Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Roster Table */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-202 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto animate-fade-in">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-700 dark:hover:text-white select-none" onClick={() => handleSort('studentName')}>
                    Student Name
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-700 dark:hover:text-white select-none" onClick={() => handleSort('studentId')}>
                    Student ID
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-700 dark:hover:text-white select-none" onClick={() => handleSort('eventName')}>
                    Event / Workshop
                  </th>
                  <th className="py-4 px-6">
                    Enrollment Date
                  </th>
                  <th className="py-4 px-6">
                    Status
                  </th>
                  <th className="py-4 px-6">
                    Attendance
                  </th>
                  <th className="py-4 px-6 text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-350">
                {paginatedRegs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-950/10">
                      No matching enrollments found.
                    </td>
                  </tr>
                ) : (
                  paginatedRegs.map((reg) => {
                    const statusColors = {
                      Enrolled: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
                      Approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
                      Rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
                      Cancelled: 'bg-slate-105 text-slate-550 dark:bg-slate-800/60 dark:text-slate-400',
                      REGISTERED: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
                      APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
                      REJECTED: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
                      CANCELLED: 'bg-slate-105 text-slate-550 dark:bg-slate-800/60 dark:text-slate-400',
                    };

                    const attendanceColors = {
                      Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
                      Present: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
                      Absent: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
                    };

                    return (
                      <tr key={reg.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 dark:text-white">{reg.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{reg.studentEmail}</div>
                        </td>
                        <td className="py-4 px-6 font-mono text-[11px]">{reg.studentId}</td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{reg.eventName}</div>
                          <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                            Date: <span className="text-purple-650">{reg.eventDate}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                          {new Date(reg.enrollmentDateTime).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${statusColors[reg.enrollmentStatus] || ''}`}>
                            {reg.enrollmentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${attendanceColors[reg.attendanceStatus] || ''}`}>
                            {reg.attendanceStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setSelectedReg(reg)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-650 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>

                            {reg.enrollmentStatus === 'Enrolled' && (
                              <>
                                <button
                                  onClick={() => handleAction(reg.id, 'enrollmentStatus', 'Approved', 'Enrollment Approved')}
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-650 transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleAction(reg.id, 'enrollmentStatus', 'Rejected', 'Enrollment Rejected')}
                                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                                  title="Reject"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}

                            {reg.enrollmentStatus === 'Approved' && (
                              <div className="flex gap-0.5 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-950">
                                <button
                                  onClick={() => handleAction(reg.id, 'attendanceStatus', 'Present', 'Marked Present')}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase transition-all ${
                                    reg.attendanceStatus === 'Present'
                                      ? 'bg-emerald-500 text-white shadow-sm'
                                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                                  }`}
                                >
                                  P
                                </button>
                                <button
                                  onClick={() => handleAction(reg.id, 'attendanceStatus', 'Absent', 'Marked Absent')}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase transition-all ${
                                    reg.attendanceStatus === 'Absent'
                                      ? 'bg-rose-500 text-white shadow-sm'
                                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                                  }`}
                                >
                                  A
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {processedRegs.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 gap-4">
              <div>
                Showing <span className="font-bold text-slate-800 dark:text-white">{startIndex}</span> to{' '}
                <span className="font-bold text-slate-800 dark:text-white">{endIndex}</span> of{' '}
                <span className="font-bold text-slate-800 dark:text-white">{processedRegs.length}</span> enrollments
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-655 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-bold px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-655 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Detail Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Enrollment Details</h3>
              <button
                onClick={() => setSelectedReg(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-400">Student Name:</span>
                <span className="col-span-2 font-bold text-slate-900 dark:text-white">{selectedReg.studentName}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-400">Student ID:</span>
                <span className="col-span-2 font-mono">{selectedReg.studentId}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-400">Email:</span>
                <span className="col-span-2 font-mono">{selectedReg.studentEmail}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-400">Workshop:</span>
                <span className="col-span-2 font-bold text-slate-850 dark:text-slate-200">{selectedReg.eventName}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-400">Event Date:</span>
                <span className="col-span-2 text-[#6C1D5F] font-bold">{selectedReg.eventDate}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-400">Enrollment Date:</span>
                <span className="col-span-2">{new Date(selectedReg.enrollmentDateTime).toLocaleString()}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-400">Status:</span>
                <span className="col-span-2 font-extrabold text-[#6C1D5F]">{selectedReg.enrollmentStatus}</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <span className="text-slate-400">Attendance:</span>
                <span className="col-span-2 font-extrabold text-amber-600">{selectedReg.attendanceStatus}</span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-150 dark:border-slate-800">
              <button
                onClick={() => setSelectedReg(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
