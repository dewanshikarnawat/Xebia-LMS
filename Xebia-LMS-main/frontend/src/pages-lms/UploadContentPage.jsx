import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UploadCloud, X, FileText, Video, Music, Presentation, FolderArchive, 
  ExternalLink, Eye, BookOpen, Sparkles, Check, AlertCircle, Trash2, ArrowLeft 
} from 'lucide-react';
import { useCatalog } from '@/hooks-lms/useCatalog';
import { useToast } from '@/hooks-lms/useToast';
import PageHeader from '@/components/layout-lms/PageHeader';
import Breadcrumb from '@/components/layout-lms/Breadcrumb';
import Button from '@/components/ui-lms/Button';
import Input from '@/components/ui-lms/Input';
import TextArea from '@/components/ui-lms/TextArea';
import Select from '@/components/ui-lms/Select';
import Toggle from '@/components/ui-lms/Toggle';
import SectionCard from '@/components/ui-lms/SectionCard';
import ImageUploader from '@/components/ui-lms/ImageUploader';
import RichNotesEditor from '@/components/ui-lms/RichNotesEditor';
import api from '@/services-lms/api';
import { formatFileSize } from '@/utils-lms';
import { getAIPlaceholderImage } from '@/utils-lms/placeholderUtils';

export default function UploadContentPage() {
  const { categories, courses, addContent, hydrated } = useCatalog();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Basic Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    courseId: '',
    moduleId: '',
    submoduleId: '',
    type: 'pdf',
    status: 'published',
    visibility: 'public',
    thumbnail: '',
    fileUrl: '',
    fileSize: 0,
    markdown: '',
    linkUrl: '',
    linkTitle: '',
    linkDescription: '',
  });

  // UI state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const fileInputRef = useRef(null);

  // Dynamic dropdown lists
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredModules, setFilteredModules] = useState([]);
  const [filteredSubmodules, setFilteredSubmodules] = useState([]);

  // Sync courses based on selected category
  useEffect(() => {
    if (form.categoryId) {
      const categoryCourses = courses.filter(c => c.category?.id === Number(form.categoryId) || c.categoryId === Number(form.categoryId));
      setFilteredCourses(categoryCourses);
      setForm(prev => ({ ...prev, courseId: '', moduleId: '', submoduleId: '' }));
    } else {
      setFilteredCourses([]);
    }
  }, [form.categoryId, courses]);

  // Sync modules based on selected course
  useEffect(() => {
    if (form.courseId) {
      const selectedCourse = courses.find(c => c.id === Number(form.courseId));
      setFilteredModules(selectedCourse?.modules || []);
      setForm(prev => ({ ...prev, moduleId: '', submoduleId: '' }));
    } else {
      setFilteredModules([]);
    }
  }, [form.courseId, courses]);

  // Sync submodules based on selected module
  useEffect(() => {
    if (form.moduleId) {
      const selectedModule = filteredModules.find(m => m.id === Number(form.moduleId));
      setFilteredSubmodules(selectedModule?.submodules || []);
      setForm(prev => ({ ...prev, submoduleId: '' }));
    } else {
      setFilteredSubmodules([]);
    }
  }, [form.moduleId, filteredModules]);

  // File type validation helper
  const getAcceptTypes = () => {
    switch (form.type) {
      case 'pdf': return ['.pdf'];
      case 'ppt':
      case 'pptx': return ['.ppt', '.pptx'];
      case 'doc':
      case 'docx': return ['.doc', '.docx'];
      case 'video': return ['video/mp4', 'video/webm', 'video/quicktime'];
      case 'audio': return ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
      case 'zip': return ['.zip', '.rar', '.7z'];
      case 'image': return ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
      default: return [];
    }
  };

  const validateFile = (file) => {
    setFileError('');
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    const mime = file.type;

    if (form.type === 'pdf' && extension !== '.pdf') {
      setFileError('Invalid file type. Please upload a PDF document.');
      return false;
    }
    if ((form.type === 'ppt' || form.type === 'pptx') && !['.ppt', '.pptx'].includes(extension)) {
      setFileError('Invalid file type. Please upload a PowerPoint file.');
      return false;
    }
    if ((form.type === 'doc' || form.type === 'docx') && !['.doc', '.docx'].includes(extension)) {
      setFileError('Invalid file type. Please upload a Word document.');
      return false;
    }
    if (form.type === 'video' && !mime.startsWith('video/')) {
      setFileError('Invalid file type. Please upload a video file (MP4, WebM etc).');
      return false;
    }
    if (form.type === 'audio' && !mime.startsWith('audio/')) {
      setFileError('Invalid file type. Please upload an audio file (MP3, WAV etc).');
      return false;
    }
    if (form.type === 'zip' && !['.zip', '.rar', '.7z'].includes(extension)) {
      setFileError('Invalid file type. Please upload a ZIP/archive file.');
      return false;
    }
    if (form.type === 'image' && !mime.startsWith('image/')) {
      setFileError('Invalid file type. Please upload an image file.');
      return false;
    }

    // Size limit check (e.g. 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setFileError('File size exceeds the 50MB limit.');
      return false;
    }

    return true;
  };

  const handleFileUpload = async (file) => {
    if (!validateFile(file)) return;

    setSelectedFile(file);
    setUploading(true);
    setUploadProgress(10);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 90) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      const { url, size } = response.data.data;
      setForm(prev => ({
        ...prev,
        fileUrl: url,
        fileSize: size
      }));
      setUploadProgress(100);
      showToast('File uploaded successfully');
    } catch (err) {
      setFileError('Upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (uploading) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setForm(prev => ({ ...prev, fileUrl: '', fileSize: 0 }));
    setUploadProgress(0);
    setFileError('');
  };

  const handleSave = async () => {
    // Validations
    if (!form.title.trim()) {
      showToast('Content title is required', 'error');
      return;
    }
    if (!form.categoryId || !form.courseId || !form.moduleId || !form.submoduleId) {
      showToast('Please select category, course, module, and submodule hierarchy', 'error');
      return;
    }
    if (form.type !== 'notes' && form.type !== 'link' && !form.fileUrl) {
      showToast('Please upload a file for the selected content type', 'error');
      return;
    }
    if (form.type === 'notes' && !form.markdown.trim()) {
      showToast('Please enter content notes', 'error');
      return;
    }
    if (form.type === 'link' && !form.linkUrl.trim()) {
      showToast('Please enter external link URL', 'error');
      return;
    }

    setSaving(true);
    try {
      // 1. Resolve Thumbnail (Auto assign if empty)
      let finalThumbnail = form.thumbnail;
      if (!finalThumbnail) {
        finalThumbnail = getAIPlaceholderImage(form.title || 'content', form.type);
      }

      // 2. Map Payload
      const payload = {
        title: form.title,
        description: form.description,
        type: form.type,
        status: form.status,
        visibility: form.visibility,
        thumbnail: finalThumbnail,
        fileUrl: form.type === 'link' ? form.linkUrl : form.fileUrl,
        fileSize: form.fileSize,
        markdown: form.type === 'notes' ? form.markdown : '',
        linkTitle: form.type === 'link' ? form.linkTitle : '',
        linkDescription: form.type === 'link' ? form.linkDescription : '',
      };

      await addContent(
        Number(form.courseId),
        Number(form.moduleId),
        Number(form.submoduleId),
        payload
      );

      showToast('Content item published successfully', 'success');
      navigate('/admin/media');
    } catch (err) {
      showToast('Failed to save content', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!hydrated) return null;

  return (
    <div className="bg-brand-background text-brand-text-primary min-h-screen">
      <PageHeader title="Upload Content" subtitle="Publish curriculum assets" />
      <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Breadcrumb items={[{ label: 'Media Library', href: '/admin/media' }, { label: 'Upload Content' }]} />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="space-y-6"
        >
          {/* 1. Placement Hierarchy selection */}
          <SectionCard icon={BookOpen} title="Placement Hierarchy" subtitle="Choose where this content belongs" accent="teal">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <Select 
                label="Category" 
                value={form.categoryId} 
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                options={[
                  { value: '', label: 'Select Category' },
                  ...categories.map(c => ({ value: c.id, label: c.name }))
                ]}
              />
              <Select 
                label="Course" 
                value={form.courseId} 
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                disabled={!form.categoryId}
                options={[
                  { value: '', label: 'Select Course' },
                  ...filteredCourses.map(c => ({ value: c.id, label: c.title }))
                ]}
              />
              <Select 
                label="Module" 
                value={form.moduleId} 
                onChange={(e) => setForm({ ...form, moduleId: e.target.value })}
                disabled={!form.courseId}
                options={[
                  { value: '', label: 'Select Module' },
                  ...filteredModules.map(m => ({ value: m.id, label: m.title }))
                ]}
              />
              <Select 
                label="Submodule" 
                value={form.submoduleId} 
                onChange={(e) => setForm({ ...form, submoduleId: e.target.value })}
                disabled={!form.moduleId}
                options={[
                  { value: '', label: 'Select Submodule' },
                  ...filteredSubmodules.map(s => ({ value: s.id, label: s.title }))
                ]}
              />
            </div>
          </SectionCard>

          {/* 2. Basic details */}
          <SectionCard icon={Sparkles} title="Content Details" subtitle="Provide metadata and choose type" accent="purple">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input 
                  label="Content Title" 
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                  placeholder="Enter descriptive title" 
                  required 
                />
                <Select 
                  label="Content Type" 
                  value={form.type} 
                  onChange={(e) => {
                    setForm({ ...form, type: e.target.value, fileUrl: '', fileSize: 0, markdown: '' });
                    setSelectedFile(null);
                  }}
                  options={[
                    { value: 'pdf', label: 'PDF Document' },
                    { value: 'ppt', label: 'PPT Presentation' },
                    { value: 'pptx', label: 'PPTX Presentation' },
                    { value: 'doc', label: 'DOC Word' },
                    { value: 'docx', label: 'DOCX Word' },
                    { value: 'video', label: 'Video Lecture' },
                    { value: 'audio', label: 'Audio Playback' },
                    { value: 'image', label: 'Graphic Image' },
                    { value: 'zip', label: 'ZIP Archive' },
                    { value: 'notes', label: 'Notes WYSIWYG' },
                    { value: 'link', label: 'External Link' }
                  ]}
                />
              </div>

              <TextArea 
                label="Description" 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                placeholder="Brief summary of what this content covers..." 
                rows={3} 
              />

              <div className="grid gap-4 sm:grid-cols-2 border-t border-brand-border dark:border-slate-800 pt-4">
                <Select 
                  label="Status" 
                  value={form.status} 
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  options={[
                    { value: 'published', label: 'Published' },
                    { value: 'draft', label: 'Draft' }
                  ]}
                />
                <Select 
                  label="Visibility" 
                  value={form.visibility} 
                  onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                  options={[
                    { value: 'public', label: 'Public (Everyone)' },
                    { value: 'private', label: 'Private (Enrolled only)' }
                  ]}
                />
              </div>
            </div>
          </SectionCard>

          {/* 3. Upload or Rich Notes Area */}
          <SectionCard icon={UploadCloud} title="Content File / Body" subtitle="Upload file payload or write editor notes" accent="orange">
            {form.type === 'notes' ? (
              <div className="space-y-2">
                <label className="text-sm font-semibold block text-brand-text-primary dark:text-slate-200">Notes Content Editor</label>
                <RichNotesEditor 
                  value={form.markdown} 
                  onChange={(val) => setForm({ ...form, markdown: val })} 
                />
              </div>
            ) : form.type === 'link' ? (
              <div className="space-y-4">
                <Input 
                  label="External Link URL" 
                  value={form.linkUrl} 
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} 
                  placeholder="https://example.com/reference-page" 
                  required 
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input 
                    label="Link Title (Optional)" 
                    value={form.linkTitle} 
                    onChange={(e) => setForm({ ...form, linkTitle: e.target.value })} 
                    placeholder="Reference website" 
                  />
                  <Input 
                    label="Link Description (Optional)" 
                    value={form.linkDescription} 
                    onChange={(e) => setForm({ ...form, linkDescription: e.target.value })} 
                    placeholder="Short meta details" 
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Drop Area */}
                <div 
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-brand-border dark:border-slate-800 rounded-2xl p-8 bg-brand-surface dark:bg-slate-950/40 text-center hover:border-accent-teal/40 transition-all cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileInputChange} 
                    accept={getAcceptTypes().join(',')}
                    className="hidden" 
                  />
                  <UploadCloud className="h-12 w-12 mx-auto text-brand-text-secondary dark:text-slate-500 mb-2 animate-pulse" />
                  <p className="text-sm font-bold text-brand-text-primary dark:text-slate-200">
                    Drag and drop your file here, or <span className="text-accent-teal">browse</span>
                  </p>
                  <p className="text-xs text-brand-text-secondary dark:text-slate-450 mt-1">
                    Maximum size: 50MB. Supported extension: {getAcceptTypes().join(', ')}
                  </p>
                </div>

                {/* Upload Status Card */}
                {(selectedFile || form.fileUrl) && (
                  <div className="p-4 rounded-xl border border-brand-border dark:border-slate-800 bg-brand-background flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded bg-brand-surface border border-brand-border flex items-center justify-center text-accent-teal">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">{selectedFile?.name || form.fileUrl.split('/').pop()}</p>
                        <p className="text-[10px] text-brand-text-secondary">{formatFileSize(form.fileSize)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="xs" onClick={handleCancelUpload} className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </Button>
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                {uploading && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Uploading File...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-teal transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                {fileError && (
                  <div className="p-3 rounded-lg bg-red-550/10 text-red-500 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {fileError}
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* 4. Optional Thumbnail and Live Previews */}
          <div className="grid gap-6 sm:grid-cols-2">
            <SectionCard icon={Sparkles} title="Optional Thumbnail" subtitle="Visual identifier for the block" accent="orange">
              <ImageUploader 
                value={form.thumbnail} 
                onChange={(val) => setForm({ ...form, thumbnail: val })}
                aspectRatio="video"
              />
            </SectionCard>

            <SectionCard icon={Eye} title="Curriculum Output Preview" subtitle="Simulated view of the content card" accent="teal">
              <div className="p-5 rounded-2xl border border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-950 flex flex-col justify-between h-[230px]">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-bold tracking-widest uppercase text-brand-text-secondary">Preview Card</span>
                    <span className="text-[9px] bg-accent-teal/10 text-accent-teal px-2 py-0.5 rounded-full font-bold uppercase">{form.type}</span>
                  </div>
                  <h3 className="text-sm font-bold line-clamp-1">{form.title || 'Untitled Content Block'}</h3>
                  <p className="text-[11px] text-brand-text-secondary line-clamp-2">{form.description || 'No description provided.'}</p>
                </div>

                <div className="flex items-center justify-between border-t border-brand-border dark:border-slate-900 pt-3 text-[10px] text-brand-text-secondary">
                  <span>Size: {formatFileSize(form.fileSize)}</span>
                  <span>{form.visibility}</span>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* 5. Save action bar */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => navigate('/admin/media')} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || uploading} variant="cta">
              {saving ? 'Publishing...' : 'Save & Publish'}
            </Button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}


