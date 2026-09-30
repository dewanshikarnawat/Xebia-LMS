import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, LayoutGrid, List, ArrowRight, BookOpen, Clock, 
  PlayCircle, Layers, CheckCircle2, Award, ChevronRight, RotateCcw,
  Sparkles
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { useCatalog } from '../../hooks-lms/useCatalog';
import { studentService } from '../../services/student.service';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Button from '@/components/ui-lms/Button';

// Dynamic course progress helper matching mock structure
const getCourseProgress = (courseTitle: string): number => {
  const title = courseTitle.toLowerCase();
  if (title.includes('react')) return 72;
  if (title.includes('python')) return 46;
  if (title.includes('cloud') || title.includes('native')) return 100;
  if (title.includes('generative') || title.includes('ai')) return 15;
  
  // Predictable fallback progress based on character codes
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 60) + 20; // 20% to 80% progress
};

export const StudentMyCoursesPage: React.FC = () => {
  const { courses, categories } = useCatalog() as any;
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedProgress, setSelectedProgress] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchEnrollments = async () => {
      try {
        const res = await studentService.getMyCourseEnrollments(0, 1000);
        if (active) {
          const content = res?.data?.content || res?.content || [];
          setEnrollments(content);
        }
      } catch (err) {
        console.error('Error fetching enrollments:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchEnrollments();
    return () => { active = false; };
  }, []);

  // Filter courses that are APPROVED
  const approvedCourses = useMemo(() => {
    const approvedCourseTitlesOrIds = new Set(
      enrollments
        .filter((e) => e.status === 'APPROVED')
        .map((e) => String(e.courseId || e.courseName))
    );

    return (courses || []).filter((c) => 
      approvedCourseTitlesOrIds.has(String(c.id)) || approvedCourseTitlesOrIds.has(c.title)
    );
  }, [courses, enrollments]);

  const filteredCourses = useMemo(() => {
    let result = approvedCourses.filter((course) => {
      const categoryObj = course.category || (categories || []).find(cat => cat.id === course.categoryId);
      const catName = categoryObj?.name || categoryObj || '';
      const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) || catName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || catName.toLowerCase() === selectedCategory.toLowerCase();
      
      // Local difficulty check mapping
      let matchesDifficulty = true;
      if (selectedDifficulty !== 'All') {
        const title = course.title.toLowerCase();
        if (selectedDifficulty === 'Beginner') {
          matchesDifficulty = title.includes('foundation') || title.includes('intro') || title.includes('start');
        } else if (selectedDifficulty === 'Advanced') {
          matchesDifficulty = title.includes('enterprise') || title.includes('advanced') || title.includes('native');
        } else {
          matchesDifficulty = !title.includes('foundation') && !title.includes('enterprise');
        }
      }

      // Progress check mapping
      let matchesProgress = true;
      const progress = getCourseProgress(course.title);
      if (selectedProgress === 'InProgress') {
        matchesProgress = progress > 0 && progress < 100;
      } else if (selectedProgress === 'Completed') {
        matchesProgress = progress === 100;
      }

      return matchesSearch && matchesCategory && matchesDifficulty && matchesProgress;
    });

    // Sorting
    if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'progress') {
      result.sort((a, b) => getCourseProgress(b.title) - getCourseProgress(a.title));
    }
    return result;
  }, [approvedCourses, search, selectedCategory, selectedDifficulty, selectedProgress, sortBy, categories]);

  // Summary Metrics calculations
  const enrolledCount = approvedCourses.length;
  const inProgressCount = useMemo(() => {
    return approvedCourses.filter(c => getCourseProgress(c.title) < 100).length;
  }, [approvedCourses]);
  const completedCount = useMemo(() => {
    return approvedCourses.filter(c => getCourseProgress(c.title) === 100).length;
  }, [approvedCourses]);
  const certificatesCount = completedCount; // Certificate earned per completed course

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSelectedProgress('All');
    setSortBy('recent');
    setView('grid');
    toast.success('Filters reset successfully.');
  };

  return (
    <div className="w-full space-y-8 select-none">
        
        {/* Breadcrumb, Page Title & Description */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-extrabold text-slate-400 select-none">
            <Link to="/student" className="hover:text-brand-primary transition-colors">Dashboard</Link>
            <ChevronRight size={10} />
            <span className="text-brand-primary">My Courses</span>
          </div>
          <h2 className="text-2xl font-black text-brand-text-primary dark:text-white">
            My Learning Space
          </h2>
          <p className="text-xs text-brand-text-secondary dark:text-slate-400">
            Track your enrolled courses, monitor your progress, and continue learning from where you left off.
          </p>
        </div>

        {/* Full-Width Hero Section */}
        <div className="rounded-2xl bg-gradient-to-r from-[#4A1F4F] to-[#7A2676] h-[190px] text-white shadow-md relative overflow-hidden flex items-center px-8">
          <div className="relative z-10 max-w-xl space-y-2">
            <h2 className="text-2xl font-extrabold tracking-tight">Continue Your Learning Journey</h2>
            <p className="text-purple-100 text-xs font-medium leading-relaxed max-w-md">
              Upgrade your tech stack, earn credentials, and showcase your certifications on student transcripts.
            </p>
          </div>
          
          {/* Abstract SVG Illustration */}
          <div className="absolute right-6 bottom-0 top-0 w-2/5 opacity-90 pointer-events-none hidden md:flex items-center justify-end select-none">
            <svg className="w-full h-full max-h-[150px] text-white" viewBox="0 0 300 150" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="70" y="50" width="100" height="60" rx="4" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="2"/>
              <line x1="60" y1="110" x2="180" y2="110" stroke="white" strokeWidth="4" strokeLinecap="round"/>
              <path d="M210 110 H260 V100 H210 Z" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="1.5"/>
              <path d="M205 100 H255 V90 H205 Z" fill="white" fillOpacity="0.35" stroke="white" strokeWidth="1.5"/>
              <path d="M120 25 L150 35 L120 45 L90 35 Z" fill="white" fillOpacity="0.4" stroke="white" strokeWidth="1.5"/>
              <path d="M105 39.5 V48 C105 52 135 52 135 48 V39.5" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5"/>
              <line x1="150" y1="35" x2="160" y2="55" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="160" cy="55" r="2.5" fill="white"/>
              <circle cx="50" cy="30" r="4" fill="white" fillOpacity="0.3" className="animate-pulse"/>
              <circle cx="230" cy="40" r="6" fill="white" fillOpacity="0.2" className="animate-pulse"/>
              <polygon points="190,30 194,38 202,40 194,42 190,50 186,42 178,40 186,38" fill="white" fillOpacity="0.5"/>
            </svg>
          </div>
        </div>

        {/* Dashboard Summary Metrics (4 Cards) */}
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1: Enrolled */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/15 dark:from-purple-950/20 dark:to-purple-900/20 dark:border-purple-800/30 flex items-center gap-4 transition-all hover:translate-y-[-2px] hover:shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 dark:bg-purple-400/10 flex items-center justify-center text-[#4A1F4F] dark:text-purple-300 shrink-0">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-105 leading-none">{enrolledCount}</h3>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1.5">Enrolled Paths</p>
            </div>
          </div>

          {/* Card 2: In Progress */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-500/15 dark:from-amber-950/20 dark:to-amber-900/20 dark:border-amber-800/30 flex items-center gap-4 transition-all hover:translate-y-[-2px] hover:shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center text-amber-605 dark:text-amber-305 shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-105 leading-none">{inProgressCount}</h3>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1.5">In Progress</p>
            </div>
          </div>

          {/* Card 3: Completed */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-500/15 dark:from-emerald-950/20 dark:to-emerald-900/20 dark:border-emerald-800/30 flex items-center gap-4 transition-all hover:translate-y-[-2px] hover:shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center text-emerald-605 dark:text-emerald-355 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-105 leading-none">{completedCount}</h3>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1.5">Completed Paths</p>
            </div>
          </div>

          {/* Card 4: Certificates */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/15 dark:from-blue-950/20 dark:to-blue-900/20 dark:border-blue-800/30 flex items-center gap-4 transition-all hover:translate-y-[-2px] hover:shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 dark:bg-blue-400/10 flex items-center justify-center text-blue-605 dark:text-blue-355 shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-slate-105 leading-none">{certificatesCount}</h3>
              <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1.5">Certificates</p>
            </div>
          </div>

        </div>

        {/* Premium Unified Search, Filter & Reset toolbar */}
        <div className="flex flex-col gap-4 rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between select-none">
          
          {/* Search Box */}
          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search enrolled courses..."
              className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2 pl-10 text-xs font-semibold text-brand-text-primary dark:text-slate-100 outline-none focus:border-brand-primary"
            />
          </div>

          {/* Filters Area */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:justify-end">
            
            {/* Category */}
            <label className="flex items-center gap-2 rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-brand-text-secondary dark:text-slate-400">
              <span className="text-[9px] uppercase font-bold text-slate-400/80">Category</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer dark:bg-slate-950"
              >
                <option value="All">All Categories</option>
                {categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.name} className="dark:bg-slate-950">{cat.name}</option>
                ))}
              </select>
            </label>

            {/* Difficulty */}
            <label className="flex items-center gap-2 rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-brand-text-secondary dark:text-slate-400">
              <span className="text-[9px] uppercase font-bold text-slate-400/80">Difficulty</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer dark:bg-slate-950"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </label>

            {/* Progress status */}
            <label className="flex items-center gap-2 rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-1.5 text-xs font-semibold text-brand-text-secondary dark:text-slate-400">
              <span className="text-[9px] uppercase font-bold text-slate-400/80">Progress</span>
              <select
                value={selectedProgress}
                onChange={(e) => setSelectedProgress(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer dark:bg-slate-955"
              >
                <option value="All">All</option>
                <option value="InProgress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </label>

            {/* Sort */}
            <label className="flex items-center gap-2 rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-3 py-1.5 text-xs font-semibold text-brand-text-secondary dark:text-slate-400">
              <span className="text-[9px] uppercase font-bold text-slate-400/80">Sort By</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold outline-none cursor-pointer dark:bg-slate-955"
              >
                <option value="recent">Recently Enrolled</option>
                <option value="title">Course Title (A-Z)</option>
                <option value="progress">Progress (High to Low)</option>
              </select>
            </label>

            {/* Reset Filters Action Button */}
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-brand-border dark:border-slate-800 hover:bg-slate-105 dark:hover:bg-slate-950 text-xs font-bold text-brand-text-secondary transition-all cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="h-3.5 w-3.5 text-brand-primary" />
              <span>Reset</span>
            </button>

            {/* Grid/List layout selector toggles */}
            <div className="flex rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1">
              <button
                type="button"
                onClick={() => setView('grid')}
                className={`rounded-lg p-1.5 cursor-pointer transition-colors ${view === 'grid' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-550'}`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setView('list')}
                className={`rounded-lg p-1.5 cursor-pointer transition-colors ${view === 'list' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-550'}`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        </div>

        {/* Course Grid Stack (Supports responsive 4 Columns layout) */}
        {loading ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[430px] rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 animate-pulse p-5 space-y-4">
                <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-full mt-4" />
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          /* Empty State Section */
          <div className="text-center py-20 px-6 rounded-2xl border-2 border-dashed border-brand-border dark:border-slate-850 bg-white dark:bg-slate-900 max-w-lg mx-auto space-y-5 shadow-sm">
            <svg className="w-48 h-48 mx-auto text-slate-200 dark:text-slate-800 animate-bounce" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="80" fill="currentColor" fillOpacity="0.1"/>
              <rect x="70" y="70" width="60" height="60" rx="8" stroke="currentColor" strokeWidth="4"/>
              <path d="M90 95 L110 95" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              <path d="M90 105 L110 105" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            </svg>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-brand-text-primary dark:text-slate-100">You haven't enrolled in any courses yet.</h3>
              <p className="text-xs text-brand-text-secondary dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                Explore our catalog of professional training courses to add them to your dashboard and begin learning.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/student/courses">
                <Button variant="primary" className="rounded-full px-6 flex items-center justify-center gap-1.5 mx-auto">
                  Browse Courses <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredCourses.map((course) => {
              const categoryObj = course.category || (categories || []).find(cat => cat.id === course.categoryId);
              const categoryName = categoryObj?.name || 'General';
              const totalModules = course.modules?.length || 0;
              const totalLessons = course.modules?.reduce((acc, m) => acc + (m.submodules?.length || 0), 0) || 0;
              const progress = getCourseProgress(course.title);
              const isCompleted = progress === 100;
              
              // Mock remaining time & difficulty badges
              const estRemaining = isCompleted ? '0h remaining' : `${Math.round((100 - progress) * 0.15)}h remaining`;
              const mockLastAccess = isCompleted ? 'Completed' : 'Accessed 2 days ago';

              return (
                <motion.article
                  key={course.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-hidden rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:translate-y-[-4px] hover:border-brand-primary/30 dark:hover:border-purple-900/30 transition-all duration-300 flex flex-col justify-between group h-[435px]"
                >
                  <div>
                    <div className="relative h-40 w-full bg-slate-900 overflow-hidden rounded-t-2xl">
                      <img
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
                        alt={course.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Floating Badges */}
                      <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-white/95 dark:bg-slate-900/90 text-brand-primary dark:text-purple-300 shadow-sm">
                        {categoryName}
                      </div>
                      
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase shadow-sm ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-350'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-955/40 dark:text-amber-350'
                        }`}>
                          {isCompleted ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3 relative">
                      
                      {/* Circular Progress Gauge overlay on top right of body */}
                      <div className="absolute top-4 right-4 flex items-center shrink-0" title={`${progress}% Complete`}>
                        <svg className="w-9 h-9 transform -rotate-90 text-brand-primary" viewBox="0 0 36 36">
                          <path className="text-slate-100 dark:text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                          <path strokeDasharray={`${progress}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-slate-800 dark:text-white leading-none">
                          {progress}%
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-brand-text-primary dark:text-slate-100 group-hover:text-brand-primary transition-colors line-clamp-1 pr-10">
                        {course.title}
                      </h3>
                      
                      <div className="flex items-center gap-2 text-[10px] font-semibold text-brand-text-secondary">
                        <span>By {course.author || 'Xebia Specialist'}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-[#10B5A5] font-extrabold">Intermediate</span>
                      </div>

                      <p className="text-xs text-brand-text-secondary dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {course.shortDescription || course.description || 'No course overview provided yet.'}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-extrabold text-brand-text-secondary dark:text-slate-400 pt-1.5 border-t border-brand-border dark:border-slate-800/80">
                        <div className="flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                          <span>{totalModules} Modules ({totalLessons} lessons)</span>
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <Clock className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                          <span>{estRemaining}</span>
                        </div>
                      </div>

                      {/* Progress Bar & Percentage */}
                      <div className="space-y-1.5 pt-2.5 border-t border-brand-border dark:border-slate-800/80">
                        <div className="flex items-center justify-between text-[10px] font-extrabold text-brand-text-secondary">
                          <span>{mockLastAccess}</span>
                          <span className="text-brand-text-primary dark:text-slate-200 font-black">{progress}% Completed</span>
                        </div>
                        <div className="w-full bg-brand-surface dark:bg-slate-850 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-brand-success' : 'bg-brand-primary'}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="p-5 pt-0 flex gap-2">
                    <Link
                      to={`/student/courses/${course.id}`}
                      className="flex-1 flex items-center justify-center gap-2 rounded-full py-2 text-xs font-bold text-white shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
                      style={{ backgroundColor: 'var(--brand-primary)' }}
                    >
                      <PlayCircle className="h-4 w-4" /> {isCompleted ? 'Review Path' : 'Continue Learning'}
                    </Link>
                    <Link
                      to={`/student/courses/${course.id}`}
                      className="px-3 border border-brand-border dark:border-slate-800 text-brand-text-secondary hover:bg-brand-surface dark:hover:bg-slate-850 rounded-full flex items-center justify-center transition-colors text-xs font-bold"
                    >
                      Details
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}

      </div>
  );
};
