import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, Award, User, Download, Upload, X, CheckCircle2,
  AlertCircle, Clock, BookOpen, FileText, MessageSquare, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { studentService } from '../../services/student.service';
import { formatDate, formatDateTime, getDueDateCountdown, getDueDateColor, isOverdue, getFileIcon } from '../../utils/helpers';
import type { Assignment } from '../../types';

const parseTaskMeta = (instructionsStr: string = '') => {
  let realInst = instructionsStr;
  let certEligibilityMarksPct = 75; // default
  if (instructionsStr && instructionsStr.trim().startsWith('{')) {
    try {
      const meta = JSON.parse(instructionsStr);
      realInst = meta.realInstructions || '';
      certEligibilityMarksPct = meta.certEligibilityMarks !== undefined ? Number(meta.certEligibilityMarks) : 75;
    } catch (e) {
      console.error("Error parsing assignment instructions JSON", e);
    }
  } else if (instructionsStr) {
    const match = instructionsStr.match(/\[CERT_ELIGIBILITY:(\d+)\]/);
    if (match) {
      certEligibilityMarksPct = Number(match[1]);
      realInst = instructionsStr.replace(/\[CERT_ELIGIBILITY:\d+\]/, '').trim();
    }
  }
  return { realInstructions: realInst, certEligibilityMarksPct };
};

