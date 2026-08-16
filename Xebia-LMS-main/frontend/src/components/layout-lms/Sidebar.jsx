import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Tag, Layers, LayoutDashboard, LogOut, Sun, Moon, Calendar } from 'lucide-react';
import Logo from '@/components/ui-lms/Logo';
import { cn } from '@/utils-lms';
import { useAuth } from '@/hooks-lms/useAuth';

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/enrollments', label: 'Course Enrollments', icon: Layers },
  { href: '/admin/events', label: 'Events', icon: Calendar },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
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

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen flex-col"
      style={{ width: 220, backgroundColor: '#4a1e47' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}
      >
        <Logo variant="dark" />
      </div>

      {/* Nav label */}
      <p
        className="px-5 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: 'rgba(255,255,255,0.35)' }}
      >
        Main Menu
      </p>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-4 scrollbar-thin">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          let active = false;
          if (label === 'Curriculum') {
            active = pathname === href || pathname.startsWith('/admin/curriculum/');
          } else if (label === 'Courses') {
            active = pathname === href || pathname.startsWith('/admin/courses/');
          } else {
            active = pathname === href || pathname.startsWith(`${href}/`);
          }
          return (
            <Link
              key={href}
              to={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-white/10 text-white'
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
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: '#6c1d5f' }}
            >
              {(user.fullName || 'A')[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.fullName || 'Admin User'}</p>
              <p className="truncate text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {user.email || 'admin@xebia.com'}
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


