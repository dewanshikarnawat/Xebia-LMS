'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, ChevronRight, ChevronDown, ChevronUp, GripVertical, Pencil, Trash2, Save, X,
  Cloud, Lock, Sun, Moon, ArrowLeft, Link as LinkIcon, CheckCircle, FileText, UploadCloud, AlertCircle
} from 'lucide-react';
import { cn } from '@/utils-lms';
import Button from '@/components/ui-lms/Button';
import { ConfirmationDialog } from '@/components/ui-lms/Modal';
import { Link } from 'react-router-dom';
import api from '@/services-lms/api';

const getVideoPreview = (url) => {
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
    <video
      controls
      className="w-full h-full rounded-xl object-contain bg-black"
      src={videoSrc}
    >
      Your browser does not support video playback.
    </video>
  );
};

export default function CourseBuilderWorkspace({ course, catalog, showToast }) {
  // Navigation & View Mode
  const [activeView, setActiveView] = useState('modules_submodules'); // 'modules_submodules' or 'submodule_content'
  const [activeModuleId, setActiveModuleId] = useState(course.modules?.[0]?.id || null);
  const [activeSubmoduleId, setActiveSubmoduleId] = useState(null);

  // Forms Visibility
  const [moduleFormOpen, setModuleFormOpen] = useState(null); // 'add' | 'edit' | null
  const [submoduleFormOpen, setSubmoduleFormOpen] = useState(null); // 'add' | 'edit' | null
  const [seoExpanded, setSeoExpanded] = useState(false);

  // Content Block inline editor state
  const [contentFormOpen, setContentFormOpen] = useState(null); // 'add' | 'edit' | null
  const [contentForm, setContentForm] = useState({
    id: null,
    title: '',
    description: '',
    type: 'heading', // default content block type in mockup
    status: 'published',
    visibility: 'public',
    thumbnail: '',
    fileUrl: '',
    fileSize: 0,
    markdown: '',
    code: '',
    language: 'Java',
    headingLevel: 2,
    contentOrder: 1,
    alt: '',
    caption: ''
  });

  // Form states for Modules & Submodules
  const [moduleForm, setModuleForm] = useState({
    id: null,
    title: '',
    description: '',
    moduleOrder: 1,
    status: 'active'
  });

  const [submoduleForm, setSubmoduleForm] = useState({
    id: null,
    title: '',
    slug: '',
    description: '',
    submoduleOrder: 1,
    status: 'active',
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    ogTitle: '',
    ogImageUrl: ''
  });

  // File uploading states inside inline editor
  const [contentUploading, setContentUploading] = useState(false);
  const [contentUploadProgress, setContentUploadProgress] = useState(0);
  const [contentFileError, setContentFileError] = useState('');
  const [contentSelectedFile, setContentSelectedFile] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [theme, setTheme] = useState('light');

  // Drag states for builder workspace
  const [draggedModuleIndex, setDraggedModuleIndex] = useState(null);
  const [draggedSubmoduleIndex, setDraggedSubmoduleIndex] = useState(null);
  const [draggedContentIndex, setDraggedContentIndex] = useState(null);

  // Load theme settings on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(savedTheme || systemTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Find active records based on selected ID
  const activeModule = course.modules?.find(m => m.id === activeModuleId) || course.modules?.[0];
  useEffect(() => {
    if (activeModule && !activeModuleId) {
      setActiveModuleId(activeModule.id);
    }
  }, [activeModule, activeModuleId]);

  const activeSubmodule = activeModule?.submodules?.find(s => s.id === activeSubmoduleId);

  // ── Form Handlers ──

  // Module Actions
  const handleOpenAddModuleForm = () => {
    setModuleForm({
      id: null,
      title: '',
      description: '',
      moduleOrder: (course.modules?.length || 0) + 1,
      status: 'active'
    });
    setSubmoduleFormOpen(null);
    setModuleFormOpen('add');
  };

  const handleOpenEditModuleForm = (mod) => {
    setModuleForm({
      id: mod.id,
      title: mod.title || '',
      description: mod.description || '',
      moduleOrder: mod.moduleOrder || 1,
      status: mod.status || 'active'
    });
    setSubmoduleFormOpen(null);
    setModuleFormOpen('edit');
  };

  const handleSaveModule = async () => {
    if (!moduleForm.title.trim()) {
      showToast('Module title is required', 'error');
      return;
    }

    try {
      const payload = {
        title: moduleForm.title,
        description: moduleForm.description,
        moduleOrder: moduleForm.moduleOrder,
        status: moduleForm.status
      };

      if (moduleFormOpen === 'add') {
        const newMod = await catalog.addModule(course.id, payload);
        if (newMod) setActiveModuleId(newMod.id);
      } else {
        await catalog.updateModule(course.id, moduleForm.id, payload);
      }
      setModuleFormOpen(null);
      showToast('Module saved successfully');
    } catch (err) {
      showToast('Failed to save module details', 'error');
    }
  };

  const handleToggleModuleStatus = async (mod) => {
    const nextStatus = mod.status === 'active' ? 'inactive' : 'active';
    try {
      await catalog.updateModule(course.id, mod.id, { status: nextStatus });
      showToast(`Module status updated to ${nextStatus}`);
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Submodule Actions
  const handleOpenAddSubmoduleForm = () => {
    if (!activeModule) {
      showToast('Please select or create a module first', 'error');
      return;
    }
    setSubmoduleForm({
      id: null,
      title: '',
      slug: '',
      description: '',
      submoduleOrder: (activeModule.submodules?.length || 0) + 1,
      status: 'active',
      metaTitle: '',
      metaDescription: '',
      canonicalUrl: '',
      ogTitle: '',
      ogImageUrl: ''
    });
    setSeoExpanded(false);
    setModuleFormOpen(null);
    setSubmoduleFormOpen('add');
  };

  const handleOpenEditSubmoduleForm = (sub) => {
    setSubmoduleForm({
      id: sub.id,
      title: sub.title || '',
      slug: sub.slug || '',
      description: sub.description || '',
      submoduleOrder: sub.submoduleOrder || 1,
      status: sub.status || 'active',
      metaTitle: sub.metaTitle || '',
      metaDescription: sub.metaDescription || '',
      canonicalUrl: sub.canonicalUrl || '',
      ogTitle: sub.ogTitle || '',
      ogImageUrl: sub.ogImage || ''
    });
    setSeoExpanded(false);
    setModuleFormOpen(null);
    setSubmoduleFormOpen('edit');
  };

  const handleSaveSubmodule = async () => {
    if (!submoduleForm.title.trim()) {
      showToast('Submodule title is required', 'error');
      return;
    }
    if (!submoduleForm.slug.trim()) {
      showToast('Slug is required', 'error');
      return;
    }

    try {
      const payload = {
        title: submoduleForm.title,
        slug: submoduleForm.slug,
        description: submoduleForm.description,
        submoduleOrder: submoduleForm.submoduleOrder,
        status: submoduleForm.status,
        metaTitle: submoduleForm.metaTitle,
        metaDescription: submoduleForm.metaDescription,
        canonicalUrl: submoduleForm.canonicalUrl,
        ogTitle: submoduleForm.ogTitle,
        ogImageUrl: submoduleForm.ogImageUrl
      };

      if (submoduleFormOpen === 'add') {
        await catalog.addSubmodule(course.id, activeModuleId, payload);
      } else {
        await catalog.updateSubmodule(course.id, activeModuleId, submoduleForm.id, payload);
      }
      setSubmoduleFormOpen(null);
      showToast('Submodule saved successfully');
    } catch (err) {
      showToast('Failed to save submodule details', 'error');
    }
  };

  const handleToggleSubmoduleStatus = async (sub) => {
    const nextStatus = sub.status === 'active' ? 'inactive' : 'active';
    try {
      await catalog.updateSubmodule(course.id, activeModuleId, sub.id, { status: nextStatus });
      showToast(`Submodule status updated to ${nextStatus}`);
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Delete Handlers
  const handleDeleteClick = (node) => {
    setDeleteConfirm(node);
  };

  const confirmDelete = async () => {
    try {
      const node = deleteConfirm;
      if (node.type === 'module') {
        await catalog.deleteModule(course.id, node.id);
        if (activeModuleId === node.id) {
          setActiveModuleId(course.modules?.find(m => m.id !== node.id)?.id || null);
        }
      } else if (node.type === 'submodule') {
        await catalog.deleteSubmodule(course.id, node.moduleId || activeModuleId, node.id);
        if (activeSubmoduleId === node.id) {
          setActiveSubmoduleId(null);
        }
      } else if (node.type === 'content') {
        await catalog.deleteContent(course.id, node.moduleId, node.submoduleId, node.id);
      }
      setDeleteConfirm(null);
      showToast('Item deleted successfully');
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  // Navigate to content blocks editor
  const handleNavigateToContent = (sub) => {
    setActiveSubmoduleId(sub.id);
    setActiveView('submodule_content');
    setContentFormOpen(null);
  };

  // ── Inline Content Block Editor Handlers ──

  const handleOpenAddContent = (type) => {
    setContentUploading(false);
    setContentUploadProgress(0);
    setContentFileError('');
    setContentSelectedFile(null);

    setContentForm({
      id: null,
      title: type === 'heading' ? 'Your Heading Here' : '',
      description: '',
      type: type || 'notes',
      status: 'published',
      visibility: 'public',
      thumbnail: '',
      fileUrl: '',
      fileSize: 0,
      markdown: '',
      code: '',
      language: 'Java',
      headingLevel: 2,
      contentOrder: (activeSubmodule?.contents?.length || 0) + 1,
      alt: '',
      caption: '',
      pageCount: '',
      slideCount: ''
    });
    setContentFormOpen('add');
  };

  const handleOpenEditContent = (item) => {
    setContentUploading(false);
    setContentUploadProgress(0);
    setContentFileError('');
    setContentSelectedFile(null);

    setContentForm({
      id: item.id,
      title: item.title || '',
      description: item.description || '',
      type: item.type || 'notes',
      status: item.status || 'published',
      visibility: item.visibility || 'public',
      thumbnail: item.thumbnail || '',
      fileUrl: item.fileUrl || '',
      fileSize: item.fileSize || 0,
      markdown: item.markdown || '',
      code: item.code || '',
      language: item.language || 'Java',
      headingLevel: item.headingLevel || 2,
      contentOrder: item.contentOrder || 1,
      alt: item.alt || '',
      caption: item.caption || '',
      pageCount: item.pageCount || '',
      slideCount: item.slideCount || ''
    });
    setContentFormOpen('edit');
  };

  const handleSaveContent = async () => {
    const isTextBased = ['notes', 'text', 'heading', 'callout', 'table'].includes(contentForm.type);

    if (contentForm.type === 'heading' && !contentForm.title.trim()) {
      showToast('Heading text is required', 'error');
      return;
    }
    if (contentForm.type === 'notes' && !contentForm.markdown.trim()) {
      showToast('Notes body content is required', 'error');
      return;
    }
    if (contentForm.type === 'text' && !contentForm.markdown.trim()) {
      showToast('Text content is required', 'error');
      return;
    }
    if (contentForm.type === 'code' && !contentForm.code.trim()) {
      showToast('Code block content is required', 'error');
      return;
    }
    if (contentForm.type === 'video' && !contentForm.fileUrl.trim()) {
      showToast('Video URL is required', 'error');
      return;
    }
    if (contentForm.type === 'image' && !contentForm.fileUrl.trim()) {
      showToast('Image source URL is required', 'error');
      return;
    }
    if (contentForm.type === 'pdf' && !contentForm.fileUrl.trim()) {
      showToast('PDF file URL is required', 'error');
      return;
    }
    if (contentForm.type === 'ppt' && !contentForm.fileUrl.trim()) {
      showToast('PPT file URL is required', 'error');
      return;
    }
    if (contentForm.type === 'link' && !contentForm.fileUrl.trim()) {
      showToast('External link URL is required', 'error');
      return;
    }
    if (contentForm.type === 'callout' && !contentForm.markdown.trim()) {
      showToast('Callout body text is required', 'error');
      return;
    }
    if (contentForm.type === 'table' && !contentForm.markdown.trim()) {
      showToast('Table markdown or JSON text is required', 'error');
      return;
    }

    const payload = {
      ...contentForm,
      status: contentForm.status,
      title: contentForm.title || (contentForm.type.toUpperCase() + ' Block')
    };

    try {
      if (contentForm.id) {
        await catalog.updateContent(course.id, activeModuleId, activeSubmoduleId, contentForm.id, payload);
        showToast('Content block updated successfully');
      } else {
        await catalog.addContent(course.id, activeModuleId, activeSubmoduleId, payload);
        showToast('Content block created successfully');
      }
      setContentFormOpen(null);
    } catch (err) {
      showToast('Failed to save content block', 'error');
    }
  };

  const handleInlineFileUpload = async (file) => {
    setContentFileError('');
    setContentSelectedFile(file);
    setContentUploading(true);
    setContentUploadProgress(15);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 80) / progressEvent.total) + 15;
          setContentUploadProgress(percentCompleted);
        }
      });

      const { url, size } = response.data.data;
      setContentForm(prev => ({
        ...prev,
        fileUrl: url,
        fileSize: size
      }));
      setContentUploadProgress(100);
      showToast('Asset uploaded successfully');
    } catch (err) {
      setContentFileError('Upload failed. Try again.');
    } finally {
      setContentUploading(false);
    }
  };

  const handleToggleContentStatus = async (item) => {
    const nextStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      await catalog.updateContent(course.id, activeModuleId, activeSubmoduleId, item.id, { status: nextStatus });
      showToast(`Block status updated to ${nextStatus}`);
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Reordering helpers
  const handleMoveModule = async (mod, direction) => {
    const list = [...(course.modules || [])].sort((a, b) => (a.moduleOrder || 0) - (b.moduleOrder || 0));
    const index = list.findIndex(m => m.id === mod.id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const targetMod = list[targetIndex];
    try {
      await catalog.updateModule(course.id, mod.id, { moduleOrder: targetMod.moduleOrder });
      await catalog.updateModule(course.id, targetMod.id, { moduleOrder: mod.moduleOrder });
      showToast('Modules reordered');
    } catch (e) {
      showToast('Failed to reorder', 'error');
    }
  };

  const handleMoveSubmodule = async (sub, direction) => {
    const list = [...(activeModule?.submodules || [])].sort((a, b) => (a.submoduleOrder || 0) - (b.submoduleOrder || 0));
    const index = list.findIndex(s => s.id === sub.id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const targetSub = list[targetIndex];
    try {
      await catalog.updateSubmodule(course.id, activeModuleId, sub.id, { submoduleOrder: targetSub.submoduleOrder });
      await catalog.updateSubmodule(course.id, activeModuleId, targetSub.id, { submoduleOrder: sub.submoduleOrder });
      showToast('Submodules reordered');
    } catch (e) {
      showToast('Failed to reorder', 'error');
    }
  };

  const handleMoveContent = async (item, direction) => {
    const list = [...(activeSubmodule?.contents || [])].sort((a, b) => (a.contentOrder || 0) - (b.contentOrder || 0));
    const index = list.findIndex(c => c.id === item.id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const targetItem = list[targetIndex];
    try {
      await catalog.updateContent(course.id, activeModuleId, activeSubmoduleId, item.id, { contentOrder: targetItem.contentOrder });
      await catalog.updateContent(course.id, activeModuleId, activeSubmoduleId, targetItem.id, { contentOrder: item.contentOrder });
      showToast('Content blocks reordered');
    } catch (e) {
      showToast('Failed to reorder', 'error');
    }
  };

  // Drag and Drop reordering handlers
  const handleModuleDragStart = (e, index) => {
    setDraggedModuleIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleModuleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedModuleIndex === null || draggedModuleIndex === targetIndex) return;

    const list = [...(course.modules || [])].sort((a, b) => (a.moduleOrder || 0) - (b.moduleOrder || 0));
    const sourceMod = list[draggedModuleIndex];
    const targetMod = list[targetIndex];

    try {
      await catalog.updateModule(course.id, sourceMod.id, { moduleOrder: targetMod.moduleOrder });
      await catalog.updateModule(course.id, targetMod.id, { moduleOrder: sourceMod.moduleOrder });
      showToast('Modules reordered');
    } catch (err) {
      showToast('Failed to reorder modules', 'error');
    } finally {
      setDraggedModuleIndex(null);
    }
  };

  const handleSubmoduleDragStart = (e, index) => {
    setDraggedSubmoduleIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSubmoduleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedSubmoduleIndex === null || draggedSubmoduleIndex === targetIndex) return;

    const list = [...(activeModule.submodules || [])].sort((a, b) => (a.submoduleOrder || 0) - (b.submoduleOrder || 0));
    const sourceSub = list[draggedSubmoduleIndex];
    const targetSub = list[targetIndex];

    try {
      await catalog.updateSubmodule(course.id, activeModuleId, sourceSub.id, { submoduleOrder: targetSub.submoduleOrder });
      await catalog.updateSubmodule(course.id, activeModuleId, targetSub.id, { submoduleOrder: sourceSub.submoduleOrder });
      showToast('Submodules reordered');
    } catch (err) {
      showToast('Failed to reorder submodules', 'error');
    } finally {
      setDraggedSubmoduleIndex(null);
    }
  };

  const handleContentDragStart = (e, index) => {
    setDraggedContentIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleContentDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedContentIndex === null || draggedContentIndex === targetIndex) return;

    const list = [...(activeSubmodule?.contents || [])].sort((a, b) => (a.contentOrder || 0) - (b.contentOrder || 0));
    const sourceItem = list[draggedContentIndex];
    const targetItem = list[targetIndex];

    try {
      await catalog.updateContent(course.id, activeModuleId, activeSubmoduleId, sourceItem.id, { contentOrder: targetItem.contentOrder });
      await catalog.updateContent(course.id, activeModuleId, activeSubmoduleId, targetItem.id, { contentOrder: sourceItem.contentOrder });
      showToast('Content blocks reordered');
    } catch (err) {
      showToast('Failed to reorder content blocks', 'error');
    } finally {
      setDraggedContentIndex(null);
    }
  };

  // Block colors config from design stylesheet
  const blockTypesConfig = {
    heading: { label: 'Heading', color: '#6c1d5f', bg: '#6c1d5f12' },
    text: { label: 'Text', color: '#5c4f61', bg: '#5c4f6112' },
    callout: { label: 'Callout', color: '#793b74', bg: '#793b7412' },
    code: { label: 'Code', color: '#4a1e47', bg: '#4a1e4712' },
    video: { label: 'Video', color: '#ff6200', bg: '#ff620012' },
    image: { label: 'Image', color: '#db2777', bg: '#db277712' },
    table: { label: 'Table', color: '#533754', bg: '#53375412' },
    notes: { label: 'Notes', color: '#ff6200', bg: '#ff620012' },
    link: { label: 'Link', color: '#793b74', bg: '#793b7412' },
    pdf: { label: 'PDF', color: '#db2777', bg: '#db277712' },
    ppt: { label: 'PPT', color: '#eab308', bg: '#eab30812' }
  };

  const currentTypeColor = blockTypesConfig[contentForm.type]?.color || '#6b7280';

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-slate-900 transition-colors">
      {/* Sticky Header breadcrumbs exactly matching mockup */}
      <div className="sticky top-0 z-20 border-b border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-text-secondary dark:text-slate-400">
            <Link to="/admin/courses" className="text-brand-text-secondary hover:text-brand-text-primary transition-colors">Courses</Link>
            <ChevronRight className="h-3.5 w-3.5 text-brand-text-secondary" />
            <span className="text-brand-text-secondary truncate max-w-[150px]">
              {course.title}
            </span>
            {activeModule && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-brand-text-secondary" />
                <span className="text-brand-text-primary dark:text-slate-100 truncate max-w-[200px]">
                  {activeModule.title}
                </span>
              </>
            )}
            {activeView === 'submodule_content' && activeSubmodule && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-brand-text-secondary" />
                <span className="font-bold text-brand-primary dark:text-slate-100 truncate max-w-[200px]">
                  {activeSubmodule.title}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3.5">
            <span className="text-xs text-brand-text-secondary dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <Cloud className="h-3.5 w-3.5 text-brand-success shrink-0" />
              <span>All changes saved</span>
            </span>
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2 text-brand-text-secondary dark:text-slate-400 hover:bg-brand-surface dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme mode"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5 text-amber-500" /> : <Moon className="h-4.5 w-4.5 text-slate-500" />}
            </button>
            <div className="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </div>
        </div>
      </div>

      {activeView === 'modules_submodules' ? (
        /* Module & Submodule Side-by-Side Split Column Editor */
        <div className="flex-1 flex overflow-hidden divide-x divide-brand-border dark:divide-slate-800">
          {/* Left Column: Modules list & form */}
          <div className="w-[480px] shrink-0 flex flex-col bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900">
              <div>
                <h2 className="text-base font-bold text-brand-text-primary dark:text-slate-100 font-headings">Modules</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-brand-text-secondary dark:text-slate-400">Course:</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-surface dark:bg-slate-800 border border-brand-border dark:border-slate-700 text-brand-text-primary dark:text-slate-200">
                    <span>📘</span>
                    <span className="truncate max-w-[140px]">{course.title}</span>
                    <Lock className="h-2.5 w-2.5 text-brand-text-secondary/50 dark:text-slate-500" />
                  </span>
                </div>
              </div>
              <Button 
                onClick={handleOpenAddModuleForm} 
                size="sm" 
                className="bg-accent-teal hover:bg-accent-teal-dark text-white font-semibold flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Module
              </Button>
            </div>

            {/* Scrollable Modules List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin divide-y divide-brand-border dark:divide-slate-800 bg-white dark:bg-slate-900">
              {course.modules?.length === 0 ? (
                <div className="p-8 text-center text-brand-text-secondary dark:text-slate-450">
                  No modules created yet. Click "Add Module" to start.
                </div>
              ) : (
                [...(course.modules || [])]
                  .sort((a, b) => (a.moduleOrder || 0) - (b.moduleOrder || 0))
                  .map((mod, idx) => {
                    const isSelected = activeModuleId === mod.id;
                    return (
                      <div
                        key={mod.id}
                        draggable="true"
                        onDragStart={(e) => handleModuleDragStart(e, idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleModuleDrop(e, idx)}
                        onClick={() => {
                          setActiveModuleId(mod.id);
                          setModuleFormOpen(null);
                          setSubmoduleFormOpen(null);
                        }}
                        className={cn(
                          "flex items-start gap-3 px-5 py-4 cursor-grab active:cursor-grabbing hover:bg-brand-surface/[0.05] dark:hover:bg-slate-800/20 transition-all",
                          isSelected && "bg-brand-primary/[0.03] dark:bg-brand-primary/10 border-l-3 border-l-brand-primary pl-[17px]"
                        )}
                      >
                        <div className="flex flex-col gap-1 mt-1 shrink-0 text-brand-text-secondary dark:text-slate-500">
                          <button onClick={(e) => { e.stopPropagation(); handleMoveModule(mod, 'up'); }} className="hover:text-brand-primary"><ChevronUp className="h-3 w-3" /></button>
                          <GripVertical className="h-3.5 w-3.5 mx-auto opacity-40" />
                          <button onClick={(e) => { e.stopPropagation(); handleMoveModule(mod, 'down'); }} className="hover:text-brand-primary"><ChevronDown className="h-3 w-3" /></button>
                        </div>
                        <div 
                          className={cn(
                            "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5",
                            isSelected 
                              ? "bg-brand-primary/15 text-brand-primary dark:bg-brand-primary/30 dark:text-brand-text-primary" 
                              : "bg-brand-surface dark:bg-slate-800 text-brand-text-secondary border border-brand-border dark:border-slate-700"
                          )}
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-brand-text-primary dark:text-slate-100 leading-snug truncate">
                                {mod.title}
                              </div>
                              <div className="text-xs text-brand-text-secondary dark:text-slate-400 mt-0.5 truncate">
                                {mod.description || 'No description provided.'}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                              <button
                                onClick={() => {
                                  setActiveModuleId(mod.id);
                                  setModuleFormOpen(null);
                                  setSubmoduleFormOpen(null);
                                }}
                                className="w-7 h-7 rounded-md border border-brand-border dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-brand-surface dark:hover:bg-slate-750 flex items-center justify-center text-brand-primary"
                                title="View submodules"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleOpenEditModuleForm(mod)}
                                className="w-7 h-7 rounded-md border border-brand-border dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-brand-surface dark:hover:bg-slate-750 flex items-center justify-center text-brand-primary"
                                title="Edit module details"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          {/* Bottom Row status + delete */}
                          <div className="flex items-center gap-3 mt-2.5" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleToggleModuleStatus(mod)}
                                className={cn(
                                  "w-8 h-4 rounded-full px-0.5 flex items-center transition-colors duration-200",
                                  mod.status === 'active' ? "bg-brand-success" : "bg-brand-border dark:bg-slate-700"
                                )}
                              >
                                <div className={cn("w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200", mod.status === 'active' && "translate-x-4")} />
                              </button>
                              <span className={cn("text-xs font-semibold", mod.status === 'active' ? "text-brand-success" : "text-brand-text-secondary dark:text-slate-400")}>
                                {mod.status === 'active' ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteClick({ type: 'module', id: mod.id })}
                              className="flex items-center gap-1 text-xs font-medium text-accent-orange hover:underline"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}

              {/* Module Add/Edit Form Card inline under list */}
              {moduleFormOpen && (
                <div className="mx-5 my-5 rounded-xl border border-brand-border dark:border-slate-800 overflow-hidden shadow-card bg-white dark:bg-slate-900 border-t-3 border-t-accent-teal">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-950/20">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center bg-accent-teal/15 text-accent-teal">
                        <Pencil className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-bold text-brand-text-primary dark:text-slate-100">
                        {moduleFormOpen === 'edit' ? 'Edit Module' : 'Add Module'}
                      </span>
                    </div>
                    <button onClick={() => setModuleFormOpen(null)} className="text-brand-text-secondary hover:text-brand-text-primary dark:text-slate-400">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="px-5 py-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-brand-text-secondary dark:text-slate-400">Course</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-surface dark:bg-slate-800 border border-brand-border dark:border-slate-750 text-brand-text-secondary dark:text-slate-400">
                        <span>📘</span>
                        <span>{course.title}</span>
                        <Lock className="h-2.5 w-2.5 text-brand-text-secondary/55" />
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                        Title <span className="text-accent-orange">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={moduleForm.title}
                          onChange={e => setModuleForm({ ...moduleForm, title: e.target.value.slice(0, 200) })}
                          placeholder="e.g. Introduction to Spring Boot"
                          className="w-full border-l-3 border-l-brand-primary border border-brand-border dark:border-slate-750 rounded-md px-4 py-2.5 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary dark:text-slate-100 focus:border-brand-primary focus:outline-none"
                          required
                        />
                        <span className="absolute right-3 bottom-2.5 text-xs text-brand-text-secondary dark:text-slate-455">{moduleForm.title.length}/200</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">Description</label>
                      <textarea
                        value={moduleForm.description}
                        onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })}
                        placeholder="Describe this module..."
                        className="w-full border border-brand-border dark:border-slate-750 rounded-md px-4 py-3 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary dark:text-slate-200 leading-relaxed min-h-[80px] focus:outline-none focus:border-accent-teal"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5 font-headings">Module Order</label>
                        <input
                          type="number"
                          value={moduleForm.moduleOrder}
                          onChange={e => setModuleForm({ ...moduleForm, moduleOrder: parseInt(e.target.value) || 1 })}
                          className="w-full border border-brand-border dark:border-slate-750 rounded-md px-4 py-2.5 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">Active</label>
                        <div className="flex items-center gap-2.5 pt-1.5">
                          <button
                            onClick={() => setModuleForm({ ...moduleForm, status: moduleForm.status === 'active' ? 'inactive' : 'active' })}
                            className={cn(
                              "w-11 h-6 rounded-full px-0.5 flex items-center transition-colors duration-200",
                              moduleForm.status === 'active' ? "bg-brand-success" : "bg-brand-border dark:bg-slate-700"
                            )}
                          >
                            <div className={cn("w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200", moduleForm.status === 'active' && "translate-x-5")} />
                          </button>
                          <span className={cn("text-sm font-semibold", moduleForm.status === 'active' ? "text-brand-success" : "text-brand-text-secondary")}>
                            {moduleForm.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-brand-border dark:border-slate-800">
                      <Button onClick={() => setModuleFormOpen(null)} variant="outline" size="sm">Cancel</Button>
                      <Button onClick={handleSaveModule} size="sm" className="bg-accent-teal text-white flex items-center gap-1.5">
                        <Save className="h-3.5 w-3.5" /> Save Module
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Submodules list & form */}
          <div className="flex-1 flex flex-col bg-brand-surface dark:bg-slate-950/40">
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900">
              <div>
                <h2 className="text-base font-bold text-brand-text-primary dark:text-slate-100 font-headings">Submodules</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-brand-text-secondary dark:text-slate-400 font-medium">Module:</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-brand-surface dark:bg-slate-800 border border-brand-border dark:border-slate-750 text-brand-text-primary dark:text-slate-200">
                    <span>📦</span>
                    <span className="truncate max-w-[200px]">{activeModule?.title || 'None Selected'}</span>
                    <Lock className="h-2.5 w-2.5 text-brand-text-secondary/55" />
                  </span>
                </div>
              </div>
              <Button 
                onClick={handleOpenAddSubmoduleForm} 
                disabled={!activeModule} 
                size="sm" 
                className="bg-accent-teal hover:bg-accent-teal-dark text-white font-semibold flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Submodule
              </Button>
            </div>

            {/* Scrollable Submodules list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-4 space-y-3">
              {!activeModule ? (
                <div className="text-center py-12 text-brand-text-secondary dark:text-slate-450 bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 rounded-xl">
                  Select a Module in the left panel to manage its submodules.
                </div>
              ) : activeModule.submodules?.length === 0 ? (
                <div className="text-center py-12 text-brand-text-secondary dark:text-slate-450 bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 rounded-xl">
                  No submodules inside this module yet. Click "Add Submodule" to start.
                </div>
              ) : (
                [...(activeModule.submodules || [])]
                  .sort((a, b) => (a.submoduleOrder || 0) - (b.submoduleOrder || 0))
                  .map((sub, idx) => (
                    <div 
                      key={sub.id} 
                      draggable="true"
                      onDragStart={(e) => handleSubmoduleDragStart(e, idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleSubmoduleDrop(e, idx)}
                      className="bg-white dark:bg-slate-900 rounded-xl border border-brand-border dark:border-slate-800 overflow-hidden shadow-sm flex items-start gap-3 px-5 py-4 cursor-grab active:cursor-grabbing hover:border-brand-primary transition-all"
                    >
                      <div className="flex flex-col gap-1 mt-1 shrink-0 text-brand-text-secondary dark:text-slate-500">
                        <button onClick={() => handleMoveSubmodule(sub, 'up')} className="hover:text-brand-primary"><ChevronUp className="h-3 w-3" /></button>
                        <GripVertical className="h-3.5 w-3.5 mx-auto opacity-40" />
                        <button onClick={() => handleMoveSubmodule(sub, 'down')} className="hover:text-brand-primary"><ChevronDown className="h-3 w-3" /></button>
                      </div>
                      <div 
                        className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-brand-border dark:border-slate-700 bg-brand-surface dark:bg-slate-850 text-brand-text-secondary"
                      >
                        {String(idx + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-brand-text-primary dark:text-slate-100 leading-snug truncate">
                              {sub.title}
                            </div>
                            <div className="text-xs font-mono text-brand-text-secondary dark:text-slate-450 mt-0.5 truncate">
                              /{sub.slug}
                            </div>
                            <div className="text-xs text-brand-text-secondary dark:text-slate-400 mt-1 truncate">
                              {sub.description || 'No description provided.'}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleNavigateToContent(sub)}
                              className="w-7 h-7 rounded-md border border-brand-border dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-brand-surface dark:hover:bg-slate-755 flex items-center justify-center text-brand-primary"
                              title="Edit submodule learning content blocks"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditSubmoduleForm(sub)}
                              className="w-7 h-7 rounded-md border border-brand-border dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-brand-surface dark:hover:bg-slate-755 flex items-center justify-center text-brand-primary"
                              title="Edit submodule details"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        {/* Bottom Row status & actions */}
                        <div className="flex items-center gap-3 mt-2.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleSubmoduleStatus(sub)}
                              className={cn(
                                "w-8 h-4 rounded-full px-0.5 flex items-center transition-colors duration-200",
                                sub.status === 'active' ? "bg-brand-success" : "bg-brand-border dark:bg-slate-700"
                              )}
                            >
                              <div className={cn("w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200", sub.status === 'active' && "translate-x-4")} />
                            </button>
                            <span className={cn("text-xs font-semibold", sub.status === 'active' ? "text-brand-success" : "text-brand-text-secondary dark:text-slate-400")}>
                              {sub.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteClick({ type: 'submodule', id: sub.id, moduleId: activeModule.id })}
                            className="flex items-center gap-1 text-xs font-medium text-accent-orange hover:underline"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}

              {/* Submodule Add/Edit Form Card inline under list */}
              {submoduleFormOpen && (
                <div className="rounded-xl border border-brand-border dark:border-slate-800 overflow-hidden shadow-card bg-white dark:bg-slate-900 border-t-3 border-t-accent-teal mt-2">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-950/20">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center bg-accent-teal/15 text-accent-teal">
                        <Pencil className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-bold text-brand-text-primary dark:text-slate-100">
                        {submoduleFormOpen === 'edit' ? 'Edit Submodule' : 'Add Submodule'}
                      </span>
                    </div>
                    <button onClick={() => setSubmoduleFormOpen(null)} className="text-brand-text-secondary dark:text-slate-400 hover:text-brand-text-primary">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="px-5 py-5 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-brand-text-secondary dark:text-slate-400">Module</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-surface dark:bg-slate-800 border border-brand-border dark:border-slate-750 text-brand-text-secondary dark:text-slate-400">
                        <span>📦</span>
                        <span>{activeModule.title}</span>
                        <Lock className="h-2.5 w-2.5 text-brand-text-secondary/55" />
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                          Title <span className="text-accent-orange">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={submoduleForm.title}
                            onChange={e => {
                              const val = e.target.value.slice(0, 200);
                              const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                              setSubmoduleForm({ 
                                ...submoduleForm, 
                                title: val,
                                slug: submoduleFormOpen === 'add' ? generatedSlug : submoduleForm.slug
                              });
                            }}
                            placeholder="e.g. Variables and Types"
                            className="w-full border-l-3 border-l-brand-primary border border-brand-border dark:border-slate-750 rounded-md px-4 py-2.5 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary dark:text-slate-100 focus:outline-none"
                            required
                          />
                          <span className="absolute right-3 bottom-2.5 text-xs text-brand-text-secondary dark:text-slate-455">{submoduleForm.title.length}/200</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                          Slug <span className="text-accent-orange">*</span>
                        </label>
                        <div className="border border-brand-border dark:border-slate-750 rounded-md px-3 py-2 bg-brand-surface dark:bg-slate-800 text-sm flex items-center gap-2">
                          <span className="text-brand-text-secondary dark:text-slate-400">
                            <LinkIcon className="h-3.5 w-3.5" />
                          </span>
                          <input
                            type="text"
                            value={submoduleForm.slug}
                            onChange={e => setSubmoduleForm({ ...submoduleForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]+/g, '') })}
                            placeholder="variables-and-types"
                            className="flex-1 bg-transparent text-brand-text-primary dark:text-slate-100 focus:outline-none text-sm"
                          />
                          <span className="flex items-center gap-1 text-xs font-semibold text-brand-success shrink-0">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span>OK</span>
                          </span>
                          <span className="text-brand-text-secondary/55">
                            <Lock className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5 font-headings">Description</label>
                      <textarea
                        value={submoduleForm.description}
                        onChange={e => setSubmoduleForm({ ...submoduleForm, description: e.target.value })}
                        placeholder="Describe this submodule..."
                        className="w-full border border-brand-border dark:border-slate-750 rounded-md px-4 py-3 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary dark:text-slate-200 leading-relaxed min-h-[68px] focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5 font-headings">Submodule Order</label>
                        <input
                          type="number"
                          value={submoduleForm.submoduleOrder}
                          onChange={e => setSubmoduleForm({ ...submoduleForm, submoduleOrder: parseInt(e.target.value) || 1 })}
                          className="w-full border border-brand-border dark:border-slate-750 rounded-md px-4 py-2.5 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">Active</label>
                        <div className="flex items-center gap-2.5 pt-1.5">
                          <button
                            onClick={() => setSubmoduleForm({ ...submoduleForm, status: submoduleForm.status === 'active' ? 'inactive' : 'active' })}
                            className={cn(
                              "w-11 h-6 rounded-full px-0.5 flex items-center transition-colors duration-200",
                              submoduleForm.status === 'active' ? "bg-brand-success" : "bg-brand-border dark:bg-slate-700"
                            )}
                          >
                            <div className={cn("w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200", submoduleForm.status === 'active' && "translate-x-5")} />
                          </button>
                          <span className={cn("text-sm font-semibold", submoduleForm.status === 'active' ? "text-brand-success" : "text-brand-text-secondary")}>
                            {submoduleForm.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Expandable SEO Accordion */}
                    <div className="rounded-lg border border-brand-border dark:border-slate-800 overflow-hidden bg-brand-surface dark:bg-slate-800/40">
                      <div 
                        onClick={() => setSeoExpanded(!seoExpanded)}
                        className="flex items-center justify-between px-4 py-3 bg-brand-surface dark:bg-slate-800 border-b border-brand-border dark:border-slate-850 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-brand-text-primary dark:text-slate-100">SEO &amp; Metadata</span>
                          <span className="text-[10px] text-brand-text-secondary border border-brand-border dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-0.5 rounded-full font-semibold">Optional</span>
                        </div>
                        <ChevronDown className={cn("h-4 w-4 text-brand-text-secondary transition-transform duration-200", seoExpanded && "rotate-180")} />
                      </div>
                      {seoExpanded && (
                        <div className="px-4 py-4 grid grid-cols-2 gap-3 bg-white dark:bg-slate-900">
                          <div>
                            <label className="block text-xs font-semibold text-brand-text-primary dark:text-slate-300 mb-1">Meta Title</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={submoduleForm.metaTitle}
                                onChange={e => setSubmoduleForm({ ...submoduleForm, metaTitle: e.target.value.slice(0, 70) })}
                                placeholder="Meta title..."
                                className="w-full border border-brand-border dark:border-slate-750 bg-brand-surface dark:bg-slate-800 text-xs px-3 py-2 text-brand-text-primary dark:text-slate-100 rounded-md focus:outline-none"
                              />
                              <span className="absolute right-2 bottom-2 text-[9px] text-brand-text-secondary dark:text-slate-450">{submoduleForm.metaTitle.length}/70</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-brand-text-primary dark:text-slate-300 mb-1">Canonical URL</label>
                            <input
                              type="url"
                              value={submoduleForm.canonicalUrl}
                              onChange={e => setSubmoduleForm({ ...submoduleForm, canonicalUrl: e.target.value })}
                              placeholder="https://..."
                              className="w-full border border-brand-border dark:border-slate-750 bg-brand-surface dark:bg-slate-800 text-xs px-3 py-2 text-brand-text-primary dark:text-slate-100 rounded-md focus:outline-none"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-semibold text-brand-text-primary dark:text-slate-300 mb-1">Meta Description</label>
                            <div className="relative">
                              <textarea
                                value={submoduleForm.metaDescription}
                                onChange={e => setSubmoduleForm({ ...submoduleForm, metaDescription: e.target.value.slice(0, 320) })}
                                placeholder="Meta description..."
                                className="w-full border border-brand-border dark:border-slate-750 bg-brand-surface dark:bg-slate-800 text-xs px-3 py-2 text-brand-text-primary dark:text-slate-100 rounded-md min-h-[48px] focus:outline-none"
                              />
                              <span className="absolute right-2 bottom-2 text-[9px] text-brand-text-secondary dark:text-slate-450">{submoduleForm.metaDescription.length}/320</span>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-brand-text-primary dark:text-slate-300 mb-1">OG Title</label>
                            <input
                              type="text"
                              value={submoduleForm.ogTitle}
                              onChange={e => setSubmoduleForm({ ...submoduleForm, ogTitle: e.target.value })}
                              placeholder="OG title..."
                              className="w-full border border-brand-border dark:border-slate-750 bg-brand-surface dark:bg-slate-800 text-xs px-3 py-2 text-brand-text-primary dark:text-slate-100 rounded-md focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-brand-text-primary dark:text-slate-300 mb-1">OG Image URL</label>
                            <input
                              type="url"
                              value={submoduleForm.ogImageUrl}
                              onChange={e => setSubmoduleForm({ ...submoduleForm, ogImageUrl: e.target.value })}
                              placeholder="Image URL..."
                              className="w-full border border-brand-border dark:border-slate-750 bg-brand-surface dark:bg-slate-800 text-xs px-3 py-2 text-brand-text-primary dark:text-slate-100 rounded-md focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-brand-border dark:border-slate-800">
                      <Button onClick={() => setSubmoduleFormOpen(null)} variant="outline" size="sm">Cancel</Button>
                      <Button onClick={handleSaveSubmodule} size="sm" className="bg-accent-teal text-white flex items-center gap-1.5">
                        <Save className="h-3.5 w-3.5" /> Save Submodule
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Submodule Learning Content Block Editor View (cyrriculamcontent.html layout) */
        <div className="flex-1 flex flex-col bg-brand-surface dark:bg-slate-950/40 px-12 py-8 overflow-y-auto scrollbar-thin">
          <div className="max-w-4xl mx-auto w-full space-y-6">
            
            {/* Submodule Header Details exactly matching cyrriculamcontent.html */}
            <div className="flex items-start justify-between gap-6 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#6c1d5f18' }}
                  >
                    <FileText className="h-[17px] w-[17px] text-brand-primary" />
                  </div>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <h1 className="border-b-2 border-brand-primary text-2xl font-bold text-brand-text-primary dark:text-slate-100 font-headings leading-tight">
                      {activeSubmodule?.title}
                    </h1>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-12 text-xs text-brand-text-secondary dark:text-slate-450">
                  <span className="flex items-center gap-1.5 font-mono">
                    <span className="font-semibold text-brand-text-secondary dark:text-slate-400">slug:</span>
                    /{activeSubmodule?.slug}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full inline-block bg-brand-success"></span>
                    <span className="text-brand-success font-semibold">Active</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 opacity-60" />
                    <span>{activeSubmodule?.contents?.length || 0} blocks</span>
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setActiveView('modules_submodules');
                    setContentFormOpen(null);
                  }}
                  className="flex items-center gap-2 border-brand-border dark:border-slate-800 text-brand-text-secondary hover:bg-brand-surface"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </Button>
                <Button
                  onClick={handleSaveContent}
                  disabled={!contentFormOpen}
                  size="sm"
                  className="bg-brand-success hover:bg-brand-success-dark text-white font-semibold flex items-center gap-2"
                >
                  <Save className="h-3.5 w-3.5" /> Save All
                </Button>
              </div>
            </div>

            <div className="border-b border-brand-border dark:border-slate-800 mb-6 ml-12"></div>

            {/* List of Content blocks inside this submodule */}
            <div className="space-y-2">
              {(!activeSubmodule?.contents || activeSubmodule.contents.length === 0) ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 rounded-xl p-8">
                  <UploadCloud className="h-8 w-8 text-brand-text-secondary mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-bold text-brand-text-primary dark:text-slate-200">No content blocks yet</p>
                  <p className="text-xs text-brand-text-secondary dark:text-slate-450 mt-1 max-w-sm mx-auto">
                    Create headings, code snippets, videos, tables or callouts below.
                  </p>
                </div>
              ) : (
                [...(activeSubmodule.contents || [])]
                  .sort((a, b) => (a.contentOrder || 0) - (b.contentOrder || 0))
                  .map((item, idx) => {
                    const blockCfg = blockTypesConfig[item.type] || { label: item.type, color: '#6b7280', bg: '#6b728012' };

                    return (
                      <div 
                        key={item.id} 
                        draggable="true"
                        onDragStart={(e) => handleContentDragStart(e, idx)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleContentDrop(e, idx)}
                        className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 rounded-xl px-4 py-3.5 shadow-sm group hover:border-brand-primary cursor-grab active:cursor-grabbing transition-all"
                      >
                        <div className="flex flex-col gap-0.5 shrink-0 text-brand-text-secondary dark:text-slate-500 opacity-60">
                          <button onClick={() => handleMoveContent(item, 'up')} className="hover:text-brand-primary"><ChevronUp className="h-2.5 w-2.5" /></button>
                          <GripVertical className="h-3.5 w-3.5 mx-auto" />
                          <button onClick={() => handleMoveContent(item, 'down')} className="hover:text-brand-primary"><ChevronDown className="h-2.5 w-2.5" /></button>
                        </div>
                        <span 
                          className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white shrink-0 capitalize select-none"
                          style={{ backgroundColor: blockCfg.color }}
                        >
                          {item.type === 'notes' ? 'text' : item.type}
                        </span>
                        <div 
                          className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 border border-brand-border dark:border-slate-700 bg-brand-surface dark:bg-slate-800 text-brand-text-secondary"
                        >
                          {idx + 1}
                        </div>
                        <span className="flex-1 text-sm font-semibold text-brand-text-primary dark:text-slate-200 truncate min-w-0">
                          {item.type === 'heading' ? item.title : (item.text || item.title || item.fileUrl)}
                        </span>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleContentStatus(item)}
                              className={cn(
                                "w-8 h-4 rounded-full px-0.5 flex items-center transition-colors duration-200",
                                item.status === 'published' ? "bg-brand-success" : "bg-brand-border dark:bg-slate-700"
                              )}
                            >
                              <div className={cn("w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200", item.status === 'published' && "translate-x-4")} />
                            </button>
                            <span className="text-xs font-medium text-brand-text-secondary dark:text-slate-400">
                              {item.status === 'published' ? 'Active' : 'Draft'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleOpenEditContent(item)}
                            className="w-7 h-7 rounded-md border border-brand-border dark:border-slate-750 bg-white dark:bg-slate-800 hover:bg-brand-surface dark:hover:bg-slate-755 flex items-center justify-center text-brand-primary"
                            title="Edit content block"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick({ type: 'content', id: item.id, moduleId: activeModuleId, submoduleId: activeSubmoduleId })}
                            className="w-7 h-7 rounded-md border border-brand-border dark:border-slate-755 bg-white dark:bg-slate-800 hover:bg-brand-surface dark:hover:bg-slate-755 flex items-center justify-center text-accent-orange"
                            title="Delete block"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Quick block addition triggers (renders above inline editor) */}
            <div className="border-2 border-dashed rounded-xl px-4 py-4 flex items-center justify-center border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-brand-text-secondary dark:text-slate-400">Quick Add:</span>
                {['heading', 'text', 'code', 'video', 'pdf', 'ppt', 'image', 'callout', 'table'].map(t => (
                  <button
                    key={t}
                    onClick={() => handleOpenAddContent(t)}
                    className="text-xs px-3 py-1.5 rounded-full border border-brand-border dark:border-slate-700 bg-brand-surface dark:bg-slate-800 font-semibold text-brand-text-primary dark:text-slate-200 hover:bg-brand-primary hover:text-white dark:hover:bg-brand-primary transition-all capitalize"
                  >
                    + {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Inline Content Block Editor Form exactly matching cyrriculamcontent.html */}
            {contentFormOpen && (
              <div
                className="bg-card rounded-2xl border border-brand-border dark:border-slate-800 overflow-hidden shadow-card"
                style={{ borderTop: `3px solid ${currentTypeColor}` }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border dark:border-slate-850">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full text-white capitalize"
                      style={{ backgroundColor: currentTypeColor }}
                    >
                      {contentForm.type}
                    </span>
                    <span className="text-base font-bold text-brand-text-primary dark:text-slate-100">
                      {contentFormOpen === 'edit' ? 'Edit Content Block' : 'Add Content Block'}
                    </span>
                    <span className="text-xs text-brand-text-secondary dark:text-slate-400 px-2 py-0.5 rounded-full bg-brand-surface dark:bg-slate-800 border border-brand-border dark:border-slate-700">
                      order: {contentForm.contentOrder}
                    </span>
                  </div>
                  <button onClick={() => setContentFormOpen(null)} className="text-brand-text-secondary dark:text-slate-400 hover:text-brand-text-primary">
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Block type pill list selector */}
                <div className="px-6 pt-5 pb-4 border-b border-brand-border dark:border-slate-850">
                  <div className="text-xs font-semibold text-brand-text-secondary dark:text-slate-400 mb-3 uppercase tracking-wider">
                    Block Type
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {['heading', 'text', 'callout', 'code', 'video', 'pdf', 'ppt', 'image', 'table'].map(t => {
                      const isActive = contentForm.type === t;
                      const cfg = blockTypesConfig[t] || { color: '#6b7280' };
                      return (
                        <button
                          key={t}
                          onClick={() => setContentForm(prev => ({ 
                            ...prev, 
                            type: t, 
                            title: t === 'heading' ? 'Your Heading Here' : '',
                            markdown: '',
                            code: ''
                          }))}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold border transition-all"
                          style={{
                            backgroundColor: isActive ? cfg.color : 'transparent',
                            color: isActive ? '#fff' : '#5a5a5a',
                            borderColor: isActive ? cfg.color : '#dadcea'
                          }}
                        >
                          <span className="capitalize">{t}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form fields based on selected type */}
                <div className="px-6 py-5 space-y-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-brand-text-secondary dark:text-slate-400">Submodule</span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-surface dark:bg-slate-800 border border-brand-border dark:border-slate-700 text-brand-text-secondary dark:text-slate-400">
                      <span>📄</span>
                      <span>{activeSubmodule?.title}</span>
                      <Lock className="h-2.5 w-2.5 text-brand-text-secondary/40" />
                    </span>
                  </div>

                  {/* 1. Heading Type */}
                  {contentForm.type === 'heading' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                            Heading Text <span className="text-accent-orange">*</span>
                            <span className="ml-1 text-xs font-normal text-brand-text-secondary">max 300</span>
                          </label>
                          <input
                            type="text"
                            value={contentForm.title}
                            onChange={e => setContentForm(prev => ({ ...prev, title: e.target.value.slice(0, 300) }))}
                            placeholder="Enter heading text..."
                            className="w-full border-l-3 border-brand-primary border border-brand-border dark:border-slate-700 rounded-md px-4 py-2.5 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary dark:text-slate-100 focus:outline-none"
                            style={{ borderLeftColor: currentTypeColor }}
                          />
                          <div className="text-right text-[10px] text-brand-text-secondary mt-1">
                            {contentForm.title.length}/300
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                            Heading Level <span className="text-xs font-normal text-brand-text-secondary">default 2</span>
                          </label>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5, 6].map(lvl => {
                              const isLvlActive = contentForm.headingLevel === lvl;
                              return (
                                <button
                                  key={lvl}
                                  onClick={() => setContentForm(prev => ({ ...prev, headingLevel: lvl }))}
                                  className="w-10 h-10 rounded-lg text-sm font-bold border transition-colors"
                                  style={{
                                    backgroundColor: isLvlActive ? '#6c1d5f' : 'transparent',
                                    color: isLvlActive ? '#fff' : '#5a5a5a',
                                    borderColor: isLvlActive ? '#6c1d5f' : '#dadcea'
                                  }}
                                >
                                  H{lvl}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      {/* Live Heading Preview */}
                      <div className="rounded-xl border border-brand-border dark:border-slate-800 p-5 bg-brand-surface dark:bg-slate-800/40">
                        <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-brand-text-secondary uppercase">
                          <span>👁️</span>
                          <span>Preview</span>
                        </div>
                        <div className="text-brand-text-primary dark:text-slate-100 font-headings font-bold">
                          {contentForm.headingLevel === 1 && <h1 className="text-3xl">{contentForm.title || 'Your Heading Here'}</h1>}
                          {contentForm.headingLevel === 2 && <h2 className="text-2xl">{contentForm.title || 'Your Heading Here'}</h2>}
                          {contentForm.headingLevel === 3 && <h3 className="text-xl">{contentForm.title || 'Your Heading Here'}</h3>}
                          {contentForm.headingLevel === 4 && <h4 className="text-lg">{contentForm.title || 'Your Heading Here'}</h4>}
                          {contentForm.headingLevel === 5 && <h5 className="text-base">{contentForm.title || 'Your Heading Here'}</h5>}
                          {contentForm.headingLevel === 6 && <h6 className="text-sm">{contentForm.title || 'Your Heading Here'}</h6>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. Text Type */}
                  {contentForm.type === 'text' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                        Text Content <span className="text-accent-orange">*</span>
                      </label>
                      <textarea
                        value={contentForm.markdown}
                        onChange={e => setContentForm(prev => ({ ...prev, markdown: e.target.value }))}
                        placeholder="Enter paragraph text content..."
                        rows={4}
                        className="w-full border-l-3 border-brand-border dark:border-slate-700 border rounded-md px-4 py-3 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary dark:text-slate-200 leading-relaxed focus:outline-none"
                        style={{ borderLeftColor: currentTypeColor }}
                      />
                    </div>
                  )}

                  {/* 3. Code Type */}
                  {contentForm.type === 'code' && (
                    <div className="grid grid-cols-4 gap-4">
                      <div className="col-span-3">
                        <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                          Code <span className="text-accent-orange">*</span>
                        </label>
                        <textarea
                          value={contentForm.code}
                          onChange={e => setContentForm(prev => ({ ...prev, code: e.target.value }))}
                          placeholder="// Paste your code here..."
                          rows={4}
                          className="w-full border-l-3 border border-brand-border dark:border-slate-700 rounded-lg px-4 py-3 text-sm font-mono leading-relaxed"
                          style={{
                            backgroundColor: '#1e1b2e',
                            color: '#a9b1d6',
                            borderLeftColor: currentTypeColor
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                          Language <span className="text-xs font-normal text-brand-text-secondary">max 50</span>
                        </label>
                        <select
                          value={contentForm.language}
                          onChange={e => setContentForm(prev => ({ ...prev, language: e.target.value }))}
                          className="w-full border border-brand-border dark:border-slate-700 rounded-md px-3 py-2 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary focus:outline-none"
                        >
                          {['Java', 'Javascript', 'Python', 'Go', 'Typescript', 'SQL', 'Bash', 'HTML', 'CSS', 'JSON'].map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {['JS', 'Python', 'Java', 'SQL', 'Bash'].map(lang => {
                            const isSel = contentForm.language.toLowerCase().startsWith(lang.toLowerCase());
                            return (
                              <button
                                key={lang}
                                onClick={() => setContentForm(prev => ({ ...prev, language: lang }))}
                                className="text-[10px] px-2 py-0.5 rounded border border-brand-border dark:border-slate-700 bg-brand-surface text-brand-text-secondary font-semibold"
                                style={isSel ? { borderColor: '#4a1e47', color: '#4a1e47', backgroundColor: '#4a1e4710' } : {}}
                              >
                                {lang}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4. Video Type */}
                  {contentForm.type === 'video' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5 font-sans">
                              Video URL / Paste Link <span className="text-accent-orange">*</span>
                            </label>
                            <div 
                              className="border-l-3 border border-brand-border dark:border-slate-700 rounded-md px-4 py-2.5 bg-brand-surface dark:bg-slate-800 text-sm flex items-center gap-2 mb-2"
                              style={{ borderLeftColor: currentTypeColor }}
                            >
                              <span className="text-brand-text-secondary"><LinkIcon className="h-4 w-4" /></span>
                              <input
                                type="text"
                                value={contentForm.fileUrl}
                                onChange={e => setContentForm(prev => ({ ...prev, fileUrl: e.target.value }))}
                                placeholder="YouTube, Vimeo, or direct video URL..."
                                className="flex-1 bg-transparent text-brand-text-primary focus:outline-none"
                              />
                            </div>
                          </div>
                          
                          {/* File upload drag & drop inside Video form */}
                          <div
                            className="border border-dashed border-brand-border dark:border-slate-700 rounded-lg p-4 text-center bg-brand-surface dark:bg-slate-855 cursor-pointer hover:bg-brand-surface transition-colors"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'video/*';
                              input.onchange = (e) => {
                                const f = e.target.files[0];
                                if (f) handleInlineFileUpload(f);
                              };
                              input.click();
                            }}
                          >
                            <UploadCloud className="h-6 w-6 text-brand-text-secondary mx-auto mb-1 shrink-0" />
                            <p className="text-[11px] font-semibold text-brand-text-primary">
                              Click to upload video file from computer
                            </p>
                            <p className="text-[9px] text-brand-text-secondary/65 mt-0.5">
                              Will be saved in Cloudinary and linked here
                            </p>
                          </div>
                        </div>

                        {/* Video preview or placeholder */}
                        <div className="flex items-center justify-center rounded-xl border border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-800/40 relative overflow-hidden aspect-video">
                          {contentForm.fileUrl ? (
                            <div className="w-full h-full">
                              {getVideoPreview(contentForm.fileUrl)}
                            </div>
                          ) : (
                            <div className="text-center text-brand-text-secondary space-y-2">
                              <span className="inline-block p-3 rounded-full bg-brand-primary/10 text-brand-primary text-xl">📹</span>
                              <p className="text-xs font-semibold">Video preview will appear here</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. Image Type */}
                  {contentForm.type === 'image' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                            Image URL / Source <span className="text-accent-orange">*</span>
                          </label>
                          <div 
                            className="border-l-3 border border-brand-border dark:border-slate-700 rounded-md px-4 py-2.5 bg-brand-surface dark:bg-slate-800 text-sm flex items-center gap-2 mb-2"
                            style={{ borderLeftColor: currentTypeColor }}
                          >
                            <span className="text-brand-text-secondary">🖼️</span>
                            <input
                              type="text"
                              value={contentForm.fileUrl}
                              onChange={e => setContentForm(prev => ({ ...prev, fileUrl: e.target.value }))}
                              placeholder="https://cdn.example.com/image.png"
                              className="flex-1 bg-transparent text-brand-text-primary focus:outline-none"
                            />
                          </div>
                          {/* File upload drag & drop inside image form */}
                          <div
                            className="border border-dashed border-brand-border dark:border-slate-700 rounded-lg p-4 text-center bg-brand-surface dark:bg-slate-850 cursor-pointer"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const f = e.target.files[0];
                                if (f) handleInlineFileUpload(f);
                              };
                              input.click();
                            }}
                          >
                            <UploadCloud className="h-6 w-6 text-brand-text-secondary mx-auto mb-1 shrink-0" />
                            <p className="text-[11px] font-semibold text-brand-text-primary">Click to upload image asset</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-center rounded-xl border border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-800/40">
                          {contentForm.fileUrl ? (
                            <img src={contentForm.fileUrl} alt={contentForm.alt || "Preview"} className="max-h-[140px] rounded object-contain p-2" />
                          ) : (
                            <div className="text-center text-brand-text-secondary text-xs">
                              <span>🖼️</span>
                              <div>Live Preview</div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                            Alt text
                          </label>
                          <input
                            type="text"
                            value={contentForm.alt}
                            onChange={e => setContentForm(prev => ({ ...prev, alt: e.target.value.slice(0, 200) }))}
                            placeholder="Describe the image..."
                            className="w-full border border-brand-border dark:border-slate-700 rounded-md px-3 py-2 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                            Caption
                          </label>
                          <input
                            type="text"
                            value={contentForm.caption}
                            onChange={e => setContentForm(prev => ({ ...prev, caption: e.target.value.slice(0, 300) }))}
                            placeholder="Optional caption..."
                            className="w-full border border-brand-border dark:border-slate-700 rounded-md px-3 py-2 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 6. Callout Type */}
                  {contentForm.type === 'callout' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                            Callout Title <span className="text-accent-orange">*</span>
                          </label>
                          <input
                            type="text"
                            value={contentForm.title}
                            onChange={e => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="e.g. 💡 Pro Tip"
                            className="w-full border-l-3 border border-brand-border dark:border-slate-700 rounded-md px-3 py-2 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary focus:outline-none"
                            style={{ borderLeftColor: currentTypeColor }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                            Callout Body Text <span className="text-accent-orange">*</span>
                          </label>
                          <textarea
                            value={contentForm.markdown}
                            onChange={e => setContentForm(prev => ({ ...prev, markdown: e.target.value }))}
                            placeholder="Callout body text..."
                            rows={2}
                            className="w-full border border-brand-border dark:border-slate-700 rounded-md px-3 py-2 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Live Callout Preview */}
                      <div
                        className="rounded-xl border-l-4 px-5 py-4"
                        style={{
                          borderColor: '#01ac9f',
                          backgroundColor: '#01ac9f0a',
                          border: '1px solid #01ac9f30',
                          borderLeftWidth: '4px',
                          borderLeftColor: '#01ac9f'
                        }}
                      >
                        <div className="text-sm font-bold text-brand-text-primary dark:text-slate-200 mb-1">
                          {contentForm.title || "💡 Pro Tip"}
                        </div>
                        <div className="text-sm text-brand-text-secondary dark:text-slate-400">
                          {contentForm.markdown || "Your callout body text will appear here."}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 7. Table Type */}
                  {contentForm.type === 'table' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                          Table Text Content <span className="text-accent-orange">*</span>
                        </label>
                        <textarea
                          value={contentForm.markdown}
                          onChange={e => setContentForm(prev => ({ ...prev, markdown: e.target.value }))}
                          placeholder="| Column A | Column B |&#10;| -------- | -------- |&#10;| Value 1  | Value 2  |"
                          rows={4}
                          className="w-full border-l-3 border border-brand-border dark:border-slate-700 rounded-md px-4 py-3 font-mono text-sm leading-relaxed"
                          style={{
                            backgroundColor: '#f7f8fc',
                            color: '#5a5a5a',
                            borderLeftColor: currentTypeColor
                          }}
                        />
                        <p className="text-[11px] text-brand-text-secondary dark:text-slate-450 mt-1.5 flex items-center gap-1">
                          <span>ℹ️</span>
                          <span>Enter as JSON array or Markdown table</span>
                        </p>
                        <div className="mt-2 rounded-lg border border-brand-border dark:border-slate-800 px-4 py-3 bg-brand-surface dark:bg-slate-850 text-xs font-mono text-brand-text-secondary leading-relaxed">
                          {"// JSON example: [[\"Op\",\"Time\"],[\"Access\",\"O(1)\"],[\"Search\",\"O(n)\"]]"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PDF and PPT Content Types */}
                  {['pdf', 'ppt'].includes(contentForm.type) && (
                    <div className="space-y-4 font-sans">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5 font-sans">
                            Content Title <span className="text-accent-orange">*</span>
                          </label>
                          <input
                            type="text"
                            value={contentForm.title}
                            onChange={e => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder={contentForm.type === 'pdf' ? "e.g. Kubernetes Cheat Sheet" : "e.g. S3 Architecture Slides"}
                            className="w-full border border-brand-border dark:border-slate-750 rounded-md px-3 py-2 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5 font-sans">
                            {contentForm.type === 'pdf' ? "Page Count" : "Slide Count"}
                          </label>
                          <input
                            type="number"
                            value={contentForm.type === 'pdf' ? contentForm.pageCount : contentForm.slideCount}
                            onChange={e => {
                              const val = parseInt(e.target.value) || '';
                              if (contentForm.type === 'pdf') {
                                setContentForm(prev => ({ ...prev, pageCount: val }));
                              } else {
                                setContentForm(prev => ({ ...prev, slideCount: val }));
                              }
                            }}
                            placeholder={contentForm.type === 'pdf' ? "e.g. 8" : "e.g. 24"}
                            className="w-full border border-brand-border dark:border-slate-750 rounded-md px-3 py-2 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5 font-sans">
                            File URL <span className="text-accent-orange">*</span>
                          </label>
                          <div 
                            className="border-l-3 border border-brand-border dark:border-slate-750 rounded-md px-4 py-2.5 bg-brand-surface dark:bg-slate-800 text-sm flex items-center gap-2 mb-2"
                            style={{ borderLeftColor: currentTypeColor }}
                          >
                            <span className="text-brand-text-secondary">🔗</span>
                            <input
                              type="text"
                              value={contentForm.fileUrl}
                              onChange={e => setContentForm(prev => ({ ...prev, fileUrl: e.target.value }))}
                              placeholder="https://..."
                              className="flex-1 bg-transparent text-brand-text-primary focus:outline-none"
                            />
                          </div>
                          
                          {/* File upload drag & drop inside PDF/PPT form */}
                          <div
                            className="border border-dashed border-brand-border dark:border-slate-700 rounded-lg p-4 text-center bg-brand-surface dark:bg-slate-850 cursor-pointer"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = contentForm.type === 'pdf' ? '.pdf' : '.ppt,.pptx';
                              input.onchange = (e) => {
                                const f = e.target.files[0];
                                if (f) handleInlineFileUpload(f);
                              };
                              input.click();
                            }}
                          >
                            <UploadCloud className="h-6 w-6 text-brand-text-secondary mx-auto mb-1 shrink-0" />
                            <p className="text-[11px] font-semibold text-brand-text-primary">
                              Click to upload {contentForm.type.toUpperCase()} file
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col justify-center rounded-xl border border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-800/40 p-4">
                          <div className="text-center text-brand-text-secondary text-xs space-y-2">
                            <span className="text-2xl">{contentForm.type === 'pdf' ? "📄" : "📊"}</span>
                            <div className="font-semibold">{contentForm.type.toUpperCase()} Block Preview</div>
                            {contentForm.fileUrl ? (
                              <div className="text-[11px] break-all px-2 text-brand-primary font-mono max-h-[60px] overflow-y-auto">
                                {contentForm.fileUrl}
                              </div>
                            ) : (
                              <div className="text-[10px] text-brand-text-secondary/60">No file uploaded/linked</div>
                            )}
                            {contentForm.fileSize > 0 && (
                              <div className="text-[10px] font-semibold text-brand-text-primary">
                                Size: {(contentForm.fileSize / (1024 * 1024)).toFixed(2)} MB
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 8 & 9: PDF, ZIP and external link support using file block fields */}
                  {['notes', 'link'].includes(contentForm.type) && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                          Content Title <span className="text-accent-orange">*</span>
                        </label>
                        <input
                          type="text"
                          value={contentForm.title}
                          onChange={e => setContentForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g. Reference Documentation"
                          className="w-full border border-brand-border dark:border-slate-700 rounded-md px-3 py-2 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                          URL / Link
                        </label>
                        <input
                          type="text"
                          value={contentForm.fileUrl}
                          onChange={e => setContentForm(prev => ({ ...prev, fileUrl: e.target.value }))}
                          placeholder="https://..."
                          className="w-full border border-brand-border dark:border-slate-700 rounded-md px-3 py-2 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                          Markdown Body
                        </label>
                        <textarea
                          value={contentForm.markdown}
                          onChange={e => setContentForm(prev => ({ ...prev, markdown: e.target.value }))}
                          placeholder="Markdown body..."
                          rows={3}
                          className="w-full border border-brand-border dark:border-slate-700 rounded-md px-3 py-2 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {contentUploading && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-semibold">
                        <span>Uploading...</span>
                        <span>{contentUploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-accent-teal transition-all duration-200" style={{ width: `${contentUploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  {contentFileError && (
                    <p className="text-[10px] font-semibold text-red-500 flex items-center gap-1">
                      <span>⚠️</span> {contentFileError}
                    </p>
                  )}

                  {/* Order & Status toggles */}
                  <div className="grid grid-cols-3 gap-5 border-t border-brand-border dark:border-slate-800 pt-5">
                    <div>
                      <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                        contentOrder <span className="text-brand-text-secondary font-normal">≥ 0</span>
                      </label>
                      <input
                        type="number"
                        value={contentForm.contentOrder}
                        onChange={e => setContentForm(prev => ({ ...prev, contentOrder: parseInt(e.target.value) || 1 }))}
                        className="w-full border border-brand-border dark:border-slate-700 rounded-md px-3 py-2.5 bg-brand-surface dark:bg-slate-800 text-sm text-brand-text-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-brand-text-primary dark:text-slate-200 mb-1.5">
                        isActive <span className="text-brand-text-secondary font-normal">default ON</span>
                      </label>
                      <div className="flex items-center gap-2.5 pt-2">
                        <button
                          onClick={() => setContentForm(prev => ({ ...prev, status: prev.status === 'published' ? 'draft' : 'published' }))}
                          className={cn(
                            "w-11 h-6 rounded-full px-0.5 flex items-center transition-colors duration-200",
                            contentForm.status === 'published' ? "bg-brand-success" : "bg-brand-border dark:bg-slate-700"
                          )}
                        >
                          <div className={cn("w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200", contentForm.status === 'published' && "translate-x-5")} />
                        </button>
                        <span className={cn("text-sm font-semibold", contentForm.status === 'published' ? "text-brand-success" : "text-brand-text-secondary")}>
                          {contentForm.status === 'published' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-brand-border dark:border-slate-850">
                    <span className="text-xs text-brand-text-secondary flex items-center gap-1.5">
                      <span>ℹ️</span>
                      <span>Block will be added at position {contentForm.contentOrder}</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setContentFormOpen(null)}
                        className="px-5 py-2.5 border-brand-border"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveContent}
                        disabled={contentUploading}
                        className="px-6 py-2.5 text-white bg-brand-success hover:bg-brand-success-dark flex items-center gap-2 font-semibold"
                      >
                        <span>+</span>
                        <span>{contentForm.id ? 'Save Block' : 'Add Block'}</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation of deletion dialog */}
      <ConfirmationDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Item Confirmation"
        message="Are you sure you want to delete this element? This will permanently delete the item and all nested contents."
        confirmLabel="Delete"
      />
    </div>
  );
}


