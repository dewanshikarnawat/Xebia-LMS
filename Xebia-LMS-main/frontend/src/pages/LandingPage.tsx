import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  BookOpen, 
  Moon, 
  Sun, 
  ArrowRight, 
  FileText, 
  CheckSquare, 
  User, 
  Award, 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  Smartphone,
  Laptop,
  CheckCircle,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const LandingPage: React.FC = () => {
  const { isDark, toggle } = useTheme();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    assignments: 0,
    quizzes: 0,
    certificates: 0
  });

  // Animated stats count up simulation
  useEffect(() => {
    const duration = 2000;
    const steps = 50;
    const stepTime = duration / steps;
    let currentStep = 0;

    const targets = {
      students: 5240,
      teachers: 240,
      assignments: 14890,
      quizzes: 8430,
      certificates: 3820
    };

    const timer = setInterval(() => {
      currentStep++;
      setStats({
        students: Math.min(targets.students, Math.floor((targets.students / steps) * currentStep)),
        teachers: Math.min(targets.teachers, Math.floor((targets.teachers / steps) * currentStep)),
        assignments: Math.min(targets.assignments, Math.floor((targets.assignments / steps) * currentStep)),
        quizzes: Math.min(targets.quizzes, Math.floor((targets.quizzes / steps) * currentStep)),
        certificates: Math.min(targets.certificates, Math.floor((targets.certificates / steps) * currentStep))
      });

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <FileText className="text-purple-600 dark:text-purple-400" size={24} />,
      title: "Assignment Management",
      desc: "Create rich, multi-type assignments, upload reference materials, set deadlines, and evaluate student work seamlessly."
    },
    {
      icon: <CheckSquare className="text-blue-600 dark:text-blue-400" size={24} />,
      title: "Quiz Management",
      desc: "Build manual or auto-graded tests. Supports multiple question types, time limits, and spreadsheet bulk imports."
    },
    {
      icon: <User className="text-teal-600 dark:text-teal-400" size={24} />,
      title: "Student Dashboard",
      desc: "Personalized dashboard highlighting upcoming tasks, current subject averages, quiz attempts, and course calendars."
    },
    {
      icon: <GraduationCap className="text-pink-600 dark:text-pink-400" size={24} />,
      title: "Teacher Dashboard",
      desc: "At-a-glance gradebook summaries, quick-review workflows, and batch-wise performance trends."
    },
    {
      icon: <Award className="text-amber-600 dark:text-amber-400" size={24} />,
      title: "Certificates",
      desc: "Automatically generate verified, downloadable, and shareable achievement credentials based on completion rules."
    },
    {
      icon: <BarChart3 className="text-indigo-600 dark:text-indigo-400" size={24} />,
      title: "Analytics",
      desc: "Deep insights into subject performance, quiz item analysis, class averages, and grading histograms."
    },
    {
      icon: <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={24} />,
      title: "Progress Tracking",
      desc: "Visual logs monitoring student assignment submissions, attendance ratios, and grade projections."
    },
    {
      icon: <Laptop className="text-rose-600 dark:text-rose-400" size={24} />,
      title: "Easy Learning",
      desc: "Responsive web access, dark mode preferences, intuitive interfaces, and unified workspace layout."
    }
  ];

  const whyChoosePoints = [
    { title: "Modern Learning Experience", desc: "Sleek card surfaces, clear hierarchy, and smooth micro-interactions that elevate engagement." },
    { title: "Easy Assignment Management", desc: "File attachment uploads, flexible grading ranges, and clean review status tabs." },
    { title: "Interactive Quiz System", desc: "Timed quiz attempts, auto-grading, and instant student performance breakdowns." },
    { title: "Real-time Progress Tracking", desc: "KPI widgets and interactive bars detailing certificates earned and pending submissions." },
    { title: "Secure Authentication", desc: "JWT-secured login sessions, distinct student/teacher roles, and custom student enrollment checks." },
    { title: "Responsive Across All Devices", desc: "Designed for desktops, tablets, and phones so you never miss a submission." }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col text-slate-800 dark:text-slate-100 overflow-x-hidden font-sans bg-grid-pattern">
      
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4A1F4F] via-[#7A2676] to-[#2563EB] flex items-center justify-center shadow-md">
            <GraduationCap size={22} className="text-white" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Learning Management System</p>
            <p className="text-sm font-black text-slate-850 dark:text-white tracking-tight">Xebia LMS</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#4A1F4F] dark:hover:text-purple-400 transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} />}
          </button>
          <Link
            to="/student/login?mode=choose"
            className="hidden sm:inline-flex px-5 py-2 text-xs font-bold bg-[#4A1F4F] hover:bg-[#622865] text-white rounded-xl shadow transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Floating gradient blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[#4A1F4F]/5 dark:bg-[#4A1F4F]/10 blur-3xl animate-blob-1" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#2563EB]/5 dark:bg-[#2563EB]/10 blur-3xl animate-blob-2" />
        
        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4A1F4F]/5 dark:bg-purple-950/30 border border-[#4A1F4F]/10 dark:border-purple-800/30 text-xs font-bold text-[#7A2676] dark:text-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Empowering Modern Education
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
            Learning Made Simple,<br />
            <span className="text-gradient-primary">Teaching Made Powerful</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Manage assignments, quizzes, student progress, certificates, and learning resources from one intelligent learning management platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link
              to="/student/login?mode=choose"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#4A1F4F] to-[#7A2676] hover:from-[#622865] hover:to-[#8E328A] text-sm font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/student/login?tab=student"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
            >
              Student Portal
            </Link>
          </div>
        </div>

        {/* Decorative interface mock-up design (CSS/SVG) */}
        <div className="w-full max-w-5xl mt-16 p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm shadow-2xl relative select-none">
          <div className="flex gap-1.5 mb-3">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <div className="bg-slate-50 dark:bg-[#1E293B] rounded-xl overflow-hidden aspect-[16/9] border border-slate-200/60 dark:border-slate-800 flex flex-col">
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3.5 px-5 flex justify-between items-center">
              <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="w-20 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
            <div className="flex-1 p-6 grid grid-cols-4 gap-4">
              <div className="col-span-1 bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`h-3 rounded-md bg-slate-100 dark:bg-slate-800 ${i === 0 ? 'w-full' : i === 1 ? 'w-5/6' : 'w-4/6'}`} />
                ))}
              </div>
              <div className="col-span-3 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-100 dark:border-slate-800 space-y-4">
                <div className="h-6 w-1/3 bg-[#4A1F4F]/10 dark:bg-purple-900/20 rounded-md" />
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-2">
                      <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 dark:bg-blue-900/20" />
                      <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded-md" />
                      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 bg-white dark:bg-slate-900/40 border-t border-b border-slate-250/20 dark:border-slate-800/40 px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs uppercase font-extrabold text-[#7A2676] dark:text-purple-400 tracking-wider">Features Suite</h2>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Everything you need to succeed</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Explore professional features built specifically for modern learning environments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => (
              <div 
                key={idx}
                className="p-6 bg-[#F8FAFC]/50 dark:bg-[#1E293B]/40 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl hover:border-[#4A1F4F]/50 dark:hover:border-purple-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-md mb-5 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{feat.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Our LMS Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-xs uppercase font-extrabold text-[#7A2676] dark:text-purple-400 tracking-wider">Why Xebia LMS</h2>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Why Choose Our LMS?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              We focus on clean visual aesthetics, responsiveness, and performance, delivering an enterprise product that students and teachers love.
            </p>
            <div className="space-y-4 pt-2">
              {whyChoosePoints.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{pt.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{pt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#2563EB]/10 to-[#4A1F4F]/10 blur-2xl" />
            <div className="relative bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center gap-3">
                <ShieldCheck size={28} className="text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Secure and Verified Portal</h4>
                  <p className="text-[10px] text-slate-400">Rest assured of safe and responsive connections.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-750 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-450 uppercase tracking-wider">Server Status:</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" /> Online & Responsive
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-750 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-450 uppercase tracking-wider">Global Latency:</span>
                <span className="text-blue-600 dark:text-blue-400">~ 24ms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 bg-gradient-to-br from-[#4A1F4F]/90 via-[#7A2676] to-[#2563EB] text-white px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-black text-white">{stats.students.toLocaleString()}+</p>
              <p className="text-[10px] sm:text-xs text-white/70 font-semibold uppercase tracking-widest mt-2">Active Students</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-white">{stats.teachers.toLocaleString()}+</p>
              <p className="text-[10px] sm:text-xs text-white/70 font-semibold uppercase tracking-widest mt-2">Registered Teachers</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-white">{stats.assignments.toLocaleString()}+</p>
              <p className="text-[10px] sm:text-xs text-white/70 font-semibold uppercase tracking-widest mt-2">Tasks Submitted</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-white">{stats.quizzes.toLocaleString()}+</p>
              <p className="text-[10px] sm:text-xs text-white/70 font-semibold uppercase tracking-widest mt-2">Quizzes Taken</p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-3xl sm:text-4xl font-black text-white">{stats.certificates.toLocaleString()}+</p>
              <p className="text-[10px] sm:text-xs text-white/70 font-semibold uppercase tracking-widest mt-2">Credentials Awarded</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6 border-t border-slate-800 mt-auto select-none">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4A1F4F] to-[#7A2676] flex items-center justify-center shadow-md">
                <GraduationCap size={16} className="text-white" />
              </div>
              <span className="font-black text-white tracking-tight text-sm">Xebia LMS</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Transforming classroom education through intuitive digital assignments, verified credentialing, and advanced builder templates.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="#" className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-[#4A1F4F] transition-all flex items-center justify-center w-8 h-8" aria-label="GitHub">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-[#4A1F4F] transition-all flex items-center justify-center w-8 h-8" aria-label="Twitter">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-[#4A1F4F] transition-all flex items-center justify-center w-8 h-8" aria-label="LinkedIn">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Info</h4>
            <ul className="text-xs space-y-2">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
              <li><a href="#careers" className="hover:text-white transition-colors">Careers</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Legal Terms</h4>
            <ul className="text-xs space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policies</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Acceptable Use</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contact Support</h4>
            <ul className="text-xs space-y-2.5 text-slate-500">
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" />
                <span className="hover:text-white transition-colors">support@xebia-lms.edu</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-slate-400" />
                <span className="hover:text-white transition-colors">+1 (800) 555-0199</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" />
                <span>100 Technology Way, Suite 400</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-600">
          <span>© 2026 Xebia LMS. All rights reserved.</span>
          <span className="flex gap-4">
            <a href="#" className="hover:underline">Security</a>
            <span>·</span>
            <a href="#" className="hover:underline">System Status</a>
            <span>·</span>
            <a href="#" className="hover:underline">Compliance</a>
          </span>
        </div>
      </footer>
    </div>
  );
};
