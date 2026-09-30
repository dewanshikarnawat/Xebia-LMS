import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldAlert, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { useStudentAuth } from '@/auth-lms/student/studentAuthHooks';
import Button from '@/components/ui-lms/Button';
import Input from '@/components/ui-lms/Input';
import StudentLogo from '@/components/ui-lms/StudentLogo';

export default function StudentLoginPage() {
  const { login } = useStudentAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Login credentials states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.successMsg || '');

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const validate = () => {
    const e = {};
    if (!email) {
      e.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      e.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      e.password = 'Password is required';
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Submit credentials -> Standard direct login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      // Call backend to authenticate user using email/password
      const user = await login(email, password);

      // Redirect based on role
      const userRole = user.role?.toLowerCase();
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
      
    } catch (err) {
      setServerError(err.message || 'Invalid Email or Password.');
    } finally {
      setLoading(false);
    }
  };

  const floatingElements = [
    { id: 1, delay: 0, x: '5%', y: '18%', size: 'w-20 h-20', color: 'bg-purple-300/10' },
    { id: 2, delay: 3, x: '85%', y: '10%', size: 'w-24 h-24', color: 'bg-violet-400/10' },
    { id: 3, delay: 1, x: '80%', y: '75%', size: 'w-28 h-28', color: 'bg-indigo-300/10' },
    { id: 4, delay: 5, x: '10%', y: '70%', size: 'w-16 h-16', color: 'bg-purple-400/10' }
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-tr from-[#faf5ff] via-[#ffffff] to-[#eef2ff] dark:from-[#0B1120] dark:via-[#111827] dark:to-[#0B1120] px-4 py-12 overflow-hidden select-none transition-colors duration-300">
      
      {/* Floating elements background */}
      {floatingElements.map(el => (
        <motion.div
          key={el.id}
          className={`absolute rounded-2xl ${el.size} ${el.color} blur-[2px]`}
          style={{ top: el.y, left: el.x }}
          animate={{
            y: [0, -20, 0],
            rotate: [0, 15, -15, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: el.delay,
            ease: 'easeInOut'
          }}
        />
      ))}

      {/* Grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern-login-std" width="45" height="45" patternUnits="userSpaceOnUse">
              <path d="M 45 0 L 0 0 0 45" fill="none" stroke="rgba(167, 139, 250, 0.35)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern-login-std)" />
        </svg>
      </div>

      <div className="w-full max-w-md z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full rounded-2xl border border-brand-border/70 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-8 shadow-2xl space-y-8 transition-colors duration-300"
        >
          {/* Header logo */}
          <div className="flex flex-col items-center justify-center text-center font-semibold">
            <StudentLogo className="mb-2" size="lg" />
            <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded-full mt-2">
              Xebia Login Portal
            </span>
          </div>

          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
                Xebia Login Portal
              </h2>
            </div>

            {successMessage && (
              <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-600 mb-4">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                <p className="font-semibold">{successMessage}</p>
              </div>
            )}

            {serverError && (
              <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-600 mb-4">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
                <p className="font-semibold">{serverError}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                
                {/* Email Input */}
                <div className="relative">
                  <Input
                    label="Email Address"
                    type="text"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    error={errors.email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                  />
                  <Mail className="absolute right-3 top-[38px] h-5 w-5 text-slate-400" />
                </div>

                {/* Password Input */}
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    error={errors.password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-0"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    defaultChecked
                    className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs text-brand-text-secondary cursor-pointer">
                    Remember me
                  </label>
                </div>
                
                <Link
                  to="/student/forgot-password"
                  className="text-xs font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 text-base font-semibold text-white bg-[#A78BFA] hover:bg-[#906ef5] transition-all rounded-xl shadow-lg shadow-purple-400/20 flex items-center justify-center gap-2 border-0 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </div>
            </form>

            <div className="text-center text-sm text-brand-text-secondary mt-6 pt-3 border-t border-brand-border/40 space-y-4">
              <div className="text-center text-xs text-slate-500 border border-brand-border/50 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                <p className="font-bold text-slate-600 dark:text-slate-350">Demo Student Account:</p>
                <p className="mt-1 font-mono text-[11px] text-purple-600 dark:text-purple-400">
                  aarav.sharma@xebia.com / student123
                </p>
              </div>
              <div>
                Don't have an account?{' '}
                <Link
                  to="/student/register"
                  className="font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

