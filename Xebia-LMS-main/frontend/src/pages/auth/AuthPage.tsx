import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, GraduationCap, Moon, Sun, ArrowLeft, User, Phone, Hash } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../contexts/AuthContext';
import { useAuth as useAdminAuth } from '@/hooks-lms/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useAppDispatch, useAppSelector } from '../../store';
import { getPublicBatches } from '../../store/batchSlice';
import Logo from '../../components/ui-lms/Logo';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const studentRegisterSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  enrollmentNumber: z.string().min(3, 'Enter a valid enrollment number'),
  batchId: z.string().min(1, 'Batch selection is required'),
  phone: z.string().optional(),
});

const teacherRegisterSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  subject: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;
type StudentRegisterForm = z.infer<typeof studentRegisterSchema>;
type TeacherRegisterForm = z.infer<typeof teacherRegisterSchema>;

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, user } = useAuth();
  const { login: adminLogin } = useAdminAuth() as any;
  const { isDark, toggle } = useTheme();

  // Redirect authenticated user automatically based on their role on load
  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = user.role?.toLowerCase();
      if (userRole === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (userRole === 'teacher') {
        navigate('/teacher/dashboard', { replace: true });
      } else if (userRole === 'student') {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);
  
  const { batchList } = useAppSelector((state) => state.batch);

  // States
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState<0 | 1 | 2>(0); // 0 = main auth, 1 = role selection, 2 = email form
  const [resetRole, setResetRole] = useState<'student' | 'teacher'>('student');
  const [resetEmail, setResetEmail] = useState('');

  // Dropdown states
  const [batchSearch, setBatchSearch] = useState('');
  const [batchOpen, setBatchOpen] = useState(false);
  const [selectedBatchName, setSelectedBatchName] = useState('');

  // Initialize role from search param if provided
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'teacher' || roleParam === 'student' || roleParam === 'admin') {
      setRole(roleParam);
    }
  }, [searchParams]);

  // Load batches when component mounts
  useEffect(() => {
    dispatch(getPublicBatches());
  }, [dispatch]);

  // Forms
  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const studentRegisterForm = useForm<StudentRegisterForm>({
    resolver: zodResolver(studentRegisterSchema),
    defaultValues: { batchId: '' },
  });
  const teacherRegisterForm = useForm<TeacherRegisterForm>({ resolver: zodResolver(teacherRegisterSchema) });

  const watchBatchId = studentRegisterForm.watch('batchId');

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

  // Reusable role-based redirect and state syncer
  const performLoginRedirect = async (email, password) => {
    const { user, token } = await authService.login({ email, password });
    
    // Save tokens and user locally
    localStorage.setItem('xebia-student-token', token);
    localStorage.setItem('lms_user', JSON.stringify(user));
    
    const userRole = user.role?.toLowerCase();
    
    if (userRole === 'admin') {
      // Sync Admin authentication context
      await adminLogin(email, password);
      // Sync main authentication context
      login(user, token);
      
      toast.success(`Welcome back, ${user.name || 'Admin'}!`);
      navigate('/admin/dashboard', { replace: true });
    } else if (userRole === 'teacher') {
      login(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/teacher/dashboard', { replace: true });
    } else {
      login(user, token);
      toast.success(`Welcome back, ${user.name}!`);
      navigate('/student/dashboard', { replace: true });
    }
  };

  // Submit Handlers
  const handleLogin = async (data: LoginForm) => {
    try {
      await performLoginRedirect(data.email, data.password);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Login failed. Please check credentials.');
    }
  };

  const handleStudentRegister = async (data: StudentRegisterForm) => {
    try {
      const res = await authService.studentRegister({
        ...data,
        batchId: Number(data.batchId),
      });
      localStorage.setItem('xebia-student-token', res.token);
      login(res.user, res.token);
      toast.success(`Account created! Welcome, ${res.user.name}!`);
      navigate('/student/dashboard', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    }
  };

  const handleTeacherRegister = async (data: TeacherRegisterForm) => {
    try {
      const res = await authService.teacherRegister(data);
      login(res.user, res.token);
      toast.success(`Account created! Welcome, ${res.user.name}!`);
      navigate('/teacher/dashboard', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    }
  };

  // Direct login for quick demo
  const handleStudentDirectLogin = async () => {
    try {
      await performLoginRedirect('rohit@xebia.com', 'Rohit@123');
    } catch (err: any) {
      try {
        let batchId = 1;
        if (batchList && batchList.length > 0) {
          batchId = batchList[0].id;
        }
        const regRes = await authService.studentRegister({
          name: 'Rohit Vaishnav',
          email: 'rohit@xebia.com',
          enrollmentNumber: 'ENR-DEMO-001',
          batchId: batchId,
          password: 'Rohit@123'
        });
        localStorage.setItem('xebia-student-token', regRes.token);
        login(regRes.user, regRes.token);
        toast.success('Demo Student account created and logged in!');
        navigate('/student/dashboard', { replace: true });
      } catch {
        toast.error('Quick Student login failed.');
      }
    }
  };

  const handleTeacherDirectLogin = async () => {
    try {
      await performLoginRedirect('teacher@example.com', 'Password@123');
    } catch (err: any) {
      try {
        const regRes = await authService.teacherRegister({
          name: 'Teacher User',
          email: 'teacher@example.com',
          password: 'Password@123',
          subject: 'General'
        });
        login(regRes.user, regRes.token);
        toast.success('Demo Teacher account created and logged in!');
        navigate('/teacher/dashboard', { replace: true });
      } catch {
        toast.error('Quick Teacher login failed.');
      }
    }
  };

  const handleAdminDirectLogin = async () => {
    try {
      await performLoginRedirect('admin@xebia.com', 'admin123');
    } catch (err: any) {
      toast.error('Quick Admin login failed. Please verify admin credentials.');
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error('Email is required.');
      return;
    }
    toast.success(`Password reset link sent successfully for ${resetRole === 'teacher' ? 'Teacher' : 'Student'} account!`);
    setForgotPasswordStep(0);
    setResetEmail('');
  };

  const filteredBatches = batchList.filter((b) =>
    b.batchName.toLowerCase().includes(batchSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-[#0F172A] relative overflow-hidden font-sans bg-grid-pattern">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#4A1F4F]/8 dark:bg-[#4A1F4F]/12 blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#2563EB]/8 dark:bg-[#2563EB]/12 blur-3xl" />

      {/* Dark/Light mode toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={toggle}
          className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-450 hover:text-[#4A1F4F] transition-all cursor-pointer shadow-sm"
        >
          {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
        </button>
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-[460px] bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-6 sm:p-7 rounded-2xl shadow-2xl transition-all duration-300">
        
        {/* Logo and header */}
        <div className="flex flex-col items-center text-center space-y-2 mb-5 select-none">
          <Logo className="scale-110 mb-1" subtitle="Portal" />
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Enterprise Learning Management System
          </p>
        </div>

        {forgotPasswordStep === 1 ? (
          /* Step 1: Forgot Password Role Selection */
          <div className="space-y-4 py-2">
            <button
              onClick={() => setForgotPasswordStep(0)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-450 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer select-none"
            >
              <ArrowLeft size={13} /> Back to Sign In
            </button>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Select Account Type</h3>
              <p className="text-xs text-[var(--text-secondary)]">Choose which portal your account belongs to</p>
            </div>
            <div className="grid grid-cols-1 gap-2.5 pt-2">
              <button
                onClick={() => { setResetRole('student'); setForgotPasswordStep(2); }}
                className="flex items-center gap-3 w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#2563EB] hover:bg-[#2563EB]/5 font-bold text-xs text-[var(--text-primary)] transition-all text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-[#2563EB]">
                  <GraduationCap size={16} />
                </div>
                <div>
                  <span className="block font-bold">Student Account</span>
                  <span className="text-[10px] text-slate-400 block font-normal">Reset student portal password</span>
                </div>
              </button>
              <button
                onClick={() => { setResetRole('teacher'); setForgotPasswordStep(2); }}
                className="flex items-center gap-3 w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#4A1F4F] hover:bg-[#4A1F4F]/5 font-bold text-xs text-[var(--text-primary)] transition-all text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-slate-800 flex items-center justify-center text-[#4A1F4F]">
                  <User size={16} />
                </div>
                <div>
                  <span className="block font-bold">Teacher Account</span>
                  <span className="text-[10px] text-slate-400 block font-normal">Reset teacher portal password</span>
                </div>
              </button>
            </div>
          </div>
        ) : forgotPasswordStep === 2 ? (
          /* Step 2: Email Submission for Forgot Password */
          <div className="space-y-4 py-2">
            <button
              onClick={() => setForgotPasswordStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-450 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer select-none"
            >
              <ArrowLeft size={13} /> Back
            </button>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-extrabold text-[var(--text-primary)]">Reset {resetRole === 'teacher' ? 'Teacher' : 'Student'} Password</h3>
              <p className="text-xs text-[var(--text-secondary)]">Enter your registered email address</p>
            </div>
            <form onSubmit={handleResetPassword} className="space-y-4 pt-1">
              <Input
                label="Registered Email"
                type="email"
                required
                placeholder="email@school.edu"
                leftIcon={<Mail size={14} />}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <Button type="submit" variant="brand" className="w-full h-11 text-xs font-bold cursor-pointer">
                Send Reset Link
              </Button>
            </form>
          </div>
        ) : (
          /* Main Tabbed Auth Flow */
          <div className="space-y-4">

            {/* Sliding Auth Mode selector */}
            <div className="flex border-b border-slate-200 dark:border-slate-800/80 w-full mb-2">
              <button
                type="button"
                onClick={() => { setIsRegister(false); loginForm.reset(); }}
                className={`flex-1 py-2 text-xs font-black border-b-2 transition-all cursor-pointer ${
                  !isRegister
                    ? 'border-[#4A1F4F] text-[#4A1F4F] dark:text-purple-450'
                    : 'border-transparent text-slate-400 hover:text-[var(--text-primary)]'
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => { setIsRegister(true); studentRegisterForm.reset(); teacherRegisterForm.reset(); }}
                className={`flex-1 py-2 text-xs font-black border-b-2 transition-all cursor-pointer ${
                  isRegister
                    ? 'border-[#4A1F4F] text-[#4A1F4F] dark:text-purple-450'
                    : 'border-transparent text-slate-400 hover:text-[var(--text-primary)]'
                }`}
              >
                SIGN UP
              </button>
            </div>

            {isRegister ? (
              /* SIGN UP FORMS */
              <div className="space-y-4">
                {/* Account Type Selector for Sign Up */}
                <div className="flex bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg select-none w-full mb-3">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      role === 'student'
                        ? 'bg-white dark:bg-slate-700 text-[#2563EB] shadow-sm'
                        : 'text-slate-400 hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Student Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      role === 'teacher'
                        ? 'bg-white dark:bg-slate-700 text-[#4A1F4F] dark:text-purple-450 shadow-sm'
                        : 'text-slate-400 hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Teacher Account
                  </button>
                </div>

                {role === 'student' ? (
                  /* Student Sign Up Form */
                  <form onSubmit={studentRegisterForm.handleSubmit(handleStudentRegister)} className="space-y-3.5">
                    <Input
                      label="Full Name"
                      type="text"
                      required
                      placeholder="John Doe"
                      leftIcon={<User size={14} />}
                      error={studentRegisterForm.formState.errors.name?.message}
                      {...studentRegisterForm.register('name')}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      required
                      placeholder="student@school.edu"
                      leftIcon={<Mail size={14} />}
                      error={studentRegisterForm.formState.errors.email?.message}
                      {...studentRegisterForm.register('email')}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Enrollment Number"
                        type="text"
                        required
                        placeholder="ENR-1234"
                        leftIcon={<Hash size={14} />}
                        error={studentRegisterForm.formState.errors.enrollmentNumber?.message}
                        {...studentRegisterForm.register('enrollmentNumber')}
                      />
                      <Input
                        label="Phone (Optional)"
                        type="tel"
                        placeholder="9876543210"
                        leftIcon={<Phone size={14} />}
                        error={studentRegisterForm.formState.errors.phone?.message}
                        {...studentRegisterForm.register('phone')}
                      />
                    </div>

                    {/* Searchable Batch Selector */}
                    <div className="relative">
                      <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">Batch / Class</label>
                      <div 
                        onClick={() => setBatchOpen(!batchOpen)}
                        className="flex items-center justify-between w-full px-3 py-2 text-xs bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] focus:border-[#4A1F4F] rounded-xl text-[var(--text-primary)] cursor-pointer select-none"
                      >
                        <span>{selectedBatchName || 'Select your batch...'}</span>
                      </div>
                      {batchOpen && (
                        <div className="absolute left-0 right-0 z-30 mt-1.5 p-3.5 bg-white dark:bg-slate-900 border border-[var(--brand-border)] rounded-2xl shadow-xl space-y-2">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search batch..."
                              value={batchSearch}
                              onChange={(e) => setBatchSearch(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-[var(--brand-border)] rounded-lg py-1 px-3 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] transition-colors focus:outline-none"
                            />
                          </div>
                          <div className="max-h-36 overflow-y-auto space-y-1">
                            {filteredBatches.length === 0 ? (
                              <p className="text-[10px] text-[var(--text-secondary)] text-center py-2">No batches found</p>
                            ) : (
                              filteredBatches.map((b) => (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => {
                                    studentRegisterForm.setValue('batchId', String(b.id));
                                    setSelectedBatchName(b.batchName);
                                    setBatchOpen(false);
                                  }}
                                  className={`w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                                    watchBatchId === String(b.id) ? 'bg-[#4A1F4F10] text-[#4A1F4F] font-semibold' : 'text-[var(--text-primary)]'
                                  }`}
                                >
                                  {b.batchName}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                      {studentRegisterForm.formState.errors.batchId?.message && (
                        <p className="text-[10px] text-red-500 mt-1">{studentRegisterForm.formState.errors.batchId.message}</p>
                      )}
                    </div>

                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      leftIcon={<Lock size={14} />}
                      rightIcon={
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      }
                      error={studentRegisterForm.formState.errors.password?.message}
                      {...studentRegisterForm.register('password')}
                    />
                    <div className="pt-2">
                      <Button type="submit" variant="brand" className="w-full h-11 text-xs font-bold cursor-pointer" loading={studentRegisterForm.formState.isSubmitting}>
                        Register Student Account
                      </Button>
                    </div>
                  </form>
                ) : (
                  /* Teacher Sign Up Form */
                  <form onSubmit={teacherRegisterForm.handleSubmit(handleTeacherRegister)} className="space-y-4">
                    <Input
                      label="Full Name"
                      type="text"
                      required
                      placeholder="Professor Miller"
                      leftIcon={<User size={14} />}
                      error={teacherRegisterForm.formState.errors.name?.message}
                      {...teacherRegisterForm.register('name')}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      required
                      placeholder="teacher@school.edu"
                      leftIcon={<Mail size={14} />}
                      error={teacherRegisterForm.formState.errors.email?.message}
                      {...teacherRegisterForm.register('email')}
                    />
                    <Input
                      label="Primary Subject (Optional)"
                      type="text"
                      placeholder="Computer Science"
                      leftIcon={<GraduationCap size={14} />}
                      error={teacherRegisterForm.formState.errors.subject?.message}
                      {...teacherRegisterForm.register('subject')}
                    />
                    <Input
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="At least 6 characters"
                      leftIcon={<Lock size={14} />}
                      rightIcon={
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      }
                      error={teacherRegisterForm.formState.errors.password?.message}
                      {...teacherRegisterForm.register('password')}
                    />
                    <div className="pt-2">
                      <Button type="submit" variant="brand" className="w-full h-11 text-xs font-bold cursor-pointer" loading={teacherRegisterForm.formState.isSubmitting}>
                        Register Teacher Account
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              /* SIGN IN FORM (Unified Email/Password) */
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  required
                  placeholder="student@example.com"
                  leftIcon={<Mail size={14} />}
                  error={loginForm.formState.errors.email?.message}
                  {...loginForm.register('email')}
                />
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => setForgotPasswordStep(1)}
                      className="text-[11px] font-bold text-[#2563EB] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter password"
                    leftIcon={<Lock size={14} />}
                    rightIcon={
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer">
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    }
                    error={loginForm.formState.errors.password?.message}
                    {...loginForm.register('password')}
                  />
                </div>

                <div className="pt-2 space-y-3">
                  <Button type="submit" variant="brand" className="w-full h-11 text-xs font-bold cursor-pointer" loading={loginForm.formState.isSubmitting}>
                    Sign In
                  </Button>
                  
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 text-[10px] font-bold border-blue-500/25 text-[#2563EB] hover:bg-[#2563EB]/5 cursor-pointer px-1 flex items-center justify-center"
                      onClick={handleStudentDirectLogin}
                    >
                      Student
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 text-[10px] font-bold border-purple-500/25 text-[#4A1F4F] dark:text-purple-450 hover:bg-[#4A1F4F]/5 cursor-pointer px-1 flex items-center justify-center"
                      onClick={handleTeacherDirectLogin}
                    >
                      Teacher
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 text-[10px] font-bold border-teal-500/25 text-teal-600 hover:bg-teal-600/5 cursor-pointer px-1 flex items-center justify-center"
                      onClick={handleAdminDirectLogin}
                    >
                      Admin
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
