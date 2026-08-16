import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Award, Clock, Calendar, CheckCircle2, 
  XCircle, AlertCircle, FileText, MessageSquare, Info 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { studentService } from '../../services/student.service';
import { formatDate, formatDateTime } from '../../utils/helpers';
import type { Assignment, Submission } from '../../types';
import { certificateService } from '../../services/certificate.service';
import type { Certificate } from '../../services/certificate.service';
import { CongratulatoryPopup } from '../../components/shared/CongratulatoryPopup';

export const QuizReview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  const fetchQuizDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await studentService.getAssignmentDetail(id);
      const q = res.assignment;
      if (q.assignmentType !== 'QUIZ') {
        toast.error('This is not a quiz.');
        navigate('/student/quizzes');
        return;
      }
      setQuiz(q);
    } catch {
      toast.error('Failed to load quiz details.');
      navigate('/student/quizzes');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchQuizDetails();
  }, [fetchQuizDetails]);

  useEffect(() => {
    if (loading || !quiz || !quiz.submission) return;
    
    const sub = quiz.submission;
    const isPassed = sub.marks !== null && sub.marks !== undefined && sub.marks >= (quiz.passingMarks || 0);
    const certKey = `lms_cert_shown_${id}`;

    if (isPassed && !localStorage.getItem(certKey)) {
      certificateService.getCertificateByQuiz(id!)
        .then((cert) => {
          if (cert) {
            setCertificate(cert);
            setShowCongrats(true);
            localStorage.setItem(certKey, 'true');
          }
        })
        .catch((err) => {
          console.error("Failed to load certificate on quiz completion:", err);
        });
    }
  }, [quiz, loading, id]);

  // Parse student answers
  const submittedAnswersMap = useMemo(() => {
    if (!quiz?.submission?.quizAnswers) return {};
    try {
      const list = JSON.parse(quiz.submission.quizAnswers);
      const map: Record<string, string> = {};
      if (Array.isArray(list)) {
        list.forEach((ans: any) => {
          if (ans.questionId !== undefined && ans.questionId !== null) {
            map[String(ans.questionId)] = ans.selectedOption;
          }
        });
      }
      return map;
    } catch {
      return {};
    }
  }, [quiz?.submission?.quizAnswers]);

  // Compute detailed statistics
  const stats = useMemo(() => {
    if (!quiz || !quiz.questions) return { correct: 0, wrong: 0, skipped: 0 };
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    
    quiz.questions.forEach((q) => {
      const selected = submittedAnswersMap[String(q.id)];
      if (!selected || selected.trim() === '') {
        skipped++;
      } else if (String(selected).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
        correct++;
      } else {
        wrong++;
      }
    });
    return { correct, wrong, skipped };
  }, [quiz, submittedAnswersMap]);

  if (loading) {
    return (
      <Layout role="student" title="Quiz Results">
        <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
          <div className="h-6 w-1/4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-40 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!quiz || !quiz.submission) {
    return (
      <Layout role="student" title="Quiz Review">
        <Card className="py-12 text-center max-w-3xl mx-auto border border-[var(--brand-border)]">
          <AlertCircle size={32} className="text-rose-500 mx-auto mb-2" />
          <h2 className="text-base font-bold text-[var(--text-primary)]">Results Unavailable</h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4">You have not completed this quiz attempt.</p>
          <Button variant="primary" onClick={() => navigate('/student/quizzes')}>Back to Quizzes</Button>
        </Card>
      </Layout>
    );
  }

  const sub = quiz.submission;
  const accuracy = quiz.maxMarks > 0 ? Math.round(((sub.marks || 0) / quiz.maxMarks) * 100) : 0;
  const isPassed = sub.marks !== null && sub.marks !== undefined && sub.marks >= (quiz.passingMarks || 0);

  return (
    <Layout role="student" title="Quiz Review" subtitle={quiz.title}>
      <div className="max-w-3xl mx-auto space-y-5 select-none animate-fade-in pb-12">
        
        <button
          onClick={() => navigate('/student/quizzes')}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} /> Back to Quizzes
        </button>

        {/* ==================== SUMMARY HEADER CARD ==================== */}
        <Card className="border border-[var(--brand-border)] bg-white dark:bg-[#1E293B] shadow-sm overflow-hidden">
          <div className="flex flex-col items-center justify-center text-center py-6">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 border-2 ${
              isPassed 
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                : 'bg-rose-500/10 border-rose-500 text-rose-500'
            }`}>
              {isPassed ? <CheckCircle2 size={26} /> : <XCircle size={26} />}
            </div>
            
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              {isPassed ? 'Passed Successfully!' : 'Failed Evaluation'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Completed on {formatDateTime(sub.submittedAt)}
            </p>

            <div className="grid grid-cols-4 gap-4 sm:gap-8 mt-6 p-4 bg-slate-50 dark:bg-slate-800/40 border border-[var(--brand-border)] rounded-2xl shadow-sm">
              <div className="text-center">
                <p className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-1">Your Score</p>
                <p className="text-lg font-black text-[#4A1F4F] dark:text-purple-400">
                  {sub.marks ?? 0}
                  <span className="text-xs font-normal text-[var(--text-secondary)]"> / {quiz.maxMarks}</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-1">Accuracy</p>
                <p className={`text-lg font-black ${isPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {accuracy}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-1">Pass Criteria</p>
                <p className="text-lg font-black text-slate-700 dark:text-slate-300">
                  {quiz.passingMarks} <span className="text-[10px] font-normal text-[var(--text-secondary)]">pts</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-[9px] uppercase font-bold tracking-wider text-[var(--text-secondary)] mb-1">Status</p>
                <p className={`text-xs font-extrabold uppercase mt-1 px-2 py-0.5 rounded-full inline-block ${
                  isPassed 
                    ? 'bg-emerald-500/10 text-emerald-600' 
                    : 'bg-rose-500/10 text-rose-600'
                }`}>
                  {isPassed ? 'Pass' : 'Fail'}
                </p>
              </div>
            </div>
          </div>

          {/* Counts breakdown row */}
          <div className="border-t border-[var(--brand-border)] bg-slate-50/50 dark:bg-slate-800/20 px-6 py-3.5 grid grid-cols-3 text-center text-xs">
            <div>
              <span className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider block">Correct</span>
              <span className="font-extrabold text-[var(--text-primary)] text-sm">{stats.correct}</span>
            </div>
            <div className="border-x border-[var(--brand-border)]">
              <span className="text-[9px] uppercase font-bold text-rose-500 tracking-wider block">Wrong</span>
              <span className="font-extrabold text-[var(--text-primary)] text-sm">{stats.wrong}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider block">Skipped</span>
              <span className="font-extrabold text-[var(--text-primary)] text-sm">{stats.skipped}</span>
            </div>
          </div>
        </Card>

        {/* Quiz details / remarks */}
        <Card className="border border-[var(--brand-border)] bg-white dark:bg-[#1E293B]">
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Attempt Info</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-2.5 rounded-xl border border-[var(--brand-border)] bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] block mb-0.5">Subject</span>
              <span className="text-xs text-[var(--text-primary)] font-semibold">{quiz.subject}</span>
            </div>
            <div className="p-2.5 rounded-xl border border-[var(--brand-border)] bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] block mb-0.5">Category</span>
              <span className="text-xs text-[var(--text-primary)] font-semibold">{quiz.topic || 'General'}</span>
            </div>
            <div className="p-2.5 rounded-xl border border-[var(--brand-border)] bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[9px] uppercase font-bold text-[var(--text-secondary)] block mb-0.5">Total Questions</span>
              <span className="text-xs text-[var(--text-primary)] font-semibold">{quiz.questions?.length || 0}</span>
            </div>
          </div>

          {sub.feedback && (
            <div className="mt-4 p-3 bg-[#F5EAF8]0/5 border border-purple-200 dark:border-purple-500/20 rounded-xl">
              <p className="text-[10px] uppercase font-black text-[#4A1F4F] dark:text-purple-400 mb-1 flex items-center gap-1">
                <MessageSquare size={12} /> Instructor Remarks
              </p>
              <p className="text-xs text-[var(--text-primary)] italic">
                "{sub.feedback}"
              </p>
            </div>
          )}
        </Card>

        {/* Question Review Section */}
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2 mt-5">Question-by-Question Review</h3>
        <div className="space-y-4 select-none">
          {quiz.questions?.map((q, idx) => {
            const selected = submittedAnswersMap[String(q.id)] || '';
            const isCorrect = selected.trim().toLowerCase() === (q.correctAnswer || '').trim().toLowerCase();
            const isSkipped = !selected || selected.trim() === '';

            // Extract metadata if exists (explanation, negative marks)
            let questionTextToRender = q.questionText || '';
            let explanation = '';
            let negativeMarks = 0;
            try {
              if (q.questionText && q.questionText.trim().startsWith('{')) {
                const qMeta = JSON.parse(q.questionText);
                questionTextToRender = qMeta.text || '';
                explanation = qMeta.explanation || '';
                negativeMarks = qMeta.negativeMarks || 0;
              }
            } catch {}

            return (
              <Card
                key={q.id}
                className={`border-l-4 shadow-sm relative ${
                  isSkipped 
                    ? 'border-l-slate-400' 
                    : isCorrect 
                      ? 'border-l-emerald-500' 
                      : 'border-l-rose-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                    isSkipped 
                      ? 'bg-slate-100 text-slate-500' 
                      : isCorrect 
                        ? 'bg-emerald-500/10 text-emerald-600' 
                        : 'bg-rose-500/10 text-rose-600'
                  }`}>
                    {idx + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-3">
                      <p className="text-xs font-bold text-[var(--text-primary)] leading-normal">{questionTextToRender}</p>
                      
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                          isCorrect 
                            ? 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-rose-100 dark:bg-rose-950/20 text-rose-600'
                        }`}>
                          {isCorrect ? `+${q.marks} Marks` : '0 Marks'}
                        </span>
                        {!isCorrect && negativeMarks > 0 && !isSkipped && (
                          <span className="text-[8px] font-bold text-red-500 bg-red-100 px-1 py-0.5 rounded">
                            -{negativeMarks} Neg. Mark
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Options list for MCQ / MSQ */}
                    {(q.questionType === 'MCQ' || q.questionType === 'MSQ') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3.5">
                        {[
                          { key: 'A', value: q.optionA },
                          { key: 'B', value: q.optionB },
                          ...(q.optionC ? [{ key: 'C', value: q.optionC }] : []),
                          ...(q.optionD ? [{ key: 'D', value: q.optionD }] : [])
                        ].map((opt) => {
                          const listSelected = selected.split(',').map(s => s.trim());
                          const isSelected = listSelected.includes(opt.key);
                          const isCorrectOption = q.questionType === 'MSQ'
                            ? (q.correctAnswer || '').split(',').map((s: string) => s.trim()).includes(opt.key)
                            : (q.correctAnswer || '') === opt.key;

                          let borderStyle = 'border-[var(--brand-border)] text-[var(--text-secondary)]';
                          if (isSelected) {
                            borderStyle = isCorrectOption 
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold' 
                              : 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 font-bold';
                          } else if (isCorrectOption) {
                            borderStyle = 'bg-emerald-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold';
                          }

                          return (
                            <div key={opt.key} className={`flex items-center gap-2 p-2 border rounded-xl text-[11px] ${borderStyle}`}>
                              <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] border font-black shrink-0 ${
                                isSelected
                                  ? 'bg-transparent text-current'
                                  : isCorrectOption ? 'bg-emerald-500/20 text-emerald-600 border-transparent' : 'border-[var(--brand-border)]'
                              }`}>
                                {opt.key}
                              </span>
                              <span className="truncate">{opt.value}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* True False */}
                    {q.questionType === 'TRUE_FALSE' && (
                      <div className="flex gap-4 mt-3">
                        {['A', 'B'].map((optKey) => {
                          const val = optKey === 'A' ? (q.optionA || 'True') : (q.optionB || 'False');
                          const isSelected = selected.toUpperCase() === optKey || selected.toUpperCase() === val.toUpperCase();
                          const isCorrectOption = (q.correctAnswer || '').toUpperCase() === optKey || (q.correctAnswer || '').toUpperCase() === val.toUpperCase();

                          let borderStyle = 'border-[var(--brand-border)] text-[var(--text-secondary)]';
                          if (isSelected) {
                            borderStyle = isCorrectOption
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold'
                              : 'bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-400 font-bold';
                          } else if (isCorrectOption) {
                            borderStyle = 'bg-emerald-500/5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold';
                          }

                          return (
                            <div key={optKey} className={`flex items-center gap-2 p-2 border rounded-xl text-[11px] ${borderStyle}`}>
                              <span className="font-bold">{optKey === 'A' ? 'True' : 'False'}:</span>
                              <span>{val}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Fill in Blank / Short Answer */}
                    {q.questionType === 'SHORT_ANSWER' && (
                      <div className="space-y-1 mt-3.5 text-xs">
                        <p className="text-[var(--text-secondary)]">
                          Your Answer: <span className={`font-semibold ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>{selected || '(No Answer / Skipped)'}</span>
                        </p>
                        {!isCorrect && (
                          <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                            Correct Text: <span className="font-bold text-emerald-600">{q.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Explanation */}
                    {explanation && (
                      <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-[var(--brand-border)] flex items-start gap-2">
                        <Info size={14} className="text-[#2563EB] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold text-[#2563EB] uppercase tracking-wider block">Answer Explanation</span>
                          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">{explanation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      {quiz && quiz.submission && (
        <CongratulatoryPopup
          isOpen={showCongrats}
          onClose={() => setShowCongrats(false)}
          certificate={certificate}
          activityTitle={quiz.title}
          score={quiz.submission.marks ?? 0}
          maxScore={quiz.maxMarks}
          assignmentOrQuizId={quiz.id}
        />
      )}
    </Layout>
  );
};
