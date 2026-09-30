'use client';

import { Bell, Search, User, Sun, Moon, SlidersHorizontal, Check, X, BookOpen, Users, FolderTree, FileText, Landmark } from 'lucide-react';
import { useCatalog } from '@/hooks-lms/useCatalog';
import Logo from '@/components/ui-lms/Logo';
import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { cn, formatDateTime } from '@/utils-lms';
import Button from '@/components/ui-lms/Button';
import { useAuth } from '@/hooks-lms/useAuth';

// Highlight helper
function highlightText(text, query) {
  if (!text) return '';
  if (!query.trim()) return text;
  const parts = String(text).split(new RegExp(`(${query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-amber-100 dark:bg-amber-950/60 text-brand-primary dark:text-brand-secondary font-semibold rounded px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

export default function Header({ title, subtitle }) {
  const {
    courses, categories, students, mediaLibrary, instructors,
    notifications, markAllNotificationsAsRead, clearNotifications, branding
  } = useCatalog();
  const { user } = useAuth();
  
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([
    'courses', 'students', 'categories', 'instructors', 'videos', 'pdfs', 'ppts', 'assignments', 'published', 'draft', 'active', 'inactive'
  ]);
  
  // Notifications panel state
  const [notifOpen, setNotifOpen] = useState(false);

  // Refs for closing panels on click outside
  const searchRef = useRef(null);
  const filterRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    // Theme sync
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const activeTheme = savedTheme || systemTheme;
    setTheme(activeTheme);
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const clickHandler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', clickHandler);
    return () => document.removeEventListener('mousedown', clickHandler);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Filter Checkbox Toggles
  const handleFilterToggle = (val) => {
    setSelectedFilters((prev) =>
      prev.includes(val) ? prev.filter((x) => x !== val) : [...prev, val]
    );
  };

  const handleSelectAllFilters = () => {
    const allFilters = [
      'courses', 'students', 'categories', 'instructors', 'videos', 'pdfs', 'ppts', 'assignments', 'published', 'draft', 'active', 'inactive'
    ];
    if (selectedFilters.length === allFilters.length) {
      setSelectedFilters([]);
    } else {
      setSelectedFilters(allFilters);
    }
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
  };

  // Multi-entity search querying logic
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const results = [];
    const q = searchQuery.toLowerCase();

    // 1. Categories
    if (selectedFilters.includes('categories')) {
      categories.filter(c => !c.deletedAt).forEach(cat => {
        const matchName = cat.name.toLowerCase().includes(q);
        const matchDesc = cat.description?.toLowerCase().includes(q);
        const matchActive = selectedFilters.includes(cat.status);
        
        if ((matchName || matchDesc) && matchActive) {
          results.push({
            type: 'category',
            title: cat.name,
            subtitle: cat.description,
            link: `/admin/categories/${cat.id}`,
            icon: FolderTree,
            badge: 'Category'
          });
        }
      });
    }

    // 2. Courses
    if (selectedFilters.includes('courses')) {
      courses.filter(c => !c.deletedAt).forEach(course => {
        const matchTitle = course.title.toLowerCase().includes(q);
        const matchTech = course.technology?.toLowerCase().includes(q);
        const matchPub = selectedFilters.includes(course.status);
        
        if ((matchTitle || matchTech) && matchPub) {
          results.push({
            type: 'course',
            title: course.title,
            subtitle: `${course.technology} · ${course.difficulty}`,
            link: `/admin/courses/${course.id}/builder`,
            icon: BookOpen,
            badge: 'Course'
          });
        }
      });
    }

    // 3. Students
    if (selectedFilters.includes('students')) {
      students.forEach(student => {
        const matchName = student.fullName.toLowerCase().includes(q);
        const matchEmail = student.email.toLowerCase().includes(q);
        const matchActive = selectedFilters.includes(student.status === 'completed' ? 'active' : student.status);
        
        if ((matchName || matchEmail) && matchActive) {
          results.push({
            type: 'student',
            title: student.fullName,
            subtitle: `${student.department} · ${student.city}`,
            link: `/admin/dashboard`, // Jump to dashboard where student list is visible
            icon: Users,
            badge: 'Student'
          });
        }
      });
    }

    // 4. Instructors
    if (selectedFilters.includes('instructors')) {
      (instructors || []).forEach(inst => {
        const matchName = inst.fullName.toLowerCase().includes(q);
        const matchEmail = inst.email.toLowerCase().includes(q);
        
        if (matchName || matchEmail) {
          results.push({
            type: 'instructor',
            title: inst.fullName,
            subtitle: `${inst.department} · ${inst.email}`,
            link: `/admin/dashboard`,
            icon: Landmark,
            badge: 'Instructor'
          });
        }
      });
    }

    // 5. Media Library / Content Files
    mediaLibrary.forEach(file => {
      const matchTitle = file.title.toLowerCase().includes(q);
      const isVideo = file.type === 'video' && selectedFilters.includes('videos');
      const isPdf = file.type === 'pdf' && selectedFilters.includes('pdfs');
      const isPpt = file.type === 'ppt' && selectedFilters.includes('ppts');
      const isDoc = file.type === 'doc' && selectedFilters.includes('assignments'); // Map Doc as Assignment
      
      const typeAllowed = isVideo || isPdf || isPpt || isDoc;
      
      if (matchTitle && (selectedFilters.length === 0 || typeAllowed)) {
        results.push({
          type: 'media',
          title: file.title,
          subtitle: `File inside Course: ${file.courseName}`,
          link: `/admin/courses/${file.courseId}/builder`,
          icon: FileText,
          badge: file.type.toUpperCase()
        });
      }
    });

    return results.slice(0, 10); // Cap at 10 suggestions
  }, [searchQuery, selectedFilters, courses, categories, students, mediaLibrary, instructors]);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const handleSuggestionClick = (link) => {
    setSearchQuery('');
    setSearchOpen(false);
    navigate(link);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-brand-border dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 backdrop-blur-md px-6 transition-colors duration-200">
      <div className="flex items-center gap-3">
        <Logo iconOnly={true} className="shrink-0 scale-90" />
        <div>
          {title && (
            <h1 className="text-lg font-bold text-brand-primary dark:text-slate-100 flex items-center gap-2">
              {title}
            </h1>
          )}
          {subtitle && <p className="text-xs text-brand-text-secondary dark:text-slate-400">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        
        {/* Global Search Bar */}
        <div className="relative" ref={searchRef}>
          <div className="relative flex items-center gap-2">
            <div className="relative w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary dark:text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full rounded-full border border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-950 py-2 pl-10 pr-4 text-sm text-brand-text-primary dark:text-slate-100 placeholder:text-brand-text-secondary/60 hover:border-accent-teal/30 focus:border-accent-teal focus:ring-2 focus:ring-accent-teal/20 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary dark:text-slate-400"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle Button */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className={cn(
                  'rounded-xl border p-2 flex items-center justify-center transition-all',
                  selectedFilters.length < 12
                    ? 'border-brand-primary bg-brand-primary/5 text-brand-primary dark:text-brand-secondary'
                    : 'border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-950 text-brand-text-secondary dark:text-slate-400 hover:bg-brand-surface dark:hover:bg-slate-800'
                )}
                title="Advanced Filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {selectedFilters.length < 12 && (
                  <span className="ml-1 text-[10px] font-bold bg-brand-primary text-white rounded-full h-4 w-4 flex items-center justify-center">
                    {selectedFilters.length}
                  </span>
                )}
              </button>

              {/* Filter Panel Dropdown */}
              <AnimatePresence>
                {filterOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute right-0 top-full mt-2 z-40 w-64 rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-modal space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-brand-border dark:border-slate-800 pb-2">
                      <span className="text-xs font-bold text-brand-text-primary dark:text-slate-200">Advanced Search Filters</span>
                      <button type="button" onClick={handleClearFilters} className="text-[10px] text-brand-primary dark:text-brand-secondary hover:underline">Clear</button>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin text-xs text-brand-text-primary dark:text-slate-350 pr-1">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold py-1 border-b border-brand-border/40 dark:border-slate-800/40">
                        <input
                          type="checkbox"
                          checked={selectedFilters.length === 12}
                          onChange={handleSelectAllFilters}
                          className="rounded border-brand-border bg-white dark:bg-slate-950 text-brand-primary"
                        />
                        Select All Filters
                      </label>

                      <p className="text-[10px] uppercase font-bold text-brand-text-secondary mt-2 tracking-wider">Entities</p>
                      {[
                        { val: 'courses', lbl: 'Courses' },
                        { val: 'students', lbl: 'Students' },
                        { val: 'instructors', lbl: 'Instructors' },
                        { val: 'categories', lbl: 'Categories' }
                      ].map((item) => (
                        <label key={item.val} className="flex items-center gap-2 cursor-pointer py-0.5">
                          <input
                            type="checkbox"
                            checked={selectedFilters.includes(item.val)}
                            onChange={() => handleFilterToggle(item.val)}
                            className="rounded border-brand-border bg-white dark:bg-slate-950 text-brand-primary"
                          />
                          {item.lbl}
                        </label>
                      ))}

                      <p className="text-[10px] uppercase font-bold text-brand-text-secondary mt-2 tracking-wider">Media Types</p>
                      {[
                        { val: 'videos', lbl: 'Videos' },
                        { val: 'pdfs', lbl: 'PDFs' },
                        { val: 'ppts', lbl: 'PPT Slides' },
                        { val: 'assignments', lbl: 'Assignments' }
                      ].map((item) => (
                        <label key={item.val} className="flex items-center gap-2 cursor-pointer py-0.5">
                          <input
                            type="checkbox"
                            checked={selectedFilters.includes(item.val)}
                            onChange={() => handleFilterToggle(item.val)}
                            className="rounded border-brand-border bg-white dark:bg-slate-950 text-brand-primary"
                          />
                          {item.lbl}
                        </label>
                      ))}

                      <p className="text-[10px] uppercase font-bold text-brand-text-secondary mt-2 tracking-wider">Statuses</p>
                      {[
                        { val: 'published', lbl: 'Published' },
                        { val: 'draft', lbl: 'Draft' },
                        { val: 'active', lbl: 'Active' },
                        { val: 'inactive', lbl: 'Inactive' }
                      ].map((item) => (
                        <label key={item.val} className="flex items-center gap-2 cursor-pointer py-0.5">
                          <input
                            type="checkbox"
                            checked={selectedFilters.includes(item.val)}
                            onChange={() => handleFilterToggle(item.val)}
                            className="rounded border-brand-border bg-white dark:bg-slate-950 text-brand-primary"
                          />
                          {item.lbl}
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Live Search Suggestions Dropdown */}
          <AnimatePresence>
            {searchOpen && searchQuery.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute left-0 mt-2 z-40 w-full max-w-lg rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-modal overflow-hidden"
              >
                <div className="px-3 py-1.5 border-b border-brand-border dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider text-brand-text-secondary">
                  Live Search Results ({searchResults.length})
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-8 text-center text-xs text-brand-text-secondary">
                    No results match "{searchQuery}" under active filters.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto scrollbar-thin">
                    {searchResults.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSuggestionClick(item.link)}
                        className="flex w-full items-center gap-3 px-3 py-2 hover:bg-brand-surface dark:hover:bg-slate-800/60 rounded-xl text-left transition-colors"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary/10 dark:bg-brand-secondary/10 text-brand-primary dark:text-brand-secondary shrink-0">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-semibold text-xs text-brand-text-primary dark:text-slate-100 truncate">
                              {highlightText(item.title, searchQuery)}
                            </h4>
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-brand-surface dark:bg-slate-800 px-1.5 py-0.5 rounded text-brand-text-secondary dark:text-slate-400">
                              {item.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-brand-text-secondary dark:text-slate-400 truncate mt-0.5">
                            {highlightText(item.subtitle, searchQuery)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl p-2 text-brand-text-secondary dark:text-slate-400 hover:bg-brand-surface dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-600" />}
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-xl p-2 text-brand-text-secondary dark:text-slate-400 hover:bg-brand-surface dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadNotifCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 top-full mt-2 z-40 w-80 rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-modal overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-brand-border dark:border-slate-800 px-3 py-2">
                  <span className="text-xs font-bold text-brand-text-primary dark:text-slate-200">System Notifications</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={markAllNotificationsAsRead} className="text-[10px] font-semibold text-brand-primary dark:text-brand-secondary hover:underline">Mark all read</button>
                    <span className="text-brand-border dark:text-slate-800">|</span>
                    <button type="button" onClick={clearNotifications} className="text-[10px] font-semibold text-brand-text-secondary hover:underline">Clear</button>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-brand-text-secondary">
                    No new notifications.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto scrollbar-thin">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          'p-3 border-b border-brand-border/40 dark:border-slate-800/40 last:border-0 text-left transition-colors relative',
                          !notif.read ? 'bg-brand-primary/[0.02] dark:bg-brand-secondary/[0.04]' : ''
                        )}
                      >
                        {!notif.read && (
                          <div className="absolute top-4 left-2.5 h-1.5 w-1.5 rounded-full bg-brand-primary dark:bg-brand-secondary" />
                        )}
                        <div className="pl-3">
                          <h4 className="font-semibold text-xs text-brand-text-primary dark:text-slate-200">{notif.title}</h4>
                          <p className="text-[10px] text-brand-text-secondary dark:text-slate-400 mt-0.5">{notif.message}</p>
                          <p className="text-[9px] text-brand-text-secondary/65 mt-1 font-medium">{formatDateTime(notif.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User profile dropdown indicator */}
        <div className="flex items-center gap-2 rounded-full border border-brand-border dark:border-slate-800 px-3 py-1.5 bg-white dark:bg-slate-900 transition-colors">
          <img
            src={user?.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=Admin"}
            alt={user?.fullName || "Admin"}
            className="h-7 w-7 rounded-full border border-black/5 bg-slate-100 shrink-0"
          />
          <span className="hidden sm:inline text-sm font-medium text-brand-text-primary dark:text-slate-350">{user?.fullName || 'Admin'}</span>
        </div>
      </div>
    </header>
  );
}


