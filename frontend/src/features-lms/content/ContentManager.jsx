'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, UploadCloud, Eye, ExternalLink, Link, FileText, StickyNote, Video, Image, Presentation, FileCode, Download, Music, FolderArchive } from 'lucide-react';
import Button from '@/components/ui-lms/Button';
import Input from '@/components/ui-lms/Input';
import TextArea from '@/components/ui-lms/TextArea';
import Toggle from '@/components/ui-lms/Toggle';
import { formatDate, formatFileSize } from '@/utils-lms';
import RichNotesEditor from '@/components/ui-lms/RichNotesEditor';
import ImageUploader from '@/components/ui-lms/ImageUploader';

const TYPE_ICONS = {
  video: Video,
  pdf: FileText,
  ppt: Presentation,
  doc: FileCode,
  notes: StickyNote,
  image: Image,
  link: ExternalLink,
  audio: Music,
  zip: FolderArchive,
};

const TYPE_COLORS = {
  video: 'text-red-500 bg-red-50 dark:bg-red-950/20',
  pdf: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20',
  ppt: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20',
  doc: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20',
  notes: 'text-purple-500 bg-purple-50 dark:bg-purple-950/20',
  image: 'text-green-500 bg-green-50 dark:bg-green-950/20',
  link: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/20',
  audio: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
  zip: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20',
};

