import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Award, Calendar, Download, Share2, CheckCircle, Eye, AlertCircle, FileText, CheckSquare, Sparkles, RefreshCw, Trophy, XCircle, Clock } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/shared/EmptyState';
import { certificateService } from '../../services/certificate.service';
import type { Certificate } from '../../services/certificate.service';
import { studentService } from '../../services/student.service';
import { useCatalog } from '../../hooks-lms/useCatalog';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const StudentCertificates: React.FC = () => {
  const navigate = useNavigate();
  const { courses } = useCatalog() as any;
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [previewCert, setPreviewCert] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [activeSubject, setActiveSubject] = useState<string>('');
  const certificateRef = useRef<HTMLDivElement>(null);

  const fetchProgressAndCertificates = async () => {
    setLoading(true);
    try {
      const [certsData, assignmentsRes] = await Promise.all([
        certificateService.getMyCertificates(),
        studentService.getAssignments({ page: '1', limit: '1000' })
      ]);
      setCerts(certsData);
      
      const rawAssignments = assignmentsRes.assignments || [];
      setAssignments(rawAssignments);
    } catch (err) {
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courses && courses.length > 0) {
      fetchProgressAndCertificates();
    }
  }, [courses]);

  // Set default active subject when courses load
  useEffect(() => {
    const certCourses = courses.filter(c => c.enableCertificate === true);
    if (certCourses.length > 0 && !activeSubject) {
      setActiveSubject(certCourses[0].title);
    }
  }, [courses, activeSubject]);

  const certCourses = courses.filter(c => c.enableCertificate === true);
  const activeCourse = courses.find(c => c.title === activeSubject);
  const activeCourseId = activeCourse?.id;

  // Group tasks for active course
  const courseTasks = assignments.filter(a => a.subject === activeSubject);
  const assignmentsList = courseTasks.filter(a => a.assignmentType !== 'QUIZ');
  const quizzesList = courseTasks.filter(a => a.assignmentType === 'QUIZ');

  // Stats calculation
  const totalTasks = courseTasks.length;
  const submittedTasks = courseTasks.filter(a => a.submissionStatus === 'submitted' || a.submissionStatus === 'reviewed').length;
  const completionPct = totalTasks > 0 ? (submittedTasks / totalTasks) * 100 : 100;

  // Quiz passing average score
  const completedQuizzes = quizzesList.filter(q => q.submissionStatus === 'submitted' || q.submissionStatus === 'reviewed');
  const quizScoreSum = completedQuizzes.reduce((sum, q) => sum + ((q.submission?.marks || 0) / q.maxMarks) * 100, 0);
  const avgQuizScore = completedQuizzes.length > 0 ? (quizScoreSum / completedQuizzes.length) : 100;

  // Assignment submissions check
  const allAssignmentsSubmitted = assignmentsList.every(a => a.submissionStatus === 'submitted' || a.submissionStatus === 'reviewed');

  // Final Assessment Passed
  let finalTask: any = null;
  for (const t of courseTasks) {
    if (!finalTask || t.maxMarks > finalTask.maxMarks) {
      finalTask = t;
    }
  }
  const finalCompleted = finalTask ? (finalTask.submissionStatus === 'submitted' || finalTask.submissionStatus === 'reviewed') : true;
  const finalPassed = finalTask ? (finalCompleted && (finalTask.submission?.marks || 0) >= (finalTask.passingMarks || finalTask.maxMarks * 0.4)) : true;

  // Attendance
  const actualHours = parseFloat((submittedTasks * 1.5).toFixed(1));
  const reqHours = activeCourse?.minAttendanceHours || 0;
  const attendanceMet = actualHours >= reqHours;

  // Checklist checks
  const completionMet = completionPct >= (activeCourse?.minCourseCompletion || 100);
  const quizScoreMet = !activeCourse?.minQuizScore || (quizzesList.length === 0) || (avgQuizScore >= activeCourse.minQuizScore);
  const assignmentMet = activeCourse?.assignmentRequirement !== 'Required' || allAssignmentsSubmitted;
  const finalAssessmentMet = !activeCourse?.finalAssessmentRequirement || !finalTask || finalPassed;

  const isEligible = completionMet && quizScoreMet && assignmentMet && finalAssessmentMet && attendanceMet;

  // Claimed Certificate check
  const claimedCert = certs.find(c => String(c.courseId) === String(activeCourseId) || c.courseTitle === activeSubject);

  // Status mapping
  const certificateStatus = claimedCert
    ? 'CLAIMED'
    : isEligible
      ? 'ELIGIBLE'
      : submittedTasks > 0
        ? 'IN_PROGRESS'
        : 'NOT_ELIGIBLE';

  useEffect(() => {
    if (isEligible && activeCourseId && !claimedCert) {
      certificateService.getCourseCertificatePreview(String(activeCourseId))
        .then(data => setPreviewCert(data))
        .catch(err => console.error("Error loading preview certificate metadata", err));
    } else {
      setPreviewCert(null);
    }
  }, [isEligible, activeCourseId, claimedCert, activeSubject]);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setDownloading(true);
    const loadingToast = toast.loading('Generating and downloading your certificate...');
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#faf5ed'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`certificate-${activeSubject.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);

      toast.success('Certificate downloaded successfully!', { id: loadingToast });
      await fetchProgressAndCertificates();
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to generate and download certificate', { id: loadingToast });
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = (cert: Certificate) => {
    const frontendUrl = window.location.origin;
    const verificationUrl = `${frontendUrl}/verify-certificate/${cert.verificationToken}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(verificationUrl);
      toast.success('Verification link copied to clipboard!');
    } else {
      toast.error('Sharing not supported on this browser');
    }
  };

  const currentCert = claimedCert || previewCert;
  const userStr = localStorage.getItem('lms_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const studentName = user?.name || currentCert?.studentName || "Student";
  const displayDate = currentCert?.completionDate 
    ? new Date(currentCert.completionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const finalSecuredScore = currentCert?.marks || completionPct;

  return (
    <Layout role="student" title="Certificates" subtitle="Track your course requirements and claim completion certificates">
      {/* Course Tabs */}
      {certCourses.length > 1 && (
        <div className="flex border-b border-[var(--brand-border)] mb-6 select-none overflow-x-auto">
          {certCourses.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveSubject(c.title)}
              className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                activeSubject === c.title
                  ? 'border-[#4A1F4F] text-[#4A1F4F]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <Card className="p-10 border border-[var(--brand-border)] animate-pulse flex flex-col items-center justify-center gap-4 min-h-[300px]">
          <RefreshCw className="animate-spin text-[#4A1F4F]" size={36} />
          <span className="text-sm font-semibold text-[var(--text-secondary)]">Calculating course completion requirements...</span>
        </Card>
      ) : certCourses.length === 0 ? (
        <Card className="py-16 text-center border border-[var(--brand-border)]">
          <EmptyState
            icon="award"
            title="No certificates available"
            description="There are currently no courses with certificate option enabled."
          />
        </Card>
      ) : (
        <>
          {/* Top Progress Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 select-none">
            {/* Completion Progress Card */}
            <Card className="p-5 border border-[var(--brand-border)] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs uppercase font-extrabold text-[var(--text-secondary)]">Course Completion</span>
                  <FileText size={18} className="text-[#4A1F4F]" />
                </div>
                <h3 className="text-2xl font-black text-[var(--text-primary)]">
                  {submittedTasks} <span className="text-xs font-normal text-[var(--text-secondary)]">/ {totalTasks} completed</span>
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                  Required: <span className="font-semibold text-[var(--text-primary)]">{activeCourse?.minCourseCompletion || 100}%</span>
                </p>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-[var(--text-secondary)]">Progress</span>
                  <span className="text-[#4A1F4F]">{Math.round(completionPct)}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#4A1F4F] h-full rounded-full transition-all duration-500" 
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Quiz Average Score Card */}
            <Card className="p-5 border border-[var(--brand-border)] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs uppercase font-extrabold text-[var(--text-secondary)]">Quiz Performance</span>
                  <Award size={18} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-[var(--text-primary)]">
                  {Math.round(avgQuizScore)}%
                </h3>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                  Required Minimum Quiz Score: <span className="font-semibold text-[var(--text-primary)]">{activeCourse?.minQuizScore ? `${activeCourse.minQuizScore}%` : 'N/A'}</span>
                </p>
              </div>
              <div className="mt-4">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${avgQuizScore}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Status Overview Card */}
            <Card className="p-5 border border-[var(--brand-border)] flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs uppercase font-extrabold text-[var(--text-secondary)]">Overall Result</span>
                  <Trophy size={18} className="text-amber-500" />
                </div>
                <h3 className="text-2xl font-black text-[var(--text-primary)]">
                  {Math.round(finalSecuredScore)}%
                </h3>
                <div className="mt-2 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                    <span className="font-bold">Eligibility:</span>
                    {certificateStatus === 'CLAIMED' ? (
                      <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">Claimed</span>
                    ) : certificateStatus === 'ELIGIBLE' ? (
                      <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">Eligible to Claim</span>
                    ) : certificateStatus === 'IN_PROGRESS' ? (
                      <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">In Progress</span>
                    ) : (
                      <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">Not Eligible</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${finalSecuredScore}%` }}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Main Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side: Checklist and settings info */}
            <div className="lg:col-span-1 space-y-6 select-none">
              <Card className="p-6 border border-[var(--brand-border)]">
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <CheckSquare size={18} className="text-[#4A1F4F]" />
                  <span>Eligibility Checklist</span>
                </h3>
                
                <div className="space-y-4">
                  {/* Course Completion */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {completionMet ? (
                        <CheckCircle className="text-emerald-500" size={16} />
                      ) : (
                        <XCircle className="text-rose-500" size={16} />
                      )}
                    </div>
                    <div>
                      <span className={`text-sm font-semibold ${completionMet ? 'text-[var(--text-primary)]' : 'text-slate-500'}`}>
                        Course Completion ({activeCourse?.minCourseCompletion || 100}%)
                      </span>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Completed {submittedTasks} out of {totalTasks} tasks ({Math.round(completionPct)}%).
                      </p>
                    </div>
                  </div>

                  {/* Quiz Score */}
                  {activeCourse?.minQuizScore && quizzesList.length > 0 ? (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {quizScoreMet ? (
                          <CheckCircle className="text-emerald-500" size={16} />
                        ) : (
                          <XCircle className="text-rose-500" size={16} />
                        )}
                      </div>
                      <div>
                        <span className={`text-sm font-semibold ${quizScoreMet ? 'text-[var(--text-primary)]' : 'text-slate-500'}`}>
                          Minimum Quiz Score ({activeCourse.minQuizScore}%)
                        </span>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Average Quiz Score: {Math.round(avgQuizScore)}%.
                        </p>
                      </div>
                    </div>
                  ) : activeCourse?.minQuizScore ? (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <CheckCircle className="text-emerald-500" size={16} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-[var(--text-primary)]">
                          Minimum Quiz Score ({activeCourse.minQuizScore}%)
                        </span>
                        <p className="text-xs text-[var(--text-secondary)]">
                          No quizzes currently published in this course.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {/* Assignment Requirement */}
                  {activeCourse?.assignmentRequirement === 'Required' && assignmentsList.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {assignmentMet ? (
                          <CheckCircle className="text-emerald-500" size={16} />
                        ) : (
                          <XCircle className="text-rose-500" size={16} />
                        )}
                      </div>
                      <div>
                        <span className={`text-sm font-semibold ${assignmentMet ? 'text-[var(--text-primary)]' : 'text-slate-500'}`}>
                          Assignments Submitted
                        </span>
                        <p className="text-xs text-[var(--text-secondary)]">
                          All regular course assignments must be submitted.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Final Assessment Requirement */}
                  {activeCourse?.finalAssessmentRequirement && finalTask && (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {finalAssessmentMet ? (
                          <CheckCircle className="text-emerald-500" size={16} />
                        ) : (
                          <XCircle className="text-rose-500" size={16} />
                        )}
                      </div>
                      <div>
                        <span className={`text-sm font-semibold ${finalAssessmentMet ? 'text-[var(--text-primary)]' : 'text-slate-500'}`}>
                          Final Assessment Passed
                        </span>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Must pass high-weightage assessment: "{finalTask.title}".
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Attendance Hours */}
                  {activeCourse?.minAttendanceHours && (
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {attendanceMet ? (
                          <CheckCircle className="text-emerald-500" size={16} />
                        ) : (
                          <XCircle className="text-rose-500" size={16} />
                        )}
                      </div>
                      <div>
                        <span className={`text-sm font-semibold ${attendanceMet ? 'text-[var(--text-primary)]' : 'text-slate-500'}`}>
                          Attendance ({reqHours} hrs)
                        </span>
                        <p className="text-xs text-[var(--text-secondary)]">
                          Secured Hours: {actualHours} hrs.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Action Area */}
              <Card className="p-5 border border-[var(--brand-border)]">
                <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">Claim &amp; Share</h4>
                {certificateStatus === 'CLAIMED' ? (
                  <div className="space-y-3">
                    <Button
                      variant="primary"
                      className="w-full flex items-center justify-center gap-2 bg-[#4A1F4F] text-white py-2.5 font-bold cursor-pointer"
                      onClick={handleDownload}
                      loading={downloading}
                    >
                      <Download size={15} />
                      <span>Download PDF</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 border-[var(--brand-border)] text-[var(--text-secondary)] py-2.5 font-bold cursor-pointer"
                      onClick={() => claimedCert && handleShare(claimedCert)}
                    >
                      <Share2 size={15} />
                      <span>Copy Verification Link</span>
                    </Button>
                  </div>
                ) : certificateStatus === 'ELIGIBLE' ? (
                  <Button
                    variant="primary"
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 font-bold cursor-pointer"
                    onClick={async () => {
                      if (!activeCourseId) return;
                      const claimToast = toast.loading('Claiming your certificate...');
                      try {
                        await certificateService.claimCourseCertificate(String(activeCourseId));
                        toast.success('Certificate claimed successfully!', { id: claimToast });
                        await fetchProgressAndCertificates();
                      } catch (err: any) {
                        toast.error(err.response?.data?.message || 'Failed to claim certificate', { id: claimToast });
                      }
                    }}
                  >
                    <Award size={15} />
                    <span>Claim Certificate</span>
                  </Button>
                ) : (
                  <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 text-xs leading-relaxed">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <AlertCircle size={14} />
                      <span>Certificate Locked</span>
                    </div>
                    You must complete all criteria in the checklist to unlock this course certificate.
                  </div>
                )}
              </Card>
            </div>

            {/* Right Side: Framed certificate preview */}
            <div className="lg:col-span-2 space-y-6">
              {claimedCert || isEligible ? (
                <div ref={certificateRef} className="bg-white text-slate-800 rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-12 relative overflow-hidden select-none">
                  <div className="border-[8px] border-[#4A1F4F] rounded-2xl p-4 sm:p-8 relative min-h-[460px] flex flex-col justify-between bg-slate-50/20">
                    <div className="absolute inset-2 border border-slate-200 pointer-events-none rounded-lg" />
                    
                    {/* Header Logos */}
                    <div className="flex justify-between items-center z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#4A1F4F] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          L
                        </div>
                        <span className="font-bold text-slate-800 tracking-tight text-xs sm:text-sm">LMS Portal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-[#4A1F4F] flex items-center justify-center text-white font-bold text-xs">
                          X
                        </div>
                        <span className="font-bold text-slate-800 tracking-tight text-xs sm:text-sm">Xebia</span>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="text-center my-6 flex-1 flex flex-col justify-center gap-4">
                      <h1 className="font-serif font-black text-2xl sm:text-4xl text-[#4A1F4F] tracking-tight">
                        Certificate of Course Completion
                      </h1>
                      <div className="w-36 h-0.5 bg-purple-200 mx-auto" />
                      <p className="text-slate-400 text-xs sm:text-sm font-medium italic">
                        This is proudly presented to
                      </p>
                      <h2 className="font-bold text-2xl sm:text-3xl text-slate-800 tracking-tight leading-none px-4">
                        {studentName}
                      </h2>
                      <p className="text-slate-500 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed mt-1">
                        for demonstrating outstanding excellence and successfully passing all learning modules in
                      </p>
                      <h3 className="font-bold text-base sm:text-xl text-slate-800 italic leading-none px-4">
                        "{activeSubject}"
                      </h3>
                      
                      <div className="mt-2 text-xs sm:text-sm text-slate-500 flex flex-col gap-1">
                        <p className="font-bold text-[#2563EB]">
                          Final Grade: {Math.round(finalSecuredScore)}% / 100.0%
                        </p>
                        <p className="text-slate-400">
                          Completion Date: {displayDate}
                        </p>
                      </div>
                    </div>

                    {/* Footer Seal/Stamp */}
                    <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-6 mt-4 pt-4 border-t border-slate-100 z-10">
                      <div className="flex items-center gap-3">
                        {currentCert?.qrCodeUrl ? (
                          <img
                            src={currentCert.qrCodeUrl}
                            alt="Verification QR"
                            className="w-14 h-14 object-contain rounded border border-slate-100 bg-white p-1"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center p-1 text-[7px] text-slate-400 text-center leading-tight">
                            <span>Automatic</span>
                            <span>Verified QR</span>
                          </div>
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] uppercase font-bold text-slate-400">Certificate ID</span>
                          <span className="text-[9px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                            {currentCert?.certificateId || "CERT-PENDING"}
                          </span>
                        </div>
                      </div>

                      <div className="w-14 h-14 rounded-full bg-yellow-100/50 border-2 border-dashed border-yellow-500/80 flex flex-col items-center justify-center p-1 relative rotate-12 shrink-0">
                        <span className="text-[7px] font-bold text-[#4A1F4F] leading-none">LMS</span>
                        <span className="text-[7px] font-bold text-[#4A1F4F] leading-none">PORTAL</span>
                        <span className="text-[5px] text-yellow-600 font-bold mt-1 tracking-wider uppercase">Certified</span>
                      </div>

                      <div className="flex flex-col items-center gap-1 w-40 shrink-0">
                        <div className="w-full border-b border-slate-300 pb-1 flex flex-col items-center justify-center min-h-[20px]">
                          <span className="font-serif italic text-xs text-indigo-900">
                            {currentCert?.teacherName || activeCourse?.author || "Authorized Instructor"}
                          </span>
                        </div>
                        <div className="text-center">
                          <span className="text-[9px] font-bold text-slate-600 block leading-tight">
                            {currentCert?.teacherName || activeCourse?.author || "Authorized Instructor"}
                          </span>
                          <span className="text-[7px] text-slate-400 block leading-none">
                            LMS Evaluator Signature
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[460px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-900/20 select-none">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                    <Trophy size={32} />
                  </div>
                  <h4 className="text-lg font-black text-[var(--text-primary)]">Certificate Preview Locked</h4>
                  <p className="text-sm text-[var(--text-secondary)] text-center max-w-sm mt-1 leading-relaxed">
                    Satisfy all the course requirement rules on the left to generate and unlock your certificate preview.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};
