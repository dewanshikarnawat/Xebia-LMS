import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ShieldAlert, CheckCircle, ArrowLeft } from 'lucide-react';
import { studentAuthService } from '@/auth-lms/student/studentAuthService';
import Button from '@/components/ui-lms/Button';
import Input from '@/components/ui-lms/Input';
import Logo from '@/components/ui-lms/Logo';

export default function StudentForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await studentAuthService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to submit request.');
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
            Reset Password
          </h2>
          <p className="mt-2 text-sm text-brand-text-secondary animate-pulse">
            Enter your student email to request a recovery link
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600"
          >
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-505" />
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
              <p className="font-bold text-slate-800 text-sm">Recovery Link Sent!</p>
              <p className="text-xs text-brand-text-secondary leading-relaxed">
                If the email matches a student account, we have sent instructions to reset your password.
              </p>
            </div>
            <Link to="/student/login" className="block">
              <Button className="w-full">Back to Login</Button>
            </Link>
          </motion.div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <Input
                label="Student Email Address"
                type="email"
                required
                placeholder="aarav.sharma@xebia.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
              <Mail className="absolute right-3 top-[38px] h-5 w-5 text-slate-400" />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base font-semibold transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Sending link...' : 'Send Recovery Link'}
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/student/login"
                className="inline-flex items-center gap-2 text-xs font-semibold text-brand-text-secondary hover:text-brand-primary"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

