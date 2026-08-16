import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircle, FileText, CheckCircle2, ArrowLeft, Clock, BookOpen, Layers, Download, ExternalLink, HelpCircle, CheckCircle, Film } from 'lucide-react';
import Button from '@/components/ui-lms/Button';
import { useCatalog } from '@/hooks-lms/useCatalog';
import { studentService } from '../../services/student.service';

const getVideoPlayer = (url) => {
  if (!url) return null;
  
  // YouTube regexes
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const ytMatch = url.match(ytRegex);
  
  // Vimeo regexes
  const vimeoRegex = /(?:vimeo\.com\/)\??([^"&?\/ ]+)/;
  const vimeoMatch = url.match(vimeoRegex);
  
  if (ytMatch && ytMatch[1]) {
    const embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    return (
      <iframe
        src={embedUrl}
        title="YouTube video player"
        className="w-full h-full rounded-xl border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }
  
  if (vimeoMatch && vimeoMatch[1]) {
    const embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return (
      <iframe
        src={embedUrl}
        title="Vimeo video player"
        className="w-full h-full rounded-xl border-0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }
  
  // Direct video URL (MP4, WebM, Ogg, Cloudinary secure_url, etc.)
  let videoSrc = url;
  if (url.startsWith('/') && !url.startsWith('/uploads/')) {
    videoSrc = `https://res.cloudinary.com${url}`;
  }
  
  return (
    <video controls className="w-full h-full object-contain">
      <source src={videoSrc} type="video/mp4" />
      Your browser does not support video playback.
    </video>
  );
};

export default function StudentCourseDetailsPage() {
  const { courseId } = useParams();
  const { courses } = useCatalog();

  const course = useMemo(() => {
    return courses.find(c => String(c.id) === String(courseId)) || courses[0];
  }, [courses, courseId]);

  const [enrollments, setEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);

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

  const enrollment = useMemo(() => {
    if (loadingEnrollments) return null;
    return enrollments.find(e => String(e.courseId) === String(courseId) || e.courseName === course?.title);
  }, [enrollments, loadingEnrollments, courseId, course]);

  const isApproved = useMemo(() => {
    return enrollment?.status === 'APPROVED';
  }, [enrollment]);

  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeSubmoduleIndex, setActiveSubmoduleIndex] = useState(0);

  const activeModule = course?.modules?.[activeModuleIndex] || course?.modules?.[0];
  const activeSubmodule = activeModule?.submodules?.[activeSubmoduleIndex] || activeModule?.submodules?.[0];
  const contents = activeSubmodule?.contents || [];

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] p-8 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Course Not Found</h2>
        <Link to="/student/courses" className="mt-4 inline-block text-xs font-bold text-purple-600 underline">Return to My Courses</Link>
      </div>
    );
  }

  if (loadingEnrollments) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Checking course enrollment status...</p>
        </div>
      </div>
    );
  }

  if (!isApproved) {
    let friendlyMessage = "You must request enrollment and wait for Admin approval to view course contents.";
    if (enrollment?.status === 'PENDING') {
      friendlyMessage = "Your enrollment request is pending approval.";
    } else if (enrollment?.status === 'REJECTED') {
      friendlyMessage = "Your enrollment request was rejected.";
    }

    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Access Denied</h2>
            <p className="text-xs text-slate-500 dark:text-[#CBD5E1] leading-relaxed">
              {friendlyMessage}
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Link
              to="/student/courses"
              className="flex-1 text-center py-2.5 rounded-xl border border-slate-200 dark:border-[#334155] text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const categoryName = typeof course.category === 'object' ? course.category?.name : (course.category || 'General');

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] p-6 lg:p-8 text-slate-800 dark:text-[#F8FAFC]">
      
      {/* Top Breadcrumb */}
      <div className="mb-4 flex items-center gap-3">
        <Link to="/student/courses" className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-[#334155] text-slate-500 hover:text-slate-900 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-xs font-bold text-slate-400">My Courses / {course.title}</span>
      </div>



      <div className="mt-6 grid gap-6 xl:grid-cols-[340px_1fr]">
        
        {/* Left Modules / Syllabus Tree Navigation */}
        <motion.aside initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-[#334155] pb-4">
            <img src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'} alt={course.title} className="h-14 w-20 rounded-xl object-cover" />
            <div>
              <p className="text-[10px] font-extrabold uppercase text-purple-600">{categoryName}</p>
              <h3 className="text-xs font-black text-slate-900 dark:text-[#F8FAFC] line-clamp-1">{course.title}</h3>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Course Syllabus Tree</h4>
            {course.modules?.map((m, mIdx) => (
              <div key={m.id} className="space-y-1.5">
                <div
                  onClick={() => { setActiveModuleIndex(mIdx); setActiveSubmoduleIndex(0); }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer font-bold text-xs flex items-center justify-between ${mIdx === activeModuleIndex ? 'bg-purple-50 dark:bg-purple-950/40 border-[#7C3AED] text-purple-900 dark:text-purple-300' : 'bg-slate-50 dark:bg-[#111827] border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1]'}`}
                >
                  <span className="truncate">{mIdx + 1}. {m.title}</span>
                  <span className="text-[10px] text-slate-400">{(m.submodules || []).length} lessons</span>
                </div>

                {mIdx === activeModuleIndex && (
                  <div className="pl-3 space-y-1 border-l-2 border-purple-200 dark:border-purple-900">
                    {m.submodules?.map((s, sIdx) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setActiveSubmoduleIndex(sIdx)}
                        className={`w-full text-left p-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${sIdx === activeSubmoduleIndex ? 'bg-[#7C3AED]/20 text-[#7C3AED] font-extrabold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        <span className="truncate">{s.title}</span>
                        <PlayCircle className="h-3.5 w-3.5 opacity-60" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.aside>

        {/* Right Active Lesson Content Viewer */}
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Active Lesson</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-[#F8FAFC]">{activeSubmodule?.title || 'Lesson Details'}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{activeSubmodule?.description || 'Review the lesson modules below.'}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-600 text-xs font-bold">
                {contents.length} Content Blocks
              </span>
            </div>

            {/* Content Blocks List */}
            {contents.length === 0 ? (
              <div className="p-12 text-center text-xs font-medium text-slate-400 bg-slate-50 dark:bg-[#111827] rounded-2xl border border-dashed border-slate-200 dark:border-[#334155]">
                No content blocks added to this lesson yet.
              </div>
            ) : (
              <div className="space-y-6">
                {contents.map((blk) => (
                  <div key={blk.id} className="p-5 rounded-2xl border border-slate-200 dark:border-[#334155] bg-slate-50/50 dark:bg-[#111827]/60 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-300">
                        {blk.type}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{blk.title}</h4>
                    </div>

                    {/* Video Player */}
                    {blk.type === 'video' && blk.fileUrl && (
                      <div className="rounded-xl overflow-hidden aspect-video bg-black shadow-md">
                        {getVideoPlayer(blk.fileUrl)}
                      </div>
                    )}

                    {/* Text Body */}
                    {blk.type === 'text' && (
                      <p className="text-xs text-slate-700 dark:text-[#CBD5E1] leading-relaxed">
                        {blk.markdown || blk.title}
                      </p>
                    )}

                    {/* File Attachment */}
                    {['pdf', 'ppt', 'word', 'excel', 'zip', 'link'].includes(blk.type) && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155]">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{blk.title}</span>
                        {blk.fileUrl && (
                          <a href={blk.fileUrl} target="_blank" rel="noreferrer" className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700">
                            Open File
                          </a>
                        )}
                      </div>
                    )}

                    {blk.type === 'assignment' && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155]">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{blk.title}</span>
                        {blk.assignmentId ? (
                          <Link to={`/student/assignments/${blk.assignmentId}`} className="px-3 py-1 bg-[#10B5A5] text-white rounded-lg text-xs font-bold hover:bg-teal-700">
                            Open Assignment
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">Processing...</span>
                        )}
                      </div>
                    )}

                    {blk.type === 'quiz' && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155]">
                        <span className="text-xs font-bold text-slate-800 dark:text-white">{blk.title}</span>
                        {blk.assignmentId ? (
                          <Link to={`/student/quizzes/${blk.assignmentId}/attempt`} className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700">
                            Start Quiz
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">Processing...</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