export const AssignmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Standard File Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Quiz State
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const fetchAssignment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await studentService.getAssignmentDetail(id);
      setAssignment(res.assignment);
    } catch {
      toast.error('Failed to load assignment.');
      navigate('/student/assignments');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchAssignment(); }, [fetchAssignment]);

  const handleFile = (file: File) => {
    const allowed = ['application/pdf', 'application/zip', 'application/x-zip-compressed', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.type)) {
      toast.error('Invalid file type. Allowed: PDF, ZIP, PPT, Images');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File too large. Maximum 25MB allowed.');
      return;
    }
    setUploadFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async () => {
    if (!uploadFile || !assignment) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      await studentService.submitAssignment(assignment.id, uploadFile, setUploadProgress);
      toast.success(assignment.submission ? 'Submission replaced successfully!' : 'Assignment submitted successfully!');
      setUploadFile(null);
      setUploadProgress(0);
      fetchAssignment(); // Refresh
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit assignment.');
    } finally {
      setUploading(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (!assignment) return;
    
    // Check if they answered everything
    const unanswered = assignment.questions?.filter(q => !answers[q.id ?? '']);
    if (unanswered && unanswered.length > 0) {
      const confirm = window.confirm(`You have not answered ${unanswered.length} questions. Are you sure you want to submit?`);
      if (!confirm) return;
    } else {
      const confirm = window.confirm('Are you sure you want to submit your quiz answers?');
      if (!confirm) return;
    }
    
    setUploading(true);
    try {
      const quizAnswersList = assignment.questions?.map(q => ({
        questionId: q.id,
        selectedOption: answers[q.id ?? ''] || ''
      })) || [];
      
      await studentService.submitAssignment(assignment.id, {
        quizAnswersJson: JSON.stringify(quizAnswersList)
      });
      
      toast.success('Quiz submitted and graded successfully!');
      fetchAssignment(); // Refresh to show scores
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit quiz.');
    } finally {
      setUploading(false);
    }
  };

  const overdue = assignment ? isOverdue(assignment.dueDate) : false;

  // Parse submitted answers
  const submittedAnswersMap = React.useMemo(() => {
    if (!assignment?.submission?.quizAnswers) return {};
    try {
      const list = JSON.parse(assignment.submission.quizAnswers);
      const m: Record<string, string> = {};
      list.forEach((ans: any) => {
        if (ans.questionId !== undefined && ans.questionId !== null) {
          m[String(ans.questionId)] = ans.selectedOption;
        }
      });
      return m;
    } catch {
      return {};
    }
  }, [assignment?.submission?.quizAnswers]);

  if (loading) {
    return (
      <Layout role="student" title="Assignment Detail">
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl p-5 space-y-3">
              <div className="skeleton h-5 w-1/2 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-3/4 rounded" />
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  if (!assignment) return null;

  const isQuiz = assignment.assignmentType === 'QUIZ';

  return (
    <Layout role="student" title={assignment.title} subtitle={assignment.subject}>
      <div className="max-w-3xl mx-auto space-y-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} /> Back to Assignments
        </button>

        {/* Header Card */}
        <Card>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1">
              <h1 className="text-lg font-bold text-[var(--text-primary)] mb-2">{assignment.title}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] bg-slate-100 dark:bg-slate-800 rounded-full px-2.5 py-1">
                  <BookOpen size={11} /> {assignment.subject}
                </span>
                <Badge
                  variant={(assignment.submissionStatus || 'not_submitted') as any}
                  label={
                    assignment.submissionStatus === 'not_submitted' ? 'Not Submitted'
                    : assignment.submissionStatus === 'submitted' ? 'Submitted'
                    : 'Reviewed'
                  }
                />
                {overdue && !assignment.submission && <Badge variant="overdue" />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {(() => {
              const { certEligibilityMarksPct } = parseTaskMeta(assignment.instructions);
              const passMarks = assignment.passingMarks || Math.round(assignment.maxMarks * 0.4);
              const certMarks = Math.round(assignment.maxMarks * (certEligibilityMarksPct / 100));
              return [
                { icon: <Calendar size={14} />, label: 'Due Date', value: `${formatDate(assignment.dueDate)}` },
                { icon: <Clock size={14} />, label: 'Time Left', value: getDueDateCountdown(assignment.dueDate), color: getDueDateColor(assignment.dueDate) },
                { icon: <Award size={14} />, label: 'Max Marks', value: String(assignment.maxMarks) },
                { icon: <Award size={14} />, label: 'Passing Marks', value: `${passMarks}` },
                { icon: <Award size={14} />, label: 'Cert Marks', value: `${certMarks} (${certEligibilityMarksPct}%)` },
                { icon: <User size={14} />, label: 'Teacher', value: assignment.teacher?.name || 'Unknown' },
              ].map((item) => (
                <div key={item.label} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-[var(--text-secondary)] mb-1">
                    {item.icon}
                    <span className="text-[10px] uppercase tracking-wide">{item.label}</span>
                  </div>
                  <p className={`text-xs font-semibold ${item.color || 'text-[var(--text-primary)]'}`}>{item.value}</p>
                </div>
              ));
            })()}
          </div>
        </Card>

        {/* Description */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
            <FileText size={15} className="text-[#4A1F4F] dark:text-purple-400" /> Description
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{assignment.description}</p>

          {assignment.instructions && (() => {
            const { realInstructions } = parseTaskMeta(assignment.instructions);
            if (!realInstructions) return null;
            return (
              <>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mt-5 mb-3 flex items-center gap-2">
                  <MessageSquare size={15} className="text-[#2563EB]" /> Instructions
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">{realInstructions}</p>
              </>
            );
          })()}

          {assignment.attachment && (
            <div className="mt-5 pt-4 border-t border-[var(--brand-border)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Attachment</h3>
              <a
                href={assignment.attachment}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#2563EB] text-[#2563EB] text-sm hover:bg-[#2563EB0D] transition-colors cursor-pointer"
              >
                <span>{getFileIcon(assignment.attachmentName || 'file')}</span>
                {assignment.attachmentName || 'Download Attachment'}
                <Download size={14} />
              </a>
            </div>
          )}
        </Card>

        {/* Quiz Layout vs Standard File submission */}
        {isQuiz ? (
          <>
            {assignment.submission ? (
              /* Quiz submitted state - Review questions and correct options */
              <div className="space-y-5">
                <Card className="bg-slate-50 dark:bg-slate-800/40 border border-[var(--brand-border)]">
                  <div className="flex flex-col items-center justify-center text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mb-3">
                      <CheckCircle2 size={28} className="text-emerald-500" />
                    </div>

                    {/* Status split for Quiz */}
                    {(() => {
                      const { certEligibilityMarksPct } = parseTaskMeta(assignment.instructions);
                      const minPassing = assignment.passingMarks || Math.round(assignment.maxMarks * 0.4);
                      const minCertMarks = assignment.maxMarks * (certEligibilityMarksPct / 105) > 0 
                        ? Math.round(assignment.maxMarks * (certEligibilityMarksPct / 100))
                        : Math.round(assignment.maxMarks * 0.75);
                      const score = assignment.submission.marks || 0;
                      const isPassed = score >= minPassing;
                      const isCertMet = score >= minCertMarks;
                      return (
                        <div className="mt-5 w-full max-w-sm p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-[var(--brand-border)] space-y-2.5 text-left mx-auto select-none">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-[var(--text-secondary)]">Course Status:</span>
                            {isPassed ? (
                              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/20 px-2 py-0.5 rounded">Passed</span>
                            ) : (
                              <span className="font-extrabold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/20 px-2 py-0.5 rounded">Failed</span>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-[var(--text-secondary)]">Certificate Requirement:</span>
                            {isCertMet ? (
                              <span className="font-extrabold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/20 px-2 py-0.5 rounded">Certificate Requirement Met</span>
                            ) : (
                              <span className="font-extrabold text-rose-650 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/20 px-2 py-0.5 rounded">Certificate Requirement Not Met</span>
                            )}
                          </div>
                          <p className="text-[10px] text-[var(--text-secondary)] text-center pt-1 leading-relaxed">
                            Requires {minPassing} marks to pass, and {minCertMarks} marks ({certEligibilityMarksPct}%) for certificate eligibility.
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </Card>

                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2 mt-6">Question Review</h3>
                
                {assignment.questions?.map((q, idx) => {
                  const selected = submittedAnswersMap[q.id!];
                  const isCorrect = String(selected).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
                  return (
                    <Card key={q.id} className={`border-l-4 ${isCorrect ? 'border-l-emerald-500 animate-slide-up' : 'border-l-red-500 animate-slide-up'}`}>
                      <div className="flex items-start gap-2.5">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-lg text-xs font-semibold ${
                          isCorrect ? 'bg-emerald-500/10 text-emerald-600' : 'bg-[#F5EAF8]0/10 text-red-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <p className="text-sm font-semibold text-[var(--text-primary)] leading-normal">{q.questionText}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                              isCorrect ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-purple-400'
                            }`}>
                              {isCorrect ? `+${q.marks} Marks` : '0 Marks'}
                            </span>
                          </div>
                          
                          {q.questionType !== 'SHORT_ANSWER' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                              {[
                                { key: 'A', value: q.optionA },
                                { key: 'B', value: q.optionB },
                                ...(q.optionC ? [{ key: 'C', value: q.optionC }] : []),
                                ...(q.optionD ? [{ key: 'D', value: q.optionD }] : []),
                              ].map((opt) => {
                                const isSelected = selected === opt.key;
                                const isCorrectAnswer = q.correctAnswer === opt.key;
                                
                                let optStyle = 'border-[var(--brand-border)] text-[var(--text-secondary)]';
                                if (isSelected) {
                                  optStyle = isCorrect
                                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold'
                                    : 'bg-[#F5EAF8]0/10 border-red-500 text-red-700 dark:text-purple-400 font-semibold';
                                } else if (isCorrectAnswer) {
                                  optStyle = 'bg-emerald-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-medium';
                                }
                                
                                return (
                                  <div
                                    key={opt.key}
                                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs ${optStyle}`}
                                  >
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] border ${
                                      isSelected
                                        ? isCorrect ? 'bg-emerald-500 border-transparent text-white' : 'bg-[#F5EAF8]0 border-transparent text-white'
                                        : isCorrectAnswer ? 'bg-emerald-500/20 border-transparent text-emerald-600' : 'border-[var(--brand-border)] text-[var(--text-secondary)]'
                                    }`}>
                                      {opt.key}
                                    </span>
                                    {opt.value}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="space-y-2 mt-3">
                              <p className="text-xs">
                                Your answer: <span className={`font-semibold ${isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>{selected || '(No Answer)'}</span>
                              </p>
                              {!isCorrect && (
                                <p className="text-xs text-[var(--text-secondary)]">
                                  Correct Answer: <span className="font-semibold text-emerald-500">{q.correctAnswer}</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : overdue ? (
              /* Quiz missed overdue state */
              <Card>
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#F5EAF8]0/10 border-2 border-red-500 flex items-center justify-center mx-auto">
                    <AlertCircle size={28} className="text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[var(--text-primary)]">Submission Deadline Passed</h2>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">This quiz is no longer accepting submissions.</p>
                  </div>
                  <Button
                    variant="outline"
                    disabled
                    className="w-full bg-slate-100 dark:bg-slate-800 text-red-500 border-purple-200 dark:border-red-500/20"
                  >
                    Quiz Closed
                  </Button>
                </div>
              </Card>
            ) : (
              /* Quiz attempt state */
              <div className="space-y-5">
                <Card className="bg-[#4A1F4F]/5 border-[#4A1F4F]/15">
                  <h3 className="text-sm font-semibold text-[#4A1F4F] dark:text-purple-400 flex items-center gap-2">
                    <BookOpen size={16} /> Online Quiz Mode
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Please answer all questions below and click <strong>Submit Quiz</strong> when finished. You will receive your grade immediately.
                  </p>
                </Card>
                
                {assignment.questions?.map((q, idx) => {
                  const selected = answers[q.id!];
                  return (
                    <Card key={q.id} className="animate-slide-up">
                      <div className="flex items-start gap-2.5">
                        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-[var(--text-secondary)] shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[var(--text-primary)] mb-4 leading-normal">{q.questionText}</p>
                          
                          {/* MCQ / TRUE_FALSE Option Selection */}
                          {q.questionType !== 'SHORT_ANSWER' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {[
                                { key: 'A', value: q.optionA },
                                { key: 'B', value: q.optionB },
                                ...(q.optionC ? [{ key: 'C', value: q.optionC }] : []),
                                ...(q.optionD ? [{ key: 'D', value: q.optionD }] : []),
                              ].map((opt) => {
                                const isSelected = selected === opt.key;
                                return (
                                  <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setAnswers(prev => ({ ...prev, [q.id!]: opt.key }))}
                                    className={`flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-medium cursor-pointer transition-all ${
                                      isSelected
                                        ? 'bg-[#4A1F4F10] border-[#4A1F4F] text-[#4A1F4F] dark:text-purple-400 font-bold shadow-sm'
                                        : 'bg-white dark:bg-[#1E293B] border-[var(--brand-border)] text-[var(--text-primary)] hover:border-slate-400'
                                    }`}
                                  >
                                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                                      isSelected ? 'bg-[#4A1F4F] text-white border-transparent' : 'border-[var(--brand-border)] text-[var(--text-secondary)]'
                                    }`}>
                                      {opt.key}
                                    </span>
                                    {opt.value}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            /* Short Answer input */
                            <input
                              type="text"
                              value={selected || ''}
                              onChange={(e) => setAnswers(prev => ({ ...prev, [q.id!]: e.target.value }))}
                              placeholder="Type your answer here..."
                              className="w-full bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] focus:border-[#4A1F4F] text-[var(--text-primary)] rounded-xl py-2.5 px-3.5 text-sm transition-colors"
                            />
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
                
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleQuizSubmit}
                  disabled={uploading}
                  loading={uploading}
                  className="w-full py-3"
                >
                  Submit Quiz Answers
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Standard File Submission Layout */
          <Card>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Upload size={15} className="text-[#4A1F4F] dark:text-purple-400" />
              {assignment.submission ? 'Your Submission' : 'Submit Assignment'}
            </h3>

            {/* Existing submission details */}
            {assignment.submission && (
              <div className="mb-5 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-blue-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-primary)]">Submitted Successfully</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      {formatDateTime(assignment.submission.submittedAt)}
                    </p>
                    <a
                      href={assignment.submission.uploadedFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:underline mt-2"
                    >
                      <span>{getFileIcon(assignment.submission.fileName)}</span>
                      {assignment.submission.fileName}
                      <Download size={11} />
                    </a>
                  </div>
                </div>

                {/* Marks & Feedback */}
                {assignment.submission.status === 'reviewed' && (
                  <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-500/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--text-primary)]">Your Score</span>
                      <span className="text-lg font-bold text-[#2563EB]">
                        {assignment.submission.marks}/{assignment.maxMarks}
                      </span>
                    </div>
                    {/* Score bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#4A1F4F] to-[#2563EB] h-2 rounded-full progress-bar"
                        style={{ width: `${((assignment.submission.marks || 0) / assignment.maxMarks) * 100}%` }}
                      />
                    </div>

                    {/* Status split for PDF assignments */}
                    {(() => {
                      const { certEligibilityMarksPct } = parseTaskMeta(assignment.instructions);
                      const minPassing = assignment.passingMarks || Math.round(assignment.maxMarks * 0.4);
                      const minCertMarks = Math.round(assignment.maxMarks * (certEligibilityMarksPct / 100));
                      const score = assignment.submission.marks || 0;
                      const isPassed = score >= minPassing;
                      const isCertMet = score >= minCertMarks;
                      return (
                        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-[var(--brand-border)] space-y-2 text-left select-none">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-[var(--text-secondary)]">Course Status:</span>
                            {isPassed ? (
                              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/20 px-2 py-0.5 rounded">Passed</span>
                            ) : (
                              <span className="font-extrabold text-rose-600 dark:text-rose-455 bg-rose-100 dark:bg-rose-950/20 px-2 py-0.5 rounded">Failed</span>
                            )}
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-[var(--text-secondary)]">Certificate Requirement:</span>
                            {isCertMet ? (
                              <span className="font-extrabold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/20 px-2 py-0.5 rounded">Certificate Requirement Met</span>
                            ) : (
                              <span className="font-extrabold text-rose-600 dark:text-rose-455 bg-rose-100 dark:bg-rose-950/20 px-2 py-0.5 rounded">Certificate Requirement Not Met</span>
                            )}
                          </div>
                          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                            Requires {minPassing} marks to pass, and {minCertMarks} marks ({certEligibilityMarksPct}%) for certificate eligibility.
                          </p>
                        </div>
                      );
                    })()}
                    {assignment.submission.feedback && (
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-800/50 border border-blue-200 dark:border-blue-500/10">
                        <p className="text-xs font-medium text-[var(--text-secondary)] mb-1">Teacher Feedback</p>
                        <p className="text-sm text-[var(--text-primary)]">{assignment.submission.feedback}</p>
                      </div>
                    )}
                    <Badge variant="reviewed" size="md" label="Reviewed by Teacher" />
                  </div>
                )}
              </div>
            )}

            {/* Upload section */}
            {!assignment.submission && !overdue && (
              <>
                {uploadFile ? (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F5EAF8]0/5 border border-purple-200 dark:border-purple-500/20 mb-4">
                    <span className="text-2xl">{getFileIcon(uploadFile.name)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{uploadFile.name}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{(uploadFile.size / 1024).toFixed(0)} KB</p>
                    </div>
                    <button
                      onClick={() => setUploadFile(null)}
                      className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-red-500 hover:bg-[#F5EAF8] dark:hover:bg-[#F5EAF8]0/10 transition-colors cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    className={`drop-zone ${isDragging ? 'dragging' : ''} p-8 text-center cursor-pointer mb-4`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    onClick={() => fileRef.current?.click()}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                      <Upload size={22} className="text-[#2563EB]" />
                    </div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      Drop file here or <span className="text-[#2563EB]">browse</span>
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">PDF, ZIP, PPT, Images · Max 25MB</p>
                    <input
                      ref={fileRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.zip,.ppt,.pptx,.jpg,.jpeg,.png"
                      onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                    />
                  </div>
                )}

                {/* Upload progress */}
                {uploading && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--text-secondary)]">Uploading...</span>
                      <span className="text-[#2563EB] font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-[#2563EB] h-1.5 rounded-full progress-bar"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  variant="secondary"
                  size="lg"
                  loading={uploading}
                  disabled={!uploadFile}
                  onClick={handleSubmit}
                  icon={<Upload size={16} />}
                  className="w-full"
                >
                  Submit Assignment
                </Button>
              </>
            )}

            {/* Submitted (disabled submission button) */}
            {assignment.submission && (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  size="lg"
                  disabled
                  icon={<CheckCircle2 size={16} />}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-[var(--text-secondary)] border-[var(--brand-border)]"
                >
                  Submitted
                </Button>
              </div>
            )}

            {/* Overdue (Submission Closed button) */}
            {overdue && !assignment.submission && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F5EAF8] dark:bg-[#F5EAF8]0/10 border border-purple-200 dark:border-red-500/20">
                  <AlertCircle size={18} className="text-red-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-purple-400">Submission Deadline Passed</p>
                    <p className="text-xs text-red-600/70 dark:text-purple-400/70 mt-0.5">
                      This assignment is no longer accepting submissions.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800 text-red-500 border-purple-200 dark:border-red-500/20"
                >
                  Submission Closed
                </Button>
              </div>
            )}

            {/* Reviewed notice */}
            {assignment.submission?.status === 'reviewed' && (
              <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <AlertCircle size={12} />
                Submissions cannot be replaced after grading.
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
};
