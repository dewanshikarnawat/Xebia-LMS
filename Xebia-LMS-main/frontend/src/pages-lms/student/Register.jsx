import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Check, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useStudentAuth } from '@/auth-lms/student/studentAuthHooks';
import Button from '@/components/ui-lms/Button';
import Input from '@/components/ui-lms/Input';
import StudentLogo from '@/components/ui-lms/StudentLogo';

export default function StudentRegisterPage() {
  const { register } = useStudentAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e = {};
    if (!fullName.trim()) {
      e.fullName = 'Full Name is required';
    }

    if (!email) {
      e.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      e.email = 'Please enter a valid email address';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password) {
      e.password = 'Password is required';
    } else if (password.length < 8) {
      e.password = 'Password must be at least 8 characters long';
    } else if (!passwordRegex.test(password)) {
      e.password = 'Password must contain an uppercase letter, lowercase letter, number, and special character';
    }

    if (!confirmPassword) {
      e.confirmPassword = 'Confirm Password is required';
    } else if (confirmPassword !== password) {
      e.confirmPassword = 'Passwords do not match';
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
      await register(fullName, email, password);
      // Redirect to login with success state
      navigate('/student/login', { 
        state: { successMsg: 'Account created successfully. Please sign in.' } 
      });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Educational floating background objects
  const floatingElements = [
    { id: 1, delay: 0, x: '10%', y: '15%', size: 'w-16 h-16', color: 'bg-purple-300/10' },
    { id: 2, delay: 2, x: '80%', y: '12%', size: 'w-20 h-20', color: 'bg-violet-400/10' },
    { id: 3, delay: 4, x: '75%', y: '75%', size: 'w-24 h-24', color: 'bg-indigo-300/10' },
    { id: 4, delay: 1, x: '15%', y: '70%', size: 'w-14 h-14', color: 'bg-purple-400/10' }
  ];

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-tr from-[#faf5ff] via-[#ffffff] to-[#eef2ff] px-4 py-12 overflow-hidden select-none">
      
      {/* ── Educational-Themed Floating elements ── */}
      {floatingElements.map(el => (
        <motion.div
          key={el.id}
          className={`absolute rounded-2xl ${el.size} ${el.color} blur-[2px]`}
          style={{ top: el.y, left: el.x }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: el.delay,
            ease: 'easeInOut'
          }}
        />
      ))}

      {/* Abstract Background SVG shapes (low-opacity educational theme) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {/* Network points & grid lines */}
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(167, 139, 250, 0.3)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8 rounded-2xl border border-brand-border/70 bg-white p-8 shadow-2xl z-10"
      >
        <div className="flex flex-col items-center justify-center text-center font-semibold">
          <StudentLogo className="mb-2" size="lg" />
          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full mt-2">
            Xebia Login Portal
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            Create Account
          </h2>
        </div>

        {serverError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-600"
          >
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
            <p className="font-semibold">{serverError}</p>
          </motion.div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Full Name Input */}
            <div className="relative">
              <Input
                label="Full Name"
                type="text"
                required
                placeholder="Enter your full name"
                value={fullName}
                error={errors.fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full"
              />
              <User className="absolute right-3 top-[38px] h-5 w-5 text-slate-400" />
            </div>

            {/* Email Input */}
            <div className="relative">
              <Input
                label="Email Address"
                type="email"
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
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Confirm Password Input */}
            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={confirmPassword}
                error={errors.confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-base font-semibold text-white bg-[#A78BFA] hover:bg-[#906ef5] transition-all rounded-xl shadow-lg shadow-purple-400/20 flex items-center justify-center gap-2 border-0 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </Button>
        </form>

        <div className="text-center text-sm text-brand-text-secondary mt-4 pt-2 border-t border-brand-border/40">
          Already have an account?{' '}
          <Link
            to="/student/login"
            className="font-semibold text-brand-primary hover:text-brand-primary/80 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

