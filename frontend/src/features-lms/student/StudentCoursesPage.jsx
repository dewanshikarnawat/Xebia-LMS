import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, LayoutGrid, List, ArrowRight, BookOpen, Clock, Award, PlayCircle, Layers } from 'lucide-react';
import Button from '@/components/ui-lms/Button';
import { useCatalog } from '@/hooks-lms/useCatalog';
import { Link } from 'react-router-dom';
import { studentService } from '../../services/student.service';
import { toast } from 'react-hot-toast';
import { Pagination } from '@/components/shared/Pagination';

export default function StudentCoursesPage() {
  const { fetchCoursesPage, categories } = useCatalog();
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);

  // Paginated Courses State
  const [coursesList, setCoursesList] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

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
        console.error('Error fetching student course enrollments:', err);
      } finally {
        if (active) {
          setLoadingEnrollments(false);
        }
      }
    };
    fetchEnrollments();
    return () => { active = false; };
  }, []);

  const loadCourses = useCallback(async () => {
    setLoadingCourses(true);
    try {
      let categoryId = null;
      if (selectedCategory !== 'All') {
        const found = (categories || []).find(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
        if (found) categoryId = found.id;
      }

      let sortByField = 'createdAt';
      let sortDir = 'desc';
      if (sortBy === 'title') {
        sortByField = 'title';
        sortDir = 'asc';
      }

      const data = await fetchCoursesPage(
        page, 
        size, 
        sortByField, 
        sortDir, 
        search, 
        categoryId, 
        selectedDifficulty, 
        true, // isActive
        null  // isPublished (draft + published are both shown if active)
      );
      setCoursesList(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch (err) {
      console.error('Error loading paginated courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  }, [page, size, sortBy, selectedCategory, selectedDifficulty, search, categories, fetchCoursesPage]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const filteredCourses = coursesList;

  const handleEnrollClick = async (courseId) => {
    try {
      await studentService.requestCourseEnrollment(courseId);
      toast.success('Enrollment request submitted successfully under PENDING status.');
      // Refresh
      const res = await studentService.getMyCourseEnrollments(0, 1000);
      const content = res?.data?.content || res?.content || [];
      setEnrollments(content);
    } catch (err) {
      console.error('Error requesting course enrollment:', err);
      toast.error(err.response?.data?.message || 'Failed to request enrollment.');
    }
  };

  return (
    <div className="w-full space-y-8 select-none">

      {/* Full-Width Hero Section */}
      <div className="rounded-2xl bg-gradient-to-r from-[#4A1F4F] to-[#7A2676] h-[200px] text-white shadow-md relative overflow-hidden flex items-center px-8">
        <div className="relative z-10 max-w-xl space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight">Browse Courses</h2>
          <p className="text-purple-100 text-sm font-medium leading-relaxed">
            Discover expert-designed learning paths and expand your skills.
          </p>
        </div>
        
        {/* Abstract SVG Illustration */}
        <div className="absolute right-6 bottom-0 top-0 w-2/5 opacity-90 pointer-events-none hidden md:flex items-center justify-end select-none">
          <svg className="w-full h-full max-h-[160px] text-white" viewBox="0 0 300 150" fill="none" xmlns="http://www.w3.org/2000/svg">
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

      {/* Category Chips */}
      <div className="flex flex-wrap gap-2 select-none">
        <button
          onClick={() => { setSelectedCategory('All'); setPage(0); }}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
            selectedCategory === 'All'
              ? 'bg-brand-primary text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 text-brand-text-secondary hover:bg-brand-surface dark:hover:bg-slate-850'
          }`}
        >
          All Courses
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCategory(cat.name); setPage(0); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === cat.name
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 text-brand-text-secondary hover:bg-brand-surface dark:hover:bg-slate-850'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filter and View Control Bar - Fits in one row */}
      <div className="flex flex-col gap-4 rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between select-none">
        <div className="relative w-full lg:w-96">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search live courses or topics..."
            className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 pl-10 text-xs font-semibold text-brand-text-primary dark:text-[#F8FAFC] outline-none focus:border-brand-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:justify-end">
          {/* Category Selector */}
          <label className="flex items-center gap-2 rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs font-semibold text-brand-text-secondary dark:text-[#CBD5E1]">
            <span className="text-[10px] uppercase font-bold text-slate-400/80">Category</span>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(0); }}
              className="bg-transparent text-xs font-bold outline-none cursor-pointer dark:bg-slate-950"
            >
              <option value="All" className="dark:bg-slate-950">All Categories</option>
              {categories?.map(cat => (
                <option key={cat.id} value={cat.name} className="dark:bg-slate-950">{cat.name}</option>
              ))}
            </select>
          </label>

          {/* Difficulty Selector */}
          <label className="flex items-center gap-2 rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs font-semibold text-brand-text-secondary dark:text-[#CBD5E1]">
            <span className="text-[10px] uppercase font-bold text-slate-400/80">Difficulty</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => { setSelectedDifficulty(e.target.value); setPage(0); }}
              className="bg-transparent text-xs font-bold outline-none cursor-pointer dark:bg-slate-950"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </label>

          {/* Sort Selector */}
          <label className="flex items-center gap-2 rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2 text-xs font-semibold text-brand-text-secondary dark:text-[#CBD5E1]">
            <span className="text-[10px] uppercase font-bold text-slate-400/80">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(0); }}
              className="bg-transparent text-xs font-bold outline-none cursor-pointer dark:bg-slate-950"
            >
              <option value="recent">Recently Added</option>
              <option value="title">Course Title (A-Z)</option>
            </select>
          </label>

          <div className="flex rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`rounded-lg p-1.5 cursor-pointer transition-colors ${view === 'grid' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-550'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`rounded-lg p-1.5 cursor-pointer transition-colors ${view === 'list' ? 'bg-brand-primary text-white shadow-sm' : 'text-slate-400 hover:text-slate-550'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Courses List / Responsive 4-Column Card Grid Display */}
      {loadingCourses || loadingEnrollments ? (
        <div className="flex flex-col items-center justify-center py-20 select-none">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-primary border-t-transparent"></div>
          <span className="mt-4 text-xs font-bold text-brand-text-secondary animate-pulse">Loading courses...</span>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-brand-border dark:border-slate-850 bg-white dark:bg-slate-900 max-w-md mx-auto">
          <BookOpen className="h-12 w-12 text-brand-primary mx-auto mb-4 opacity-75" />
          <h3 className="text-lg font-bold text-brand-text-primary dark:text-white">No Courses Available</h3>
          <p className="text-xs text-brand-text-secondary dark:text-[#CBD5E1] mt-2 leading-relaxed">
            There are currently no published courses matching your filter criteria. When an Admin publishes a new course, it will automatically appear here.
          </p>
        </div>
      ) : (
        <>
          <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredCourses.map((course) => {
              const categoryObj = course.category || (categories || []).find(cat => cat.id === course.categoryId);
              const categoryName = categoryObj?.name || 'General';
              const totalModules = course.modules?.length || 0;
              const totalLessons = course.modules?.reduce((acc, m) => acc + (m.submodules?.length || 0), 0) || 0;
              const enrollment = enrollments.find(e => String(e.courseId) === String(course.id) || e.courseName === course.title);
              const status = enrollment ? enrollment.status : null;
              return (
                <motion.article
                  key={course.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="overflow-hidden rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:translate-y-[-4px] hover:border-brand-primary/30 dark:hover:border-purple-900/30 transition-all duration-300 flex flex-col justify-between group h-[430px]"
                >
                  <div>
                    <div className="relative h-44 w-full bg-slate-900 overflow-hidden rounded-t-2xl">
                      <img
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
                        alt={course.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-white/95 dark:bg-slate-900/90 text-brand-primary dark:text-purple-300 shadow-sm">
                        {categoryName}
                      </div>
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase shadow-sm ${
                          status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-350'
                            : status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-350'
                            : status === 'REJECTED'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-350'
                            : 'bg-brand-primary/10 text-brand-primary dark:bg-purple-950/40 dark:text-purple-305 border border-brand-primary/20'
                        }`}>
                          {status === 'APPROVED' ? 'Approved' : status === 'PENDING' ? 'Pending' : status === 'REJECTED' ? 'Rejected' : 'New'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="text-sm font-bold text-brand-text-primary dark:text-slate-100 group-hover:text-brand-primary transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-[10px] text-brand-text-secondary dark:text-slate-400 font-semibold uppercase tracking-wider">
                        Instructor: <span className="text-[#10B5A5] font-extrabold">{course.author || 'Xebia Specialist'}</span>
                      </p>
                      <p className="text-xs text-brand-text-secondary dark:text-[#CBD5E1] line-clamp-2 leading-relaxed">
                        {course.shortDescription || course.description || 'No course overview provided yet.'}
                      </p>

                      <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] font-extrabold text-brand-text-secondary dark:text-[#CBD5E1] border-t border-brand-border dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                          <span>{course.duration || '8w'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                          <span>{totalModules} Modules</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                          <span>{totalLessons} Lessons</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex gap-2">
                    {status === 'APPROVED' ? (
                      <>
                        <Link
                          to={`/student/courses/${course.id}`}
                          className="flex-1 flex items-center justify-center gap-2 rounded-full py-2 text-xs font-bold text-white shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
                          style={{ backgroundColor: 'var(--brand-success)' }}
                        >
                          <PlayCircle className="h-4 w-4" /> Start Learning
                        </Link>
                        <Link
                          to={`/student/courses/${course.id}`}
                          className="px-3 border border-brand-border dark:border-slate-800 text-brand-text-secondary hover:bg-brand-surface dark:hover:bg-slate-850 rounded-full flex items-center justify-center transition-colors text-xs font-bold"
                        >
                          Details
                        </Link>
                      </>
                    ) : status === 'PENDING' ? (
                      <Button
                        variant="outline"
                        disabled
                        className="w-full text-xs font-bold text-amber-700 bg-amber-50/50 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-500/30 cursor-not-allowed opacity-75 rounded-full py-2"
                      >
                        Pending Approval
                      </Button>
                    ) : status === 'REJECTED' ? (
                      <Button
                        variant="outline"
                        disabled
                        className="w-full text-xs font-bold text-rose-700 bg-rose-50/50 border border-rose-200 dark:bg-rose-950/20 dark:text-rose-455 dark:border-rose-500/30 cursor-not-allowed opacity-75 rounded-full py-2"
                      >
                        Rejected
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="primary"
                          onClick={() => handleEnrollClick(course.id)}
                          className="flex-1 text-xs font-bold rounded-full py-2"
                        >
                          Enroll Now
                        </Button>
                        <Link
                          to={`/student/courses/${course.id}`}
                          className="px-3 border border-brand-border dark:border-slate-800 text-brand-text-secondary hover:bg-brand-surface dark:hover:bg-slate-850 rounded-full flex items-center justify-center transition-colors text-xs font-bold"
                        >
                          Details
                        </Link>
                      </>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-brand-border dark:border-slate-800 pt-6 sm:flex-row select-none">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-brand-text-secondary">Rows per page:</span>
                <select
                  value={size}
                  onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
                  className="rounded-lg border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-1 text-xs font-bold text-brand-text-primary dark:text-[#F8FAFC] outline-none"
                >
                  {[12, 24, 48, 96].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <Pagination
                page={page + 1}
                totalPages={totalPages}
                total={totalElements}
                limit={size}
                onPageChange={(p) => setPage(p - 1)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