export default function ContentManager({ content, submoduleId, moduleId, courseId, catalog, showToast, onPreview, onSelect }) {
  const [form, setForm] = useState({ title: '', status: 'active', downloadEnabled: true, markdown: '', fileUrl: '' });
  const [activeTab, setActiveTab] = useState('edit');
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState({});

  const course = catalog.courses?.find((c) => c.id === courseId);
  const courseTitle = course?.title || 'Course';
  const module = course?.modules?.find((m) => m.id === moduleId);
  const moduleTitle = module?.title || 'Module';
  const submodule = module?.submodules?.find((s) => s.id === submoduleId);
  const submoduleTitle = submodule?.title || 'Submodule';

  useEffect(() => {
    if (content) {
      setForm({
        title: content.title || '',
        status: content.status || 'active',
        downloadEnabled: content.downloadEnabled ?? true,
        markdown: content.markdown || '',
        fileUrl: content.fileUrl || '',
        thumbnail: content.thumbnail || '',
      });
      setErrors({});
      setActiveTab('edit');
    }
  }, [content]);

  if (!content) return null;

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (content.type === 'link') {
      if (!form.fileUrl.trim()) e.fileUrl = 'URL is required';
      else if (!/^https?:\/\/\S+/i.test(form.fileUrl)) e.fileUrl = 'Invalid URL format (must start with http:// or https://)';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    catalog.updateContent(courseId, moduleId, submoduleId, content.id, form);
    showToast('Content updated successfully');
  };

  // Drag and drop replace file logic
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Simulated upload updating size, name, url
      catalog.updateContent(courseId, moduleId, submoduleId, content.id, {
        fileSize: file.size,
        fileUrl: `/media/${content.type}-${Date.now()}.${file.name.split('.').pop()}`,
        updatedAt: new Date().toISOString(),
      });
      showToast(`Replaced file with: ${file.name}`);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const file = files[0];
      catalog.updateContent(courseId, moduleId, submoduleId, content.id, {
        fileSize: file.size,
        fileUrl: `/media/${content.type}-${Date.now()}.${file.name.split('.').pop()}`,
        updatedAt: new Date().toISOString(),
      });
      showToast(`Uploaded file: ${file.name}`);
    }
  };

  const Icon = TYPE_ICONS[content.type] || FileText;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-brand-text-secondary dark:text-slate-400">
        <button
          type="button"
          onClick={() => onSelect?.({ type: 'course', id: courseId })}
          className="hover:text-accent-teal-dark dark:hover:text-accent-teal transition-colors"
        >
          {courseTitle}
        </button>
        <span className="text-brand-border dark:text-slate-700">/</span>
        <button
          type="button"
          onClick={() => onSelect?.({ type: 'module', id: moduleId })}
          className="hover:text-accent-teal-dark dark:hover:text-accent-teal transition-colors truncate max-w-[150px]"
        >
          {moduleTitle}
        </button>
        <span className="text-brand-border dark:text-slate-700">/</span>
        <button
          type="button"
          onClick={() => onSelect?.({ type: 'submodule', id: submoduleId, moduleId })}
          className="hover:text-accent-teal-dark dark:hover:text-accent-teal transition-colors truncate max-w-[150px]"
        >
          {submoduleTitle}
        </button>
        <span className="text-brand-border dark:text-slate-700">/</span>
        <span className="text-brand-text-primary dark:text-slate-200 truncate max-w-[200px]">
          {content.title}
        </span>
      </div>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card flex items-start gap-4"
      >
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${TYPE_COLORS[content.type]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-brand-text-primary dark:text-slate-100 truncate">{content.title}</h2>
            <span className="text-xs uppercase bg-brand-surface dark:bg-slate-800 px-2 py-0.5 rounded text-brand-text-secondary dark:text-slate-400 font-semibold border border-brand-border dark:border-slate-700">
              {content.type}
            </span>
          </div>
          <p className="text-xs text-brand-text-secondary dark:text-slate-400 mt-1">
            Last modified {formatDate(content.updatedAt)} · Created by {content.createdBy || 'Admin'}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => onPreview(content)}>
          <Eye className="h-4 w-4" /> Live Preview
        </Button>
      </motion.div>

      {/* Editor Panel */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card"
      >
        {/* Navigation tabs */}
        <div className="inline-flex gap-1 rounded-full border border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-950 p-1 mb-5 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`rounded-full px-4 py-1.5 transition-all ${activeTab === 'edit' ? 'bg-accent-teal text-white shadow-sm' : 'text-brand-text-secondary dark:text-slate-400 hover:text-brand-text-primary dark:hover:text-slate-100'}`}
          >
            Authoring Form
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`rounded-full px-4 py-1.5 transition-all ${activeTab === 'preview' ? 'bg-accent-teal text-white shadow-sm' : 'text-brand-text-secondary dark:text-slate-400 hover:text-brand-text-primary dark:hover:text-slate-100'}`}
          >
            Real-time Output
          </button>
        </div>

        {activeTab === 'edit' ? (
          <div className="space-y-4">
            <Input
              label="Content Title"
              required
              maxLength={100}
              value={form.title}
              error={errors.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            {content.type !== 'image' && (
              <ImageUploader 
                label="Content Thumbnail (Optional)"
                value={form.thumbnail} 
                onChange={(val) => setForm({ ...form, thumbnail: val })}
                aspectRatio="video"
              />
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col justify-center">
                <Toggle
                  label="Active"
                  description="Inactive content is hidden from learners."
                  checked={form.status === 'active'}
                  onChange={(checked) => setForm({ ...form, status: checked ? 'active' : 'inactive' })}
                />
              </div>
              {content.type !== 'link' && content.type !== 'notes' && (
                <div className="flex flex-col justify-end pb-3">
                  <label className="flex items-center gap-2 text-sm font-medium cursor-pointer text-brand-text-primary dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={form.downloadEnabled}
                      onChange={(e) => setForm({ ...form, downloadEnabled: e.target.checked })}
                      className="rounded border-brand-border dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                    Enable User Download
                  </label>
                </div>
              )}
            </div>

            {/* Dynamic Type Specific Input Blocks */}
            {content.type === 'notes' && (
              <RichNotesEditor
                label="Course Notes (WYSIWYG Editor)"
                value={form.markdown}
                onChange={(html) => setForm({ ...form, markdown: html })}
                placeholder="Write formatted course notes here..."
              />
            )}

            {content.type === 'link' && (
              <Input
                label="External URL link"
                required
                placeholder="https://example.com/handout"
                value={form.fileUrl}
                error={errors.fileUrl}
                onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
              />
            )}

            {content.type !== 'notes' && content.type !== 'link' && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200">Asset File</label>
                <div className="rounded-xl border border-brand-border dark:border-slate-800 p-4 bg-brand-surface dark:bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm">
                    <p className="font-semibold">{content.fileUrl?.split('/').pop() || 'file'}</p>
                    <p className="text-xs text-brand-text-secondary dark:text-slate-400">
                      Size: {formatFileSize(content.fileSize || 0)} · Format: {content.type?.toUpperCase()}
                    </p>
                  </div>
                  {content.downloadEnabled && (
                    <Button variant="outline" size="sm" onClick={() => showToast('Simulating download...')}>
                      <Download className="h-4 w-4" /> Download
                    </Button>
                  )}
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`mt-4 border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                    dragging
                      ? 'border-accent-teal bg-accent-teal/5 dark:bg-accent-teal/10'
                      : 'border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <UploadCloud className="h-10 w-10 mx-auto text-brand-text-secondary dark:text-slate-500 mb-2" />
                  <p className="text-sm font-semibold text-brand-text-primary dark:text-slate-200">
                    Drag and drop file here to replace
                  </p>
                  <p className="text-xs text-brand-text-secondary dark:text-slate-400 mt-1 mb-4">
                    Supports {content.type?.toUpperCase()} up to 100MB
                  </p>
                  <label className="relative inline-flex items-center justify-center rounded-lg bg-accent-teal hover:bg-accent-teal-dark text-white px-4 py-2 text-sm font-semibold cursor-pointer select-none transition-colors">
                    Browse Files
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-brand-border dark:border-slate-800">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 border border-brand-border dark:border-slate-800 rounded-xl bg-brand-surface dark:bg-slate-950 max-h-[500px] overflow-y-auto scrollbar-thin">
            <PreviewContentBox content={{ ...content, ...form }} />
          </div>
        )}
      </motion.div>
    </div>
  );
}

function PreviewContentBox({ content }) {
  switch (content.type) {
    case 'video':
      return (
        <div className="aspect-video bg-slate-900 rounded-lg flex flex-col items-center justify-center text-white p-4 relative">
          <Video className="h-12 w-12 text-white/50 mb-2" />
          <p className="font-semibold text-sm">Video Stream Workspace</p>
          <p className="text-xs text-slate-400 mt-1">Duration: {content.duration || '10:00'}</p>
        </div>
      );
    case 'pdf':
    case 'ppt':
    case 'doc':
      return (
        <div className="p-10 border border-brand-border dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-center">
          <FileText className="h-12 w-12 mx-auto text-brand-primary dark:text-brand-secondary mb-2" />
          <p className="font-semibold text-sm text-brand-text-primary dark:text-slate-200">Document Reader View</p>
          <p className="text-xs text-brand-text-secondary dark:text-slate-400 mt-1">
            {content.pageCount ? `${content.pageCount} pages` : content.slideCount ? `${content.slideCount} slides` : 'Ready to read'}
          </p>
        </div>
      );
    case 'notes':
      return (
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <h4 className="text-brand-text-primary dark:text-slate-100 font-bold border-b border-brand-border dark:border-slate-800 pb-2 mb-3">
            Notes Preview
          </h4>
          <div 
            className="text-brand-text-primary dark:text-slate-350 text-sm font-sans bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 p-4 rounded-lg min-h-[150px] prose prose-sm dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content.markdown || '<p class="text-brand-text-secondary">No notes written yet.</p>' }}
          />
        </div>
      );
    case 'image':
      return (
        <div className="rounded-lg overflow-hidden border border-brand-border dark:border-slate-800">
          <img src={content.fileUrl || 'https://picsum.photos/600/400'} alt="" className="w-full h-auto object-cover max-h-[350px]" />
        </div>
      );
    case 'audio':
      return (
        <div className="p-6 border border-brand-border dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-center space-y-4">
          <Music className="h-10 w-10 mx-auto text-emerald-500 animate-pulse" />
          <div>
            <p className="font-semibold text-sm text-brand-text-primary dark:text-slate-200">Audio Lecture Stream</p>
            <p className="text-xs text-brand-text-secondary dark:text-slate-400 mt-1">File: {content.fileUrl?.split('/').pop() || 'lecture.mp3'}</p>
          </div>
          {/* Waveform representation */}
          <div className="flex items-center justify-center gap-1 h-8">
            {[4, 10, 8, 14, 18, 12, 6, 12, 16, 20, 14, 10, 16, 12, 8, 4].map((h, i) => (
              <span key={i} className="w-1 bg-emerald-500/80 rounded-full transition-all" style={{ height: `${h}px` }} />
            ))}
          </div>
        </div>
      );
    case 'zip':
      return (
        <div className="p-6 border border-brand-border dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-brand-border dark:border-slate-800 pb-3 mb-4">
            <FolderArchive className="h-10 w-10 text-yellow-600 shrink-0" />
            <div>
              <p className="font-semibold text-sm text-brand-text-primary dark:text-slate-200">Zipped Package Archive</p>
              <p className="text-xs text-brand-text-secondary dark:text-slate-400 mt-0.5">Size: {formatFileSize(content.fileSize || 5420000)}</p>
            </div>
          </div>
          <div className="space-y-2 text-xs text-brand-text-secondary dark:text-slate-400">
            <p className="font-semibold uppercase tracking-wider text-[10px]">Folder Contents ({content.fileCount || 3} items)</p>
            <div className="bg-brand-surface dark:bg-slate-950 rounded-lg p-3 font-mono space-y-1.5 border border-brand-border dark:border-slate-800/40">
              <p>📄 index.html (12 KB)</p>
              <p>📄 styles.css (4.5 KB)</p>
              <p>📁 assets/ (2.4 MB)</p>
            </div>
          </div>
        </div>
      );
    case 'link':
      return (
        <div className="rounded-lg border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-surface dark:bg-slate-950 text-brand-primary dark:text-brand-secondary">
              <Link className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate">{content.title}</p>
              <a href={content.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-primary dark:text-brand-secondary hover:underline truncate block">
                {content.fileUrl || 'https://link.com'}
              </a>
            </div>
            <ExternalLink className="h-4 w-4 text-brand-text-secondary dark:text-slate-500" />
          </div>
        </div>
      );
    default:
      return null;
  }
}


