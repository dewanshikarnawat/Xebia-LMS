import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft, LayoutDashboard, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const adminUser = localStorage.getItem('xebia-lms-user');

  const getDashboardPath = () => {
    if (user?.role === 'student') return '/student/dashboard';
    if (user?.role === 'teacher') return '/teacher/dashboard';
    if (adminUser) return '/admin/dashboard';
    return '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC] dark:bg-[#0B0F19] relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-[#4A1F4F]/5 dark:bg-[#4A1F4F]/10 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[#2563EB]/5 dark:bg-[#2563EB]/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-8 rounded-3xl shadow-2xl text-center space-y-6 flex flex-col items-center">
        
        {/* Stylized 404 Header */}
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#4A1F4F] to-[#7A2676] opacity-15 blur-lg animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4A1F4F] to-[#7A2676] flex items-center justify-center shadow-md">
            <HelpCircle size={40} className="text-white animate-bounce" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-7xl font-black bg-gradient-to-r from-[#4A1F4F] via-[#7A2676] to-[#A855F7] bg-clip-text text-transparent select-none tracking-tight">
            404
          </h1>
          <h2 className="text-lg font-extrabold text-slate-850 dark:text-slate-100">
            Oops! Page not found.
          </h2>
          <p className="text-xs text-slate-450 dark:text-slate-450 leading-relaxed max-w-xs mx-auto">
            The page you are looking for doesn't exist, was removed, or had its name changed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2 pt-2">
          <Button
            variant="brand"
            size="md"
            className="w-full font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-900/10"
            onClick={() => navigate(getDashboardPath())}
            icon={<LayoutDashboard size={16} />}
          >
            Go to Dashboard
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="md"
              className="flex-1 font-bold flex items-center justify-center gap-2 cursor-pointer"
              onClick={() => navigate(-1)}
              icon={<ArrowLeft size={16} />}
            >
              Go Back
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="flex-1 font-bold flex items-center justify-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
              icon={<Home size={16} />}
            >
              Home Page
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default NotFoundPage;
