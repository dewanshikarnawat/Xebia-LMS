import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEvents } from './EventsContext';
import { useToast } from '@/hooks-lms/useToast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Calendar, Clock, MapPin, Eye, Edit3, Trash2, 
  Globe, EyeOff, Users, LayoutGrid, List, MoreVertical, 
  Copy, Sparkles, TrendingUp, AlertTriangle, ChevronRight,
  Bell, FileSpreadsheet, CheckCircle2, AlertCircle
} from 'lucide-react';
import Button from '@/components/ui-lms/Button';
import PageHeader from '@/components/layout-lms/PageHeader';
import StatCard from '@/components/ui-lms/StatCard';
import Breadcrumb from '@/components/layout-lms/Breadcrumb';
import Badge from '@/components/ui-lms/Badge';
import { Pagination } from '@/components/shared/Pagination';

// Mock participant avatar colors
const AVATAR_COLORS = [
  'bg-indigo-500 text-white',
  'bg-emerald-500 text-white',
  'bg-purple-500 text-white',
  'bg-rose-500 text-white',
  'bg-amber-500 text-white'
];

export default function EventsDashboard() {
  const navigate = useNavigate();
  const { events, fetchEventsPage, deleteEvent, togglePublishEvent, registrations, createEvent } = useEvents();
  const { showToast } = useToast();
  
  // Dashboard state
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterOrganizer, setFilterOrganizer] = useState('All');
  const [filterDate, setFilterDate] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [viewMode, setViewMode] = useState('grid');
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [activeTab, setActiveTab] = useState('All'); // All | Upcoming | Ongoing | Completed | Draft | Cancelled
  
  // Pagination State
  const [eventsList, setEventsList] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      let sortByField = 'createdAt';
      let sortDir = 'desc';
      if (sortBy === 'name-asc') {
        sortByField = 'title';
        sortDir = 'asc';
      } else if (sortBy === 'name-desc') {
        sortByField = 'title';
        sortDir = 'desc';
      } else if (sortBy === 'date-asc') {
        sortByField = 'eventDate';
        sortDir = 'asc';
      } else if (sortBy === 'date-desc') {
        sortByField = 'eventDate';
        sortDir = 'desc';
      }

      let active = null;
      if (activeTab === 'Upcoming' || activeTab === 'Ongoing') {
        active = true;
      } else if (activeTab === 'Cancelled' || activeTab === 'Completed') {
        active = false;
      }

      const data = await fetchEventsPage(page, size, sortByField, sortDir, searchQuery, active);
      setEventsList(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
      setLoading(false);
    }
  }, [page, size, sortBy, activeTab, searchQuery, fetchEventsPage]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const [deleteTarget, setDeleteTarget] = useState(null);

  // Current Date string
  const currentDateString = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const total = events.length;
    
    const upcoming = events.filter((e) => e.status === 'UPCOMING').length;
    const ongoing = events.filter((e) => e.status === 'ONGOING').length;
    const completed = events.filter((e) => e.status === 'COMPLETED').length;
    const cancelled = events.filter((e) => e.status === 'CANCELLED').length;
    
    const enrollments = registrations.filter(
      (r) => r.status === 'REGISTERED' || r.status === 'APPROVED' || r.status === 'Enrolled' || r.status === 'Approved' || r.status === 'Registered'
    ).length;

    const pending = registrations.filter((r) => r.status === 'REGISTERED' || r.status === 'Enrolled').length;

    return { total, upcoming, ongoing, completed, cancelled, enrollments, pending };
  }, [events, registrations]);

  // Extract metadata lists for filters
  const categories = useMemo(() => {
    const cats = new Set();
    events.forEach((ev) => {
      cats.add(ev.title.includes('AI') ? 'Artificial Intelligence' : ev.title.includes('Cloud') ? 'Cloud Native' : 'Modern Frontend');
    });
    return ['All', ...Array.from(cats)];
  }, [events]);

  const organizers = useMemo(() => {
    return ['All', 'Sarah Chen', 'James Wilson', 'Michael O\'Brien'];
  }, []);

  const getEventCategory = (title) => {
    if (title.includes('AI')) return 'Artificial Intelligence';
    if (title.includes('Cloud')) return 'Cloud Native';
    return 'Modern Frontend';
  };

  const getCategoryColor = (cat) => {
    if (cat === 'Artificial Intelligence') return 'bg-purple-150 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300';
    if (cat === 'Cloud Native') return 'bg-teal-150 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300';
    return 'bg-blue-150 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300';
  };

  const getEnrolledList = (eventId) => {
    return registrations.filter(
      (r) => String(r.eventId) === String(eventId) && (r.enrollmentStatus === 'Enrolled' || r.enrollmentStatus === 'Approved')
    );
  };

  // Actions
  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      await deleteEvent(deleteTarget.id);
      showToast('Event deleted successfully!', 'success');
      setDeleteTarget(null);
      loadEvents();
    }
  };

  const handleTogglePublish = async (id, status, title) => {
    await togglePublishEvent(id);
    const action = status === 'CANCELLED' ? 'activated' : 'cancelled';
    showToast(`"${title}" ${action} successfully!`, 'success');
    setActiveMenuId(null);
    loadEvents();
  };

  const handleDuplicate = async (ev) => {
    const copy = {
      title: `Copy of ${ev.title}`,
      description: ev.description || '',
      image: ev.image || '',
      eventDate: ev.eventDate,
      registrationDeadline: ev.registrationDeadline || null,
      location: ev.location,
      status: 'UPCOMING',
    };
    await createEvent(copy);
    showToast(`"${ev.title}" duplicated successfully!`, 'success');
    setActiveMenuId(null);
    loadEvents();
  };

  const handleExport = () => {
    showToast('Exporting event data (CSV mock download triggered)...', 'success');
  };

  // Filter and Sort Events
  const filteredEvents = useMemo(() => {
    let result = [...eventsList];

    // Advanced Category filter
    if (filterCategory !== 'All') {
      result = result.filter((ev) => getEventCategory(ev.title) === filterCategory);
    }

    // Organizer filter
    if (filterOrganizer !== 'All') {
      result = result.filter(() => true);
    }

    // Date filter
    if (filterDate) {
      result = result.filter((ev) => ev.eventDate === filterDate);
    }

    return result;
  }, [eventsList, filterCategory, filterOrganizer, filterDate]);

  return (
    <div className="min-h-screen bg-brand-surface p-6 lg:p-8 space-y-6 text-brand-text-primary transition-colors duration-200">
      
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', to: '/admin/dashboard' },
          { label: 'Events' }
        ]}
      />

      {/* Page Header */}
      <PageHeader
        title="Events"
        subtitle="Manage workshops, seminars, hackathons, and campus activities."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center justify-center gap-1.5 text-xs font-bold"
            >
              <FileSpreadsheet className="h-4 w-4" /> Export Events
            </Button>
            <Link to="/admin/events/enrollments">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-1.5 text-xs font-bold"
              >
                <Users className="h-4 w-4 text-brand-primary" /> Manage Enrollments
              </Button>
            </Link>
            <Link to="/admin/events/create">
              <Button
                variant="primary"
                size="sm"
                className="flex items-center justify-center gap-1.5 text-xs font-black"
              >
                <Plus className="h-4 w-4" /> Create Event
              </Button>
            </Link>
          </div>
        }
      />

      {/* Main Content */}
      <div className="space-y-6">
        
        {/* KPI metrics block */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-20 rounded-xl bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 animate-pulse p-4 space-y-2">
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-5 w-1/3 bg-slate-300 dark:bg-slate-700 rounded"></div>
              </div>
            ))
          ) : (
            <>
              <StatCard icon={Calendar} label="Total Events" value={stats.total} color="purple" index={0} className="border-brand-border dark:border-slate-800" />
              <StatCard icon={Globe} label="Upcoming" value={stats.upcoming} color="teal" index={1} className="border-brand-border dark:border-slate-800" />
              <StatCard icon={Sparkles} label="Ongoing" value={stats.ongoing} color="orange" index={2} className="border-brand-border dark:border-slate-800" />
              <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} color="plum" index={3} className="border-brand-border dark:border-slate-800" />
              <StatCard icon={Users} label="Total Enrolls" value={stats.enrollments} color="pink" index={4} className="border-brand-border dark:border-slate-800" />
              <StatCard icon={AlertCircle} label="Pending Appr." value={stats.pending} color="orange" index={5} className="border-brand-border dark:border-slate-800" />
            </>
          )}
        </div>

        {/* Filter tabs block */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <div className="flex overflow-x-auto gap-4 -mb-px">
            {['All', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setActiveMenuId(null);
                }}
                className={`py-3 px-1 border-b-2 text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                  (activeTab === tab)
                    ? 'border-brand-primary text-brand-primary dark:border-purple-400 dark:text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                {tab === 'All' ? 'All Events' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Controls, search, and sorting toolbar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-brand-border dark:border-slate-800 shadow-sm">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 max-w-4xl">
            <div className="relative flex-1 min-w-[200px]">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-3.5 w-3.5 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Search by event title..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2 text-xs font-semibold text-brand-text-primary dark:text-white placeholder-slate-400 focus:border-brand-primary focus:outline-none"
              />
            </div>

            {/* Category selection */}
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
              className="rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
            >
              <option value="All">All Categories</option>
              {categories.filter(c => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Organizer selection */}
            <select
              value={filterOrganizer}
              onChange={(e) => { setFilterOrganizer(e.target.value); setPage(0); }}
              className="rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
            >
              <option value="All">All Organizers</option>
              {organizers.filter(o => o !== 'All').map((org) => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>

            {/* Date selection */}
            <input
              type="date"
              value={filterDate}
              onChange={(e) => { setFilterDate(e.target.value); setPage(0); }}
              className="rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-white focus:border-brand-primary focus:outline-none"
            />
          </div>

          {/* Sorters and Layout View Mode Toggles */}
          <div className="flex items-center gap-2 justify-between lg:justify-end">
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
              className="rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
            >
              <option value="date-desc">Newest Date</option>
              <option value="date-asc">Oldest Date</option>
              <option value="name-asc">Title (A-Z)</option>
              <option value="name-desc">Title (Z-A)</option>
              <option value="enrollments-desc">Enrollments</option>
            </select>

            <div className="flex items-center border border-brand-border dark:border-slate-800 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-950">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-brand-primary shadow-sm'
                    : 'text-slate-400 hover:text-slate-655'
                }`}
                title="Grid Layout"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-brand-primary shadow-sm'
                    : 'text-slate-400 hover:text-slate-655'
                }`}
                title="List Layout"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Card listing block */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-slate-50/50 dark:bg-slate-900/10">
            <Calendar className="h-12 w-12 text-slate-300 dark:text-slate-750 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-white">No Events Found</h3>
            <p className="text-xs text-slate-400 mt-1">There are no events matching the active filter or tab categories.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEvents.map((ev) => {
              const isActive = ev.status === 'UPCOMING' || ev.status === 'ONGOING';
              const cat = getEventCategory(ev.title);
              const enrolledCount = ev.registrationCount || 0;
              const enrolledList = getEnrolledList(ev.id);
              const maxCapacity = 100;
              const remainingSeats = maxCapacity - enrolledCount;
              const filledPercent = Math.min((enrolledCount / maxCapacity) * 100, 100);

              return (
                <motion.div
                  layout
                  key={ev.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="group relative overflow-hidden rounded-2xl border border-brand-border dark:border-slate-800 bg-brand-background dark:bg-slate-900 shadow-sm hover:shadow-md hover:border-brand-primary/40 dark:hover:border-purple-400/40 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Cover layout */}
                    <div className="relative h-40 bg-slate-950 overflow-hidden">
                      <img
                        src={ev.image || 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=800&auto=format&fit=crop&q=80'}
                        alt={ev.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                      
                      <div className="absolute top-4 left-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase shadow-sm ${
                            ev.status === 'COMPLETED'
                              ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              : ev.status === 'ONGOING'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-350'
                              : ev.status === 'CANCELLED'
                              ? 'bg-red-105 text-red-800 dark:bg-red-950/40 dark:text-red-350'
                              : 'bg-brand-primary/10 text-brand-primary dark:bg-purple-950/40 dark:text-purple-300 border border-brand-primary/20'
                          }`}
                        >
                          {ev.status}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4">
                        <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase shadow-sm ${getCategoryColor(cat)}`}>
                          {cat}
                        </span>
                      </div>

                      <div className="absolute top-4 right-4 z-20">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === ev.id ? null : ev.id);
                          }}
                          className="h-8 w-8 rounded-lg bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors"
                        >
                          <MoreVertical className="h-4.5 w-4.5" />
                        </button>

                        {/* Card Dropdown Popover */}
                        {activeMenuId === ev.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                            <div className="absolute right-0 mt-1 w-48 rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 shadow-xl z-20 text-xs font-semibold text-brand-text-primary dark:text-slate-200">
                              <button
                                onClick={() => { navigate(`/admin/events/${ev.id}`); setActiveMenuId(null); }}
                                className="w-full text-left px-3 py-1.5 hover:bg-brand-surface dark:hover:bg-slate-800 flex items-center gap-2"
                              >
                                <Eye className="h-3.5 w-3.5" /> View Agenda
                              </button>
                              <button
                                onClick={() => { navigate(`/admin/events/${ev.id}/edit`); setActiveMenuId(null); }}
                                className="w-full text-left px-3 py-1.5 hover:bg-brand-surface dark:hover:bg-slate-800 flex items-center gap-2"
                              >
                                <Edit3 className="h-3.5 w-3.5" /> Edit Details
                              </button>
                              <button
                                onClick={() => { navigate(`/admin/events/${ev.id}/registrations`); setActiveMenuId(null); }}
                                className="w-full text-left px-3 py-1.5 hover:bg-brand-surface dark:hover:bg-slate-800 flex items-center gap-2"
                              >
                                <Users className="h-3.5 w-3.5" /> View Registrations
                              </button>
                              <button
                                onClick={() => { navigate(`/admin/events/enrollments`); setActiveMenuId(null); }}
                                className="w-full text-left px-3 py-1.5 hover:bg-brand-surface dark:hover:bg-slate-800 flex items-center gap-2"
                              >
                                <Users className="h-3.5 w-3.5" /> View Enrollments
                              </button>
                              <button
                                onClick={() => handleDuplicate(ev)}
                                className="w-full text-left px-3 py-1.5 hover:bg-brand-surface dark:hover:bg-slate-800 flex items-center gap-2"
                              >
                                <Copy className="h-3.5 w-3.5" /> Duplicate Event
                              </button>
                              <button
                                onClick={() => handleTogglePublish(ev.id, ev.status, ev.title)}
                                className="w-full text-left px-3 py-1.5 hover:bg-brand-surface dark:hover:bg-slate-800 flex items-center gap-2 text-brand-primary"
                              >
                                {isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                                {isActive ? 'Cancel Event' : 'Activate Event'}
                              </button>
                              <div className="border-t border-brand-border dark:border-slate-800 my-1"></div>
                              <button
                                onClick={() => { setDeleteTarget({ id: ev.id, title: ev.title }); setActiveMenuId(null); }}
                                className="w-full text-left px-3 py-1.5 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-455 text-rose-500 font-bold"
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete Event
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="text-[10px] font-black uppercase text-brand-primary tracking-wider flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5 text-[#10B5A5]" /> MASTERCLASS SERIES
                        </h3>
                        <h2 className="text-sm font-bold text-brand-text-primary dark:text-white line-clamp-1 mt-0.5 group-hover:text-brand-primary dark:group-hover:text-purple-400 transition-colors">
                          {ev.title}
                        </h2>
                        <p className="text-xs text-brand-text-secondary dark:text-slate-400 line-clamp-2 leading-relaxed mt-1 h-8">
                          {ev.description || 'No agenda parameters set.'}
                        </p>
                      </div>

                      {/* Detail attributes */}
                      <div className="space-y-1.5 text-[11px] font-semibold text-brand-text-secondary dark:text-slate-350 border-t border-brand-border dark:border-slate-800 pt-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-brand-primary" />
                          <span>Date: {ev.eventDate ? new Date(ev.eventDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-brand-primary" />
                          <span>Time: {ev.eventDate ? new Date(ev.eventDate).toLocaleTimeString() : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-brand-primary" />
                          <span className="truncate">Venue: {ev.location}</span>
                        </div>
                      </div>

                      {/* Deadline warning */}
                      <div className="text-[10px] uppercase font-black text-brand-text-secondary border-t border-brand-border dark:border-slate-800 pt-2 flex justify-between">
                        <span>Deadline</span>
                        <span className="text-rose-500 font-extrabold">{ev.registrationDeadline ? new Date(ev.registrationDeadline).toLocaleDateString() : 'N/A'}</span>
                      </div>

                      {/* Progress bar and seat info */}
                      <div className="space-y-2 border-t border-brand-border dark:border-slate-800 pt-3">
                        <div className="flex items-center justify-between text-[10px] font-bold text-brand-text-secondary uppercase">
                          <span>Capacity: {maxCapacity}</span>
                          <span className="text-brand-text-primary dark:text-slate-200 font-black">
                            {remainingSeats} Seats Left
                          </span>
                        </div>

                        <div className="w-full bg-brand-surface dark:bg-slate-850 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-brand-primary h-full rounded-full transition-all duration-500"
                            style={{ width: `${filledPercent}%` }}
                          ></div>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          <div className="flex -space-x-2.5 overflow-hidden">
                            {enrolledList.slice(0, 3).map((reg, rIdx) => (
                              <div
                                key={reg.id}
                                className={`inline-flex items-center justify-center h-6 w-6 rounded-full border-2 border-white dark:border-slate-900 text-[8px] font-black uppercase ${AVATAR_COLORS[rIdx % AVATAR_COLORS.length]}`}
                                title={reg.studentName}
                              >
                                {reg.studentName.split(' ').map(n => n[0]).join('')}
                              </div>
                            ))}
                            {enrolledCount > 3 && (
                              <div className="inline-flex items-center justify-center h-6 w-6 rounded-full border-2 border-white dark:border-slate-900 bg-brand-surface dark:bg-slate-850 text-[8px] font-black text-brand-text-secondary">
                                +{enrolledCount - 3}
                              </div>
                            )}
                            {enrolledCount === 0 && (
                              <span className="text-[10px] font-bold text-brand-text-secondary italic">Be the first to join</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-3.5 bg-brand-surface dark:bg-slate-950 border-t border-brand-border flex items-center justify-between text-[10px] font-bold mt-auto gap-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/admin/events/${ev.id}/registrations`)}
                      className="text-[10px] uppercase font-bold tracking-wider rounded-lg h-7 px-3"
                    >
                      View Registrations
                    </Button>
                    <span className="text-brand-text-secondary uppercase">Updated 1d ago</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-brand-background dark:bg-slate-900 rounded-2xl border border-brand-border dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-950/40 text-[10px] font-black uppercase tracking-wider text-brand-text-secondary">
                    <th className="py-4 px-6">Event Title</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Venue Details</th>
                    <th className="py-4 px-6">Organizer</th>
                    <th className="py-4 px-6">Enrollment Rate</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border dark:divide-slate-800 text-xs font-semibold text-brand-text-primary dark:text-slate-300">
                  {filteredEvents.map((ev) => {
                    const isActive = ev.status === 'UPCOMING' || ev.status === 'ONGOING';
                    const cat = getEventCategory(ev.title);
                    const enrolledCount = getEnrolledList(ev.id).length;

                    return (
                      <tr key={ev.id} className="hover:bg-brand-surface/40 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={ev.image || 'https://images.unsplash.com/photo-1591453089816-0fbb971b454c?w=100&auto=format&fit=crop&q=80'}
                              alt={ev.title}
                              className="h-10 w-14 rounded-lg object-cover border border-brand-border"
                            />
                            <div>
                              <div className="font-bold text-brand-text-primary dark:text-white">{ev.title}</div>
                              <div className="text-[10px] text-brand-text-secondary font-bold uppercase">Deadline: {ev.registrationDeadline ? new Date(ev.registrationDeadline).toLocaleDateString() : 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase shadow-sm ${getCategoryColor(cat)}`}>
                            {cat}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div>{ev.eventDate ? new Date(ev.eventDate).toLocaleDateString() : 'N/A'} @ {ev.eventDate ? new Date(ev.eventDate).toLocaleTimeString() : 'N/A'}</div>
                          <div className="text-[10px] text-brand-text-secondary font-semibold flex items-center gap-0.5 mt-0.5">
                            <MapPin className="h-3 w-3" /> {ev.location}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-brand-text-secondary dark:text-slate-350">
                          <div className="flex items-center gap-1.5">
                            <div className="h-5 w-5 rounded-full bg-brand-primary text-white flex items-center justify-center text-[8px] font-bold">
                              SC
                            </div>
                            <span>Sarah Chen</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1 w-32">
                            <div className="text-[10px] font-black flex justify-between text-brand-text-secondary">
                              <span>Registered Students: {ev.registrationCount || 0}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              ev.status === 'COMPLETED'
                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                : ev.status === 'ONGOING'
                                ? 'bg-emerald-105 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-350'
                                : ev.status === 'CANCELLED'
                                ? 'bg-red-105 text-red-800 dark:bg-red-950/40 dark:text-red-350'
                                : 'bg-brand-primary/10 text-brand-primary dark:bg-purple-950/40 dark:text-purple-300 border border-brand-primary/20'
                            }`}
                          >
                            {ev.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="relative inline-block text-left">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === ev.id ? null : ev.id);
                              }}
                              className="p-1.5 rounded-lg hover:bg-brand-surface dark:hover:bg-slate-800 transition-colors"
                            >
                              <MoreVertical className="h-4 w-4 text-brand-text-secondary" />
                            </button>

                            {/* Dropdown Popover */}
                            {activeMenuId === ev.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                                <div className="absolute right-0 mt-1 w-44 rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 py-1.5 shadow-xl z-20 text-xs font-semibold text-brand-text-primary dark:text-slate-350">
                                  <button
                                    onClick={() => { navigate(`/admin/events/${ev.id}`); setActiveMenuId(null); }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-brand-surface dark:hover:bg-slate-800 flex items-center gap-2"
                                  >
                                    <Eye className="h-3.5 w-3.5" /> View Details
                                  </button>
                                  <button
                                    onClick={() => { navigate(`/admin/events/${ev.id}/edit`); setActiveMenuId(null); }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-brand-surface dark:hover:bg-slate-800 flex items-center gap-2"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" /> Edit Details
                                  </button>
                                  <button
                                    onClick={() => { navigate(`/admin/events/${ev.id}/registrations`); setActiveMenuId(null); }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-brand-surface dark:hover:bg-slate-800 flex items-center gap-2"
                                  >
                                    <Users className="h-3.5 w-3.5" /> Registrations
                                  </button>
                                  <button
                                    onClick={() => { navigate(`/admin/events/enrollments`); setActiveMenuId(null); }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-brand-surface dark:hover:bg-slate-800 flex items-center gap-2"
                                  >
                                    <Users className="h-3.5 w-3.5" /> Enrollments
                                  </button>
                                  <button
                                    onClick={() => handleDuplicate(ev)}
                                    className="w-full text-left px-3 py-1.5 hover:bg-brand-surface dark:hover:bg-slate-800 flex items-center gap-2"
                                  >
                                    <Copy className="h-3.5 w-3.5" /> Duplicate
                                  </button>
                                  <button
                                    onClick={() => handleTogglePublish(ev.id, ev.status, ev.title)}
                                    className="w-full text-left px-3 py-1.5 hover:bg-brand-surface dark:hover:bg-slate-800 flex items-center gap-2 text-brand-primary"
                                  >
                                    {isActive ? <EyeOff className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
                                    {isActive ? 'Cancel Event' : 'Activate Event'}
                                  </button>
                                  <div className="border-t border-brand-border dark:border-slate-800 my-1"></div>
                                  <button
                                    onClick={() => { setDeleteTarget({ id: ev.id, title: ev.title }); setActiveMenuId(null); }}
                                    className="w-full text-left px-3 py-1.5 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-455 text-rose-500 font-bold"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {!loadingEvents && filteredEvents.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 rounded-2xl px-4 py-3 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Items per page:</span>
              <select
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
                className="pl-2 pr-6 py-1 text-xs bg-white dark:bg-[#1E293B] border border-brand-border dark:border-slate-800 rounded-lg text-slate-700 dark:text-white cursor-pointer"
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

      {/* Delete Confirmation Modal Overlay */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-brand-background dark:bg-slate-900 border border-brand-border dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-6 shadow-2xl relative"
            >
              <div className="text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertTriangle className="h-6.5 w-6.5" />
                </div>
                <h3 className="text-base font-bold text-brand-text-primary dark:text-white">Delete Event?</h3>
                <p className="text-xs text-brand-text-secondary dark:text-slate-400 leading-relaxed">
                  Are you sure you want to delete <span className="font-extrabold text-brand-text-primary dark:text-white">"{deleteTarget.title}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setDeleteTarget(null)}
                  className="w-full text-xs font-bold rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onClick={handleConfirmDelete}
                  className="w-full text-xs font-bold rounded-xl"
                >
                  Delete Event
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
