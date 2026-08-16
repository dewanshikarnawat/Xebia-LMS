import React from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  User,
  LogOut,
  X,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Users,
  HelpCircle,
  Award,
  PlayCircle,
  MessageSquare,
  Trophy,
  Bell,
  Settings,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials } from '../../utils/helpers';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
}

interface SidebarProps {
  role: 'teacher' | 'student';
  isMobileOpen: boolean;
  onClose: () => void;
}

const teacherNav: NavItem[] = [
  { to: '/teacher/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/teacher/batches', icon: <Users size={18} />, label: 'Batches' },
  { to: '/teacher/assignments', icon: <FileText size={18} />, label: 'Assignments' },
  { to: '/teacher/quizzes', icon: <HelpCircle size={18} />, label: 'Quiz' },
  { to: '/teacher/submitted', icon: <ClipboardList size={18} />, label: 'Submitted' },
  { to: '/teacher/certificates', icon: <Award size={18} />, label: 'Certificates Issued' },
  { to: '/teacher/events', icon: <Calendar size={18} />, label: 'Events' },
  { to: '/teacher/profile', icon: <User size={18} />, label: 'Profile' },
];

const studentNav: NavItem[] = [
  { to: '/student/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/student/courses', icon: <BookOpen size={18} />, label: 'All Courses' },
  { to: '/student/my-courses', icon: <GraduationCap size={18} />, label: 'My Courses' },
  { to: '/student/assignments', icon: <FileText size={18} />, label: 'Assignments' },
  { to: '/student/quizzes', icon: <HelpCircle size={18} />, label: 'Quiz' },
  { to: '/student/certificates', icon: <Award size={18} />, label: 'Certificates' },
  { to: '/student/events', icon: <Calendar size={18} />, label: 'Events' },
];

export const Sidebar: React.FC<SidebarProps> = ({ role, isMobileOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = role === 'teacher' ? teacherNav : studentNav;
  const portalLabel = role === 'teacher' ? 'Teacher Portal' : 'Student Portal';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64
          bg-[#4A1F4F] text-white
          border-r border-[#622865]
          rounded-none
          shadow-lg shadow-purple-900/10
          flex flex-col overflow-hidden
          sidebar-transition
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo - Clickable Xebia corporate brand section */}
        <div className="bg-[#4A1F4F] border-b border-[#622865] p-5">
          <div className="flex items-center justify-between">
            <Link to={role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <img src="/xebia_logo.png" alt="Xebia Logo" className="w-10 h-10 object-contain shrink-0" />
              <div>
                <p className="text-xs font-black text-white tracking-wide">Xebia LMS</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-purple-200/60">{portalLabel}</p>
              </div>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden text-purple-200/70 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 select-none">
          <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-300/40">
            Menu
          </p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] cursor-pointer
                ${isActive
                  ? 'bg-[#7A2676] text-white font-semibold shadow-md shadow-purple-950/25'
                  : 'text-purple-100/80 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <span className="shrink-0 flex items-center justify-center">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile at bottom */}
        <div className="p-3 border-t border-[#622865] bg-[#3B1940]">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl mb-1">
            <div className="w-8 h-8 rounded-full bg-[#8A2C90] flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
              {user ? getInitials(user.name) : '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-snug">{user?.name}</p>
              <p className="text-[10px] text-purple-200/70 truncate capitalize leading-tight">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-purple-400 hover:bg-white/5 hover:text-white transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
