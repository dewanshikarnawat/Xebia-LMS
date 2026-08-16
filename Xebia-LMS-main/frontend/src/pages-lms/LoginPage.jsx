'use client';

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldAlert, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks-lms/useAuth';
import Button from '@/components/ui-lms/Button';
import Input from '@/components/ui-lms/Input';
import Logo from '@/components/ui-lms/Logo';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Redirect target
  const from = location.state?.from?.pathname || '/admin/dashboard';

  const validate = () => {
    const e = {};
    if (!email) {
      e.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      e.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      e.password = 'Password is required';
    } else if (password.length < 6) {
      e.password = 'Password must be at least 6 characters long';
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      await login(email, password);
      // Redirect to the originally requested route or default dashboard
      navigate(from, { replace: true });
    } catch (err) {
      let errorMsg;
      if (err.response) {
        // Server responded — use its message, or fall back by status code
        errorMsg = err.response.data?.message
          || (err.response.status === 401 || err.response.status === 403
            ? 'Invalid email or password. Please try again.'
            : `Server error (${err.response.status}). Please try again.`);
      } else if (err.request) {
        // Request was sent but no response came back — backend down, wrong URL, or CORS block
        errorMsg = `Can't reach the server at ${import.meta.env.VITE_API_URL || '/api'}. Make sure the backend is running and allows requests from this origin (CORS).`;
      } else {
        errorMsg = err.message || 'Something went wrong. Please try again.';
      }
      setServerError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-brand-primary-dark px-4 py-12 overflow-hidden select-none">
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-accent-teal/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-brand-secondary/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 rounded-2xl border border-white/10 bg-white p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center justify-center text-center">
          <Logo className="mb-2 h-12 w-auto" variant="light" />
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-brand-text-secondary">
            Sign in to the Xebia LMS Admin Panel
          </p>
        </div>

        {serverError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
          >
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-400" />
            <p className="font-medium">{serverError}</p>
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="admin@xebia.com"
                value={email}
                error={errors.email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
              <Mail className="absolute right-3 top-[38px] h-5 w-5 text-slate-400" />
            </div>

            <div className="relative">
              <Input
                label="Password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                error={errors.password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
              <Lock className="absolute right-3 top-[38px] h-5 w-5 text-slate-400" />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-white/10 bg-white/5 text-brand-primary focus:ring-brand-primary focus:ring-offset-slate-900"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                Remember me
              </label>
            </div>
            
            <span className="cursor-pointer text-sm font-medium text-brand-primary hover:text-brand-primary/80 transition-colors">
              Forgot password?
            </span>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-base font-semibold shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/35 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 border-t border-white/5 pt-4">
          <p>Demo Accounts:</p>
          <p className="mt-1">
            Admin: <code className="text-slate-400">admin@xebia.com</code> / <code className="text-slate-400">admin123</code>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

