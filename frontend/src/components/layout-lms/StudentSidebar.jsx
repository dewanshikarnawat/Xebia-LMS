import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen, LayoutDashboard, PlayCircle, ClipboardList, FileCheck2, BellRing,
  User, Settings, LogOut, Sun, Moon
} from 'lucide-react';
import StudentLogo from '@/components/ui-lms/StudentLogo';
import { cn } from '@/utils-lms';
import { useStudentAuth } from '@/auth-lms/student/studentAuthHooks';
import { useTheme } from '@/context-lms/ThemeContext';

const STUDENT_NAV_ITEMS = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/courses', label: 'My Courses', icon: BookOpen },
  { href: '/student/learning-content', label: 'Learning Content', icon: PlayCircle },
  { href: '/student/assignments', label: 'Assignments', icon: ClipboardList },
  { href: '/student/assessments', label: 'Assessments', icon: FileCheck2 },
  { href: '/student/notifications', label: 'Notifications', icon: BellRing },
  { href: '/student/profile', label: 'Profile', icon: User },
  { href: '/student/settings', label: 'Settings', icon: Settings },
];

export default function StudentSidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useStudentAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen flex-col bg-[#4a1e47] dark:bg-[#111827] transition-colors duration-200"
      style={{ width: 220 }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}
      >
        <StudentLogo size="lg" />
      </div>

      {/* Nav label */}
      <p
        className="px-5 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        Student Menu
      </p>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-4 scrollbar-thin">
        {STUDENT_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all cursor-pointer',
                active
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-white/65 hover:bg-white/5 hover:text-white'
              )}
              style={active ? { backgroundColor: '#01ac9f22' } : {}}
            >
              <Icon className="h-[15px] w-[15px] shrink-0" strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      {user && (
        <div
          className="px-4 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white bg-[#7C3AED]"
            >
              {(user.fullName || 'S')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.fullName || 'Student User'}</p>
              <p className="truncate text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {user.email || 'student@xebia.com'}
              </p>
            </div>
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="shrink-0 rounded-md p-1.5 transition-colors hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.40)' }}
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={logout}
              className="shrink-0 rounded-md p-1.5 transition-colors hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.40)' }}
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}



