import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { studentAuthService } from '@/auth-lms/student/studentAuthService';
import Button from '@/components/ui-lms/Button';
import Input from '@/components/ui-lms/Input';
import Logo from '@/components/ui-lms/Logo';
import { useToast } from '@/hooks-lms/useToast';

export default function StudentResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const token = searchParams.get('token') || 'mock-reset-token';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await studentAuthService.resetPassword(token, password);
      setSuccess(true);
      showToast('Password has been updated!', 'success');
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
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
        <div className="flex flex-col items-center justify-center text-center font-semibold">
          <Logo className="mb-2" variant="light" size="lg" />
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-brand-text-secondary">
            Set a new secure password for your student profile
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-650"
          >
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
            <p className="font-semibold">{error}</p>
          </motion.div>
        )}

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <div className="flex justify-center">
              <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-600">
                <CheckCircle className="h-10 w-10" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-slate-800 text-sm">Reset Successful!</p>
              <p className="text-xs text-brand-text-secondary leading-relaxed">
                Your password has been updated. You can now use your new password to log in.
              </p>
            </div>
            <Link to="/student/login" className="block">
              <Button className="w-full">Sign In Now</Button>
            </Link>
          </motion.div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full"
                />
                <Lock className="absolute right-3 top-[38px] h-5 w-5 text-slate-400" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base font-semibold transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Updating password...' : 'Update Password'}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

