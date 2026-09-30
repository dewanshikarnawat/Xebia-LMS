import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, Award, HelpCircle, CheckCircle, 
  ChevronLeft, ChevronRight, AlertCircle, Flag, CornerDownRight 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { studentService } from '../../services/student.service';
import type { Assignment, Question } from '../../types';

export const QuizAttempt: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Attempt State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({}); // Maps question ID to selected answer/option
  const [flagged, setFlagged] = useState<Record<number, boolean>>({}); // Maps question ID to true/false

  // Timer State
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // seconds
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);

  // Parse custom metadata from instructions
  const quizSettings = useMemo(() => {
    if (!quiz) return { timeLimit: 30, attemptsAllowed: 1, realInstructions: '' };
    let time = (quiz.questions?.length || 6) * 5; // default 5 mins per question
    let att = 1;
    let inst = quiz.instructions || '';
    try {
      if (quiz.instructions && quiz.instructions.trim().startsWith('{')) {
        const meta = JSON.parse(quiz.instructions);
        time = meta.timeLimit || time;
        att = meta.attemptsAllowed || 1;
        inst = meta.realInstructions || '';
      }
    } catch {}
    return { timeLimit: time, attemptsAllowed: att, realInstructions: inst };
  }, [quiz]);

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
      let att = 1;
      try {
        if (q.instructions && q.instructions.trim().startsWith('{')) {
          const meta = JSON.parse(q.instructions);
          att = meta.attemptsAllowed || 1;
        }
      } catch {}

      if ((q.submissionStatus === 'submitted' || q.submissionStatus === 'reviewed') && att <= 1) {
        toast.error('You have already submitted this quiz.');
        navigate(`/student/quizzes/${id}/review`);
        return;
      }

      setQuiz(q);
      
      // Load saved answers and flags from localStorage if present
      const savedAns = localStorage.getItem(`lms_quiz_answers_${id}`);
      if (savedAns) {
        try {
          setAnswers(JSON.parse(savedAns));
        } catch {}
      }
      const savedFlags = localStorage.getItem(`lms_quiz_flags_${id}`);
      if (savedFlags) {
        try {
          setFlagged(JSON.parse(savedFlags));
        } catch {}
      }

      // Initialize countdown timer
      let timeLimitMins = (q.questions?.length || 6) * 5;
      try {
        if (q.instructions && q.instructions.trim().startsWith('{')) {
          const meta = JSON.parse(q.instructions);
          timeLimitMins = meta.timeLimit || timeLimitMins;
        }
      } catch {}

      // Check if timer state is already stored in localStorage to preserve on reload
      const savedExpiry = localStorage.getItem(`lms_quiz_expiry_${id}`);
      let targetTimeLeft = timeLimitMins * 60;
      if (savedExpiry) {
        const diff = Math.floor((Number(savedExpiry) - Date.now()) / 1000);
        if (diff > 0) {
          targetTimeLeft = diff;
        } else {
          targetTimeLeft = 0;
        }
      } else {
        localStorage.setItem(`lms_quiz_expiry_${id}`, String(Date.now() + (timeLimitMins * 60 * 1000)));
      }

      setTimeLeft(targetTimeLeft);
    } catch {
      toast.error('Failed to load quiz questions.');
      navigate('/student/quizzes');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchQuizDetails();
  }, [fetchQuizDetails]);

  // Handle countdown timer
  useEffect(() => {
    if (timeLeft === null || submitting) return;
    if (timeLeft <= 0) {
      toast.error('Time is up! Submitting your answers automatically.');
      autoSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev !== null && prev > 1) return prev - 1;
        return 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitting]);

  const clearLocalStorageCache = () => {
    localStorage.removeItem(`lms_quiz_answers_${id}`);
    localStorage.removeItem(`lms_quiz_flags_${id}`);
    localStorage.removeItem(`lms_quiz_expiry_${id}`);
  };

  const autoSubmitQuiz = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const quizAnswersList = (quiz.questions || []).map(q => ({
        questionId: q.id,
        selectedOption: answers[Number(q.id)] || ''
      }));

      await studentService.submitAssignment(quiz.id, {
        quizAnswersJson: JSON.stringify(quizAnswersList)
      });
      clearLocalStorageCache();
      toast.success('Your quiz was auto-submitted successfully.');
      navigate(`/student/quizzes/${quiz.id}/review`);
    } catch {
      toast.error('Failed to auto-submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const executeSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    setShowSubmitConfirmModal(false);
    try {
      const quizAnswersList = (quiz.questions || []).map(q => ({
        questionId: q.id,
        selectedOption: answers[Number(q.id)] || ''
      }));

      await studentService.submitAssignment(quiz.id, {
        quizAnswersJson: JSON.stringify(quizAnswersList)
      });
      clearLocalStorageCache();
      toast.success('Your quiz has been submitted successfully.');
      navigate(`/student/quizzes/${quiz.id}/review`);
    } catch {
      toast.error('Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectOption = (questionId: number, optionKey: string) => {
    const updated = {
      ...answers,
      [questionId]: optionKey
    };
    setAnswers(updated);
    localStorage.setItem(`lms_quiz_answers_${id}`, JSON.stringify(updated));
  };

  const handleToggleFlag = (questionId: number) => {
    const updated = {
      ...flagged,
      [questionId]: !flagged[questionId]
    };
    setFlagged(updated);
    localStorage.setItem(`lms_quiz_flags_${id}`, JSON.stringify(updated));
  };

  // Format Time Helper
  const formatSeconds = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Layout role="student" title="Quiz Portal">
        <div className="max-w-5xl mx-auto space-y-4 animate-pulse">
          <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-60 w-full bg-slate-200 dark:bg-slate-700 rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (!quiz) return null;

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  // Safe JSON text metadata extraction
  let questionTextToRender = currentQuestion?.questionText || '';
  let questionImageUrl = '';
  try {
    if (currentQuestion?.questionText && currentQuestion.questionText.trim().startsWith('{')) {
      const qMeta = JSON.parse(currentQuestion.questionText);
      questionTextToRender = qMeta.text || '';
      questionImageUrl = qMeta.imageUrl || '';
    }
  } catch {}

  const answeredCount = Object.keys(answers).filter(k => answers[Number(k)] && answers[Number(k)].trim() !== '').length;
  const progressPercentage = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <Layout role="student" title="Quiz Attempt" subtitle={quiz.title}>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 select-none animate-fade-in">
        
        {/* ================================= LEFT PANEL: Info & Sidebar ================================= */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Timer Card */}
          <Card className="bg-[#4A1F4F]/5 border-[#4A1F4F]/15 dark:bg-[#4A1F4F]/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-[#4A1F4F] dark:text-purple-400 animate-spin" /> Time Remaining
              </span>
              <span className={`text-xl font-black font-mono tracking-wider ${
                timeLeft !== null && timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-[#4A1F4F] dark:text-purple-400'
              }`}>
                {timeLeft !== null ? formatSeconds(timeLeft) : '—'}
              </span>
            </div>
            
            {/* Timer countdown progress pill */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  timeLeft !== null && timeLeft < 60 ? 'bg-rose-500' : 'bg-[#4A1F4F]'
                }`}
                style={{ width: `${timeLeft !== null ? (timeLeft / (quizSettings.timeLimit * 60)) * 100 : 100}%` }}
              />
            </div>
          </Card>

          {/* Progress Card */}
          <Card className="border border-[var(--brand-border)]">
            <div className="flex justify-between items-center text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-2">
              <span>Progress</span>
              <span>{answeredCount} / {totalQuestions} Answered</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mb-5">
              <div 
                className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Questions Grid */}
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-3">Question Navigation</h3>
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = answers[Number(q.id)] !== undefined && answers[Number(q.id)].trim() !== '';
                const isFlagged = flagged[Number(q.id)] === true;
                
                let stateStyle = 'bg-slate-50 dark:bg-slate-800 text-[var(--text-secondary)] border-[var(--brand-border)]';
                if (isCurrent) {
                  stateStyle = 'bg-[#4A1F4F] text-white border-transparent ring-2 ring-purple-300 dark:ring-purple-900';
                } else if (isFlagged) {
                  stateStyle = 'bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400 font-bold';
                } else if (isAnswered) {
                  stateStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-blue-400 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold border cursor-pointer transition-all relative ${stateStyle}`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 pt-3 border-t border-[var(--brand-border)] space-y-2 text-[10px] text-[var(--text-secondary)] font-medium">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-[#4A1F4F] block" />
                <span>Current Question</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-500/15 border border-emerald-500 block" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-500/15 border border-amber-500 block" />
                <span>Flagged for Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-50 dark:bg-slate-800 border border-[var(--brand-border)] block" />
                <span>Unanswered</span>
              </div>
            </div>
          </Card>
        </div>

        {/* ================================= RIGHT PANEL: Question Renderer ================================= */}
        <div className="lg:col-span-8 space-y-5">
          <Card className="min-h-[400px] flex flex-col justify-between border border-[var(--brand-border)] bg-white dark:bg-[#1E293B] shadow-sm rounded-2xl p-6">
            {currentQuestion ? (
              <div className="space-y-6 flex-1 flex flex-col justify-between">
                
                {/* Question Header */}
                <div className="flex justify-between items-center pb-3 border-b border-[var(--brand-border)]">
                  <span className="text-xs font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                    <span className="text-[var(--text-primary)]">Question {currentIndex + 1}</span> of {totalQuestions}
                  </span>
                  
                  <div className="flex gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {currentQuestion.difficulty || 'Medium'}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-[#2563EB] bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-[#2563EB]/10 flex items-center gap-1">
                      <Award size={11} /> {currentQuestion.marks} Marks
                    </span>
                  </div>
                </div>

                {/* Question Body */}
                <div className="space-y-5 flex-1 py-2">
                  <h2 className="text-base font-bold text-[var(--text-primary)] leading-normal flex items-start gap-2">
                    <span className="text-[#4A1F4F] dark:text-purple-400 font-black">{currentIndex + 1}.</span>
                    <span>{questionTextToRender}</span>
                  </h2>

                  {/* Render Question Image if available */}
                  {questionImageUrl && (
                    <div className="my-3 max-w-full h-auto max-h-48 overflow-hidden rounded-xl border border-[var(--brand-border)]">
                      <img src={questionImageUrl} alt="Question Resource" className="object-contain" />
                    </div>
                  )}

                  {/* Options List */}

                  {/* Type 1: MCQ (Single Select) */}
                  {currentQuestion.questionType === 'MCQ' && (
                    <div className="grid grid-cols-1 gap-3.5 mt-4">
                      {[
                        { key: 'A', value: currentQuestion.optionA },
                        { key: 'B', value: currentQuestion.optionB },
                        ...(currentQuestion.optionC ? [{ key: 'C', value: currentQuestion.optionC }] : []),
                        ...(currentQuestion.optionD ? [{ key: 'D', value: currentQuestion.optionD }] : [])
                      ].map((opt) => {
                        const isSelected = answers[Number(currentQuestion.id)] === opt.key;

                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => handleSelectOption(Number(currentQuestion.id), opt.key)}
                            className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left text-xs font-semibold cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? 'bg-[#4A1F4F]/5 border-[#4A1F4F] text-[#4A1F4F] dark:text-purple-400 font-bold shadow-sm'
                                : 'bg-white dark:bg-[#1E293B] border-[var(--brand-border)] text-[var(--text-primary)] hover:border-slate-400'
                            }`}
                          >
                            <span className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isSelected ? 'bg-[#4A1F4F] text-white border-transparent' : 'border-[var(--brand-border)] text-[var(--text-secondary)] bg-slate-50'
                            }`}>
                              {opt.key}
                            </span>
                            <span className="flex-1">{opt.value}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Type 2: MSQ (Multiple Select) */}
                  {currentQuestion.questionType === 'MSQ' && (
                    <div className="grid grid-cols-1 gap-3.5 mt-4">
                      {[
                        { key: 'A', value: currentQuestion.optionA },
                        { key: 'B', value: currentQuestion.optionB },
                        ...(currentQuestion.optionC ? [{ key: 'C', value: currentQuestion.optionC }] : []),
                        ...(currentQuestion.optionD ? [{ key: 'D', value: currentQuestion.optionD }] : [])
                      ].map((opt) => {
                        const selectedList = String(answers[Number(currentQuestion.id)] || '').split(',').map(s => s.trim()).filter(Boolean);
                        const isSelected = selectedList.includes(opt.key);

                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => {
                              let newList = [...selectedList];
                              if (isSelected) {
                                newList = newList.filter(item => item !== opt.key);
                              } else {
                                newList.push(opt.key);
                              }
                              newList.sort();
                              handleSelectOption(Number(currentQuestion.id), newList.join(','));
                            }}
                            className={`w-full flex items-center gap-4 p-3.5 rounded-xl border text-left text-xs font-semibold cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? 'bg-[#4A1F4F]/5 border-[#4A1F4F] text-[#4A1F4F] dark:text-purple-400 font-bold shadow-sm'
                                : 'bg-white dark:bg-[#1E293B] border-[var(--brand-border)] text-[var(--text-primary)] hover:border-slate-400'
                            }`}
                          >
                            <span className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isSelected ? 'bg-[#4A1F4F] text-white border-transparent' : 'border-[var(--brand-border)] text-[var(--text-secondary)] bg-slate-50'
                            }`}>
                              {opt.key}
                            </span>
                            <span className="flex-1">{opt.value}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Type 3: True / False */}
                  {currentQuestion.questionType === 'TRUE_FALSE' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {[
                        { key: 'A', label: 'True', val: currentQuestion.optionA || 'True' },
                        { key: 'B', label: 'False', val: currentQuestion.optionB || 'False' }
                      ].map((opt) => {
                        const isSelected = answers[Number(currentQuestion.id)] === opt.key || answers[Number(currentQuestion.id)] === opt.label || answers[Number(currentQuestion.id)] === opt.val;

                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => handleSelectOption(Number(currentQuestion.id), opt.key)}
                            className={`flex flex-col items-center justify-center p-6 rounded-xl border text-center cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? 'bg-[#4A1F4F]/5 border-[#4A1F4F] text-[#4A1F4F] dark:text-purple-400 font-bold shadow-sm'
                                : 'bg-white dark:bg-[#1E293B] border-[var(--brand-border)] text-[var(--text-primary)] hover:border-slate-400'
                            }`}
                          >
                            <span className="text-base font-bold mb-1">{opt.label}</span>
                            <span className="text-[10px] text-[var(--text-secondary)]">Option {opt.key}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Type 4: Short Answer / Fill in Blank */}
                  {currentQuestion.questionType === 'SHORT_ANSWER' && (
                    <div className="space-y-2 mt-4">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)] flex items-center gap-1">
                        <CornerDownRight size={12} /> Type your answer
                      </label>
                      <input
                        type="text"
                        value={answers[Number(currentQuestion.id)] || ''}
                        onChange={(e) => handleSelectOption(Number(currentQuestion.id), e.target.value)}
                        placeholder="Answer must match exact keyword..."
                        className="w-full bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] focus:border-[#4A1F4F] text-[var(--text-primary)] rounded-xl py-3 px-4 text-xs transition-colors focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Bottom Navigation Toolbar */}
                <div className="flex justify-between items-center pt-5 mt-6 border-t border-[var(--brand-border)]">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
                      disabled={currentIndex === 0}
                      icon={<ChevronLeft size={16} />}
                    >
                      Previous
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleToggleFlag(Number(currentQuestion.id))}
                      className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        flagged[Number(currentQuestion.id)]
                          ? 'bg-amber-500 border-transparent text-white'
                          : 'bg-white dark:bg-[#1E293B] border-[var(--brand-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <Flag size={13} fill={flagged[Number(currentQuestion.id)] ? 'white' : 'transparent'} />
                      <span>{flagged[Number(currentQuestion.id)] ? 'Flagged' : 'Flag'}</span>
                    </button>
                  </div>

                  {isLastQuestion ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setShowSubmitConfirmModal(true)}
                      loading={submitting}
                      disabled={submitting}
                      icon={<CheckCircle size={16} />}
                    >
                      Submit Quiz
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setCurrentIndex(prev => Math.min(prev + 1, totalQuestions - 1))}
                      icon={<ChevronRight size={16} />}
                      iconPosition="right"
                    >
                      Next
                    </Button>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <HelpCircle size={32} className="text-[var(--text-secondary)] animate-bounce" />
                <p className="text-sm font-semibold text-[var(--text-primary)] mt-2">No question loaded.</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={showSubmitConfirmModal}
        onClose={() => setShowSubmitConfirmModal(false)}
        title="Confirm Submission"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowSubmitConfirmModal(false)}>Go Back</Button>
            <Button variant="primary" loading={submitting} onClick={executeSubmit}>Submit Answers</Button>
          </>
        }
      >
        <div className="flex items-start gap-3 select-none">
          <div className="w-10 h-10 rounded-xl bg-[#F5EAF8]0/10 flex items-center justify-center shrink-0">
            <CheckCircle size={20} className="text-[#4A1F4F]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">Ready to submit your answers?</p>
            
            <div className="mt-3.5 space-y-1.5 text-xs text-[var(--text-secondary)] bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-[var(--brand-border)]">
              <div className="flex justify-between">
                <span>Total Questions:</span>
                <span className="font-bold text-[var(--text-primary)]">{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span>Answered:</span>
                <span className="font-bold text-emerald-600">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Unanswered:</span>
                <span className="font-bold text-rose-500">{totalQuestions - answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Flagged for Review:</span>
                <span className="font-bold text-amber-500">
                  {Object.values(flagged).filter(Boolean).length}
                </span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] mt-3">
              Once submitted, your answers will be automatically graded and you cannot change them.
            </p>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
