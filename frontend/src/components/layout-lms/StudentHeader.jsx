import React, { useState, useRef, useEffect } from 'react';
import { Bell, Sun, Moon, LogOut, User, Settings, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCatalog } from '@/hooks-lms/useCatalog';
import { useStudentAuth } from '@/auth-lms/student/studentAuthHooks';
import { useTheme } from '@/context-lms/ThemeContext';
import { cn, formatDateTime } from '@/utils-lms';

function getInitials(name) {
  if (!name) return 'ST';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function StudentHeader({ title, subtitle }) {
  const { notifications, markAllNotificationsAsRead, clearNotifications } = useCatalog();
  const { user, logout } = useStudentAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const clickHandler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', clickHandler);
    return () => document.removeEventListener('mousedown', clickHandler);
  }, []);

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-[#334155] bg-white/95 dark:bg-[#111827]/90 backdrop-blur-md px-6 transition-colors duration-200">
      <div>
        {title && (
          <h1 className="text-lg font-bold text-brand-primary dark:text-slate-100 flex items-center gap-2">
            {title}
          </h1>
        )}
        {subtitle && <p className="text-xs text-brand-text-secondary dark:text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl p-2 text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-600" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-xl p-2 text-slate-500 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                className="absolute right-0 top-full mt-2 z-40 w-80 rounded-2xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-2 shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155]/60 px-3 py-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">Notifications</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={markAllNotificationsAsRead} className="text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:underline">Mark all read</button>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <button type="button" onClick={clearNotifications} className="text-[10px] font-bold text-slate-400 dark:text-[#CBD5E1] hover:underline">Clear</button>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs font-medium text-slate-400 dark:text-[#CBD5E1]">
                    No new notifications.
                  </div>
                ) : (
                  <div className="max-h-72 overflow-y-auto scrollbar-thin">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          'p-3 border-b border-slate-100 dark:border-[#334155]/60 last:border-0 text-left transition-colors relative hover:bg-slate-50 dark:hover:bg-[#1E293B]',
                          !notif.read ? 'bg-purple-50/50 dark:bg-purple-950/20' : ''
                        )}
                      >
                        {!notif.read && (
                          <div className="absolute top-4 left-2.5 h-1.5 w-1.5 rounded-full bg-purple-600" />
                        )}
                        <div className="pl-3">
                          <h4 className="font-semibold text-xs text-slate-800 dark:text-[#F8FAFC]">{notif.title}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-[#CBD5E1] mt-0.5">{notif.message}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{formatDateTime(notif.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 rounded-full border border-slate-200 dark:border-[#334155] px-3.5 py-1.5 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#1E293B] transition-all cursor-pointer shadow-sm"
          >
            <div className="h-7 w-7 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-[10px] font-black shrink-0 border border-white/20 shadow-sm select-none">
              {getInitials(user?.fullName)}
            </div>
            <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-[#F8FAFC]">
              {user?.fullName || 'Student'}
            </span>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 z-50 w-56 rounded-2xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-2.5 shadow-2xl space-y-1 select-none"
              >
                {/* User Header Info Card */}
                <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-[#334155]/60 mb-1.5">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-[#F8FAFC] truncate">
                    {user?.fullName || 'Student'}
                  </h4>
                  <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 mt-0.5 uppercase tracking-wider">
                    Student
                  </p>
                </div>

                {/* Profile Link */}
                <Link
                  to="/student/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#2D3748] transition-colors cursor-pointer"
                >
                  <User className="h-4 w-4 text-[#7C3AED]" />
                  <span>Profile</span>
                </Link>

                {/* Settings Link */}
                <Link
                  to="/student/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#2D3748] transition-colors cursor-pointer"
                >
                  <Settings className="h-4 w-4 text-[#7C3AED]" />
                  <span>Settings</span>
                </Link>

                <div className="my-1.5 border-t border-slate-100 dark:border-[#334155]" />

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    navigate('/');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left border-0 bg-transparent"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}



