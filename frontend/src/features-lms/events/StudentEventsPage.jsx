import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from './EventsContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks-lms/useToast';
import { Calendar, Clock, MapPin, Search, CheckCircle, ArrowRight } from 'lucide-react';
import Button from '@/components/ui-lms/Button';
import { Pagination } from '@/components/shared/Pagination';

export default function StudentEventsPage() {
  const navigate = useNavigate();
  const { fetchEventsPage, registerForEvent, isRegistered, cancelEnrollment } = useEvents();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [eventsList, setEventsList] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      const data = await fetchEventsPage(page, size, 'createdAt', 'desc', searchQuery, true);
      setEventsList(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  }, [page, size, searchQuery, fetchEventsPage]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filteredEvents = eventsList;

  const handleRegister = async (eventId, title) => {
    if (!user) {
      showToast('You must be logged in to register.', 'error');
      return;
    }
    const success = await registerForEvent(eventId);
    if (success) {
      showToast(`Successfully enrolled in "${title}"!`, 'success');
    } else {
      showToast('Registration failed or already registered.', 'error');
    }
  };

  const handleCancel = async (eventId, title) => {
    if (!user) return;
    if (window.confirm(`Are you sure you want to cancel your enrollment for "${title}"?`)) {
      await cancelEnrollment(eventId, user.email);
      showToast(`Enrollment for "${title}" cancelled.`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="rounded-[24px] bg-gradient-to-r from-purple-900 to-indigo-950 p-6 md:p-8 text-white relative overflow-hidden shadow-md">
        <div className="relative z-10 space-y-2 max-w-lg">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-white/20 tracking-wider">
            Xebia Workshops
          </span>
          <h1 className="text-xl md:text-2xl font-black">Xebia Events & Masterclasses</h1>
          <p className="text-xs text-purple-200 leading-relaxed">
            Enhance your career. Join interactive coding bootcamps, architectural summits, and system-design events led by Xebia specialists.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-6 translate-x-6 shrink-0 select-none">
          <Calendar className="h-64 w-64" />
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-slate-400" />
        </span>
        <input
          type="text"
          placeholder="Search upcoming events..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
        />
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/10">
          <Calendar className="h-10 w-10 text-slate-350 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-white">No Upcoming Events</h3>
          <p className="text-xs text-slate-455 mt-1">There are no matching events scheduled at this moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((ev) => {
            const registered = isRegistered(ev.id, user?.email);

            return (
              <div
                key={ev.id}
                className="overflow-hidden rounded-[24px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Banner Photo */}
                  <div className="relative h-44 bg-slate-900 overflow-hidden">
                    <img
                      src={ev.image || 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=800&auto=format&fit=crop&q=80'}
                      alt={ev.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-[9px] font-extrabold uppercase bg-white/90 text-purple-950 backdrop-blur-md shadow-sm">
                        Masterclass
                      </span>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">{ev.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed h-8">
                      {ev.description || 'No description provided.'}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-850 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                        <span>{ev.eventDate ? new Date(ev.eventDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                        <span>{ev.eventDate ? new Date(ev.eventDate).toLocaleTimeString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Controls */}
                <div className="p-5 pt-0 mt-auto flex flex-col gap-2">
                  {/* Join / Cancel Button */}
                  {registered ? (
                    <div className="flex gap-2 w-full">
                      <button
                        disabled
                        className="flex-1 py-2.5 rounded-xl text-xs font-black bg-emerald-600 text-white border border-transparent opacity-100 cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="h-4 w-4" /> Enrolled
                      </button>
                      <button
                        onClick={() => handleCancel(ev.id, ev.title)}
                        className="px-4 py-2.5 rounded-xl text-xs font-black bg-rose-50 dark:bg-rose-955/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-700 dark:text-rose-400 transition-colors flex items-center justify-center cursor-pointer"
                        title="Cancel Enrollment"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRegister(ev.id, ev.title)}
                      className="w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm bg-[#7C3AED] hover:bg-purple-700 text-white cursor-pointer hover:shadow-md"
                    >
                      Enroll Now
                    </button>
                  )}

                  {/* Details Link */}
                  <button
                    onClick={() => navigate(`/student/events/${ev.id}`)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-black text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    View Agenda Details <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loadingEvents && filteredEvents.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Items per page:</span>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className="pl-2 pr-6 py-1 text-xs bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-white cursor-pointer"
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
  );
}
