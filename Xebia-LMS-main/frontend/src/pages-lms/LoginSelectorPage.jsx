import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, ShieldAlert, Sparkles, UserSquare2, ChevronRight } from 'lucide-react';
import Logo from '@/components/ui-lms/Logo';
import Button from '@/components/ui-lms/Button';

export default function LoginSelectorPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-brand-primary-dark px-4 py-12 overflow-hidden select-none">
      {/* Background radial glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-accent-teal/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-brand-secondary/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg space-y-8 rounded-2xl border border-white/10 bg-white p-8 shadow-2xl md:p-10"
      >
        {/* Logo and Header */}
        <div className="flex flex-col items-center justify-center text-center font-semibold">
          <Logo className="mb-4" variant="light" size="lg" />
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            LMS Gateway
          </h2>
          <p className="mt-2.5 text-sm text-brand-text-secondary max-w-sm">
            Choose your login portal to access your personalized learning workspace
          </p>
        </div>

        {/* Buttons Selector Container */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          
          {/* Student Login Card Button */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => navigate('/?role=student')}
            className="group cursor-pointer flex flex-col justify-between rounded-2xl border border-brand-border/70 bg-brand-surface/40 p-6 transition-all hover:bg-brand-surface/90 hover:shadow-lg dark:border-slate-800"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary/10 to-accent-teal/10 text-brand-primary group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-brand-text-primary dark:text-slate-100">
                Student Portal
              </h3>
              <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed">
                Access courses, progress metrics, quiz results, and AI suggestions.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs font-bold text-brand-primary">
              <span>Login as Student</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>

          {/* Admin Login Card Button */}
          <motion.div
            whileHover={{ y: -4 }}
            onClick={() => navigate('/?role=admin')}
            className="group cursor-pointer flex flex-col justify-between rounded-2xl border border-brand-border/70 bg-brand-surface/40 p-6 transition-all hover:bg-brand-surface/90 hover:shadow-lg dark:border-slate-800"
          >
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-secondary/10 to-accent-orange/10 text-brand-secondary group-hover:scale-110 transition-transform">
                <UserSquare2 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-brand-text-primary dark:text-slate-100">
                Admin Panel
              </h3>
              <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed">
                Manage curriculum cataloging, configure learning categories, and upload files.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs font-bold text-brand-secondary">
              <span>Login as Admin</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.div>

        </div>

        <div className="text-center text-xs text-slate-500 border-t border-brand-border/40 pt-5 space-y-3">
          <div className="rounded-xl bg-slate-50 p-3.5 text-left border border-slate-100 space-y-1.5 font-medium">
            <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Demo Credentials:</p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <p className="text-purple-700 font-bold">Student Portal:</p>
                <p className="text-slate-600 font-mono mt-0.5">aarav.sharma@xebia.com</p>
                <p className="text-slate-600 font-mono">student123</p>
              </div>
              <div>
                <p className="text-brand-secondary font-bold">Admin Panel:</p>
                <p className="text-slate-600 font-mono mt-0.5">admin@xebia.com</p>
                <p className="text-slate-600 font-mono">admin123</p>
              </div>
            </div>
          </div>
          <p className="font-semibold text-brand-text-primary flex items-center justify-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
            Secure Enterprise Learning Management Ecosystem
          </p>
        </div>
      </motion.div>
    </div>
  );
}

