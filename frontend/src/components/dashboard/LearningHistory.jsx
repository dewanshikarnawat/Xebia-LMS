import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, Clock, ChevronLeft, ChevronRight, CheckCircle2, PlayCircle, BookOpen, FileText, Award } from 'lucide-react';
import Button from '@/components/ui-lms/Button';

// Icon mapper helper
const getActivityIcon = (act) => {
  const name = act.toLowerCase();
  if (name.includes('started')) return { icon: PlayCircle, color: 'text-blue-500 bg-blue-500/10' };
  if (name.includes('completed')) return { icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10' };
  if (name.includes('watched')) return { icon: PlayCircle, color: 'text-accent-teal bg-accent-teal/10' };
  if (name.includes('opened') || name.includes('pdf')) return { icon: FileText, color: 'text-purple-500 bg-purple-500/10' };
  if (name.includes('submitted')) return { icon: FileText, color: 'text-orange-500 bg-orange-500/10' };
  if (name.includes('attempted') || name.includes('quiz')) return { icon: BookOpen, color: 'text-pink-500 bg-pink-500/10' };
  if (name.includes('earned') || name.includes('certificate')) return { icon: Award, color: 'text-amber-500 bg-amber-500/10' };
  return { icon: BookOpen, color: 'text-slate-500 bg-slate-500/10' };
};

export default function LearningHistory({ history = [], isLoading = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter types unique values
  const activityCategories = [
    { label: 'All Activities', value: 'all' },
    { label: 'Courses Started', value: 'started' },
    { label: 'Lessons Completed', value: 'completed' },
    { label: 'Videos Watched', value: 'watched' },
    { label: 'PDFs Opened', value: 'pdf' },
    { label: 'Assignments Submitted', value: 'submitted' },
    { label: 'Quizzes Attempted', value: 'quiz' },
    { label: 'Certificates Earned', value: 'earned' }
  ];

  // Search & Filter Logic
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // Search matches course name or activity
      const matchesSearch =
        item.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter matches activity type
      const matchesFilter =
        filterType === 'all' ||
        item.activity.toLowerCase().includes(filterType.toLowerCase()) ||
        (filterType === 'pdf' && item.activity.toLowerCase().includes('opened'));

      return matchesSearch && matchesFilter;
    });
  }, [history, searchTerm, filterType]);

  // Reset pagination on filter/search
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  // Pagination calculation
  const totalPages = Math.max(Math.ceil(filteredHistory.length / itemsPerPage), 1);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistory, currentPage]);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-brand-border bg-white p-6 animate-pulse dark:border-slate-800 dark:bg-slate-900">
        <div className="h-10 w-full rounded-xl bg-brand-surface mb-4" />
        <div className="h-64 w-full rounded-xl bg-brand-surface" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-brand-border/70 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900 animate-fade-in"
    >
      <div className="flex flex-col gap-4 border-b border-brand-border/60 pb-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-primary">Audits & Activity</p>
          <h3 className="text-lg font-bold text-brand-text-primary dark:text-slate-100 mt-1">Learning History</h3>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search course or activity..."
              className="w-full rounded-xl border border-brand-border bg-brand-surface px-4 py-2 pl-9 text-xs text-brand-text-primary placeholder-brand-text-secondary shadow-sm transition-colors focus:border-brand-primary dark:border-slate-850 dark:bg-slate-950 md:w-56"
            />
          </div>

          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-text-secondary" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full cursor-pointer rounded-xl border border-brand-border bg-brand-surface px-4 py-2 pl-9 text-xs font-semibold text-brand-text-primary shadow-sm dark:border-slate-850 dark:bg-slate-950"
            >
              {activityCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Responsive Table ── */}
      <div className="mt-6 overflow-hidden">
        {filteredHistory.length === 0 ? (
          <div className="py-12 text-center text-sm text-brand-text-secondary">
            No history log matches your filters.
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full min-w-[600px] border-collapse text-left text-xs text-brand-text-primary dark:text-slate-300">
              <thead>
                <tr className="border-b border-brand-border/60 text-brand-text-secondary font-bold dark:border-slate-800">
                  <th className="pb-3 pr-4 font-bold uppercase tracking-wider">Date</th>
                  <th className="pb-3 pr-4 font-bold uppercase tracking-wider">Course</th>
                  <th className="pb-3 pr-4 font-bold uppercase tracking-wider">Activity</th>
                  <th className="pb-3 pr-4 font-bold uppercase tracking-wider">Duration</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40 dark:divide-slate-800/60">
                {paginatedData.map((item) => {
                  const details = getActivityIcon(item.activity);
                  const Icon = details.icon;
                  return (
                    <tr key={item.id} className="hover:bg-brand-surface/20 dark:hover:bg-slate-800/10">
                      <td className="py-3.5 pr-4 whitespace-nowrap text-brand-text-secondary font-medium">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-brand-text-secondary/70" />
                          {item.date}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 font-bold text-brand-text-primary dark:text-slate-100 max-w-[200px] truncate">
                        {item.course}
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex rounded-lg p-1.5 ${details.color}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="font-semibold text-brand-text-primary dark:text-slate-200">
                            {item.activity}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-brand-text-secondary font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-brand-text-secondary/70" />
                          {item.duration}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-bold whitespace-nowrap">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          item.status.includes('Passed') || item.status.includes('Completed') || item.status.includes('Issued')
                            ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20'
                            : 'bg-brand-primary/10 text-brand-primary'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Table Pagination ── */}
      {filteredHistory.length > itemsPerPage && (
        <div className="mt-6 flex items-center justify-between border-t border-brand-border/60 pt-4 dark:border-slate-800">
          <span className="text-xs text-brand-text-secondary">
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredHistory.length} total activities)
          </span>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              const active = p === currentPage;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                    active
                      ? 'bg-brand-primary text-white'
                      : 'border border-brand-border bg-white text-brand-text-secondary hover:bg-brand-surface dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2 py-1"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

