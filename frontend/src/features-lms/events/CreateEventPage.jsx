import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEvents } from './EventsContext';
import { useToast } from '@/hooks-lms/useToast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Image, Save, Globe, X, ChevronRight, Plus, 
  Calendar, Clock, MapPin, FileText, Upload, AlertCircle 
} from 'lucide-react';
import Button from '@/components/ui-lms/Button';

export default function CreateEventPage() {
  const id = useParams().id;
  const navigate = useNavigate();
  const { events, createEvent, updateEvent } = useEvents();
  const { showToast } = useToast();

  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    eventDate: '',
    registrationDeadline: '',
    location: '',
    status: 'UPCOMING',
  });

  // Local state for split pickers and category select
  const [eventDateOnly, setEventDateOnly] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [deadlineDateOnly, setDeadlineDateOnly] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [category, setCategory] = useState('Modern Frontend');
  const [registrationLimit, setRegistrationLimit] = useState('100');
  const [triedSubmit, setTriedSubmit] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '';
      const pad = (num) => String(num).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '';
    }
  };

  const splitDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return { date: '', time: '' };
    const parts = dateTimeStr.split('T');
    return { date: parts[0] || '', time: parts[1] || '' };
  };

  const combineDateTime = (date, time) => {
    if (!date || !time) return '';
    return `${date}T${time}`;
  };

  const getCategoryFromTitle = (title) => {
    if (!title) return 'Modern Frontend';
    if (title.includes('AI')) return 'Artificial Intelligence';
    if (title.includes('Cloud')) return 'Cloud Native';
    return 'Modern Frontend';
  };

  // Load event if editing
  useEffect(() => {
    if (isEditMode && events && events.length > 0) {
      const existing = events.find((ev) => String(ev.id) === String(id));
      if (existing) {
        const cleanEvDate = formatDateTimeLocal(existing.eventDate);
        const cleanRegDead = formatDateTimeLocal(existing.registrationDeadline);
        setFormData({
          title: existing.title || '',
          description: existing.description || '',
          image: existing.image || '',
          eventDate: cleanEvDate,
          registrationDeadline: cleanRegDead,
          location: existing.location || '',
          status: existing.status || 'UPCOMING',
        });

        // Split dates
        const evDT = splitDateTime(cleanEvDate);
        setEventDateOnly(evDT.date);
        setEventStartTime(evDT.time);
        if (evDT.time) {
          const [h, m] = evDT.time.split(':');
          const endH = String((Number(h) + 2) % 24).padStart(2, '0');
          setEventEndTime(`${endH}:${m}`);
        }

        const dlDT = splitDateTime(cleanRegDead);
        setDeadlineDateOnly(dlDT.date);
        setDeadlineTime(dlDT.time);

        setCategory(getCategoryFromTitle(existing.title));
      } else {
        showToast('Event not found', 'error');
        navigate('/admin/events');
      }
    }
  }, [id, isEditMode, events, navigate, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (type, dateVal, timeVal) => {
    if (type === 'event') {
      setEventDateOnly(dateVal);
      setEventStartTime(timeVal);
      const combined = combineDateTime(dateVal, timeVal);
      setFormData(prev => ({ ...prev, eventDate: combined }));
    } else {
      setDeadlineDateOnly(dateVal);
      setDeadlineTime(timeVal);
      const combined = combineDateTime(dateVal, timeVal);
      setFormData(prev => ({ ...prev, registrationDeadline: combined }));
    }
  };

  const handleSave = async (statusOverride) => {
    let finalTitle = formData.title;
    
    // Automatically append tags based on selected category derived values
    if (category === 'Artificial Intelligence' && !finalTitle.toLowerCase().includes('ai')) {
      finalTitle = `${finalTitle} (AI)`;
    } else if (category === 'Cloud Native' && !finalTitle.toLowerCase().includes('cloud')) {
      finalTitle = `${finalTitle} (Cloud)`;
    }

    if (!finalTitle || !formData.eventDate || !formData.location) {
      setTriedSubmit(true);
      showToast('Please fill in Title, Event Date, and Location.', 'error');
      return;
    }

    const payload = {
      title: finalTitle,
      description: formData.description,
      image: formData.image,
      eventDate: formData.eventDate,
      registrationDeadline: formData.registrationDeadline || null,
      location: formData.location,
      status: statusOverride || formData.status || 'UPCOMING',
    };

    try {
      if (isEditMode) {
        await updateEvent(id, payload);
        showToast('Event updated successfully!', 'success');
      } else {
        await createEvent(payload);
        showToast('Event created successfully!', 'success');
      }
      navigate('/admin/events');
    } catch (err) {
      showToast('Failed to save event', 'error');
    }
  };

  const triggerMockImageUpload = () => {
    const topics = ['tech', 'code', 'office', 'design', 'web', 'react'];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const randomId = Math.floor(Math.random() * 1000);
    const mockUrl = `https://images.unsplash.com/photo-${randomId % 2 === 0 ? '1591453089816-0fbb971b454c' : '1517694712202-14dd9538aa97'}?w=800&auto=format&fit=crop&q=60`;
    setFormData((prev) => ({ ...prev, image: mockUrl }));
    showToast('Mock Banner uploaded successfully!', 'success');
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
      
      {/* Modal Dialog Box */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-[900px] bg-slate-50 dark:bg-[#0B0F19] rounded-[24px] shadow-2xl border border-brand-border dark:border-slate-800 p-6 md:p-8 text-left space-y-6 overflow-hidden my-8"
      >
        
        {/* Close Button */}
        <button
          onClick={() => navigate('/admin/events')}
          className="absolute top-4 right-4 p-2 rounded-full border border-brand-border dark:border-slate-800 text-brand-text-secondary hover:bg-brand-surface dark:hover:bg-slate-800 hover:text-brand-text-primary transition-all cursor-pointer z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3 border-b border-brand-border dark:border-slate-800 pb-5">
          <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 select-none">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-brand-text-primary dark:text-white flex items-center gap-2">
              {isEditMode ? 'Edit Event Details' : 'Create New Event'}
            </h2>
            <p className="text-xs text-brand-text-secondary dark:text-slate-400 mt-1">
              Create and publish events for students and faculty.
            </p>
          </div>
        </div>

        {/* Two-Column Form Layout */}
        <form className="grid grid-cols-1 lg:grid-cols-12 gap-6" onSubmit={(e) => e.preventDefault()}>
          
          {/* Left Column - Event Metadata & Banner Upload (7/12) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Card 1: Basic Information */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider border-b border-brand-border dark:border-slate-800 pb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand-primary" /> Basic Information
              </h3>
              
              <div className="space-y-4">
                {/* Event Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-text-primary dark:text-slate-200">
                    Event Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g. AI Workshop 2026"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:outline-none transition-all ${
                      triedSubmit && !formData.title 
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500/20' 
                        : formData.title 
                        ? 'border-emerald-505 focus:ring-1 focus:ring-emerald-500/20' 
                        : 'border-brand-border dark:border-slate-800 focus:border-brand-primary'
                    }`}
                  />
                  {triedSubmit && !formData.title && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1 font-bold mt-1">
                      <AlertCircle className="h-3 w-3" /> Event Name is required.
                    </p>
                  )}
                </div>

                {/* Event Category Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-text-primary dark:text-slate-200">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                  >
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="Cloud Native">Cloud Native</option>
                    <option value="Modern Frontend">Modern Frontend</option>
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-brand-text-primary dark:text-slate-200">
                      Description
                    </label>
                    <span className="text-[10px] font-bold text-brand-text-secondary">
                      {formData.description?.length || 0} / 500 characters
                    </span>
                  </div>
                  <textarea
                    name="description"
                    rows={4}
                    maxLength={500}
                    placeholder="Provide a detailed description of the event agenda..."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Card 4: Banner Image Upload */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider border-b border-brand-border dark:border-slate-800 pb-2 flex items-center gap-2">
                <Image className="h-4 w-4 text-brand-primary" /> Event Banner
              </h3>

              <div 
                className={`relative border-2 border-dashed rounded-2xl h-44 overflow-hidden flex flex-col items-center justify-center p-4 transition-all cursor-pointer ${
                  isDragging
                    ? 'border-brand-primary bg-brand-primary/5 dark:bg-purple-950/10'
                    : 'border-brand-border dark:border-slate-800 hover:border-brand-primary/50 bg-slate-50 dark:bg-slate-950/30'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file) triggerMockImageUpload();
                }}
                onClick={triggerMockImageUpload}
              >
                {formData.image ? (
                  <>
                    <img src={formData.image} alt="Banner Preview" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors flex items-center justify-center">
                      <span className="text-xs text-white font-bold bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">Click to Change Banner</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((p) => ({ ...p, image: '' }));
                      }}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black text-white backdrop-blur-sm transition-all cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="text-center space-y-2 select-none">
                    <div className="w-10 h-10 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-2 text-brand-primary">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-brand-text-primary dark:text-white">
                      Drag & Drop Banner Image or <span className="text-brand-primary hover:underline font-extrabold">Browse Files</span>
                    </p>
                    <p className="text-[10px] text-brand-text-secondary dark:text-slate-400 font-medium">
                      Recommended Size: 1200 × 600 px (Max 2MB)
                    </p>
                  </div>
                )}
              </div>
              
              <input
                type="text"
                name="image"
                placeholder="Or paste banner image URL here..."
                value={formData.image}
                onChange={handleChange}
                className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
              />
            </div>

          </div>

          {/* Right Column - Timings, Location & Limits (5/12) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Card 2: Schedule */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider border-b border-brand-border dark:border-slate-800 pb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-primary" /> Schedule
              </h3>

              <div className="space-y-4">
                {/* Event Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-text-primary dark:text-slate-200">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      value={eventDateOnly}
                      min={today}
                      onChange={(e) => handleDateChange('event', e.target.value, eventStartTime)}
                      className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:outline-none transition-all ${
                        triedSubmit && !eventDateOnly
                          ? 'border-red-500 focus:ring-1 focus:ring-red-500/20'
                          : eventDateOnly
                          ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                          : 'border-brand-border dark:border-slate-800 focus:border-brand-primary'
                      }`}
                    />
                  </div>
                  {triedSubmit && !eventDateOnly && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1 font-bold mt-1">
                      <AlertCircle className="h-3 w-3" /> Event Date is required.
                    </p>
                  )}
                </div>

                {/* Start & End Times Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-text-primary dark:text-slate-200">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="time"
                        value={eventStartTime}
                        onChange={(e) => handleDateChange('event', eventDateOnly, e.target.value)}
                        className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:outline-none transition-all ${
                          triedSubmit && !eventStartTime
                            ? 'border-red-500 focus:ring-1 focus:ring-red-500/20'
                            : eventStartTime
                            ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                            : 'border-brand-border dark:border-slate-800 focus:border-brand-primary'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-text-primary dark:text-slate-200">
                      End Time (Local)
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="time"
                        value={eventEndTime}
                        onChange={(e) => setEventEndTime(e.target.value)}
                        className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Registration Deadline */}
                <div className="space-y-1 pt-1">
                  <label className="text-xs font-bold text-brand-text-primary dark:text-slate-200">
                    Registration Deadline
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="date"
                        value={deadlineDateOnly}
                        min={today}
                        onChange={(e) => handleDateChange('deadline', e.target.value, deadlineTime)}
                        className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                      />
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      <input
                        type="time"
                        value={deadlineTime}
                        onChange={(e) => handleDateChange('deadline', deadlineDateOnly, e.target.value)}
                        className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Location & Registration Limits */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider border-b border-brand-border dark:border-slate-800 pb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-primary" /> Location & Limits
              </h3>

              <div className="space-y-4">
                {/* Event Location */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-brand-text-primary dark:text-slate-200">
                    Venue / Event Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Gurgaon Office / Zoom Link"
                    value={formData.location}
                    onChange={handleChange}
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:outline-none transition-all ${
                      triedSubmit && !formData.location
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500/20'
                        : formData.location
                        ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                        : 'border-brand-border dark:border-slate-800 focus:border-brand-primary'
                    }`}
                  />
                  {triedSubmit && !formData.location && (
                    <p className="text-[10px] text-red-500 flex items-center gap-1 font-bold mt-1">
                      <AlertCircle className="h-3 w-3" /> Event Venue is required.
                    </p>
                  )}
                </div>

                {/* Registration Limit & Status fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-text-primary dark:text-slate-200">
                      Registration Limit
                    </label>
                    <input
                      type="number"
                      name="registrationLimit"
                      min={1}
                      value={registrationLimit}
                      onChange={(e) => setRegistrationLimit(e.target.value)}
                      className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-brand-text-primary dark:text-slate-200">
                      Event Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                    >
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="ONGOING">ONGOING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons Row */}
          <div className="lg:col-span-12 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-brand-border dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/admin/events')}
              className="w-full sm:w-auto px-6 py-2.5 border border-brand-border dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={() => handleSave(formData.status || 'UPCOMING')}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#4A1F4F] to-[#7A2676] hover:from-[#5A2460] hover:to-[#8B2F86] text-white rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:scale-[1.01] cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Save Event
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
