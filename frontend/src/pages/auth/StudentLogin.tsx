import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Hash, 
  Moon, 
  Sun, 
  Search, 
  ChevronDown, 
  Phone, 
  ArrowLeft,
  User 
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';
import { getPublicBatches } from '../../store/batchSlice';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  enrollmentNumber: z.string().min(3, 'Enter a valid enrollment number'),
  batchId: z.string().min(1, 'Batch selection is required'),
  phone: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export const StudentLogin: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { login } = useAuth();
  const { isDark, toggle } = useTheme();
  
  const { batchList } = useAppSelector((state) => state.batch);

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Searchable Batch Dropdown states
  const [batchSearch, setBatchSearch] = useState('');
  const [batchOpen, setBatchOpen] = useState(false);
  const [selectedBatchName, setSelectedBatchName] = useState('');

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { batchId: '' },
  });

  const watchBatchId = registerForm.watch('batchId');

  // Fetch batches when registering
  useEffect(() => {
    dispatch(getPublicBatches());
  }, [dispatch]);

  // Sync selectedBatchName when watchBatchId or batchList changes
  useEffect(() => {
    if (watchBatchId && batchList.length > 0) {
      const found = batchList.find((b) => String(b.id) === watchBatchId);
      if (found) {
        setSelectedBatchName(found.batchName);
      }
    } else {
      setSelectedBatchName('');
    }
  }, [watchBatchId, batchList]);

  const onLogin = async (data: LoginForm) => {
    try {
      const res = await authService.studentLogin(data);
      login(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/student/assignments');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  const onDirectLogin = async () => {
    try {
      const res = await authService.studentLogin({
        email: 'student@school.edu',
        password: 'password'
      });
      login(res.user, res.token);
      toast.success(`Welcome back, ${res.user.name}!`);
      navigate('/student/assignments');
    } catch (err: any) {
      // Auto-register default account if it doesn't exist
      try {
        let batchId = 1;
        if (batchList && batchList.length > 0) {
          batchId = batchList[0].id;
        }
        const regRes = await authService.studentRegister({
          name: 'Student User',
          email: 'student@school.edu',
          enrollmentNumber: 'ENR-DEMO-001',
          batchId: batchId,
          password: 'password'
        });
        login(regRes.user, regRes.token);
        toast.success('Direct login student account created and authenticated!');
        navigate('/student/assignments');
      } catch (regErr: any) {
        toast.error('Direct login failed.');
      }
    }
  };

  const onRegister = async (data: RegisterForm) => {
    try {
      const payload = {
        ...data,
        batchId: Number(data.batchId),
      };
      const res = await authService.studentRegister(payload);
      login(res.user, res.token);
      toast.success(`Account created! Welcome, ${res.user.name}!`);
      navigate('/student/assignments');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const filteredBatches = batchList.filter((b) =>
    b.batchName.toLowerCase().includes(batchSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC] dark:bg-[#0F172A] relative overflow-hidden font-sans bg-grid-pattern">
      
      {/* Subtle Moving Blurry Background circles */}
      <div className="absolute top-[-15%] left-[-15%] w-[45%] h-[45%] rounded-full bg-[#4A1F4F]/8 dark:bg-[#4A1F4F]/12 blur-3xl animate-blob-1" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[45%] h-[45%] rounded-full bg-[#2563EB]/8 dark:bg-[#2563EB]/12 blur-3xl animate-blob-2" />

      {/* Utilities header */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggle}
          className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-[#4A1F4F] dark:hover:text-purple-400 transition-colors cursor-pointer shadow-sm"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
        </button>
      </div>

      {/* Centered Auth Card */}
      <div className="relative z-10 w-full max-w-[500px] bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-8 sm:p-10 rounded-[20px] shadow-2xl transition-all duration-300">
        
        {/* Branding Title */}
        <div className="text-center space-y-2 mb-6 select-none">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4A1F4F] via-[#7A2676] to-[#2563EB] flex items-center justify-center mx-auto shadow-md">
            <GraduationCap size={26} className="text-white" />
          </div>
          <h1 className="text-[30px] font-black text-slate-900 dark:text-white tracking-tight pt-1">
            Xebia LMS
          </h1>
          <div className="space-y-0.5">
            <h2 className="text-[22px] font-extrabold text-slate-800 dark:text-slate-200">
              {isRegister ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-[15px] text-slate-450 dark:text-slate-500">
              {isRegister ? 'Sign up as a student to get started' : 'Sign in to continue'}
            </p>
          </div>
        </div>

        {isRegister ? (
          <div className="space-y-5">
            {/* Back Arrow to Login */}
            <button
              onClick={() => { setIsRegister(false); registerForm.reset(); }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-450 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer select-none"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </button>

            <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                required
                leftIcon={<User size={16} />}
                error={registerForm.formState.errors.name?.message}
                {...registerForm.register('name')}
              />
              <Input
                label="Enrollment Number"
                placeholder="e.g. ENR2024001"
                required
                leftIcon={<Hash size={16} />}
                error={registerForm.formState.errors.enrollmentNumber?.message}
                {...registerForm.register('enrollmentNumber')}
              />
              <Input
                label="Phone Number (Optional)"
                placeholder="e.g. 9876543210"
                leftIcon={<Phone size={16} />}
                error={registerForm.formState.errors.phone?.message}
                {...registerForm.register('phone')}
              />

              {/* Searchable Batch Dropdown */}
              <div className="relative">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Batch <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={() => setBatchOpen(!batchOpen)}
                    className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl py-2.5 px-3.5 text-left text-sm flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate">{selectedBatchName || 'Select your batch'}</span>
                    <ChevronDown size={16} className="text-slate-400 shrink-0" />
                  </button>
                </div>
                {batchOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-2 space-y-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search batch..."
                        value={batchSearch}
                        onChange={(e) => setBatchSearch(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 pl-8 pr-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {filteredBatches.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-2">No batches found</p>
                      ) : (
                        filteredBatches.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              registerForm.setValue('batchId', String(b.id));
                              setSelectedBatchName(b.batchName);
                              setBatchOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                              watchBatchId === String(b.id) ? 'bg-[#2563EB10] text-[#2563EB] font-bold' : 'text-slate-655 dark:text-slate-350'
                            }`}
                          >
                            {b.batchName}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
                {registerForm.formState.errors.batchId?.message && (
                  <p className="text-xs text-red-500 mt-1">{registerForm.formState.errors.batchId.message}</p>
                )}
              </div>

              <Input
                label="Email"
                type="email"
                placeholder="student@school.edu"
                required
                leftIcon={<Mail size={16} />}
                error={registerForm.formState.errors.email?.message}
                {...registerForm.register('email')}
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  required
                  leftIcon={<Lock size={16} />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                  error={registerForm.formState.errors.password?.message}
                  {...registerForm.register('password')}
                />
              </div>
              
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="brand"
                  size="lg"
                  className="w-full h-12 rounded-xl font-bold cursor-pointer text-[16px]"
                  loading={registerForm.formState.isSubmitting}
                >
                  Create Account
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="student@school.edu"
              required
              leftIcon={<Mail size={16} />}
              error={loginForm.formState.errors.email?.message}
              {...loginForm.register('email')}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                required
                leftIcon={<Lock size={16} />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                error={loginForm.formState.errors.password?.message}
                {...loginForm.register('password')}
              />
            </div>
            
            <div className="pt-2 space-y-2">
              <Button
                type="submit"
                variant="brand"
                size="lg"
                className="w-full h-12 rounded-xl font-bold cursor-pointer text-[16px]"
                loading={loginForm.formState.isSubmitting}
              >
                Sign In
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full h-12 rounded-xl font-bold border-[#2563EB]/25 text-[#2563EB] hover:bg-[#2563EB]/5 cursor-pointer transition-all text-[16px]"
                onClick={onDirectLogin}
              >
                Quick Direct Student Login (Demo)
              </Button>
            </div>
          </form>
        )}

        <div className="text-center pt-3 mt-6 border-t border-slate-200/50 dark:border-slate-800/50">
          <button
            onClick={() => { setIsRegister(!isRegister); loginForm.reset(); registerForm.reset(); }}
            className="text-xs text-[#2563EB] hover:underline font-bold cursor-pointer"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
          <p className="text-xs text-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-3">Other Portals</p>
          <Link
            to="/teacher/login"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-500 dark:text-slate-400 hover:border-[#4A1F4F] hover:text-[#4A1F4F] dark:hover:text-purple-400 transition-all cursor-pointer"
          >
            <GraduationCap size={16} />
            Teacher Portal →
          </Link>
        </div>

      </div>
    </div>
  );
};
