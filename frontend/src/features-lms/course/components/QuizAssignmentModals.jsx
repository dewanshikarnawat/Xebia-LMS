'use client';

import { useState } from 'react';
import {
  X, Plus, Trash2, Copy, Eye, Save, HelpCircle, CheckCircle, Clock, Award,
  Sparkles, Layers, FileText, UploadCloud, Link as LinkIcon, AlertCircle,
  Check, ChevronDown, ChevronRight, GripVertical, Settings, ShieldCheck,
  FileSpreadsheet, FileArchive, Image as ImageIcon, Video, RotateCcw, Monitor,
  Tablet, Smartphone, ArrowRight, BookOpen, List, Percent
} from 'lucide-react';

const QUESTION_TYPES = [
  { id: 'mcq_single', label: 'Multiple Choice (Single Answer)', desc: 'One correct option among choices' },
  { id: 'mcq_multiple', label: 'Multiple Choice (Multiple Answers)', desc: 'Multiple correct checkboxes' },
  { id: 'true_false', label: 'True / False', desc: 'Binary true or false statement' },
  { id: 'short_answer', label: 'Short Answer', desc: 'Brief text phrase entry' },
  { id: 'long_answer', label: 'Long Answer / Essay', desc: 'Multi-paragraph response' },
  { id: 'fill_blank', label: 'Fill in the Blank', desc: 'Missing keyword completion' },
  { id: 'matching', label: 'Matching Pairs', desc: 'Match items from column A to B' },
  { id: 'drag_drop', label: 'Drag and Drop', desc: 'Interactive tile placement' },
  { id: 'ordering', label: 'Ordering / Sequence', desc: 'Arrange items in correct order' },
  { id: 'image_question', label: 'Image-Based Question', desc: 'Visual diagram or photo query' },
  { id: 'case_study', label: 'Case Study Question', desc: 'Scenario with multi-part questions' }
];

