import { useMemo } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { useEvents } from './EventsContext';
import { ArrowLeft, Calendar, Clock, MapPin, AlertCircle, Bookmark, ChevronRight } from 'lucide-react';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { events } = useEvents();

  const event = useMemo(() => {
    return events.find((ev) => String(ev.id) === String(id));
  }, [events, id]);

  const backUrl = useMemo(() => {
    if (pathname.startsWith('/admin')) return '/admin/events';
    if (pathname.startsWith('/teacher')) return '/teacher/events';
    return '/student/events';
  }, [pathname]);

  if (!event) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Event Not Found</h2>
        <button
          onClick={() => navigate(backUrl)}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-colors"
        >
          Return to Events
        </button>
      </div>
    );
  }

  const isActive = event.status === 'UPCOMING' || event.status === 'ONGOING';

  return (
    <div className="flex min-h-screen flex-col bg-brand-surface text-brand-text-primary transition-colors duration-200">
      
      {/* 1. Page Header (Full-Width, aligned with rest of portal) */}
      <div className="flex items-center justify-between px-8 py-5 bg-white dark:bg-slate-900 border-b border-brand-border">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(backUrl)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-205 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
              <span>Events</span>
              <ChevronRight className="h-2.5 w-2.5" />
              <span className="text-[#6C1D5F] dark:text-purple-400">Details</span>
            </div>
            
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Event Details</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Roster overview and scheduled details for the workshop.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Content Area (Aligned padding: 32px px-8, 28px py-7) */}
      <div className="flex-1 px-8 py-7 bg-brand-surface">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Main Details Card */}
          <div className="overflow-hidden rounded-[32px] border border-slate-202 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg space-y-6">
            
            {/* Banner Area */}
            <div className="relative h-64 md:h-80 bg-slate-900 overflow-hidden">
              <img
                src={event.image || 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=1200&auto=format&fit=crop&q=80'}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              {pathname.startsWith('/admin') && (
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase shadow-md backdrop-blur-md ${
                      isActive
                        ? 'bg-emerald-105 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : 'bg-rose-105 text-rose-800 dark:bg-rose-950/80 dark:text-rose-350'
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              )}
            </div>

            {/* Content Details Block */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="space-y-2">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                  {event.title}
                </h1>
                
                {/* Meta row cards */}
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 pt-4">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                    <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 shrink-0">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white">{event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                    <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 shrink-0">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Time</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white">{event.eventDate ? new Date(event.eventDate).toLocaleTimeString() : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                    <div className="h-9 w-9 rounded-xl bg-purple-100 dark:bg-purple-950/50 flex items-center justify-center text-purple-650 shrink-0">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Location</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white truncate">{event.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Event Details & Agenda</h3>
                <p className="text-xs leading-relaxed text-slate-705 dark:text-slate-350 whitespace-pre-line">
                  {event.description || 'No detailed agenda or overview provided for this event yet.'}
                </p>
              </div>

              {/* Deadline warning */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-350">
                <Bookmark className="h-5 w-5 text-rose-500 shrink-0" />
                <div className="text-xs font-semibold">
                  <span className="font-extrabold uppercase">Registration Deadline:</span>{' '}
                  <span className="font-black text-rose-700 dark:text-rose-350">{event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleDateString() : 'N/A'}</span>. Make sure to sign up before this date.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
