import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  Plus, Search, Eye, Edit, Trash2, HelpCircle, Upload, 
  ArrowLeft, ArrowUp, ArrowDown, Copy, Settings, Check, 
  AlertTriangle, FileSpreadsheet, Download, RefreshCw,
  Calendar, Clock, Users, CheckCircle2, FileText, Award,
  ChevronUp, ChevronDown, ChevronRight, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/shared/EmptyState';
import { Pagination } from '../../components/shared/Pagination';
import { TableRowSkeleton } from '../../components/shared/LoadingSkeleton';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { SubjectSelector } from '../../components/shared/SubjectSelector';
import { teacherService } from '../../services/teacher.service';
import { formatDate, getDueDateCountdown, getDueDateColor } from '../../utils/helpers';
import type { Assignment, PaginationMeta, Question } from '../../types';
import { useAppDispatch, useAppSelector } from '../../store';
import { getAllBatches } from '../../store/batchSlice';

const SUBJECTS = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Geography', 'Economics', 'Other'];

interface QuizMetadata {
  instructions: string;
  timeLimit: number; // in minutes
  attemptsAllowed: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
}

export const TeacherQuizzes: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  
  const [quizzes, setQuizzes] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [deleteModal, setDeleteModal] = useState<Assignment | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Split Panel Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [activeCreatorTab, setActiveCreatorTab] = useState<'manual' | 'import'>('manual');

  // Left Panel Form State (Quiz Details)
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizSubject, setQuizSubject] = useState('Mathematics');
  const [quizTopic, setQuizTopic] = useState('');
  const [quizBatchId, setQuizBatchId] = useState('');
  const [quizBatchIds, setQuizBatchIds] = useState<string[]>([]);
  const [quizDueDate, setQuizDueDate] = useState('');
  const [quizTimeLimit, setQuizTimeLimit] = useState(30); // default 30 mins
  const [quizAttempts, setQuizAttempts] = useState(1);
  const [quizDifficulty, setQuizDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [quizInstructions, setQuizInstructions] = useState('Please answer all questions carefully.');
  const [passingPercentage, setPassingPercentage] = useState(50); // Default 50%
  const [quizCertEligibilityMarks, setQuizCertEligibilityMarks] = useState(75); // Default 75%

  // Right Panel Builder State (Questions)
  const [questionsList, setQuestionsList] = useState<any[]>([]);
  const [activeBuilderQuestion, setActiveBuilderQuestion] = useState<any | null>(null);
  const [activeBuilderIndex, setActiveBuilderIndex] = useState<number | null>(null);

  // Premium UI local states
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({});
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [randomizeOptions, setRandomizeOptions] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [autoPublish, setAutoPublish] = useState(true);

  // Assign Batch Modal State
  const [assignModalQuiz, setAssignModalQuiz] = useState<Assignment | null>(null);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);

  // Excel Upload State
  const [isExcelDragging, setIsExcelDragging] = useState(false);
  const [isExcelUploading, setIsExcelUploading] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const excelRef = useRef<HTMLInputElement>(null);

  // Redux Batches
  const { batches } = useAppSelector((s) => s.batch);

  // Fetch batches
  useEffect(() => {
    dispatch(getAllBatches());
  }, [dispatch]);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { 
        page: String(page + 1), 
        limit: String(size),
        assignmentType: 'QUIZ'
      };
      if (search) params.search = search;
      if (subjectFilter) params.subject = subjectFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await teacherService.getAssignments(params);
      
      setQuizzes(res.assignments);
      setTotalPages(res.pagination.totalPages);
      setTotalElements(res.pagination.total);
    } catch {
      toast.error('Failed to load quizzes.');
    } finally {
      setLoading(false);
    }
  }, [search, subjectFilter, statusFilter, page, size]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Sync open modal if ?create=1 is present
  useEffect(() => {
    const open = new URLSearchParams(window.location.search).get('create');
    if (open === '1') {
      handleOpenCreateModal();
    }
  }, [batches]);

  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setEditingQuizId(null);
    setQuizTitle('');
    setQuizDescription('');
    setQuizSubject('Mathematics');
    setQuizTopic('');
    setQuizBatchId('');
    setQuizBatchIds([]);
    setQuizDueDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]); // tomorrow
    setQuizTimeLimit(30);
    setQuizAttempts(1);
    setQuizDifficulty('Medium');
    setQuizInstructions('Please answer all questions carefully.');
    setPassingPercentage(50);
    setQuestionsList([]);
    setActiveBuilderQuestion(null);
    setActiveBuilderIndex(null);
    setActiveCreatorTab('manual');
    setShowCreateModal(true);
  };

  const handleOpenEditModal = async (quizItem: Assignment) => {
    setIsEditMode(true);
    setEditingQuizId(quizItem.id);
    setLoading(true);
    try {
      const res = await teacherService.getAssignmentById(quizItem.id);
      const q = res;
      setQuizTitle(q.title || '');
      setQuizDescription(q.description || '');
      setQuizSubject(q.subject || 'Mathematics');
      setQuizTopic(q.topic || '');
      setQuizBatchId(String(q.batchId || ''));
      setQuizBatchIds(q.batchId ? [String(q.batchId)] : []);
      setQuizDueDate(q.dueDate || '');
      
      let time = 30;
      let att = 1;
      let diff: 'Easy' | 'Medium' | 'Hard' = 'Medium';
      let inst = q.instructions || '';
      let certEligibility = 75;
      try {
        if (q.instructions && q.instructions.trim().startsWith('{')) {
          const meta = JSON.parse(q.instructions);
          inst = meta.realInstructions || '';
          time = meta.timeLimit || 30;
          att = meta.attemptsAllowed || 1;
          diff = meta.difficulty || 'Medium';
          certEligibility = meta.certEligibilityMarks !== undefined ? Number(meta.certEligibilityMarks) : 75;
        }
      } catch {}
      
      setQuizTimeLimit(time);
      setQuizAttempts(att);
      setQuizDifficulty(diff);
      setQuizInstructions(inst);
      setQuizCertEligibilityMarks(certEligibility);
      
      const passPercent = q.totalMarks > 0 ? Math.round((q.passingMarks / q.totalMarks) * 100) : 50;
      setPassingPercentage(passPercent);

      // Parse questions list and their internal text metadata (explanation, etc.)
      const parsedQuestions = (q.questions || []).map((quest: any) => {
        let text = quest.questionText || '';
        let expl = '';
        let neg = 0;
        try {
          if (text.trim().startsWith('{')) {
            const questMeta = JSON.parse(text);
            text = questMeta.text || '';
            expl = questMeta.explanation || '';
            neg = questMeta.negativeMarks || 0;
          }
        } catch {}

        return {
          id: quest.id,
          questionType: quest.questionType || 'MCQ',
          questionText: text,
          optionA: quest.optionA || '',
          optionB: quest.optionB || '',
          optionC: quest.optionC || '',
          optionD: quest.optionD || '',
          correctAnswer: quest.correctAnswer || 'A',
          marks: quest.marks || 2,
          difficulty: quest.difficulty || 'Medium',
          explanation: expl,
          negativeMarks: neg
        };
      });
      
      setQuestionsList(parsedQuestions);
      setActiveBuilderQuestion(null);
      setActiveBuilderIndex(null);
      setActiveCreatorTab('manual');
      setShowCreateModal(true);
    } catch {
      toast.error('Failed to load quiz details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    const sp = new URLSearchParams(window.location.search);
    sp.delete('create');
    window.history.replaceState({}, '', `${window.location.pathname}${sp.toString() ? '?' + sp.toString() : ''}`);
  };

  // Reorder actions
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questionsList.length) return;
    const updated = [...questionsList];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setQuestionsList(updated);
    if (activeBuilderIndex === index) {
      setActiveBuilderIndex(targetIndex);
    } else if (activeBuilderIndex === targetIndex) {
      setActiveBuilderIndex(index);
    }
  };

  // Duplicate action
  const duplicateQuestion = (index: number) => {
    const source = questionsList[index];
    const duplicated = {
      ...source,
      id: undefined, // remove DB id to trigger insertion
      questionText: `${source.questionText} (Copy)`
    };
    const updated = [...questionsList];
    updated.splice(index + 1, 0, duplicated);
    setQuestionsList(updated);
    toast.success('Question duplicated');
  };

  // Delete action
  const deleteQuestion = (index: number) => {
    const updated = [...questionsList];
    updated.splice(index, 1);
    setQuestionsList(updated);
    if (activeBuilderIndex === index) {
      setActiveBuilderQuestion(null);
      setActiveBuilderIndex(null);
    } else if (activeBuilderIndex !== null && activeBuilderIndex > index) {
      setActiveBuilderIndex(activeBuilderIndex - 1);
    }
    toast.success('Question deleted');
  };

  // Validation function for imported questions
  const getQuestionErrors = (q: any): string[] => {
    const errors: string[] = [];
    if (!q.questionText || !q.questionText.trim()) {
      errors.push('Question text is required.');
    }
    if (q.questionType === 'MCQ' || q.questionType === 'MSQ') {
      if (!q.optionA || !q.optionA.trim()) errors.push('Option A is required.');
      if (!q.optionB || !q.optionB.trim()) errors.push('Option B is required.');
      if (!q.optionC || !q.optionC.trim()) errors.push('Option C is required.');
      if (!q.optionD || !q.optionD.trim()) errors.push('Option D is required.');
    }
    if (q.questionType === 'TRUE_FALSE') {
      if (!q.optionA || !q.optionA.trim()) errors.push('Option A (True) is required.');
      if (!q.optionB || !q.optionB.trim()) errors.push('Option B (False) is required.');
      const validTF = ['A', 'B', 'TRUE', 'FALSE'];
      if (!q.correctAnswer || !validTF.includes(String(q.correctAnswer).trim().toUpperCase())) {
        errors.push('Correct Answer must be A, B, True, or False.');
      }
    }
    if (q.questionType === 'MCQ') {
      const validOptions = ['A', 'B', 'C', 'D'];
      if (!q.correctAnswer || !validOptions.includes(String(q.correctAnswer).trim().toUpperCase())) {
        errors.push('Correct Answer must be A, B, C, or D.');
      }
    }
    if (q.questionType === 'MSQ') {
      if (!q.correctAnswer || !q.correctAnswer.trim()) {
        errors.push('Correct options required.');
      } else {
        const parts = q.correctAnswer.split(',').map((p: string) => p.trim().toUpperCase());
        const invalid = parts.filter((p: string) => !['A', 'B', 'C', 'D'].includes(p));
        if (invalid.length > 0) {
          errors.push('Correct Answers must be selected from options A, B, C, or D (e.g. "A,B").');
        }
      }
    }
    if (!q.marks || isNaN(Number(q.marks)) || Number(q.marks) <= 0) {
      errors.push('Marks must be a positive number.');
    }
    return errors;
  };

  const hasAnyValidationErrors = () => {
    return questionsList.some(q => getQuestionErrors(q).length > 0);
  };

  // Excel Drop Handler
  const handleExcelFile = async (file: File) => {
    if (isExcelUploading) return;
    const allowed = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!allowed.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Invalid file type. Please upload an Excel file (.xlsx or .xls).');
      return;
    }
    setIsExcelUploading(true);
    const toastId = toast.loading('Parsing Excel file...');
    try {
      const res = await teacherService.importExcel(file);
      const imported = res.data || [];
      const formatted = imported.map((q: any) => {
        // detection logic inside ExcelParserHelper is already robust, we just clean up
        let type = q.questionType || 'MCQ';
        let optA = q.optionA || '';
        let optB = q.optionB || '';
        
        // detect true false
        if (optA.toLowerCase() === 'true' && optB.toLowerCase() === 'false') {
          type = 'TRUE_FALSE';
        }
        // detect fill in blank
        if (!optA && !optB) {
          type = 'SHORT_ANSWER';
        }

        return {
          questionType: type,
          questionText: q.questionText || '',
          optionA: optA,
          optionB: optB,
          optionC: q.optionC || '',
          optionD: q.optionD || '',
          correctAnswer: q.correctAnswer || 'A',
          marks: q.marks || 2,
          difficulty: q.difficulty || 'Medium',
          explanation: '',
          negativeMarks: 0
        };
      });

      setQuestionsList((prev) => [...prev, ...formatted]);
      toast.success(`Successfully loaded ${formatted.length} questions! Check for errors below.`, { id: toastId });
      setActiveCreatorTab('manual'); // redirect to list preview
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to import Excel file.', { id: toastId });
    } finally {
      setIsExcelUploading(false);
    }
  };

  const onExcelDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsExcelDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleExcelFile(file);
  };

  // Excel template downloader
  const downloadExcelTemplate = async () => {
    try {
      const blob = await teacherService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quiz_template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Excel template downloaded!');
    } catch {
      toast.error('Failed to download template. Ensure backend is running.');
    }
  };

  // Submit handler (saves draft or publishes)
  const onSubmitQuiz = async (status: 'draft' | 'published') => {
    if (submittingQuiz) return;
    if (!quizTitle.trim()) {
      toast.error('Quiz title is required.');
      return;
    }
    if (status === 'published' && quizBatchIds.length === 0) {
      toast.error('Please select at least one batch to publish the quiz.');
      return;
    }
    if (!quizDueDate) {
      toast.error('Due date is required.');
      return;
    }
    if (questionsList.length === 0) {
      toast.error('Please add or import at least one question.');
      return;
    }
    if (hasAnyValidationErrors()) {
      toast.error('Please fix all question validation errors before saving.');
      return;
    }

    setSubmittingQuiz(true);
    const totalMarks = questionsList.reduce((sum, q) => sum + Number(q.marks || 0), 0);
    const passingMarks = Math.round(totalMarks * (passingPercentage / 100));

    // Serialize custom settings into instructions
    const instructionsData = JSON.stringify({
      realInstructions: quizInstructions,
      timeLimit: quizTimeLimit,
      attemptsAllowed: quizAttempts,
      difficulty: quizDifficulty,
      category: quizTopic || 'Quiz',
      certEligibilityMarks: Number(quizCertEligibilityMarks)
    });

    // Format questions and serialize question-level extra metadata
    const questionsPayload = questionsList.map((q) => {
      let finalQuestionText = q.questionText;
      if (q.explanation || q.negativeMarks) {
        finalQuestionText = JSON.stringify({
          text: q.questionText,
          explanation: q.explanation || '',
          negativeMarks: Number(q.negativeMarks || 0)
        });
      }

      return {
        id: q.id,
        questionText: finalQuestionText,
        questionType: q.questionType,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: String(q.correctAnswer).trim(),
        marks: q.marks,
        difficulty: q.difficulty
      };
    });

    const targetBatchId = quizBatchIds.length > 0 ? Number(quizBatchIds[0]) : null;

    console.log("Selected Target Batch:", targetBatchId);

    const payload = {
      title: quizTitle,
      description: quizDescription,
      instructions: instructionsData,
      assignmentType: 'QUIZ',
      subject: quizSubject,
      topic: quizTopic,
      batchId: targetBatchId,
      maxMarks: totalMarks,
      passingMarks,
      dueDate: quizDueDate,
      dueTime: '23:59:00',
      lateSubmissionAllowed: false,
      maxFileSize: 10485760,
      questions: questionsPayload,
    };

    console.log("Quiz Creation Payload:", payload);

    const loadingToast = toast.loading(isEditMode ? 'Updating quiz...' : 'Creating quiz...');

    try {
      let savedQuiz: any;
      if (isEditMode && editingQuizId) {
        savedQuiz = await teacherService.updateAssignment(editingQuizId, payload as any);
      } else {
        savedQuiz = await teacherService.createAssignment(payload as any);
      }

      const response = savedQuiz;
      console.log("Backend Response:", response.data);

      const quizId = editingQuizId || response?.data?.id || response?.id;

      // If multiple batches were selected, assign the additional ones
      if (quizId && quizBatchIds.length > 1) {
        await teacherService.assignBatch(quizId, quizBatchIds.slice(1));
      }

      const isDraftResult = response?.data?.status === 'DRAFT';

      toast.success(
        isEditMode
          ? 'Quiz updated successfully.'
          : isDraftResult
          ? 'Quiz saved as draft successfully.'
          : 'Quiz published successfully.',
        { id: loadingToast }
      );
      handleCloseCreateModal();
      fetchQuizzes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save quiz.', { id: loadingToast });
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleAssignBatch = async () => {
    if (!assignModalQuiz) return;
    if (selectedBatchIds.length === 0) {
      toast.error('Please select at least one batch.');
      return;
    }
    setAssigning(true);
    try {
      await teacherService.assignBatch(assignModalQuiz.id, selectedBatchIds);
      toast.success('Quiz assigned successfully!');
      setAssignModalQuiz(null);
      fetchQuizzes();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign quiz to batches.');
    } finally {
      setAssigning(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await teacherService.deleteAssignment(deleteModal.id);
      toast.success('Quiz deleted.');
      setDeleteModal(null);
      fetchQuizzes();
    } catch {
      toast.error('Failed to delete quiz.');
    } finally {
      setDeleting(false);
    }
  };

  const todayDate = new Date().toISOString().split('T')[0];

  if (showCreateModal) {
    if (activeBuilderQuestion) {
      return (
        <Layout role="teacher" title={activeBuilderIndex !== null ? 'Edit Question Details' : 'Add Question Details'} subtitle="Specify question details below">
          <div className="max-w-4xl mx-auto space-y-6 select-none animate-fadeIn">
            {/* Back button */}
            <button
              type="button"
              onClick={() => {
                setActiveBuilderQuestion(null);
                setActiveBuilderIndex(null);
              }}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 mb-4 cursor-pointer transition-colors"
            >
              <ArrowLeft size={14} /> Cancel and Back to Quiz Workspace
            </button>

            {/* Question Card Form */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 shadow-sm space-y-6">
              
              {/* Question Type selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-200">
                  Question Type
                </label>
                <select
                  value={activeBuilderQuestion.questionType || 'MCQ'}
                  onChange={(e) => {
                    const type = e.target.value;
                    let correct = activeBuilderQuestion.correctAnswer;
                    if (type === 'TRUE_FALSE') correct = 'A';
                    if (type === 'MCQ') correct = 'A';
                    if (type === 'MSQ') correct = 'A';
                    setActiveBuilderQuestion({ 
                      ...activeBuilderQuestion, 
                      questionType: type,
                      correctAnswer: correct
                    });
                  }}
                  className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                >
                  <option value="MCQ">Multiple Choice (MCQ)</option>
                  <option value="MSQ">Multiple Select (MSQ)</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="SHORT_ANSWER">Short Answer / Fill in Blank</option>
                </select>
              </div>

              {/* Question Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-200">
                  Question Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={activeBuilderQuestion.questionText}
                  onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, questionText: e.target.value })}
                  placeholder="e.g. Which of the following is a prime number?"
                  className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none resize-none"
                />
              </div>

              {/* Render choices fields conditionally */}
              {(activeBuilderQuestion.questionType === 'MCQ' || activeBuilderQuestion.questionType === 'MSQ') && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-200">Option A <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={activeBuilderQuestion.optionA}
                        onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, optionA: e.target.value })}
                        className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-200">Option B <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={activeBuilderQuestion.optionB}
                        onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, optionB: e.target.value })}
                        className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-200">Option C <span className="text-red-550">*</span></label>
                      <input
                        type="text"
                        value={activeBuilderQuestion.optionC}
                        onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, optionC: e.target.value })}
                        className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-200">Option D <span className="text-red-550">*</span></label>
                      <input
                        type="text"
                        value={activeBuilderQuestion.optionD}
                        onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, optionD: e.target.value })}
                        className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeBuilderQuestion.questionType === 'TRUE_FALSE' && (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-brand-border dark:border-slate-800 text-xs text-brand-text-secondary select-none">
                  <div>
                    <span className="font-extrabold text-[#7A2676]">Option A:</span> True
                  </div>
                  <div>
                    <span className="font-extrabold text-[#7A2676]">Option B:</span> False
                  </div>
                </div>
              )}

              {/* Answers & Scoring Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Correct Answers */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-200">Correct Option(s)</label>
                  
                  {activeBuilderQuestion.questionType === 'MCQ' && (
                    <select
                      value={activeBuilderQuestion.correctAnswer}
                      onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, correctAnswer: e.target.value })}
                      className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  )}

                  {activeBuilderQuestion.questionType === 'MSQ' && (
                    <div className="flex flex-wrap gap-3 py-2 px-3 rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      {['A', 'B', 'C', 'D'].map((val) => {
                        const selectedList = String(activeBuilderQuestion.correctAnswer || '').split(',').map(s => s.trim()).filter(Boolean);
                        const isChecked = selectedList.includes(val);

                        return (
                          <label key={val} className="flex items-center gap-1.5 text-xs font-bold cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                let newList = [...selectedList];
                                if (isChecked) {
                                  newList = newList.filter(item => item !== val);
                                } else {
                                  newList.push(val);
                                }
                                newList.sort();
                                setActiveBuilderQuestion({ ...activeBuilderQuestion, correctAnswer: newList.join(',') });
                              }}
                              className="rounded border-slate-300 text-[#7A2676] focus:ring-[#7A2676] shrink-0"
                            />
                            <span>{val}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {activeBuilderQuestion.questionType === 'TRUE_FALSE' && (
                    <select
                      value={activeBuilderQuestion.correctAnswer}
                      onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, correctAnswer: e.target.value })}
                      className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                    >
                      <option value="A">True (Option A)</option>
                      <option value="B">False (Option B)</option>
                    </select>
                  )}

                  {activeBuilderQuestion.questionType === 'SHORT_ANSWER' && (
                    <input
                      type="text"
                      required
                      value={activeBuilderQuestion.correctAnswer}
                      onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, correctAnswer: e.target.value })}
                      placeholder="Enter correct text answer..."
                      className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                    />
                  )}
                </div>

                {/* Marks */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-205">Marks</label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={String(activeBuilderQuestion.marks)}
                    onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, marks: Number(e.target.value) })}
                    className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                  />
                </div>

                {/* Question Difficulty */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-205">Difficulty</label>
                  <select
                    value={activeBuilderQuestion.difficulty || 'Medium'}
                    onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, difficulty: e.target.value as any })}
                    className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

              </div>

              {/* Negative Marks & Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-200">Negative Marks (Optional)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.25}
                    value={String(activeBuilderQuestion.negativeMarks || 0)}
                    onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, negativeMarks: Number(e.target.value) })}
                    className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-200">Explanation (Optional)</label>
                  <input
                    type="text"
                    placeholder="Explain why correct answer is correct..."
                    value={activeBuilderQuestion.explanation || ''}
                    onChange={(e) => setActiveBuilderQuestion({ ...activeBuilderQuestion, explanation: e.target.value })}
                    className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-brand-border dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setActiveBuilderQuestion(null);
                    setActiveBuilderIndex(null);
                  }}
                  className="px-5 py-2 border border-brand-border dark:border-slate-800 hover:bg-slate-105 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!activeBuilderQuestion.questionText || !activeBuilderQuestion.questionText.trim()) {
                      toast.error('Question text is required.');
                      return;
                    }
                    const updated = [...questionsList];
                    if (activeBuilderIndex !== null) {
                      updated[activeBuilderIndex] = activeBuilderQuestion;
                    } else {
                      updated.push(activeBuilderQuestion);
                    }
                    setQuestionsList(updated);
                    setActiveBuilderQuestion({
                      questionType: 'MCQ',
                      questionText: '',
                      optionA: '',
                      optionB: '',
                      optionC: '',
                      optionD: '',
                      correctAnswer: 'A',
                      marks: 2,
                      difficulty: 'Medium',
                      explanation: '',
                      negativeMarks: 0
                    });
                    setActiveBuilderIndex(null);
                    toast.success('Question saved. Add another question below.');
                  }}
                  className="px-5 py-2 border border-brand-primary text-brand-primary hover:bg-brand-primary/5 rounded-full text-xs font-bold transition-all cursor-pointer"
                >
                  Save & Add Another
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!activeBuilderQuestion.questionText || !activeBuilderQuestion.questionText.trim()) {
                      toast.error('Question text is required.');
                      return;
                    }
                    const updated = [...questionsList];
                    if (activeBuilderIndex !== null) {
                      updated[activeBuilderIndex] = activeBuilderQuestion;
                    } else {
                      updated.push(activeBuilderQuestion);
                    }
                    setQuestionsList(updated);
                    setActiveBuilderQuestion(null);
                    setActiveBuilderIndex(null);
                    toast.success('Question saved to builder list.');
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-[#4A1F4F] to-[#7A2676] hover:from-[#5A2460] hover:to-[#8B2F86] text-white rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Save Question
                </button>
              </div>

            </div>
          </div>
        </Layout>
      );
    }

    const pageTitle = isEditMode ? 'Edit Quiz' : 'Create Quiz';
    return (
      <Layout role="teacher" title={pageTitle} subtitle="Fill in the details below">
        <div className="w-full pb-24 select-none animate-fadeIn">
          
          {/* Header breadcrumbs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-brand-border dark:border-slate-800 mb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-extrabold text-slate-400 select-none">
                <span>Dashboard</span>
                <ChevronRight size={10} />
                <span>Quiz</span>
                <ChevronRight size={10} />
                <span className="text-brand-primary">Create Quiz</span>
              </div>
              <h2 className="text-2xl font-black text-brand-text-primary dark:text-white flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-brand-primary shrink-0" />
                {isEditMode ? 'Edit Quiz Details' : 'Create New Quiz'}
              </h2>
              <p className="text-xs text-brand-text-secondary dark:text-slate-400">
                Create engaging quizzes for your students with manual or Excel-based question creation.
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0 select-none">
              <span className="text-[10px] font-bold text-slate-400">
                Last saved: Just now
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${
                questionsList.length === 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-955/40 dark:text-amber-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-955/40 dark:text-purple-300'
              }`}>
                {questionsList.length === 0 ? 'Draft' : 'In Progress'}
              </span>
            </div>
          </div>

          {/* 3-Section Layout Grid */}
          <form className="grid grid-cols-1 lg:grid-cols-10 gap-8" onSubmit={(e) => e.preventDefault()}>
            
            {/* Left Workspace Column (70% on desktop) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Quiz Information Card */}
              <Card className="rounded-[18px] shadow-sm bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 p-6 space-y-5">
                <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider border-b border-brand-border dark:border-slate-800 pb-2.5 flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-brand-primary" /> Quiz Details
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-205">Quiz Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Midterm Physics Evaluation"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-205">Subject</label>
                      <select
                        value={quizSubject}
                        onChange={(e) => setQuizSubject(e.target.value)}
                        className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                      >
                        {SUBJECTS.filter(s => s !== 'All').map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-205">Topic / Category</label>
                      <input
                        type="text"
                        placeholder="e.g. Gravitation"
                        value={quizTopic}
                        onChange={(e) => setQuizTopic(e.target.value)}
                        className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-205">Instructions</label>
                    <textarea
                      placeholder="Specific instructions for candidates..."
                      rows={3}
                      value={quizInstructions}
                      onChange={(e) => setQuizInstructions(e.target.value)}
                      className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-205">Description</label>
                    <textarea
                      placeholder="Enter short quiz description..."
                      rows={3}
                      value={quizDescription}
                      onChange={(e) => setQuizDescription(e.target.value)}
                      className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </Card>

              {/* Segmented Creator Tab Selectors */}
              <div className="flex justify-center select-none">
                <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-full border border-slate-200/50 dark:border-slate-800/60 w-full">
                  <button
                    type="button"
                    onClick={() => setActiveCreatorTab('manual')}
                    className={`flex-1 py-2.5 px-4 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeCreatorTab === 'manual'
                        ? 'bg-[#6C1D5F] text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                  >
                    <HelpCircle size={15} />
                    <span>Manual Question Builder</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCreatorTab('import')}
                    className={`flex-1 py-2.5 px-4 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeCreatorTab === 'import'
                        ? 'bg-[#6C1D5F] text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
                    }`}
                  >
                    <FileSpreadsheet size={15} />
                    <span>Excel Bulk Upload</span>
                  </button>
                </div>
              </div>

              {/* Manual Question Builder Workspace segment */}
              {activeCreatorTab === 'manual' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-brand-border dark:border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-brand-text-primary dark:text-slate-100">Question Workspace</h3>
                      <p className="text-[10px] text-brand-text-secondary dark:text-slate-400 mt-0.5">Build and reorder questions below</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBuilderQuestion({
                          questionType: 'MCQ',
                          questionText: '',
                          optionA: '',
                          optionB: '',
                          optionC: '',
                          optionD: '',
                          correctAnswer: 'A',
                          marks: 2,
                          difficulty: 'Medium',
                          explanation: '',
                          negativeMarks: 0
                        });
                        setActiveBuilderIndex(null);
                      }}
                      className="px-4 py-2 border border-brand-primary text-brand-primary hover:bg-brand-primary/5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus size={14} /> Add Question
                    </button>
                  </div>

                  {/* Collapsible Questions list */}
                  {questionsList.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-brand-border dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900/10">
                      <HelpCircle className="mx-auto mb-2 text-brand-text-secondary animate-bounce" size={28} />
                      <p className="text-xs font-bold text-brand-text-primary dark:text-slate-200">Quiz Workspace Empty</p>
                      <p className="text-[11px] text-brand-text-secondary mt-1">Start by clicking the "Add Question" button above or switch to Excel bulk uploads.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {questionsList.map((q, idx) => {
                        const errs = getQuestionErrors(q);
                        const isInvalid = errs.length > 0;
                        const isCurrentlyEditing = activeBuilderIndex === idx;
                        const isExpanded = !!expandedQuestions[idx];

                        return (
                          <div
                            key={idx}
                            className={`rounded-2xl border shadow-sm transition-all overflow-hidden ${
                              isInvalid
                                ? 'bg-rose-50/10 border-rose-200 dark:border-rose-900/30'
                                : isCurrentlyEditing
                                ? 'bg-purple-500/5 border-brand-primary'
                                : 'bg-white dark:bg-slate-900 border-brand-border dark:border-slate-800'
                            }`}
                          >
                            {/* Collapsible Header */}
                            <div 
                              onClick={() => setExpandedQuestions(p => ({ ...p, [idx]: !p[idx] }))}
                              className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-55 dark:hover:bg-slate-850 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-black flex items-center justify-center shrink-0 text-slate-700 dark:text-slate-300">
                                  {idx + 1}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                    q.questionType === 'MCQ'
                                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                                      : q.questionType === 'MSQ'
                                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                                      : q.questionType === 'TRUE_FALSE'
                                      ? 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300'
                                      : 'bg-amber-105 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                  }`}>
                                    {q.questionType}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                    q.difficulty === 'Easy'
                                      ? 'bg-emerald-105 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-350'
                                      : q.difficulty === 'Hard'
                                      ? 'bg-red-105 text-red-700 dark:bg-red-950/40 dark:text-red-350'
                                      : 'bg-amber-105 text-amber-700 dark:bg-amber-950/40 dark:text-amber-350'
                                  }`}>
                                    {q.difficulty}
                                  </span>
                                  <span className="text-[10px] font-extrabold text-[#2563EB]">
                                    {q.marks} pts
                                  </span>
                                </div>
                                <h4 className="text-xs font-bold text-brand-text-primary dark:text-slate-205 truncate max-w-sm sm:max-w-md md:max-w-lg">
                                  {q.questionText}
                                </h4>
                              </div>

                              <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                                {/* Move buttons */}
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => moveQuestion(idx, 'up')}
                                  className="p-1 text-slate-400 hover:text-brand-primary dark:hover:text-purple-300 disabled:opacity-30 rounded transition-colors cursor-pointer"
                                >
                                  <ArrowUp size={14} />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === questionsList.length - 1}
                                  onClick={() => moveQuestion(idx, 'down')}
                                  className="p-1 text-slate-400 hover:text-brand-primary dark:hover:text-purple-300 disabled:opacity-30 rounded transition-colors cursor-pointer"
                                >
                                  <ArrowDown size={14} />
                                </button>

                                {/* Duplicate */}
                                <button
                                  type="button"
                                  onClick={() => duplicateQuestion(idx)}
                                  className="p-1.5 text-slate-400 hover:text-brand-primary dark:hover:text-purple-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Duplicate"
                                >
                                  <Copy size={13} />
                                </button>

                                {/* Edit */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveBuilderQuestion({ ...q });
                                    setActiveBuilderIndex(idx);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-105 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit size={13} />
                                </button>

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={() => deleteQuestion(idx)}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 size={13} />
                                </button>

                                <span className="p-1 text-slate-400">
                                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </span>
                              </div>
                            </div>

                            {/* Card Body content */}
                            {isExpanded && (
                              <div className="p-5 border-t border-brand-border dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 space-y-4 text-xs">
                                <p className="font-semibold text-brand-text-primary dark:text-slate-200">
                                  {q.questionText}
                                </p>

                                {(q.questionType === 'MCQ' || q.questionType === 'MSQ') && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2">
                                    {['A', 'B', 'C', 'D'].map((optKey) => {
                                      const val = q[`option${optKey}`];
                                      const isCorrect = q.questionType === 'MSQ'
                                        ? String(q.correctAnswer).split(',').map((p: string) => p.trim()).includes(optKey)
                                        : q.correctAnswer === optKey;

                                      return (
                                        <div 
                                          key={optKey} 
                                          className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all ${
                                            isCorrect
                                              ? 'bg-emerald-500/5 border-emerald-500/30 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                              : 'bg-white dark:bg-slate-900 border-brand-border dark:border-slate-800 text-brand-text-secondary'
                                          }`}
                                        >
                                          <input
                                            type={q.questionType === 'MCQ' ? 'radio' : 'checkbox'}
                                            disabled
                                            checked={isCorrect}
                                            className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                          />
                                          <span className="leading-relaxed"><strong className="mr-1">{optKey}:</strong> {val}</span>
                                          {isCorrect && (
                                            <span className="ml-auto px-2 py-0.5 rounded bg-emerald-500/20 text-[8px] font-extrabold uppercase tracking-wide">
                                              Correct
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {q.questionType === 'TRUE_FALSE' && (
                                  <div className="grid grid-cols-2 gap-3 pl-2">
                                    {['A', 'B'].map((optKey) => {
                                      const isCorrect = q.correctAnswer === optKey;
                                      const label = optKey === 'A' ? 'True' : 'False';

                                      return (
                                        <div 
                                          key={optKey} 
                                          className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all ${
                                            isCorrect
                                              ? 'bg-emerald-500/5 border-emerald-500/30 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                              : 'bg-white dark:bg-slate-900 border-brand-border dark:border-slate-800 text-brand-text-secondary'
                                          }`}
                                        >
                                          <input
                                            type="radio"
                                            disabled
                                            checked={isCorrect}
                                            className="mt-0.5 rounded-full border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                          />
                                          <span className="font-bold leading-none">{label}</span>
                                          {isCorrect && (
                                            <span className="ml-auto px-2 py-0.5 rounded bg-emerald-500/20 text-[8px] font-extrabold uppercase tracking-wide">
                                              Correct
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {q.questionType === 'SHORT_ANSWER' && (
                                  <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 pl-4">
                                    <span className="font-extrabold text-[10px] uppercase bg-emerald-500/20 px-2 py-0.5 rounded">Correct Answer</span>
                                    <span className="font-bold">{q.correctAnswer}</span>
                                  </div>
                                )}

                                {(q.explanation || q.negativeMarks > 0) && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-brand-border dark:border-slate-800/80">
                                    {q.negativeMarks > 0 && (
                                      <p className="text-[10px] text-rose-500 font-extrabold flex items-center gap-1">
                                        <AlertTriangle size={12} /> Negative Marks: -{q.negativeMarks} pts
                                      </p>
                                    )}
                                    {q.explanation && (
                                      <p className="text-[11px] text-brand-text-secondary leading-relaxed italic">
                                        <strong>Explanation:</strong> {q.explanation}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                /* Excel Bulk Upload segment */
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-2 border-b border-brand-border dark:border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-brand-text-primary dark:text-slate-100">Excel Bulk Import</h3>
                      <p className="text-[10px] text-brand-text-secondary dark:text-slate-400 mt-0.5">Import quiz questions via Excel sheet templates</p>
                    </div>
                    <button
                      type="button"
                      onClick={downloadExcelTemplate}
                      className="px-4 py-2 border border-brand-border dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 select-none"
                    >
                      <Download size={13} /> Template Sheet
                    </button>
                  </div>

                  <div
                    className={`p-10 text-center border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                      isExcelDragging 
                        ? 'bg-purple-500/5 border-brand-primary' 
                        : 'border-brand-border dark:border-slate-800 hover:border-brand-primary bg-slate-50/50 dark:bg-slate-900/30'
                    } ${isExcelUploading ? 'opacity-50 pointer-events-none' : ''}`}
                    onDragOver={(e) => { if (!isExcelUploading) { e.preventDefault(); setIsExcelDragging(true); } }}
                    onDragLeave={() => setIsExcelDragging(false)}
                    onDrop={onExcelDrop}
                    onClick={() => { if (!isExcelUploading) excelRef.current?.click(); }}
                  >
                    <Upload size={32} className="mx-auto mb-2 text-[#7A2676] dark:text-purple-400 shrink-0" />
                    <p className="text-xs font-extrabold text-brand-text-primary dark:text-slate-200">
                      {isExcelUploading ? 'Uploading & Parsing questions...' : 'Drag & Drop Excel Spreadsheet here'}
                    </p>
                    <p className="text-[10px] text-brand-text-secondary dark:text-slate-400 mt-1">
                      or click to browse local files (.xlsx, .xls) · Max 10MB
                    </p>
                    
                    <input
                      ref={excelRef}
                      type="file"
                      className="hidden"
                      accept=".xlsx,.xls"
                      onChange={(e) => { if (e.target.files?.[0]) handleExcelFile(e.target.files[0]); }}
                      disabled={isExcelUploading}
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-[10px] text-brand-text-secondary space-y-1.5 leading-normal">
                    <p className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertTriangle size={12} /> Excel Sheet Structure Guidelines
                    </p>
                    <p>1. Row 1: Headers (Question, Option A, Option B, Option C, Option D, Correct Answer, Marks, Difficulty).</p>
                    <p>2. Correct Answer values: A, B, C, or D.</p>
                    <p>3. Blank Option C/D fields are resolved as True/False statements.</p>
                  </div>

                  {/* Excel import preview list */}
                  {questionsList.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-brand-text-primary dark:text-slate-205 border-b border-brand-border dark:border-slate-800 pb-2 mt-4">
                        Imported Questions Preview ({questionsList.length})
                      </h4>
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {questionsList.map((q, idx) => (
                          <div key={idx} className="p-3 bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 rounded-xl flex items-start gap-2.5 shadow-sm text-xs">
                            <span className="w-5.5 h-5.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center shrink-0 text-slate-705 dark:text-slate-300">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-bold text-brand-text-primary dark:text-slate-200">{q.questionText}</p>
                              <p className="text-[10px] text-brand-text-secondary dark:text-slate-400 mt-1">
                                Type: {q.questionType} • Marks: {q.marks} • Correct answer: <span className="text-emerald-600 font-extrabold">{q.correctAnswer}</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Settings Column (30% on desktop) */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Sticky Settings Container */}
              <div className="lg:sticky lg:top-6 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto pr-1">
                
                {/* Quiz Settings Panel */}
                <Card className="rounded-[18px] shadow-sm bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider border-b border-brand-border dark:border-slate-800 pb-2.5 flex items-center gap-2 select-none">
                    <Settings className="h-4.5 w-4.5 text-brand-primary" /> Quiz Settings
                  </h3>
                  
                  <div className="space-y-3.5">
                    
                    {/* Due Date */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-200">Due Date <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input
                          type="date"
                          min={todayDate}
                          required
                          value={quizDueDate}
                          onChange={(e) => setQuizDueDate(e.target.value)}
                          className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Time Limit */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-205">Time Limit (Mins)</label>
                      <div className="relative">
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                        <input
                          type="number"
                          min={5}
                          value={String(quizTimeLimit)}
                          onChange={(e) => setQuizTimeLimit(Number(e.target.value))}
                          className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 py-2 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Attempts Allowed */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-205">Attempts Allowed</label>
                      <input
                        type="number"
                        min={1}
                        value={String(quizAttempts)}
                        onChange={(e) => setQuizAttempts(Number(e.target.value))}
                        className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                      />
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-205">Difficulty Level</label>
                      <select
                        value={quizDifficulty}
                        onChange={(e) => setQuizDifficulty(e.target.value as any)}
                        className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-4 py-2.5 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    {/* Premium Toggles */}
                    <div className="pt-2 space-y-3 border-t border-brand-border dark:border-slate-800">
                      <label className="flex items-center justify-between text-xs font-bold text-brand-text-primary dark:text-slate-200 cursor-pointer select-none">
                        <span>Shuffle Questions</span>
                        <input
                          type="checkbox"
                          checked={shuffleQuestions}
                          onChange={(e) => setShuffleQuestions(e.target.checked)}
                          className="rounded text-[#7A2676] focus:ring-[#7A2676] w-4.5 h-4.5 cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between text-xs font-bold text-brand-text-primary dark:text-slate-200 cursor-pointer select-none">
                        <span>Randomize Options</span>
                        <input
                          type="checkbox"
                          checked={randomizeOptions}
                          onChange={(e) => setRandomizeOptions(e.target.checked)}
                          className="rounded text-[#7A2676] focus:ring-[#7A2676] w-4.5 h-4.5 cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between text-xs font-bold text-brand-text-primary dark:text-slate-200 cursor-pointer select-none">
                        <span>Show Results to Students</span>
                        <input
                          type="checkbox"
                          checked={showResults}
                          onChange={(e) => setShowResults(e.target.checked)}
                          className="rounded text-[#7A2676] focus:ring-[#7A2676] w-4.5 h-4.5 cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between text-xs font-bold text-brand-text-primary dark:text-slate-200 cursor-pointer select-none">
                        <span>Auto Publish</span>
                        <input
                          type="checkbox"
                          checked={autoPublish}
                          onChange={(e) => setAutoPublish(e.target.checked)}
                          className="rounded text-[#7A2676] focus:ring-[#7A2676] w-4.5 h-4.5 cursor-pointer"
                        />
                      </label>
                    </div>

                  </div>
                </Card>

                {/* Score & Eligibility Card */}
                <Card className="rounded-[18px] shadow-sm bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider border-b border-brand-border dark:border-slate-800 pb-2.5 flex items-center gap-2 select-none">
                    <Award className="h-4.5 w-4.5 text-brand-primary" /> Score & Eligibility
                  </h3>

                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-200">Passing Marks (%)</label>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={String(passingPercentage)}
                        onChange={(e) => setPassingPercentage(Number(e.target.value))}
                        className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-4 py-2 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-brand-text-primary dark:text-slate-200">Cert Eligibility Marks (%)</label>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={String(quizCertEligibilityMarks)}
                        onChange={(e) => setQuizCertEligibilityMarks(Number(e.target.value))}
                        className="w-full rounded-xl border border-brand-border dark:border-slate-800 bg-slate-50 dark:bg-slate-955 px-4 py-2 text-xs font-semibold text-brand-text-primary dark:text-white focus:border-brand-primary focus:outline-none"
                      />
                      <p className="text-[9px] text-brand-text-secondary dark:text-slate-400 leading-normal pt-1 italic">
                        Marks required to become eligible for course certificate.
                      </p>
                    </div>

                    {/* Scoring Summary Banner */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-brand-border space-y-2.5 text-xs select-none">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px]">Questions:</span>
                        <span className="font-black text-slate-850 dark:text-slate-100">{questionsList.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px]">Total Marks:</span>
                        <span className="font-black text-[#2563EB]">{questionsList.reduce((sum, q) => sum + Number(q.marks || 0), 0)} pts</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-brand-border pt-2 mt-1">
                        <span className="font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px]">Passing Mark:</span>
                        <span className="font-black text-emerald-600">
                          {Math.round(questionsList.reduce((sum, q) => sum + Number(q.marks || 0), 0) * (passingPercentage / 100))} pts ({passingPercentage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Target Batches Card */}
                <Card className="rounded-[18px] shadow-sm bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 p-5 space-y-4">
                  <h3 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider border-b border-brand-border dark:border-slate-800 pb-2.5 flex items-center gap-2 select-none">
                    <Users className="h-4.5 w-4.5 text-brand-primary" /> Target Batches
                  </h3>

                  <div className="space-y-2">
                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border border-brand-border p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 shadow-inner">
                      {batches.length === 0 ? (
                        <p className="text-xs text-brand-text-secondary italic col-span-full">No batches available.</p>
                      ) : (
                        batches.map((b) => {
                          const isChecked = quizBatchIds.includes(String(b.id));
                          return (
                            <label key={b.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100/50 dark:hover:bg-slate-850 cursor-pointer text-xs text-brand-text-primary transition-all select-none">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  if (isChecked) {
                                    setQuizBatchIds(quizBatchIds.filter((id: string) => id !== String(b.id)));
                                  } else {
                                    setQuizBatchIds([...quizBatchIds, String(b.id)]);
                                  }
                                }}
                                className="rounded border-slate-350 dark:border-slate-700 text-[#7A2676] focus:ring-[#7A2676] w-4.5 h-4.5 cursor-pointer"
                              />
                              <span className="font-semibold text-slate-750 dark:text-slate-200">{b.batchName}</span>
                            </label>
                          );
                        })
                      )}
                    </div>
                    <p className="text-[9px] text-brand-text-secondary italic leading-relaxed pt-1">
                      Leave batches unchecked to save as draft. Select at least one batch to publish the quiz.
                    </p>
                  </div>
                </Card>

              </div>

            </div>

            {/* Sticky Bottom Action Buttons Footer bar */}
            <div className="fixed bottom-0 left-0 right-0 lg:pl-64 bg-white dark:bg-[#0B0F19]/95 border-t border-brand-border dark:border-slate-800 py-4 px-6 md:px-8 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-40 flex items-center justify-between backdrop-blur-sm select-none">
              <button
                type="button"
                onClick={handleCloseCreateModal}
                disabled={submittingQuiz}
                className="px-5 py-2 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-full text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={hasAnyValidationErrors() || submittingQuiz}
                  onClick={() => onSubmitQuiz('draft')}
                  className="px-5 py-2 border border-brand-border dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  disabled={questionsList.length === 0 || hasAnyValidationErrors() || submittingQuiz}
                  onClick={() => onSubmitQuiz('published')}
                  className="px-6 py-2 bg-gradient-to-r from-[#4A1F4F] to-[#7A2676] hover:from-[#5A2460] hover:to-[#8B2F86] text-white rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingQuiz ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Publish Quiz')}
                </button>
              </div>
            </div>

          </form>
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="teacher" title="Quizzes" subtitle="Manage online quizzes and analyze results">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search quizzes..."
            className="w-full search-bar-modern"
          />
        </div>

        <div className="flex gap-2 shrink-0 flex-wrap">
          <select
            value={subjectFilter}
            onChange={(e) => { setSubjectFilter(e.target.value); setPage(1); }}
            className="pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl text-[var(--text-primary)] cursor-pointer appearance-none"
          >
            {SUBJECTS.map((s) => <option key={s} value={s === 'All' ? '' : s}>{s}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-xl text-[var(--text-primary)] cursor-pointer appearance-none"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>

          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={handleOpenCreateModal}
          >
            New Quiz
          </Button>
        </div>
      </div>

      {/* Main Quizzes Table */}
      <div className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--brand-border)]">
                {['Quiz Title', 'Subject', 'Due Date', 'Students', 'Submitted', 'Pending', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-border)]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={8} />)
              ) : quizzes.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon="help-circle"
                      title="No quizzes found"
                      description="Create an online quiz or upload a questions Excel file to get started."
                      action={{ label: 'Create Quiz', onClick: handleOpenCreateModal }}
                    />
                  </td>
                </tr>
              ) : (
                quizzes.map((a) => (
                  <tr key={a.id} className="table-row-hover">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <HelpCircle size={13} className="text-[#2563EB] dark:text-blue-400" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-[var(--text-primary)] max-w-[180px] truncate">{a.title}</span>
                          <span className="self-start text-[9px] uppercase font-black text-[#2563EB] dark:text-blue-400 bg-emerald-50 dark:bg-emerald-950/20 px-1 rounded mt-0.5">Quiz</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-[var(--text-secondary)] bg-slate-100 dark:bg-slate-700 rounded-full px-2 py-0.5">{a.subject}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-[var(--text-primary)]">{formatDate(a.dueDate)}</p>
                      <p className={`text-[10px] font-medium mt-0.5 ${getDueDateColor(a.dueDate)}`}>
                        {getDueDateCountdown(a.dueDate)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[var(--text-secondary)]">{a.totalStudents ?? '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-[var(--text-secondary)]">{a.submittedCount ?? 0}</td>
                    <td className="px-4 py-3.5 text-sm text-[var(--text-secondary)]">{a.pendingCount ?? '—'}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={a.status as any} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <Link
                          to={`/teacher/submitted?tab=quizzes&assignment=${a.id}`}
                          title="View Results"
                          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-blue-50 hover:text-[#2563EB] dark:hover:bg-blue-500/10 transition-colors"
                        >
                          <Eye size={15} />
                        </Link>
                        {a.status === 'draft' && (
                          <button
                            onClick={() => {
                              setAssignModalQuiz(a);
                              setSelectedBatchIds([]);
                            }}
                            title="Assign Batch"
                            className="p-1.5 rounded-lg text-[var(--brand-primary)] text-purple-600 hover:bg-[#F5EAF8] dark:hover:bg-[#F5EAF8]0/10 transition-colors cursor-pointer"
                          >
                            <Plus size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(a)}
                          title="Edit Quiz"
                          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-500/10 transition-colors cursor-pointer"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => setDeleteModal(a)}
                          className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[#F5EAF8] hover:text-red-500 dark:hover:bg-[#F5EAF8]0/10 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && quizzes.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-[var(--brand-border)] px-4 py-3 gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)]">Items per page:</span>
              <select
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
                }}
                className="pl-2 pr-6 py-1 text-xs bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-lg text-[var(--text-primary)] cursor-pointer"
              >
                {[10, 20, 50, 100].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <Pagination
                page={page + 1}
                totalPages={totalPages}
                total={totalElements}
                limit={size}
                onPageChange={(p) => setPage(p - 1)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Delete Quiz Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Quiz"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(null)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F5EAF8] dark:bg-[#F5EAF8]0/10 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm text-[var(--text-primary)] font-medium">
              Are you sure you want to delete <strong>"{deleteModal?.title}"</strong>?
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5">
              This will remove the quiz and delete all submitted student attempts. This action is irreversible.
            </p>
          </div>
        </div>
      </Modal>

      {/* Assign Batch Modal */}
      <Modal
        isOpen={!!assignModalQuiz}
        onClose={() => setAssignModalQuiz(null)}
        title="Assign Quiz to Batches"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAssignModalQuiz(null)}>Cancel</Button>
            <Button variant="primary" loading={assigning} onClick={handleAssignBatch}>Assign</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Select one or more batches to assign the quiz <strong>"{assignModalQuiz?.title}"</strong>.
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto border border-[var(--brand-border)] p-3 rounded-xl">
            {(batches || []).map((b) => {
              const isChecked = selectedBatchIds.includes(String(b.id));
              return (
                <label key={b.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer text-sm text-[var(--text-primary)]">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {
                      if (isChecked) {
                        setSelectedBatchIds(selectedBatchIds.filter(id => id !== String(b.id)));
                      } else {
                        setSelectedBatchIds([...selectedBatchIds, String(b.id)]);
                      }
                    }}
                    className="rounded border-[var(--brand-border)] text-[#6C1D5F] focus:ring-[#6C1D5F]"
                  />
                  <span>{b.batchName}</span>
                </label>
              );
            })}
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