export function QuizBuilderModal({ initialData, onClose, onSave, showToast }) {
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'settings' | 'questions' | 'preview'
  const [previewDevice, setPreviewDevice] = useState('desktop');

  const [quizForm, setQuizForm] = useState({
    title: initialData?.title || 'Module 1 Knowledge Assessment',
    description: initialData?.description || 'Test your knowledge on course architecture and core concepts.',
    instructions: initialData?.instructions || 'Answer all questions carefully. Time limit applies once started.',
    category: initialData?.category || 'General',
    difficulty: initialData?.difficulty || 'Intermediate',
    tags: initialData?.tags || 'Quiz, Assessment',
    estimatedTime: initialData?.estimatedTime || '20 mins',
    passingPercentage: initialData?.passingPercentage || 70,
    status: initialData?.status || 'published',

    // Quiz Settings
    timeLimit: initialData?.timeLimit || 20,
    startDateTime: initialData?.startDateTime || '',
    endDateTime: initialData?.endDateTime || '',
    allowMultipleAttempts: initialData?.allowMultipleAttempts ?? true,
    maxAttempts: initialData?.maxAttempts || 3,
    randomizeQuestions: initialData?.randomizeQuestions ?? true,
    randomizeOptions: initialData?.randomizeOptions ?? true,
    showCorrectAnswers: initialData?.showCorrectAnswers ?? true,
    showScoreImmediately: initialData?.showScoreImmediately ?? true,
    showDetailedFeedback: initialData?.showDetailedFeedback ?? true,
    negativeMarking: initialData?.negativeMarking ?? false,
    negativeDeduction: initialData?.negativeDeduction || 0.25,
    allowReview: initialData?.allowReview ?? true,
    requirePassingScore: initialData?.requirePassingScore ?? true,
    autoSave: initialData?.autoSave ?? true,
    shuffleSections: initialData?.shuffleSections ?? false,

    // Questions List
    questions: initialData?.questions || [
      {
        id: 'q1',
        title: 'Which of the following best describes microservices architecture?',
        description: 'Select the single most accurate definition.',
        type: 'mcq_single',
        marks: 5,
        difficulty: 'Intermediate',
        explanation: 'Microservices divide applications into small, independent, loosely coupled services.',
        hint: 'Think about service autonomy and loose coupling.',
        isRequired: true,
        options: [
          { text: 'A monolithic codebase deployed as a single unit', isCorrect: false },
          { text: 'Independent, loosely-coupled services communicating via APIs', isCorrect: true },
          { text: 'A database-only stored procedure model', isCorrect: false },
          { text: 'Client-side rendering without backend APIs', isCorrect: false }
        ]
      }
    ]
  });

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const currentQ = quizForm.questions[activeQuestionIndex] || quizForm.questions[0];

  const totalMarks = quizForm.questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  const updateQuestion = (index, key, val) => {
    setQuizForm(prev => {
      const copy = [...prev.questions];
      copy[index] = { ...copy[index], [key]: val };
      return { ...prev, questions: copy };
    });
  };

  const addOption = (qIdx) => {
    setQuizForm(prev => {
      const copy = [...prev.questions];
      const opts = [...(copy[qIdx].options || [])];
      opts.push({ text: `Option ${opts.length + 1}`, isCorrect: false });
      copy[qIdx].options = opts;
      return { ...prev, questions: copy };
    });
  };

  const updateOption = (qIdx, oIdx, key, val) => {
    setQuizForm(prev => {
      const copy = [...prev.questions];
      const opts = [...(copy[qIdx].options || [])];
      if (key === 'isCorrect' && copy[qIdx].type === 'mcq_single') {
        opts.forEach((o, i) => { o.isCorrect = i === oIdx; });
      } else {
        opts[oIdx] = { ...opts[oIdx], [key]: val };
      }
      copy[qIdx].options = opts;
      return { ...prev, questions: copy };
    });
  };

  const deleteOption = (qIdx, oIdx) => {
    setQuizForm(prev => {
      const copy = [...prev.questions];
      copy[qIdx].options = (copy[qIdx].options || []).filter((_, i) => i !== oIdx);
      return { ...prev, questions: copy };
    });
  };

  const addQuestion = (type = 'mcq_single') => {
    const newQ = {
      id: `q_${Date.now()}`,
      title: 'New Question Title',
      description: '',
      type,
      marks: 5,
      difficulty: 'Intermediate',
      explanation: '',
      hint: '',
      isRequired: true,
      options: [
        { text: 'Option 1', isCorrect: true },
        { text: 'Option 2', isCorrect: false }
      ]
    };
    setQuizForm(prev => ({ ...prev, questions: [...prev.questions, newQ] }));
    setActiveQuestionIndex(quizForm.questions.length);
    showToast('Question added');
  };

  const duplicateQuestion = (index) => {
    const target = quizForm.questions[index];
    const copyQ = { ...target, id: `q_${Date.now()}`, title: `${target.title} (Copy)` };
    setQuizForm(prev => {
      const updated = [...prev.questions];
      updated.splice(index + 1, 0, copyQ);
      return { ...prev, questions: updated };
    });
    setActiveQuestionIndex(index + 1);
    showToast('Question duplicated');
  };

  const deleteQuestion = (index) => {
    if (quizForm.questions.length <= 1) {
      showToast('At least one question is required', 'error');
      return;
    }
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
    setActiveQuestionIndex(Math.max(0, index - 1));
    showToast('Question removed');
  };

  const handleSave = () => {
    if (!quizForm.title.trim()) {
      showToast('Quiz title is required', 'error');
      return;
    }
    onSave({
      title: quizForm.title,
      type: 'quiz',
      quizData: quizForm,
      fileSize: 0,
      fileUrl: '',
      duration: `${quizForm.timeLimit} mins`
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-[24px] max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#334155] bg-slate-50/50 dark:bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 font-black">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-[#F8FAFC]">Enterprise Quiz Authoring Studio</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
                Total Questions: <strong className="text-purple-600">{quizForm.questions.length}</strong> | Total Marks: <strong className="text-purple-600">{totalMarks} pts</strong>
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-6">
          {[
            { id: 'info', label: '1. Basic Information', icon: BookOpen },
            { id: 'settings', label: '2. Quiz Settings', icon: Settings },
            { id: 'questions', label: `3. Questions (${quizForm.questions.length})`, icon: List },
            { id: 'preview', label: '4. Preview', icon: Eye }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 border-b-2 text-xs font-extrabold transition-all cursor-pointer ${activeTab === tab.id ? 'border-[#7C3AED] text-[#7C3AED]' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Quiz Title *</label>
                  <input
                    type="text"
                    value={quizForm.title}
                    onChange={e => setQuizForm(prev => ({ ...prev, title: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] px-3.5 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={quizForm.description}
                    onChange={e => setQuizForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-3.5 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] outline-none focus:border-[#7C3AED]"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Instructions for Learners</label>
                  <textarea
                    rows={2}
                    value={quizForm.instructions}
                    onChange={e => setQuizForm(prev => ({ ...prev, instructions: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-3.5 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Difficulty Level</label>
                  <select
                    value={quizForm.difficulty}
                    onChange={e => setQuizForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] px-3 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Passing Percentage (%)</label>
                  <input
                    type="number"
                    value={quizForm.passingPercentage}
                    onChange={e => setQuizForm(prev => ({ ...prev, passingPercentage: Number(e.target.value) }))}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] px-3.5 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    value={quizForm.estimatedTime}
                    onChange={e => setQuizForm(prev => ({ ...prev, estimatedTime: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] px-3.5 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Quiz Status</label>
                  <select
                    value={quizForm.status}
                    onChange={e => setQuizForm(prev => ({ ...prev, status: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] px-3 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUIZ SETTINGS */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-[20px] border border-slate-200 dark:border-[#334155] bg-slate-50/50 dark:bg-[#111827]/50 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-purple-600">Time &amp; Attempts Controls</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Time Limit (Minutes)</label>
                  <input
                    type="number"
                    value={quizForm.timeLimit}
                    onChange={e => setQuizForm(prev => ({ ...prev, timeLimit: Number(e.target.value) }))}
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-[#CBD5E1]">Allow Multiple Attempts</span>
                  <input
                    type="checkbox"
                    checked={quizForm.allowMultipleAttempts}
                    onChange={e => setQuizForm(prev => ({ ...prev, allowMultipleAttempts: e.target.checked }))}
                    className="h-4 w-4 rounded text-purple-600 accent-purple-600 cursor-pointer"
                  />
                </div>

                {quizForm.allowMultipleAttempts && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Maximum Attempts</label>
                    <input
                      type="number"
                      value={quizForm.maxAttempts}
                      onChange={e => setQuizForm(prev => ({ ...prev, maxAttempts: Number(e.target.value) }))}
                      className="h-10 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="p-5 rounded-[20px] border border-slate-200 dark:border-[#334155] bg-slate-50/50 dark:bg-[#111827]/50 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-purple-600">Scoring &amp; Randomization</h3>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-[#CBD5E1]">Randomize Questions</span>
                  <input
                    type="checkbox"
                    checked={quizForm.randomizeQuestions}
                    onChange={e => setQuizForm(prev => ({ ...prev, randomizeQuestions: e.target.checked }))}
                    className="h-4 w-4 rounded text-purple-600 accent-purple-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-[#CBD5E1]">Randomize Answer Options</span>
                  <input
                    type="checkbox"
                    checked={quizForm.randomizeOptions}
                    onChange={e => setQuizForm(prev => ({ ...prev, randomizeOptions: e.target.checked }))}
                    className="h-4 w-4 rounded text-purple-600 accent-purple-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-[#CBD5E1]">Show Score Immediately</span>
                  <input
                    type="checkbox"
                    checked={quizForm.showScoreImmediately}
                    onChange={e => setQuizForm(prev => ({ ...prev, showScoreImmediately: e.target.checked }))}
                    className="h-4 w-4 rounded text-purple-600 accent-purple-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-[#CBD5E1]">Negative Marking</span>
                  <input
                    type="checkbox"
                    checked={quizForm.negativeMarking}
                    onChange={e => setQuizForm(prev => ({ ...prev, negativeMarking: e.target.checked }))}
                    className="h-4 w-4 rounded text-purple-600 accent-purple-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QUESTION MANAGEMENT */}
          {activeTab === 'questions' && (
            <div className="flex gap-6">
              {/* Left Questions Selector */}
              <div className="w-1/3 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Questions List</h3>
                  <button
                    type="button"
                    onClick={() => addQuestion('mcq_single')}
                    className="px-3 py-1 rounded-xl bg-[#7C3AED] text-white text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-purple-700"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Question
                  </button>
                </div>

                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                  {quizForm.questions.map((q, qIdx) => {
                    const isSelected = activeQuestionIndex === qIdx;
                    return (
                      <div
                        key={q.id || qIdx}
                        onClick={() => setActiveQuestionIndex(qIdx)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${isSelected ? 'bg-purple-50 dark:bg-purple-950/40 border-[#7C3AED] text-purple-900 dark:text-purple-300 font-bold' : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1]'}`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-purple-200 dark:bg-purple-900 text-[10px] font-black">
                            {qIdx + 1}
                          </span>
                          <span className="text-xs truncate max-w-[150px]">{q.title || 'Untitled'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={(e) => { e.stopPropagation(); duplicateQuestion(qIdx); }} className="p-1 hover:text-purple-600">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); deleteQuestion(qIdx); }} className="p-1 hover:text-rose-500">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Active Question Form */}
              {currentQ && (
                <div className="w-2/3 p-5 rounded-[20px] border border-slate-200 dark:border-[#334155] bg-slate-50/50 dark:bg-[#111827]/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase text-purple-600">Edit Question #{activeQuestionIndex + 1}</h3>
                    <select
                      value={currentQ.type}
                      onChange={e => updateQuestion(activeQuestionIndex, 'type', e.target.value)}
                      className="h-9 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                    >
                      {QUESTION_TYPES.map(t => (
                        <option key={t.id} value={t.id}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Question Title *</label>
                    <input
                      type="text"
                      value={currentQ.title}
                      onChange={e => updateQuestion(activeQuestionIndex, 'title', e.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Marks</label>
                      <input
                        type="number"
                        value={currentQ.marks}
                        onChange={e => updateQuestion(activeQuestionIndex, 'marks', Number(e.target.value))}
                        className="h-10 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Hint</label>
                      <input
                        type="text"
                        value={currentQ.hint || ''}
                        onChange={e => updateQuestion(activeQuestionIndex, 'hint', e.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] outline-none"
                      />
                    </div>
                  </div>

                  {/* Options List */}
                  {['mcq_single', 'mcq_multiple'].includes(currentQ.type) && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 dark:text-[#CBD5E1]">Answer Options &amp; Correct Answer(s)</label>
                        <button type="button" onClick={() => addOption(activeQuestionIndex)} className="text-xs font-bold text-purple-600 hover:underline">
                          + Add Option
                        </button>
                      </div>

                      {currentQ.options?.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-3">
                          <input
                            type={currentQ.type === 'mcq_single' ? 'radio' : 'checkbox'}
                            checked={opt.isCorrect}
                            onChange={e => updateOption(activeQuestionIndex, oIdx, 'isCorrect', e.target.checked)}
                            className="h-4 w-4 accent-purple-600 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={opt.text}
                            onChange={e => updateOption(activeQuestionIndex, oIdx, 'text', e.target.value)}
                            className="h-9 flex-1 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] outline-none"
                          />
                          <button type="button" onClick={() => deleteOption(activeQuestionIndex, oIdx)} className="text-slate-400 hover:text-rose-500">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Explanation / Correct Answer Feedback</label>
                    <textarea
                      rows={2}
                      value={currentQ.explanation || ''}
                      onChange={e => updateQuestion(activeQuestionIndex, 'explanation', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-3 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PREVIEW */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-100 dark:bg-[#111827] p-2.5 rounded-xl">
                <span className="text-xs font-bold text-slate-600 dark:text-[#CBD5E1]">Device Preview Mode:</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setPreviewDevice('desktop')} className={`px-3 py-1 rounded-lg text-xs font-bold ${previewDevice === 'desktop' ? 'bg-[#7C3AED] text-white' : 'text-slate-500'}`}>Desktop</button>
                  <button type="button" onClick={() => setPreviewDevice('tablet')} className={`px-3 py-1 rounded-lg text-xs font-bold ${previewDevice === 'tablet' ? 'bg-[#7C3AED] text-white' : 'text-slate-500'}`}>Tablet</button>
                  <button type="button" onClick={() => setPreviewDevice('mobile')} className={`px-3 py-1 rounded-lg text-xs font-bold ${previewDevice === 'mobile' ? 'bg-[#7C3AED] text-white' : 'text-slate-500'}`}>Mobile</button>
                </div>
              </div>

              <div
                className="mx-auto bg-white dark:bg-[#0B1120] rounded-[24px] border border-slate-200 dark:border-slate-800 p-6 shadow-lg space-y-6"
                style={{ width: previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '600px' : '340px' }}
              >
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{quizForm.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{quizForm.description}</p>
                </div>

                <div className="space-y-4">
                  {quizForm.questions.map((q, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#1E293B]">
                      <div className="text-xs font-bold text-slate-800 dark:text-white mb-2">Q{idx + 1}. {q.title} ({q.marks} pts)</div>
                      <div className="space-y-1.5 pl-3">
                        {q.options?.map((o, oIdx) => (
                          <div key={oIdx} className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full border border-slate-400 inline-block" />
                            <span>{o.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-[#334155] bg-slate-50/50 dark:bg-[#111827] flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">Enterprise LMS Quiz Authoring</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer hover:opacity-90"
              style={{ backgroundColor: '#7C3AED' }}
            >
              Save &amp; Publish Quiz
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export function AssignmentBuilderModal({ initialData, onClose, onSave, showToast }) {
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'submission' | 'rubric' | 'attachments' | 'preview'

  const [assignmentForm, setAssignmentForm] = useState({
    title: initialData?.title || 'Capstone Hands-on Project Submission',
    description: initialData?.description || 'Build and deploy a full-stack microservice application.',
    instructions: initialData?.instructions || 'Upload your source code ZIP file or GitHub repository link with architectural documentation.',
    category: initialData?.category || 'General',
    difficulty: initialData?.difficulty || 'Advanced',
    tags: initialData?.tags || 'Assignment, Project',

    // Submission Settings
    assignmentType: initialData?.assignmentType || 'Individual',
    dueDate: initialData?.dueDate || '2026-12-31',
    dueTime: initialData?.dueTime || '23:59',
    totalMarks: initialData?.totalMarks || 100,
    passingMarks: initialData?.passingMarks || 70,
    estimatedDuration: initialData?.estimatedDuration || '4 hours',
    maxFileSizeMB: initialData?.maxFileSizeMB || 50,
    allowedFileTypes: initialData?.allowedFileTypes || ['PDF', 'DOCX', 'ZIP'],

    // Submission Options
    allowFileUpload: initialData?.allowFileUpload ?? true,
    allowTextSubmission: initialData?.allowTextSubmission ?? true,
    allowExternalLink: initialData?.allowExternalLink ?? true,
    allowMultipleFiles: initialData?.allowMultipleFiles ?? true,
    allowResubmission: initialData?.allowResubmission ?? true,
    maxSubmissionAttempts: initialData?.maxSubmissionAttempts || 3,
    allowLateSubmission: initialData?.allowLateSubmission ?? true,
    latePenaltyPercentage: initialData?.latePenaltyPercentage || 10,

    // Evaluation & Rubrics
    gradingType: initialData?.gradingType || 'Rubric-based Evaluation',
    rubricCriteria: initialData?.rubricCriteria || [
      { id: 'r1', title: 'Architecture & Design Pattern', description: 'Clean microservice pattern & code quality', maxPoints: 40 },
      { id: 'r2', title: 'Documentation & API Specs', description: 'Comprehensive OpenAPI specs & README guide', maxPoints: 30 },
      { id: 'r3', title: 'Unit Tests & Deployment Script', description: 'Docker setup & CI/CD pipeline automation', maxPoints: 30 }
    ],
    feedbackTemplate: initialData?.feedbackTemplate || 'Great work on the code structure! Consider optimizing API response times.',
    instructorNotes: initialData?.instructorNotes || 'Check Dockerfile for security best practices during grading.'
  });

  const addRubric = () => {
    setAssignmentForm(prev => ({
      ...prev,
      rubricCriteria: [
        ...prev.rubricCriteria,
        { id: `r_${Date.now()}`, title: 'New Criterion', description: 'Evaluation criteria details', maxPoints: 10 }
      ]
    }));
    showToast('Rubric criterion added');
  };

  const deleteRubric = (index) => {
    setAssignmentForm(prev => ({
      ...prev,
      rubricCriteria: prev.rubricCriteria.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (!assignmentForm.title.trim()) {
      showToast('Assignment title is required', 'error');
      return;
    }
    onSave({
      title: assignmentForm.title,
      type: 'assignment',
      assignmentData: assignmentForm,
      fileSize: 0,
      fileUrl: '',
      duration: assignmentForm.estimatedDuration
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-[24px] max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#334155] bg-slate-50/50 dark:bg-[#111827]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950/60 font-black">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 dark:text-[#F8FAFC]">Enterprise Assignment Studio</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
                Total Marks: <strong className="text-teal-600">{assignmentForm.totalMarks} pts</strong> | Passing Marks: <strong className="text-teal-600">{assignmentForm.passingMarks} pts</strong>
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-6">
          {[
            { id: 'info', label: '1. Basic Information', icon: BookOpen },
            { id: 'submission', label: '2. Submission Rules', icon: UploadCloud },
            { id: 'rubric', label: '3. Evaluation & Rubric', icon: Award },
            { id: 'preview', label: '4. Preview', icon: Eye }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 border-b-2 text-xs font-extrabold transition-all cursor-pointer ${activeTab === tab.id ? 'border-[#10B5A5] text-[#10B5A5]' : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
            >
              <tab.icon className="h-4 w-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Assignment Title *</label>
                  <input
                    type="text"
                    value={assignmentForm.title}
                    onChange={e => setAssignmentForm(prev => ({ ...prev, title: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] px-3.5 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={assignmentForm.description}
                    onChange={e => setAssignmentForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-3.5 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Detailed Submission Instructions</label>
                  <textarea
                    rows={3}
                    value={assignmentForm.instructions}
                    onChange={e => setAssignmentForm(prev => ({ ...prev, instructions: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] p-3.5 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Difficulty Level</label>
                  <select
                    value={assignmentForm.difficulty}
                    onChange={e => setAssignmentForm(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] px-3 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    value={assignmentForm.estimatedDuration}
                    onChange={e => setAssignmentForm(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                    className="h-11 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#111827] px-3.5 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBMISSION RULES */}
          {activeTab === 'submission' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="p-5 rounded-[20px] border border-slate-200 dark:border-[#334155] bg-slate-50/50 dark:bg-[#111827]/50 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-teal-600">Dates &amp; File Format Rules</h3>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={assignmentForm.dueDate}
                    onChange={e => setAssignmentForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Total Marks</label>
                    <input
                      type="number"
                      value={assignmentForm.totalMarks}
                      onChange={e => setAssignmentForm(prev => ({ ...prev, totalMarks: Number(e.target.value) }))}
                      className="h-10 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Passing Marks</label>
                    <input
                      type="number"
                      value={assignmentForm.passingMarks}
                      onChange={e => setAssignmentForm(prev => ({ ...prev, passingMarks: Number(e.target.value) }))}
                      className="h-10 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-[#CBD5E1] mb-1">Max Upload File Size (MB)</label>
                  <input
                    type="number"
                    value={assignmentForm.maxFileSizeMB}
                    onChange={e => setAssignmentForm(prev => ({ ...prev, maxFileSizeMB: Number(e.target.value) }))}
                    className="h-10 w-full rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                  />
                </div>
              </div>

              <div className="p-5 rounded-[20px] border border-slate-200 dark:border-[#334155] bg-slate-50/50 dark:bg-[#111827]/50 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-teal-600">Allowed Submission Types</h3>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-[#CBD5E1]">File Upload</span>
                  <input
                    type="checkbox"
                    checked={assignmentForm.allowFileUpload}
                    onChange={e => setAssignmentForm(prev => ({ ...prev, allowFileUpload: e.target.checked }))}
                    className="h-4 w-4 rounded text-teal-600 accent-teal-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-[#CBD5E1]">Text / Online Entry</span>
                  <input
                    type="checkbox"
                    checked={assignmentForm.allowTextSubmission}
                    onChange={e => setAssignmentForm(prev => ({ ...prev, allowTextSubmission: e.target.checked }))}
                    className="h-4 w-4 rounded text-teal-600 accent-teal-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-[#CBD5E1]">External URL / Repo Link</span>
                  <input
                    type="checkbox"
                    checked={assignmentForm.allowExternalLink}
                    onChange={e => setAssignmentForm(prev => ({ ...prev, allowExternalLink: e.target.checked }))}
                    className="h-4 w-4 rounded text-teal-600 accent-teal-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-[#CBD5E1]">Allow Resubmission</span>
                  <input
                    type="checkbox"
                    checked={assignmentForm.allowResubmission}
                    onChange={e => setAssignmentForm(prev => ({ ...prev, allowResubmission: e.target.checked }))}
                    className="h-4 w-4 rounded text-teal-600 accent-teal-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EVALUATION & RUBRICS */}
          {activeTab === 'rubric' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-teal-600">Rubric Criteria Breakdown</h3>
                <button
                  type="button"
                  onClick={addRubric}
                  className="px-3.5 py-1.5 rounded-xl bg-[#10B5A5] text-white text-xs font-bold flex items-center gap-1 cursor-pointer hover:bg-teal-700"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Rubric Criterion
                </button>
              </div>

              <div className="space-y-4">
                {assignmentForm.rubricCriteria?.map((rub, rIdx) => (
                  <div key={rub.id || rIdx} className="p-4 rounded-2xl border border-slate-200 dark:border-[#334155] bg-slate-50/50 dark:bg-[#111827] flex items-start gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600 font-bold text-xs mt-1">
                      {rIdx + 1}
                    </span>
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Criterion Title"
                        value={rub.title}
                        onChange={e => {
                          const copy = [...assignmentForm.rubricCriteria];
                          copy[rIdx].title = e.target.value;
                          setAssignmentForm(prev => ({ ...prev, rubricCriteria: copy }));
                        }}
                        className="h-10 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Description"
                        value={rub.description}
                        onChange={e => {
                          const copy = [...assignmentForm.rubricCriteria];
                          copy[rIdx].description = e.target.value;
                          setAssignmentForm(prev => ({ ...prev, rubricCriteria: copy }));
                        }}
                        className="h-10 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Max Points"
                        value={rub.maxPoints}
                        onChange={e => {
                          const copy = [...assignmentForm.rubricCriteria];
                          copy[rIdx].maxPoints = Number(e.target.value);
                          setAssignmentForm(prev => ({ ...prev, rubricCriteria: copy }));
                        }}
                        className="h-10 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 text-xs font-bold text-slate-800 dark:text-[#F8FAFC] outline-none"
                      />
                    </div>
                    <button type="button" onClick={() => deleteRubric(rIdx)} className="p-2 text-slate-400 hover:text-rose-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PREVIEW */}
          {activeTab === 'preview' && (
            <div className="p-6 rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0B1120] space-y-6 shadow-sm">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-50 text-teal-600">
                    Assignment
                  </span>
                  <span className="text-xs font-bold text-slate-400">Due: {assignmentForm.dueDate}</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">{assignmentForm.title}</h2>
                <p className="text-xs text-slate-500 mt-1">{assignmentForm.description}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-1">Instructions</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {assignmentForm.instructions}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-2">Grading Rubric</h4>
                <div className="space-y-2">
                  {assignmentForm.rubricCriteria?.map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white">{r.title}</div>
                        <div className="text-[11px] text-slate-500">{r.description}</div>
                      </div>
                      <span className="font-extrabold text-teal-600">{r.maxPoints} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Fixed Bottom Action Bar */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-[#334155] bg-slate-50/50 dark:bg-[#111827] flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">Enterprise LMS Assignment Authoring</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer hover:opacity-90"
              style={{ backgroundColor: '#10B5A5' }}
            >
              Save &amp; Publish Assignment
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
