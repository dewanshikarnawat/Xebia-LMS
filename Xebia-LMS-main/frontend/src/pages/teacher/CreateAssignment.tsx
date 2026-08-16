import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, ArrowLeft, ChevronDown, Search, BookOpen, Calendar, 
  Clock, Users, FileText, Settings, AlertCircle, CheckCircle2, Award, ShieldAlert
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { SubjectSelector } from '../../components/shared/SubjectSelector';
import { teacherService } from '../../services/teacher.service';
import { getFileIcon } from '../../utils/helpers';
import { useAppDispatch, useAppSelector } from '../../store';
import { getAllBatches } from '../../store/batchSlice';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  instructions: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  maxMarks: z.string().min(1, 'Marks are required').refine((v) => !isNaN(Number(v)) && Number(v) >= 1 && Number(v) <= 1000, 'Marks must be between 1 and 1000'),
  passingMarks: z.string().min(1, 'Passing marks are required').refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Must be a positive number'),
  certEligibilityMarks: z.string().min(1, 'Certificate eligibility marks are required').refine((v) => !isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, 'Must be a percentage between 0 and 100'),
  batchId: z.string().min(1, 'Batch selection is required'),
});

type FormData = z.infer<typeof schema>;

export const CreateAssignment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const forcedType = searchParams?.get('type')?.toUpperCase(); // 'PDF' or 'QUIZ'

  const { batches } = useAppSelector((state) => state.batch);
  const [loading, setLoading] = useState(false);
  const assignmentType = 'PDF';

  useEffect(() => {
    if (forcedType === 'QUIZ') {
      navigate('/teacher/quizzes?create=1');
    }
  }, [forcedType, navigate]);
  
  // File upload states
  const [attachment, setAttachment] = useState<File | null>(null);
  const [existingAttachment, setExistingAttachment] = useState<string | null>(null);
  const [existingAttachmentName, setExistingAttachmentName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  // Searchable Batch Dropdown states
  const [batchSearch, setBatchSearch] = useState('');
  const [batchOpen, setBatchOpen] = useState(false);
  const [selectedBatchName, setSelectedBatchName] = useState('');

  const { register, handleSubmit, setValue, watch, reset, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { maxMarks: '100', passingMarks: '40', certEligibilityMarks: '75', batchId: '' },
  });

  const watchBatchId = watch('batchId');
  const watchMaxMarks = watch('maxMarks');
  const watchTitle = watch('title');
  const watchTopic = watch('topic');
  const watchSubject = watch('subject');
  const watchDueDate = watch('dueDate');

  useEffect(() => {
    if (watchMaxMarks && !isNaN(Number(watchMaxMarks))) {
      setValue('passingMarks', String(Math.round(Number(watchMaxMarks) * 0.4)));
    }
  }, [watchMaxMarks, setValue]);

  useEffect(() => {
    dispatch(getAllBatches());
  }, [dispatch]);

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      teacherService.getAssignmentById(id)
        .then((res) => {
          let cleanInst = res.instructions || '';
          let certPct = '75';
          if (res.instructions && res.instructions.trim().startsWith('{')) {
            try {
              const meta = JSON.parse(res.instructions);
              cleanInst = meta.realInstructions || '';
              certPct = String(meta.certEligibilityMarks !== undefined ? meta.certEligibilityMarks : 75);
            } catch {}
          } else {
            const match = (res.instructions || '').match(/\[CERT_ELIGIBILITY:(\d+)\]/);
            if (match) {
              certPct = match[1];
              cleanInst = (res.instructions || '').replace(/\[CERT_ELIGIBILITY:\d+\]/, '').trim();
            }
          }

          reset({
            title: res.title,
            subject: res.subject,
            topic: res.topic || '',
            description: res.description,
            instructions: cleanInst,
            dueDate: res.dueDate,
            maxMarks: String(res.maxMarks),
            passingMarks: String(res.passingMarks !== undefined ? res.passingMarks : Math.round(res.maxMarks * 0.4)),
            certEligibilityMarks: certPct,
            batchId: String(res.batchId || ''),
          });
          if (res.batchName) {
            setSelectedBatchName(res.batchName);
          }
          if (res.attachment) {
            setExistingAttachment(res.attachment);
            setExistingAttachmentName(res.attachmentName || 'attachment');
          }
        })
        .catch(() => toast.error('Failed to load assignment details'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, reset]);

  useEffect(() => {
    if (watchBatchId && batches.length > 0) {
      const found = batches.find((b) => String(b.id) === watchBatchId);
      if (found) {
        setSelectedBatchName(found.batchName);
      }
    }
  }, [watchBatchId, batches]);

  const handleFile = (file: File) => {
    const allowed = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/zip', 
      'application/x-zip-compressed', 
      'image/jpeg', 
      'image/png'
    ];
    if (!allowed.includes(file.type)) {
      toast.error('Invalid file type. Allowed: PDF, DOC, DOCX, ZIP, JPG, PNG');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File too large. Maximum 25MB allowed.');
      return;
    }
    
    // Simulate interactive file upload progress
    setAttachment(file);
    setExistingAttachment(null);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 100);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const onSubmit = async (data: FormData, status: 'draft' | 'published') => {
    const finalMaxMarks = Number(data.maxMarks);
    const finalPassingMarks = Number(data.passingMarks);
    
    const instructionsData = JSON.stringify({
      realInstructions: data.instructions || '',
      certEligibilityMarks: Number(data.certEligibilityMarks)
    });

    try {
      if (isEdit && id) {
        await teacherService.updateAssignment(id, {
          title: data.title,
          subject: data.subject,
          topic: data.topic || '',
          description: data.description,
          instructions: instructionsData,
          dueDate: data.dueDate,
          maxMarks: finalMaxMarks,
          passingMarks: finalPassingMarks,
          status,
          batchId: data.batchId,
          attachment: attachment || undefined,
          assignmentType,
        });
        toast.success('Assignment updated successfully!');
      } else {
        await teacherService.createAssignment({
          title: data.title,
          subject: data.subject,
          topic: data.topic || '',
          description: data.description,
          instructions: instructionsData,
          dueDate: data.dueDate,
          maxMarks: finalMaxMarks,
          passingMarks: finalPassingMarks,
          status,
          batchId: data.batchId,
          attachment: attachment || undefined,
          assignmentType,
        });
        toast.success(status === 'published' ? 'Assignment published!' : 'Assignment saved as draft!');
      }
      navigate('/teacher/assignments');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save assignment.');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  const filteredBatches = batches.filter((b) =>
    b.batchName.toLowerCase().includes(batchSearch.toLowerCase())
  );

  if (loading) {
    return (
      <Layout role="teacher" title={isEdit ? 'Edit Assignment' : 'Create Assignment'}>
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse px-4 sm:px-6">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-brand-border rounded-2xl p-6 space-y-4">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-brand-border rounded-2xl p-6 space-y-4">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const pageTitle = isEdit ? 'Edit Assignment' : 'Create Assignment';

  return (
    <Layout role="teacher" title={pageTitle} subtitle="Fill in the details below">
      <div className="max-w-7xl mx-auto pb-28 px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-text-secondary dark:text-slate-400 mb-2 select-none">
          <Link to="/teacher/dashboard" className="hover:text-[#7A2676] transition-colors">Dashboard</Link>
          <span>&gt;</span>
          <Link to="/teacher/assignments" className="hover:text-[#7A2676] transition-colors">Assignments</Link>
          <span>&gt;</span>
          <span className="text-brand-text-primary dark:text-slate-200 font-bold">{isEdit ? 'Edit Assignment' : 'Create Assignment'}</span>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-brand-border dark:border-slate-800 pb-5 mb-8">
          <div className="flex items-start gap-3">
            <span className="text-3xl select-none" role="img" aria-label="Assignment">📄</span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-brand-text-primary dark:text-slate-100 flex items-center gap-3">
                {isEdit ? 'Edit Assignment' : 'Create New Assignment'}
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-primary/10 text-brand-primary dark:bg-purple-950/40 dark:text-purple-300">
                  Autosave Active
                </span>
              </h1>
              <p className="text-xs font-medium text-brand-text-secondary dark:text-slate-400 mt-1">
                Design and publish learning assignments for your students.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-brand-text-secondary dark:text-slate-400 self-end select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Last saved: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <form className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start" onSubmit={(e) => e.preventDefault()}>
          
          {/* Left Form Column (70%) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl shadow-sm bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-brand-border dark:border-slate-800">
                <FileText size={18} className="text-brand-primary" />
                <h3 className="text-sm font-bold text-brand-text-primary dark:text-slate-200">Assignment Details</h3>
              </div>
              
              <div className="grid gap-5">
                <Input 
                  label="Assignment Title" 
                  placeholder="e.g. Chapter 5 — Newton's Laws" 
                  required 
                  error={errors.title?.message} 
                  {...register('title')} 
                  className="rounded-xl focus:ring-1 focus:ring-brand-primary/50"
                />
                
                <Input 
                  label="Topic" 
                  placeholder="e.g. Laws of Motion" 
                  error={errors.topic?.message} 
                  {...register('topic')} 
                  className="rounded-xl focus:ring-1 focus:ring-brand-primary/50"
                />

                <Textarea
                  label="Description"
                  placeholder="Describe what this assignment is about..."
                  required
                  rows={4}
                  error={errors.description?.message}
                  {...register('description')}
                  className="rounded-xl focus:ring-1 focus:ring-brand-primary/50"
                />
                
                <Textarea
                  label="Instructions (Optional)"
                  placeholder="Detailed instructions for students..."
                  rows={3}
                  error={errors.instructions?.message}
                  {...register('instructions')}
                  className="rounded-xl focus:ring-1 focus:ring-brand-primary/50"
                />
              </div>
            </Card>

            {/* File Upload Section */}
            <Card className="rounded-2xl shadow-sm bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-brand-border dark:border-slate-800">
                <Upload size={18} className="text-brand-primary" />
                <h3 className="text-sm font-bold text-brand-text-primary dark:text-slate-200">Attachment (Optional)</h3>
              </div>

              <AnimatePresence mode="wait">
                {attachment ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 dark:bg-purple-950/10 dark:border-purple-800/20 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl select-none">{getFileIcon(attachment.name)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-brand-text-primary dark:text-slate-100 truncate">{attachment.name}</p>
                        <p className="text-[10px] text-brand-text-secondary dark:text-slate-400 font-semibold">{(attachment.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttachment(null)}
                        className="p-1.5 rounded-lg text-brand-text-secondary hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    {/* Simulated Upload Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-brand-text-secondary">
                        <span>{uploadProgress === 100 ? 'Ready to Submit' : 'Uploading...'}</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-brand-surface dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-primary transition-all duration-300 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ) : existingAttachment ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 dark:bg-emerald-950/10 dark:border-emerald-800/20"
                  >
                    <span className="text-2xl select-none">{getFileIcon(existingAttachmentName || '')}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-brand-text-primary dark:text-slate-100 truncate">{existingAttachmentName}</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-455 font-bold uppercase tracking-wider">Currently uploaded resource</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExistingAttachment(null)}
                      className="p-1.5 rounded-lg text-brand-text-secondary hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`p-8 text-center border-2 border-dashed rounded-2xl transition-all cursor-pointer select-none ${
                      isDragging 
                        ? 'border-brand-primary bg-brand-primary/5 dark:bg-purple-950/10' 
                        : 'border-brand-border dark:border-slate-800 hover:border-brand-primary/50 bg-slate-50/50 dark:bg-slate-900/20'
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={onDrop}
                    onClick={() => fileRef.current?.click()}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Upload size={20} className="text-brand-primary" />
                    </div>
                    <p className="text-sm font-semibold text-brand-text-primary dark:text-slate-100">
                      Drop file here or <span className="text-brand-primary hover:underline">browse</span>
                    </p>
                    <p className="text-[10px] text-brand-text-secondary dark:text-slate-400 mt-1.5 font-medium">
                      PDF, DOC, DOCX, ZIP, JPG, PNG · Max 25MB
                    </p>
                    <input
                      ref={fileRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png"
                      onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>

          {/* Right Sidebar Column (30%) - Sticky */}
          <div className="space-y-6 lg:sticky lg:top-20">
            
            {/* Settings Card */}
            <Card className="rounded-2xl shadow-sm bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-brand-border dark:border-slate-800">
                <Settings size={18} className="text-brand-primary" />
                <h3 className="text-sm font-bold text-brand-text-primary dark:text-slate-200">Assignment Settings</h3>
              </div>
              
              <div className="grid gap-4">
                <Input
                  label="Due Date"
                  type="date"
                  required
                  min={today}
                  leftIcon={<Calendar size={16} className="text-slate-400" />}
                  error={errors.dueDate?.message}
                  {...register('dueDate')}
                  className="rounded-xl"
                />
                
                <Input
                  label="Total Marks"
                  type="number"
                  min={1}
                  max={1000}
                  required
                  leftIcon={<Award size={16} className="text-slate-400" />}
                  error={errors.maxMarks?.message}
                  {...register('maxMarks')}
                  className="rounded-xl"
                />
                
                <Input
                  label="Passing Marks"
                  type="number"
                  required
                  leftIcon={<CheckCircle2 size={16} className="text-slate-400" />}
                  error={errors.passingMarks?.message}
                  {...register('passingMarks')}
                  className="rounded-xl"
                />
                
                <div className="space-y-1.5">
                  <Input
                    label="Certificate Eligibility Marks (%)"
                    type="number"
                    min={0}
                    max={100}
                    required
                    leftIcon={<ShieldAlert size={16} className="text-slate-400" />}
                    error={errors.certEligibilityMarks?.message}
                    {...register('certEligibilityMarks')}
                    className="rounded-xl"
                  />
                  <p className="text-[10px] text-brand-text-secondary dark:text-slate-400 font-medium leading-relaxed">
                    Minimum score required to qualify for completion certificate generation.
                  </p>
                </div>
              </div>
            </Card>

            {/* Batch & Subject Card */}
            <Card className="rounded-2xl shadow-sm bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-brand-border dark:border-slate-800">
                <Users size={18} className="text-brand-primary" />
                <h3 className="text-sm font-bold text-brand-text-primary dark:text-slate-200">Cohort & Topic</h3>
              </div>
              
              <div className="grid gap-4">
                {/* Searchable Batch Dropdown */}
                <div className="relative">
                  <label className="text-xs font-semibold text-brand-text-secondary uppercase tracking-wider block mb-1.5">
                    Batch <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setBatchOpen(!batchOpen)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-brand-border dark:border-slate-800 focus:border-brand-primary text-brand-text-primary rounded-xl py-2.5 px-3.5 text-left text-sm flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <span className="truncate">{selectedBatchName || 'Select a batch'}</span>
                    <ChevronDown size={16} className="text-brand-text-secondary shrink-0" />
                  </button>
                  {batchOpen && (
                    <div className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 rounded-xl shadow-lg p-2 space-y-2">
                      {batches.length > 5 && (
                        <div className="relative">
                          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
                          <input
                            type="text"
                            placeholder="Search batch..."
                            value={batchSearch}
                            onChange={(e) => setBatchSearch(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-brand-border focus:border-brand-primary rounded-lg py-1.5 pl-8 pr-3 text-xs text-brand-text-primary placeholder:text-brand-text-secondary transition-colors"
                          />
                        </div>
                      )}
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {filteredBatches.length === 0 ? (
                          <p className="text-xs text-brand-text-secondary text-center py-2">No batches found</p>
                        ) : (
                          filteredBatches.map((b) => (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => {
                                setValue('batchId', String(b.id));
                                setSelectedBatchName(b.batchName);
                                setBatchOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                                watchBatchId === String(b.id) ? 'bg-brand-primary/10 text-brand-primary font-semibold' : 'text-brand-text-primary'
                              }`}
                            >
                              {b.batchName}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  {errors.batchId?.message && <p className="text-xs text-red-500 mt-1">{errors.batchId.message}</p>}
                </div>

                {/* Subject Selector */}
                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => (
                    <SubjectSelector
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.subject?.message}
                      required
                    />
                  )}
                />
              </div>
            </Card>

            {/* Real-time Summary Preview Card */}
            <Card className="rounded-2xl border border-brand-border dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-5 space-y-4 select-none">
              <h4 className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider">
                Assignment Summary Preview
              </h4>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl select-none" role="img" aria-label="Assignment Preview">📄</span>
                  <div className="min-w-0 flex-1">
                    <h5 className="text-xs font-bold text-brand-text-primary dark:text-slate-100 truncate">
                      {watchTitle || 'Untitled Assignment'}
                    </h5>
                    <p className="text-[9px] text-brand-text-secondary dark:text-slate-400 font-semibold uppercase tracking-wider truncate">
                      {watchTopic || 'No Topic Specified'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-brand-text-secondary dark:text-slate-400 pt-2.5 border-t border-brand-border dark:border-slate-800">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-brand-text-secondary/50 mb-0.5">Subject</span>
                    <span className="text-brand-text-primary dark:text-slate-200 truncate block">{watchSubject || 'Not selected'}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-brand-text-secondary/50 mb-0.5">Cohort</span>
                    <span className="text-brand-text-primary dark:text-slate-200 truncate block">{selectedBatchName || 'Not selected'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-brand-text-secondary dark:text-slate-400 pt-2">
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-brand-text-secondary/50 mb-0.5">Max Marks</span>
                    <span className="text-brand-text-primary dark:text-slate-200">{watchMaxMarks || '100'} Marks</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase tracking-wider text-brand-text-secondary/50 mb-0.5">Due Date</span>
                    <span className="text-brand-text-primary dark:text-slate-200">{watchDueDate || 'No Due Date'}</span>
                  </div>
                </div>
              </div>
            </Card>

          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 lg:pl-64 bg-white/80 dark:bg-slate-900/80 border-t border-brand-border dark:border-slate-800 py-4 px-6 md:px-8 shadow-lg z-40 flex items-center justify-between backdrop-blur-md select-none transition-all duration-300">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => navigate('/teacher/assignments')}
              disabled={isSubmitting}
              className="rounded-full px-6 cursor-pointer"
            >
              Cancel
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="lg"
                loading={isSubmitting}
                onClick={() => handleSubmit((d: FormData) => onSubmit(d, 'draft'))()}
                className="rounded-full px-6 cursor-pointer"
              >
                Save Draft
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                onClick={() => handleSubmit((d: FormData) => onSubmit(d, 'published'))()} 
                className="rounded-full px-6 cursor-pointer shadow-md hover:scale-[1.01] transition-all bg-gradient-to-r from-[#4A1F4F] to-[#7A2676] hover:from-[#5A2460] hover:to-[#8B2F86] text-white border-none"
              >
                {isEdit ? 'Save Changes' : 'Publish Assignment'}
              </Button>
            </div>
          </div>

        </form>
      </div>
    </Layout>
  );
};