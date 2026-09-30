import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEvents } from './EventsContext';
import api from '../../services-lms/api';
import { ArrowLeft, Search, Download, ArrowUpDown, ChevronLeft, ChevronRight, ChevronRight as BreadcrumbRight, X, User } from 'lucide-react';
import { useToast } from '@/hooks-lms/useToast';

export default function AdminRegistrationsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events } = useEvents();
  const { showToast } = useToast();

  const event = useMemo(() => {
    return events.find((ev) => String(ev.id) === String(id));
  }, [events, id]);

  const [eventRegs, setEventRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // default sort desc by registration date
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReg, setSelectedReg] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/events/${id}/registrations?size=1000`);
        if (res.data && res.data.data && res.data.data.content) {
          setEventRegs(res.data.data.content);
        } else {
          setEventRegs([]);
        }
      } catch (err) {
        console.error('Failed to fetch registrations:', err);
        showToast('Failed to load registrations.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, [id]);

  const handleSort = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await api.get(`/events/${id}/registrations/export`, {
        responseType: 'blob',
      });
      const href = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = href;
      
      const cleanTitle = event ? event.title.replaceAll(' ', '_') : 'Event';
      link.setAttribute('download', `${cleanTitle}_Registrations.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      showToast('CSV downloaded successfully!', 'success');
    } catch (err) {
      console.error('Failed to export registrations:', err);
      showToast('Failed to download CSV.', 'error');
    }
  };

  // Filter & Sort
  const processedRegs = useMemo(() => {
    let mapped = eventRegs.map((reg) => ({
      ...reg,
      email: reg.studentEmail || reg.email || '',
      studentId: reg.studentId || 'N/A',
      registrationDateFormatted: reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString() : 'N/A',
    }));

    let result = [...mapped];

    // Search filter: Student Name, Email, Batch
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (reg) =>
          (reg.studentName && reg.studentName.toLowerCase().includes(query)) ||
          (reg.email && reg.email.toLowerCase().includes(query)) ||
          (reg.batchName && reg.batchName.toLowerCase().includes(query))
      );
    }

    // Sort by registration date
    result.sort((a, b) => {
      const valA = a.registrationDate ? new Date(a.registrationDate).getTime() : 0;
      const valB = b.registrationDate ? new Date(b.registrationDate).getTime() : 0;

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [eventRegs, searchQuery, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(processedRegs.length / itemsPerPage) || 1;
  const paginatedRegs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedRegs.slice(startIndex, startIndex + itemsPerPage);
  }, [processedRegs, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, processedRegs.length);

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Event Not Found</h2>
        <button onClick={() => navigate('/admin/events')} className="mt-4 text-purple-650 font-bold hover:underline">
          Return to Events
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-brand-surface text-brand-text-primary transition-colors duration-200">
      
      {/* 1. Page Header */}
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
              <span className="text-[#6C1D5F] dark:text-purple-400">Registrations</span>
            </div>
            
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{event.title} - Registrations</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Review student attendance and registration rosters.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="flex-1 px-8 py-7 space-y-6">
        
        {/* Controls: Search and Export */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-202 dark:border-slate-800 shadow-sm">
          <div className="relative max-w-sm w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search by student name, email, batch..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-xs font-semibold text-slate-700 dark:text-white placeholder-slate-400 focus:border-[#6C1D5F] focus:outline-none"
            />
          </div>

          <button
            onClick={handleDownloadCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            title="Download CSV"
          >
            <Download className="h-4 w-4" /> Download CSV
          </button>
        </div>

        {/* Registrations Table */}
        <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-202 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-wider">
                Loading event registrations...
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Student Name</th>
                    <th className="py-4 px-6">Email Address</th>
                    <th className="py-4 px-6">Student ID</th>
                    <th className="py-4 px-6">Batch</th>
                    <th className="py-4 px-6">Course</th>
                    <th className="py-4 px-6 cursor-pointer hover:text-slate-700 dark:hover:text-white select-none" onClick={handleSort}>
                      <div className="flex items-center gap-1.5">
                        Registration Date <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="py-4 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold text-slate-705 dark:text-slate-300">
                  {paginatedRegs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-950/10">
                        No registrations found.
                      </td>
                    </tr>
                  ) : (
                    paginatedRegs.map((reg) => {
                      const statusColors = {
                        REGISTERED: 'bg-blue-105 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
                        APPROVED: 'bg-emerald-105 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
                        REJECTED: 'bg-rose-105 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
                        CANCELLED: 'bg-slate-105 text-slate-550 dark:bg-slate-800/60 dark:text-slate-400',
                      };

                      return (
                        <tr 
                          key={reg.id} 
                          onClick={() => setSelectedReg(reg)}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer"
                        >
                          <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{reg.studentName}</td>
                          <td className="py-4 px-6 font-mono text-[11px] text-slate-500 dark:text-slate-400">{reg.email}</td>
                          <td className="py-4 px-6">{reg.studentId}</td>
                          <td className="py-4 px-6 text-slate-550 dark:text-slate-350">{reg.batchName || 'N/A'}</td>
                          <td className="py-4 px-6 text-slate-550 dark:text-slate-350 truncate max-w-[150px]">{reg.courses || 'None'}</td>
                          <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{reg.registrationDateFormatted}</td>
                          <td className="py-4 px-6">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${statusColors[reg.status] || 'bg-slate-100 text-slate-700'}`}>
                              {reg.status || 'REGISTERED'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Info Footer */}
          {!loading && processedRegs.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 gap-4">
              <div>
                Showing <span className="font-bold text-slate-800 dark:text-white">{startIndex}</span> to{' '}
                <span className="font-bold text-slate-800 dark:text-white">{endIndex}</span> of{' '}
                <span className="font-bold text-slate-800 dark:text-white">{processedRegs.length}</span> registrations
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

      {/* Roster Registration Details Modal */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <User className="h-5 w-5 text-[#6C1D5F]" /> Registration Details
              </h3>
              <button
                onClick={() => setSelectedReg(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
              <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-850">
                <span className="text-slate-400 font-normal">Student Name</span>
                <span className="text-slate-900 dark:text-white font-bold">{selectedReg.studentName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-850">
                <span className="text-slate-400 font-normal">Email Address</span>
                <span className="text-slate-900 dark:text-white font-bold">{selectedReg.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-850">
                <span className="text-slate-400 font-normal">Student ID</span>
                <span className="text-slate-900 dark:text-white font-bold">{selectedReg.studentId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-850">
                <span className="text-slate-400 font-normal">Batch</span>
                <span className="text-slate-900 dark:text-white font-bold">{selectedReg.batchName || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-850">
                <span className="text-slate-400 font-normal">Course</span>
                <span className="text-slate-900 dark:text-white font-bold max-w-[200px] text-right truncate" title={selectedReg.courses}>
                  {selectedReg.courses || 'None'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-850">
                <span className="text-slate-400 font-normal">Phone Number</span>
                <span className="text-slate-900 dark:text-white font-bold">{selectedReg.phone || 'Not Available'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-850">
                <span className="text-slate-400 font-normal">Registration Date</span>
                <span className="text-slate-900 dark:text-white font-bold">{selectedReg.registrationDateFormatted}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-850">
                <span className="text-slate-400 font-normal">Status</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-purple-100 text-purple-800">
                  {selectedReg.status || 'REGISTERED'}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setSelectedReg(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
