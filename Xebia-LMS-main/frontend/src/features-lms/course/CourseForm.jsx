'use client';

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useToast } from '@/hooks-lms/useToast';
import {
  BookOpen, FileText, Image as ImageIcon, Settings2, Sparkles, ArrowLeft,
  Clock, Users, Globe2, Plus, Trash2, Search, CheckCircle, Info,
  ChevronRight, Save, LayoutGrid, Cloud, GripVertical, Lock, Link2,
  AlignLeft, Upload, X, ArrowRight, PlayCircle, Video, List, Award,
} from 'lucide-react';
import { useCatalog } from '@/hooks-lms/useCatalog';
import { DIFFICULTY_LEVELS, LANGUAGES, TECHNOLOGIES } from '@/constants-lms';
import { slugify } from '@/utils-lms';
import api from '@/services-lms/api';

/* ─── colours that match the design tokens ─── */
const C = {
  primary:  '#6c1d5f',
  secondary:'#01ac9f',
  accent:   '#ff6200',
  border:   '#dadcea',
  muted:    '#f7f8fc',
  mutedFg:  '#5a5a5a',
  card:     '#ffffff',
  fg:       '#000000',
};

const EMPTY_FORM = {
  title:'', categoryId:'', technology:'Python', difficulty:'Intermediate',
  duration:'8 weeks', language:'English', shortDescription:'', description:'',
  status:'draft', logo:'', bannerImage:'', thumbnail:'',
  metaTitle:'', metaDescription:'', metaKeywords:'', canonicalUrl:'',
  primaryKeyword:'', secondaryKeywords:'', focusKeywords:'', robots:'index, follow',
  ogTitle:'', ogDescription:'', ogImage:'', ogUrl:'', ogType:'website',
  twitterTitle:'', twitterDescription:'', twitterImage:'', twitterCard:'summary_large_image',
  schemaMarkup:'', faqSchema:'', breadcrumbSchema:'',
  learningOutcomes:'[]', prerequisites:'[]', targetAudience:'[]',
  courseHighlights:'', careerOpportunities:'',
  isActive: true, isPublished: false, isFeatured: false,
  allowIndexing: true, showInSearch: true,
  enableCertificate: false, minQuizScore: '', minCourseCompletion: 100,
  assignmentRequirement: 'Optional', finalAssessmentRequirement: false,
  minAttendanceHours: '',
};

/* ─── tiny reusable helpers ─── */

function FieldLabel({ children, hint }) {
  return (
    <label className="block text-sm font-semibold mb-1.5" style={{ color: C.fg }}>
      {children}
      {hint && <span className="ml-1.5 text-xs font-normal" style={{ color: C.mutedFg }}>{hint}</span>}
    </label>
  );
}

function FieldInput({ leftAccent, value, onChange, placeholder, maxLength, type='text', readOnly, rightSlot, error }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm bg-card"
      style={{
        border: `1px solid ${error ? '#ef4444' : C.border}`,
        borderLeft: leftAccent ? `3px solid ${leftAccent}` : undefined,
      }}
    >
      <input
        type={type}
        readOnly={readOnly}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="flex-1 bg-transparent text-sm focus:outline-none focus:ring-0 outline-none"
        style={{
          color: C.fg,
          fontFamily: readOnly ? 'IBM Plex Mono, monospace' : undefined,
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
        }}
      />
      {rightSlot}
    </div>
  );
}

function FieldTextarea({ value, onChange, placeholder, rows=4, leftAccent, minHeight }) {
  return (
    <textarea
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full resize-none rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-0 outline-none leading-relaxed"
      style={{
        border: `1px solid ${C.border}`,
        borderLeft: leftAccent ? `3px solid ${leftAccent}` : undefined,
        backgroundColor: C.card,
        color: C.fg,
        minHeight,
        boxShadow: 'none',
      }}
    />
  );
}

function FieldSelect({ value, onChange, options, placeholder }) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-lg text-sm cursor-pointer"
      style={{ border: `1px solid ${C.border}`, backgroundColor: C.card }}
    >
      <div className="flex items-center gap-2">
        {options.find(o => o.value === value)?.color && (
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: options.find(o => o.value === value)?.color }} />
        )}
        <span style={{ color: value ? C.fg : C.mutedFg, fontWeight: value ? 600 : 400 }}>
          {options.find(o => String(o.value) === String(value))?.label || placeholder}
        </span>
      </div>
      <select
        value={value}
        onChange={onChange}
        className="absolute inset-0 opacity-0 cursor-pointer w-full"
      />
      <ChevronRight className="w-[13px] h-[13px] rotate-90 shrink-0" style={{ color: C.mutedFg }} />
    </div>
  );
}

/* Section card matching the design */
function Card({ title, titleIcon: Icon, titleColor='#6c1d5f', accentColor='#6c1d5f', children }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${C.border}`, borderTop: `3px solid ${accentColor}`, backgroundColor: C.card }}
    >
      <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: `1px solid ${C.border}` }}>
        {Icon && <Icon className="w-[14px] h-[14px] shrink-0" style={{ color: accentColor }} />}
        <span className="text-sm font-bold" style={{ color: C.fg }}>{title}</span>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );
}

/* Toggle pill */
function Toggle({ value, onChange, label }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl" style={{ border: `1px solid ${C.border}` }}>
      <div>
        <div className="text-sm font-bold" style={{ color: C.fg }}>{label}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className="w-11 h-6 rounded-full px-0.5 flex items-center shrink-0 ml-3 transition-colors"
        style={{ backgroundColor: value ? C.secondary : C.border }}
      >
        <div
          className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
          style={{ transform: value ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  );
}

function ensureArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
      return [parsed];
    } catch {
      if (val.trim() === '') return [];
      return [val];
    }
  }
  return [];
}

/* Precise list builder for Course Content Builders matching design */
function CourseListBuilder({
  label,
  hint,
  items,
  input,
  setInput,
  onAdd,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  placeholder,
  bulletColor,
  addButtonLabel,
  dragType
}) {
  const safeItems = ensureArray(items);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold" style={{ color: C.fg }}>{label}</label>
        {hint && <span className="text-xs" style={{ color: C.mutedFg }}>{hint}</span>}
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {safeItems.map((item, idx) => (
          <div
            key={idx}
            draggable
            onDragStart={(e) => onDragStart(e, idx, dragType)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, idx, dragType)}
            className="flex items-center gap-3 px-4 py-3 border-b border-border hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-[14px] h-[14px] shrink-0" style={{ color: '#dadcea' }} />
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: bulletColor }} />
            <span className="flex-1 text-sm text-foreground" style={{ color: C.fg }}>{item}</span>
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="shrink-0 transition-opacity opacity-60 hover:opacity-100"
            >
              <X className="w-3.5 h-3.5" style={{ color: '#5a5a5a' }} />
            </button>
          </div>
        ))}
        {/* Input box is a clean full-width field above the action button */}
        <div className="px-4 py-3 border-b border-border bg-white">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), onAdd())}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm focus:outline-none focus:ring-0 outline-none"
            style={{ color: C.fg, border: 'none', outline: 'none', boxShadow: 'none' }}
          />
        </div>
        {/* Action Add button is nested inside the bottom section */}
        <div className="px-4 py-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-colors hover:bg-white"
            style={{ color: bulletColor, borderColor: bulletColor }}
          >
            <Plus className="w-3.5 h-3.5" />
            {addButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Simple image input (url + upload to Cloudinary) */
function ImageField({ label, hint, value, onChange }) {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploadedUrl = response.data.data.url;
      onChange(uploadedUrl);
      showToast('Image uploaded successfully');
    } catch (err) {
      showToast('Image upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const isImage = value && (value.startsWith('http') || value.startsWith('/') || value.startsWith('data:') || value.startsWith('blob:'));

  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      {/* URL row */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm mb-2"
        style={{ border: `1px solid ${C.border}`, backgroundColor: C.card }}>
        <ImageIcon className="w-[13px] h-[13px] shrink-0" style={{ color: C.mutedFg }} />
        <input
          type="url"
          placeholder="https://cdn.example.com/image.jpg"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-transparent text-sm focus:outline-none"
          style={{ color: C.fg }}
        />
        {value && (
          <button type="button" onClick={() => onChange('')}>
            <X className="w-3 h-3" style={{ color: '#9ca3af' }} />
          </button>
        )}
      </div>
      {/* Upload zone / preview / uploading state */}
      {uploading ? (
        <div className="mt-1 rounded-lg flex items-center justify-center gap-2 bg-gray-50 border border-dashed border-gray-305" style={{ height: 72 }}>
          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${C.secondary} transparent ${C.secondary} ${C.secondary}` }} />
          <span className="text-xs text-gray-500">Uploading to Cloudinary...</span>
        </div>
      ) : isImage ? (
        <div className="mt-1 rounded-lg overflow-hidden relative group" style={{ border: `1px solid ${C.border}`, height: 72 }}>
          <img 
            src={(value.startsWith('/') && !value.startsWith('/uploads/')) ? `https://res.cloudinary.com${value}` : value} 
            alt="preview" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="px-2.5 py-1 bg-white rounded text-xs font-semibold text-gray-800 hover:bg-gray-100"
            >
              Replace Image
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
          className="cursor-pointer flex items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors hover:bg-gray-50"
          style={{ height: 72, backgroundColor: dragOver ? '#01ac9f08' : C.muted, borderColor: dragOver ? C.secondary : C.border }}
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
          <ImageIcon className="w-[22px] h-[22px]" style={{ color: C.border }} />
          <span className="text-xs" style={{ color: C.mutedFg }}>Drop or click to upload</span>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */
export default function CourseForm() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { courses, categories, createCourse, updateCourse, hydrated } = useCatalog();

  const isEdit = !!courseId;
  const existing = isEdit ? courses.find(c => String(c.id) === String(courseId)) : null;

  const [step, setStep]     = useState(1);
  const [form, setForm]     = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [slugLocked, setSlugLocked] = useState(true);

  // Lists
  const [outcomeInput, setOutcomeInput] = useState('');
  const [prereqInput,  setPrereqInput]  = useState('');
  const [audInput,     setAudInput]     = useState('');
  const [outcomes, setOutcomes] = useState([]);
  const [prereqs,  setPrereqs]  = useState([]);
  const [audience, setAudience] = useState([]);

  // Drag state
  const [dragIdx,  setDragIdx]  = useState(null);
  const [dragType, setDragType] = useState('');

  const slugPreview = slugLocked ? slugify(form.title || 'course') : (form.slug || slugify(form.title || 'course'));
  const categoryObj = categories.find(c => String(c.id) === String(form.categoryId));
  const categoryColor = categoryObj?.color || C.primary;
  const categoryName  = categoryObj?.name  || '—';

  useEffect(() => {
    if (existing) {
      setForm({
        ...EMPTY_FORM,
        title: existing.title || '',
        categoryId: existing.categoryId || '',
        technology: existing.technology || 'Python',
        difficulty: existing.difficulty || 'Intermediate',
        duration:   existing.duration   || '8 weeks',
        language:   existing.language   || 'English',
        status:     existing.status     || 'draft',
        shortDescription: existing.shortDescription || '',
        description: existing.description || '',
        logo:        existing.logo || existing.icon || '',
        bannerImage: existing.bannerImage || '',
        thumbnail:   existing.thumbnail || '',
        metaTitle:   existing.metaTitle || '',
        metaDescription: existing.metaDescription || '',
        metaKeywords: existing.metaKeywords || '',
        canonicalUrl: existing.canonicalUrl || '',
        primaryKeyword: existing.primaryKeyword || '',
        ogTitle: existing.ogTitle || '',
        ogDescription: existing.ogDescription || '',
        ogImage: existing.ogImage || '',
        ogType: existing.ogType || 'website',
        twitterTitle: existing.twitterTitle || '',
        twitterDescription: existing.twitterDescription || '',
        twitterImage: existing.twitterImage || '',
        twitterCard: existing.twitterCard || 'summary_large_image',
        schemaMarkup: existing.schemaMarkup || '',
        faqSchema: existing.faqSchema || '',
        breadcrumbSchema: existing.breadcrumbSchema || '',
        isActive: existing.isActive !== undefined ? existing.isActive : true,
        isPublished: existing.status === 'published',
        isFeatured: existing.isFeatured || false,
        allowIndexing: existing.allowIndexing !== undefined ? existing.allowIndexing : true,
        showInSearch: existing.showInSearch !== undefined ? existing.showInSearch : true,
        robots: existing.robots || 'index, follow',
        courseHighlights: existing.courseHighlights || '',
        careerOpportunities: existing.careerOpportunities || '',
        enableCertificate: existing.enableCertificate !== undefined ? existing.enableCertificate : false,
        minQuizScore: existing.minQuizScore !== undefined && existing.minQuizScore !== null ? existing.minQuizScore : '',
        minCourseCompletion: existing.minCourseCompletion !== undefined && existing.minCourseCompletion !== null ? existing.minCourseCompletion : 100,
        assignmentRequirement: existing.assignmentRequirement || 'Optional',
        finalAssessmentRequirement: existing.finalAssessmentRequirement !== undefined ? existing.finalAssessmentRequirement : false,
        minAttendanceHours: existing.minAttendanceHours !== undefined && existing.minAttendanceHours !== null ? existing.minAttendanceHours : '',
      });
      try { setOutcomes(JSON.parse(existing.learningOutcomes || '[]')); } catch { setOutcomes([]); }
      try { setPrereqs(JSON.parse(existing.prerequisites || '[]')); } catch { setPrereqs([]); }
      try { setAudience(JSON.parse(existing.targetAudience || '[]')); } catch { setAudience([]); }
    }
  }, [existing]);

  const setF = (patch) => setForm(prev => ({ ...prev, ...patch }));

  /* List helpers */
  const addItem = (list, setList, input, setInput, field) => {
    if (!input.trim()) return;
    const next = [...list, input.trim()];
    setList(next); setInput('');
    setF({ [field]: JSON.stringify(next) });
  };
  const removeItem = (list, setList, idx, field) => {
    const next = list.filter((_, i) => i !== idx);
    setList(next); setF({ [field]: JSON.stringify(next) });
  };
  const dragStart = (e, idx, type) => { setDragIdx(idx); setDragType(type); e.dataTransfer.effectAllowed = 'move'; };
  const dropItem = (e, targetIdx, list, setList, field, type) => {
    e.preventDefault();
    if (dragType !== type || dragIdx === null || dragIdx === targetIdx) return;
    const next = [...list];
    const [rem] = next.splice(dragIdx, 1);
    next.splice(targetIdx, 0, rem);
    setList(next); setF({ [field]: JSON.stringify(next) });
    setDragIdx(null); setDragType('');
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.categoryId)   e.categoryId = 'Category is required';
    if (!form.shortDescription.trim()) e.shortDescription = 'Short description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) { setStep(1); return; }
    try {
      const payload = { ...form, slug: slugPreview, learningOutcomes: JSON.stringify(outcomes), prerequisites: JSON.stringify(prereqs), targetAudience: JSON.stringify(audience) };
      if (isEdit) await updateCourse(existing.id, payload);
      else        await createCourse(payload);
      showToast('Course saved successfully');
      navigate('/admin/courses');
    } catch { showToast('Failed to save course', 'error'); }
  };

  if (!hydrated) return null;

  /* ── field input style shorthand ── */
  const inp = (opts = {}) => ({
    className: 'flex-1 bg-transparent focus:outline-none text-sm',
    style: { color: C.fg, ...(opts.mono ? { fontFamily: 'IBM Plex Mono, monospace' } : {}) },
  });

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: C.muted }}>

      {/* ── Breadcrumb bar ── */}
      <div className="flex items-center justify-between px-8 py-3"
        style={{ backgroundColor: C.card, borderBottom: `1px solid ${C.border}` }}>
        <nav className="flex items-center gap-2 text-sm" style={{ color: C.mutedFg }}>
          <Link to="/admin/dashboard" style={{ color: C.mutedFg }} className="hover:underline">Dashboard</Link>
          <ChevronRight className="w-[13px] h-[13px]" />
          <Link to="/admin/courses" style={{ color: C.mutedFg }} className="hover:underline">Courses</Link>
          <ChevronRight className="w-[13px] h-[13px]" />
          <span style={{ color: C.fg, fontWeight: 500 }}>{isEdit ? 'Edit' : 'Create'}</span>
        </nav>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1"
            style={{ border: `1px solid ${C.border}`, color: C.mutedFg }}>
            <Clock className="w-3 h-3" /> Draft auto-saved
          </span>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: C.primary }}>A</div>
        </div>
      </div>

      {/* ── Page title band ── */}
      <div className="flex items-center gap-4 px-8 pt-6 pb-2"
        style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.card }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#6c1d5f18' }}>
          <BookOpen className="w-[17px] h-[17px]" style={{ color: C.primary }} />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold" style={{ color: C.fg }}>
            {isEdit ? 'Edit Course' : 'Create Course'} — {step === 1 ? 'Basic Details' : 'SEO & Meta'}
          </h1>
          <p className="text-sm" style={{ color: C.mutedFg }}>
            {step === 1
              ? 'Core information, media, content builders and course settings.'
              : 'Configure meta tags, Open Graph details and search engine previews.'}
          </p>
        </div>
        {step === 1 ? (
          <button
            type="button"
            onClick={() => validate() && setStep(2)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors hover:bg-gray-50"
            style={{ border: `1px solid ${C.border}`, color: C.mutedFg, backgroundColor: C.card }}
          >
            <ArrowRight className="w-[14px] h-[14px]" /> Next: SEO &amp; Meta
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-colors hover:bg-gray-50"
            style={{ border: `1px solid ${C.border}`, color: C.mutedFg, backgroundColor: C.card }}
          >
            <ArrowLeft className="w-[14px] h-[14px]" /> Back to Details
          </button>
        )}
      </div>

      {/* ── Body: left form + right sidebar ── */}
      <div className="flex flex-1 gap-0 px-8 py-7">

        {/* LEFT */}
        <div className="flex-1 min-w-0 pr-8 space-y-6">
          {step === 1 ? (
            <>
              {/* Course Identity */}
              <Card title="Course Identity" titleIcon={Info} accentColor={C.primary}>
                {/* Title */}
                <div>
                  <FieldLabel hint="max 200">title <span style={{ color: C.accent }}>*</span></FieldLabel>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
                    style={{ border: `1px solid ${errors.title ? '#ef4444' : C.border}`, borderLeft: `3px solid ${C.primary}`, backgroundColor: C.card }}>
                    <input
                      type="text" maxLength={200}
                      placeholder="e.g. Spring Boot Masterclass"
                      value={form.title}
                      onChange={e => setF({ title: e.target.value })}
                      className="flex-1 bg-transparent focus:outline-none text-sm"
                      style={{ color: C.fg }}
                    />
                    <span className="text-xs shrink-0" style={{ color: C.mutedFg }}>{form.title.length}/200</span>
                  </div>
                  {errors.title && <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.title}</p>}
                </div>

                {/* Slug */}
                <div>
                  <FieldLabel hint="unique · max 250">slug <span style={{ color: C.accent }}>*</span></FieldLabel>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
                    style={{ border: `1px solid ${C.border}`, backgroundColor: C.card }}>
                    <Link2 className="w-[13px] h-[13px] shrink-0" style={{ color: C.mutedFg }} />
                    <span className="flex-1 font-mono text-sm" style={{ color: C.fg }}>{slugPreview}</span>
                    {form.title.trim() && (
                      <span className="flex items-center gap-1 text-xs font-semibold shrink-0" style={{ color: C.secondary }}>
                        <CheckCircle className="w-3 h-3" /> Unique
                      </span>
                    )}
                    <button type="button" onClick={() => setSlugLocked(!slugLocked)} className="shrink-0 ml-1">
                      <Lock className="w-3 h-3" style={{ color: slugLocked ? C.border : C.secondary }} />
                    </button>
                  </div>
                  <p className="text-xs mt-1" style={{ color: C.mutedFg }}>Auto-generated from title. Click lock to edit manually.</p>
                </div>

                {/* Category + Level */}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <FieldLabel>category <span style={{ color: C.accent }}>*</span></FieldLabel>
                    <div className="relative">
                      <div className="flex items-center justify-between px-4 py-3 rounded-lg text-sm"
                        style={{ border: `1px solid ${errors.categoryId ? '#ef4444' : C.border}`, backgroundColor: C.card }}>
                        <div className="flex items-center gap-2">
                          {categoryObj?.color && <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryObj.color }} />}
                          <span style={{ color: form.categoryId ? C.fg : C.mutedFg, fontWeight: form.categoryId ? 600 : 400 }}>
                            {categoryName}
                          </span>
                        </div>
                        <ChevronRight className="w-[13px] h-[13px] rotate-90 shrink-0" style={{ color: C.mutedFg }} />
                      </div>
                      <select
                        value={form.categoryId}
                        onChange={e => setF({ categoryId: e.target.value })}
                        className="absolute inset-0 opacity-0 w-full cursor-pointer"
                      >
                        <option value="">Select category</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    {errors.categoryId && <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.categoryId}</p>}
                  </div>
                  <div>
                    <FieldLabel>level</FieldLabel>
                    <div className="relative">
                      <div className="flex items-center justify-between px-4 py-3 rounded-lg text-sm"
                        style={{ border: `1px solid ${C.border}`, backgroundColor: C.card }}>
                        <span style={{ color: C.primary, fontWeight: 600 }}>{form.difficulty}</span>
                        <ChevronRight className="w-[13px] h-[13px] rotate-90 shrink-0" style={{ color: C.mutedFg }} />
                      </div>
                      <select value={form.difficulty} onChange={e => setF({ difficulty: e.target.value })}
                        className="absolute inset-0 opacity-0 w-full cursor-pointer">
                        {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Language + Duration */}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <FieldLabel hint="max 100">language</FieldLabel>
                    <div className="relative">
                      <div className="flex items-center justify-between px-4 py-3 rounded-lg text-sm"
                        style={{ border: `1px solid ${C.border}`, backgroundColor: C.card }}>
                        <span style={{ color: C.fg }}>{form.language}</span>
                        <ChevronRight className="w-[13px] h-[13px] rotate-90 shrink-0" style={{ color: C.mutedFg }} />
                      </div>
                      <select value={form.language} onChange={e => setF({ language: e.target.value })}
                        className="absolute inset-0 opacity-0 w-full cursor-pointer">
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <FieldLabel hint="max 100">duration</FieldLabel>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm"
                      style={{ border: `1px solid ${C.border}`, backgroundColor: C.card }}>
                      <input type="text" placeholder="e.g. 18 hrs, 6 weeks" value={form.duration}
                        onChange={e => setF({ duration: e.target.value })}
                        className="flex-1 bg-transparent focus:outline-none text-sm" style={{ color: C.fg }} />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Descriptions */}
              <Card title="Descriptions" titleIcon={AlignLeft} accentColor="#793b74">
                <div>
                  <FieldLabel>shortDescription</FieldLabel>
                  <textarea rows={3} placeholder="A brief summary shown in course cards and search results..."
                    value={form.shortDescription}
                    onChange={e => setF({ shortDescription: e.target.value })}
                    className="w-full resize-none rounded-lg px-4 py-3 text-sm focus:outline-none"
                    style={{ border: `1px solid ${errors.shortDescription ? '#ef4444' : C.border}`, backgroundColor: C.card, color: C.fg, minHeight: 72 }}
                  />
                  {errors.shortDescription && <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.shortDescription}</p>}
                </div>
                <div>
                  <FieldLabel><span>description</span> <span className="font-normal text-xs" style={{ color: C.mutedFg }}>(LONGTEXT)</span></FieldLabel>
                  <textarea rows={6} placeholder="Full course description — markdown supported..."
                    value={form.description}
                    onChange={e => setF({ description: e.target.value })}
                    className="w-full resize-none rounded-lg px-4 py-3 text-sm focus:outline-none leading-relaxed"
                    style={{ border: `1px solid ${C.border}`, borderLeft: `3px solid #793b74`, backgroundColor: C.card, color: C.fg, minHeight: 140 }}
                  />
                </div>
              </Card>

              {/* Media */}
              <Card title="Media" titleIcon={ImageIcon} accentColor={C.accent}>
                <div className="grid grid-cols-2 gap-5">
                  <ImageField label="icon" hint="max 1000" value={form.logo} onChange={v => setF({ logo: v })} />
                  <ImageField label="thumbnail" hint="max 1000" value={form.thumbnail} onChange={v => setF({ thumbnail: v })} />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <ImageField label="bannerImage" hint="max 1000" value={form.bannerImage} onChange={v => setF({ bannerImage: v })} />
                  <div>
                    <FieldLabel hint="max 1000">youtubeVideoUrl</FieldLabel>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm bg-card"
                      style={{ border: `1px solid ${C.border}` }}>
                      <PlayCircle className="w-[13px] h-[13px] shrink-0" style={{ color: C.accent }} />
                      <input
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={form.youtubeVideoUrl || ''}
                        onChange={e => setF({ youtubeVideoUrl: e.target.value })}
                        className="flex-1 bg-transparent text-sm focus:outline-none"
                        style={{ color: C.fg }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <FieldLabel hint="max 1000 — shown on course landing page">previewVideoUrl</FieldLabel>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm bg-card"
                    style={{ border: `1px solid ${C.border}` }}>
                    <Video className="w-[13px] h-[13px] shrink-0" style={{ color: C.mutedFg }} />
                    <input
                      type="url"
                      placeholder="Preview / trailer video URL..."
                      value={form.previewVideoUrl || ''}
                      onChange={e => setF({ previewVideoUrl: e.target.value })}
                      className="flex-1 bg-transparent text-sm focus:outline-none"
                      style={{ color: C.fg }}
                    />
                  </div>
                </div>
              </Card>

              {/* Course Content Builders */}
              <Card title="Course Content Builders" titleIcon={List} accentColor={C.secondary}>
                <CourseListBuilder
                  label="learningOutcomes"
                  hint="(LONGTEXT — JSON list)"
                  items={outcomes}
                  input={outcomeInput}
                  setInput={setOutcomeInput}
                  placeholder="Build REST APIs with Spring Boot"
                  bulletColor="#01ac9f"
                  addButtonLabel="Add Outcome"
                  dragType="outcome"
                  onAdd={() => addItem(outcomes, setOutcomes, outcomeInput, setOutcomeInput, 'learningOutcomes')}
                  onRemove={idx => removeItem(outcomes, setOutcomes, idx, 'learningOutcomes')}
                  onDragStart={(e, idx) => dragStart(e, idx, 'outcome')}
                  onDragOver={e => e.preventDefault()}
                  onDrop={(e, idx) => dropItem(e, idx, outcomes, setOutcomes, 'learningOutcomes', 'outcome')}
                />
                <CourseListBuilder
                  label="prerequisites"
                  hint="(LONGTEXT)"
                  items={prereqs}
                  input={prereqInput}
                  setInput={setPrereqInput}
                  placeholder="Basic Java knowledge"
                  bulletColor="#6c1d5f"
                  addButtonLabel="Add Prerequisite"
                  dragType="prereq"
                  onAdd={() => addItem(prereqs, setPrereqs, prereqInput, setPrereqInput, 'prerequisites')}
                  onRemove={idx => removeItem(prereqs, setPrereqs, idx, 'prerequisites')}
                  onDragStart={(e, idx) => dragStart(e, idx, 'prereq')}
                  onDragOver={e => e.preventDefault()}
                  onDrop={(e, idx) => dropItem(e, idx, prereqs, setPrereqs, 'prerequisites', 'prereq')}
                />
                <CourseListBuilder
                  label="targetAudience"
                  hint="(LONGTEXT)"
                  items={audience}
                  input={audInput}
                  setInput={setAudInput}
                  placeholder="Java developers wanting to learn Spring"
                  bulletColor="#ff6200"
                  addButtonLabel="Add Audience"
                  dragType="audience"
                  onAdd={() => addItem(audience, setAudience, audInput, setAudInput, 'targetAudience')}
                  onRemove={idx => removeItem(audience, setAudience, idx, 'targetAudience')}
                  onDragStart={(e, idx) => dragStart(e, idx, 'audience')}
                  onDragOver={e => e.preventDefault()}
                  onDrop={(e, idx) => dropItem(e, idx, audience, setAudience, 'targetAudience', 'audience')}
                />
                <div>
                  <FieldLabel hint="(LONGTEXT)">courseHighlights</FieldLabel>
                  <textarea rows={2} placeholder="Short course highlights..."
                    value={form.courseHighlights} onChange={e => setF({ courseHighlights: e.target.value })}
                    className="w-full resize-none rounded-lg px-4 py-3 text-sm focus:outline-none"
                    style={{ border: `1px solid ${C.border}`, backgroundColor: C.card, color: C.fg }} />
                </div>
                <div>
                  <FieldLabel hint="(LONGTEXT)">careerOpportunities</FieldLabel>
                  <textarea rows={2} placeholder="Describe future job scopes..."
                    value={form.careerOpportunities} onChange={e => setF({ careerOpportunities: e.target.value })}
                    className="w-full resize-none rounded-lg px-4 py-3 text-sm focus:outline-none"
                    style={{ border: `1px solid ${C.border}`, backgroundColor: C.card, color: C.fg }} />
                </div>
              </Card>

              {/* Course Flags */}
              <Card title="Course Flags" titleIcon={Settings2} accentColor="#4a1e47">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Toggle label="isActive"      value={form.isActive}      onChange={v => setF({ isActive: v })} />
                  <Toggle label="isPublished"   value={form.status === 'published'} onChange={v => setF({ status: v ? 'published' : 'draft' })} />
                  <Toggle label="isFeatured"    value={form.isFeatured}    onChange={v => setF({ isFeatured: v })} />
                  <Toggle label="allowIndexing" value={form.allowIndexing} onChange={v => setF({ allowIndexing: v })} />
                  <Toggle label="showInSearch"  value={form.showInSearch}  onChange={v => setF({ showInSearch: v })} />
                </div>
              </Card>

              {/* Certificate Criteria */}
              <Card title="Certificate Criteria" titleIcon={Award} accentColor={C.secondary}>
                <Toggle 
                  label="Enable Certificate" 
                  value={form.enableCertificate} 
                  onChange={v => setF({ enableCertificate: v })} 
                />
                
                {form.enableCertificate && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
                    <div>
                      <FieldLabel hint="e.g. 50, 70, 80">Minimum Quiz Score (%)</FieldLabel>
                      <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm bg-card"
                        style={{ border: `1px solid ${C.border}` }}>
                        <input
                          type="number"
                          placeholder="e.g. 70"
                          value={form.minQuizScore !== null && form.minQuizScore !== undefined ? form.minQuizScore : ''}
                          onChange={e => setF({ minQuizScore: e.target.value === '' ? null : Number(e.target.value) })}
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                          style={{ color: C.fg }}
                        />
                      </div>
                    </div>
                    <div>
                      <FieldLabel hint="default: 100">Minimum Course Completion (%)</FieldLabel>
                      <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm bg-card"
                        style={{ border: `1px solid ${C.border}` }}>
                        <input
                          type="number"
                          placeholder="e.g. 100"
                          value={form.minCourseCompletion !== null && form.minCourseCompletion !== undefined ? form.minCourseCompletion : 100}
                          onChange={e => setF({ minCourseCompletion: e.target.value === '' ? null : Number(e.target.value) })}
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                          style={{ color: C.fg }}
                        />
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Assignment Requirement</FieldLabel>
                      <div className="relative">
                        <div className="flex items-center justify-between px-4 py-3 rounded-lg text-sm"
                          style={{ border: `1px solid ${C.border}`, backgroundColor: C.card }}>
                          <span style={{ color: C.fg }}>{form.assignmentRequirement || 'Optional'}</span>
                          <ChevronRight className="w-[13px] h-[13px] rotate-90 shrink-0" style={{ color: C.mutedFg }} />
                        </div>
                        <select 
                          value={form.assignmentRequirement || 'Optional'} 
                          onChange={e => setF({ assignmentRequirement: e.target.value })}
                          className="absolute inset-0 opacity-0 w-full cursor-pointer"
                        >
                          <option value="Optional">Optional</option>
                          <option value="Required">Required</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <FieldLabel hint="optional (hours)">Minimum Attendance/Training Hours</FieldLabel>
                      <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm bg-card"
                        style={{ border: `1px solid ${C.border}` }}>
                        <input
                          type="number"
                          placeholder="e.g. 10"
                          value={form.minAttendanceHours !== null && form.minAttendanceHours !== undefined ? form.minAttendanceHours : ''}
                          onChange={e => setF({ minAttendanceHours: e.target.value === '' ? null : Number(e.target.value) })}
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                          style={{ color: C.fg }}
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <Toggle 
                        label="Require Final Assessment Pass (Pass/Fail)" 
                        value={form.finalAssessmentRequirement} 
                        onChange={v => setF({ finalAssessmentRequirement: v })} 
                      />
                    </div>
                  </div>
                )}
              </Card>
            </>
          ) : (
            <>
              {/* SEO Core */}
              <Card title="SEO Core Properties" titleIcon={Search} accentColor={C.secondary}>
                <div>
                  <FieldLabel hint="max 70">Meta Title</FieldLabel>
                  <FieldInput
                    maxLength={70}
                    placeholder="Master Spring Boot Core - Custom SEO Title"
                    value={form.metaTitle}
                    onChange={e => setF({ metaTitle: e.target.value })}
                    rightSlot={<span className="text-xs shrink-0" style={{ color: C.mutedFg }}>{form.metaTitle.length}/70</span>}
                  />
                </div>
                <div>
                  <FieldLabel hint="max 320">Meta Description</FieldLabel>
                  <FieldTextarea
                    rows={3}
                    placeholder="Meta descriptions snippet..."
                    value={form.metaDescription}
                    onChange={e => setF({ metaDescription: e.target.value.slice(0, 320) })}
                  />
                  <div className="text-right text-xs mt-0.5" style={{ color: C.mutedFg }}>{form.metaDescription.length}/320</div>
                </div>
                <div>
                  <FieldLabel>Canonical URL</FieldLabel>
                  <FieldInput
                    type="url"
                    placeholder="https://xebialms.com/courses/spring-boot"
                    value={form.canonicalUrl}
                    onChange={e => setF({ canonicalUrl: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <FieldLabel>Primary Focus Keyword</FieldLabel>
                    <FieldInput
                      placeholder="e.g. spring boot course"
                      value={form.primaryKeyword}
                      onChange={e => setF({ primaryKeyword: e.target.value })}
                    />
                  </div>
                  <div>
                    <FieldLabel>Meta Keywords</FieldLabel>
                    <FieldInput
                      placeholder="e.g. spring boot, java, learning"
                      value={form.metaKeywords}
                      onChange={e => setF({ metaKeywords: e.target.value })}
                    />
                  </div>
                </div>
              </Card>

              {/* Advanced SEO */}
              <Card title="Advanced SEO & Robots" titleIcon={Settings2} accentColor={C.primary}>
                <div>
                  <FieldLabel>Robots tag</FieldLabel>
                  <FieldInput
                    placeholder="index, follow"
                    value={form.robots}
                    onChange={e => setF({ robots: e.target.value })}
                  />
                </div>
              </Card>

              {/* Open Graph */}
              <Card title="Open Graph Social (og:)" titleIcon={Sparkles} accentColor={C.accent}>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <FieldLabel>OG Title</FieldLabel>
                    <FieldInput
                      placeholder="Spring Boot Masterclass"
                      value={form.ogTitle}
                      onChange={e => setF({ ogTitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <FieldLabel>OG Type</FieldLabel>
                    <FieldInput
                      placeholder="website"
                      value={form.ogType}
                      onChange={e => setF({ ogType: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>OG Description</FieldLabel>
                  <FieldTextarea
                    rows={2}
                    placeholder="Short summary..."
                    value={form.ogDescription}
                    onChange={e => setF({ ogDescription: e.target.value })}
                  />
                </div>
                <ImageField label="OG Image" value={form.ogImage} onChange={v => setF({ ogImage: v })} />
              </Card>

              {/* Twitter */}
              <Card title="Twitter/X Cards" titleIcon={Sparkles} accentColor={C.primary}>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <FieldLabel>Twitter Title</FieldLabel>
                    <FieldInput
                      placeholder="Master Spring Boot"
                      value={form.twitterTitle}
                      onChange={e => setF({ twitterTitle: e.target.value })}
                    />
                  </div>
                  <div>
                    <FieldLabel>Twitter Card Type</FieldLabel>
                    <FieldInput
                      placeholder="summary_large_image"
                      value={form.twitterCard}
                      onChange={e => setF({ twitterCard: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Twitter Description</FieldLabel>
                  <FieldTextarea
                    rows={2}
                    placeholder="Sharing snippet..."
                    value={form.twitterDescription}
                    onChange={e => setF({ twitterDescription: e.target.value })}
                  />
                </div>
                <ImageField label="Twitter Image" value={form.twitterImage} onChange={v => setF({ twitterImage: v })} />
              </Card>

              {/* Schema Markups */}
              <Card title="JSON-LD Schema Markups" titleIcon={LayoutGrid} accentColor={C.secondary}>
                {[
                  ['Local Business Schema', 'schemaMarkup'],
                  ['FAQ Schema', 'faqSchema'],
                  ['Breadcrumb Schema', 'breadcrumbSchema']
                ].map(([l, k]) => (
                  <div key={k}>
                    <FieldLabel>{l}</FieldLabel>
                    <textarea
                      rows={3}
                      placeholder="Paste JSON-LD..."
                      value={form[k]}
                      onChange={e => setF({ [k]: e.target.value })}
                      className="w-full resize-none rounded-lg px-4 py-3 text-xs font-mono focus:outline-none focus:ring-0 outline-none"
                      style={{
                        border: `1px solid ${C.border}`,
                        backgroundColor: '#1a1a2e',
                        color: '#a9b1d6',
                        boxShadow: 'none',
                        outline: 'none',
                      }}
                    />
                  </div>
                ))}
              </Card>
            </>
          )}

          {/* Footer action bar */}
          <div className="flex items-center justify-between pt-5" style={{ borderTop: `1px solid ${C.border}` }}>
            <div>
              {step === 2 && (
                <button type="button" onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-md text-sm font-semibold transition-colors hover:bg-gray-50"
                  style={{ border: `1px solid ${C.border}`, color: C.mutedFg }}>
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Details
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => navigate('/admin/courses')}
                className="px-5 py-2.5 rounded-md text-sm font-semibold transition-colors hover:bg-gray-50"
                style={{ border: `1px solid ${C.border}`, color: C.mutedFg }}>
                Cancel
              </button>
              {step === 1 ? (
                <button type="button" onClick={() => validate() && setStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90"
                  style={{ backgroundColor: C.secondary }}>
                  Next: SEO &amp; Meta <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button type="button" onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90"
                  style={{ backgroundColor: C.secondary }}>
                  <Save className="w-3.5 h-3.5" /> {isEdit ? 'Save Changes' : 'Create Course'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-72 shrink-0 space-y-5">
          {step === 1 ? (
            /* Live preview card */
            <div className="rounded-xl overflow-hidden sticky top-6"
              style={{ border: `1px solid ${C.border}`, boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
              <div className="relative aspect-video bg-gray-900 overflow-hidden">
                {form.thumbnail
                  ? <img src={form.thumbnail} alt="" className="h-full w-full object-cover opacity-90" />
                  : <div className="h-full w-full flex items-center justify-center" style={{ backgroundColor: '#f1f1f7' }}>
                      <ImageIcon className="w-10 h-10" style={{ color: C.border }} />
                    </div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white/90 flex items-center justify-center shadow overflow-hidden">
                  {form.logo
                    ? <img src={form.logo} alt="" className="w-full h-full object-contain" />
                    : <BookOpen className="w-5 h-5" style={{ color: C.primary }} />
                  }
                </div>
              </div>
              <div className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.mutedFg }}>Live Preview</p>
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                  <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
                    style={{ backgroundColor: categoryColor }}>{categoryName}</span>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ backgroundColor: form.status === 'published' ? '#01ac9f18' : '#f1f1f7', color: form.status === 'published' ? C.secondary : C.mutedFg }}>
                    {form.status === 'published' ? '● Live' : '◌ Draft'}
                  </span>
                </div>
                <h4 className="font-bold truncate" style={{ color: C.fg }}>{form.title || 'Course title'}</h4>
                <p className="mt-1 text-sm line-clamp-2" style={{ color: C.mutedFg }}>{form.shortDescription || 'Short description preview...'}</p>
                <div className="mt-3 flex items-center gap-3 text-xs pt-3" style={{ color: C.mutedFg, borderTop: `1px solid ${C.border}` }}>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{form.duration}</span>
                  <span className="flex items-center gap-1"><Globe2 className="w-3.5 h-3.5" />{form.language}</span>
                </div>
              </div>
            </div>
          ) : (
            /* SEO score + snippet */
            <div className="space-y-5 sticky top-6">
              <div className="rounded-xl p-5" style={{ border: `1px solid ${C.border}`, backgroundColor: C.card }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: C.mutedFg }}>SEO Score</p>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                    <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="transparent" stroke="#e2e8f0" strokeWidth="4" />
                      <circle cx="32" cy="32" r="28" fill="transparent" stroke={C.secondary} strokeWidth="4"
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 * (1 - (form.metaTitle ? 0.75 : 0.4))} />
                    </svg>
                    <span className="text-base font-bold" style={{ color: C.secondary }}>
                      {form.metaTitle ? '75%' : '40%'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-bold" style={{ color: C.fg }}>
                      {form.metaTitle ? 'Good Score' : 'Needs Work'}
                    </span>
                    <p className="text-xs mt-0.5" style={{ color: C.mutedFg }}>Fill meta title &amp; description for higher score.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-5 space-y-3" style={{ border: `1px solid ${C.border}`, backgroundColor: C.card }}>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: C.mutedFg }}>Google SERP Preview</p>
                <div className="p-3.5 rounded-xl" style={{ border: `1px solid ${C.border}`, backgroundColor: C.muted }}>
                  <div className="text-[11px] truncate" style={{ color: C.mutedFg }}>
                    https://xebialms.com/courses/{slugPreview}
                  </div>
                  <h3 className="text-base font-bold mt-0.5 line-clamp-1" style={{ color: '#1a0dab' }}>
                    {form.metaTitle || form.title || 'Course meta title goes here'}
                  </h3>
                  <p className="text-xs mt-1 line-clamp-2 leading-relaxed" style={{ color: '#545454' }}>
                    {form.metaDescription || form.shortDescription || 'Meta description will appear here…'}
                  </p>
                </div>
              </div>

              <div className="rounded-xl p-4" style={{ backgroundColor: '#6c1d5f08', border: `1px solid #6c1d5f20` }}>
                <p className="text-xs font-bold mb-2 flex items-center gap-1" style={{ color: C.primary }}>
                  <Sparkles className="w-3.5 h-3.5" /> SEO Checklist
                </p>
                <ul className="space-y-1.5 text-xs" style={{ color: C.mutedFg }}>
                  {[
                    ['Meta title set', !!form.metaTitle],
                    ['Meta description set', !!form.metaDescription],
                    ['Primary keyword set', !!form.primaryKeyword],
                    ['OG image set', !!form.ogImage],
                    ['Canonical URL set', !!form.canonicalUrl],
                  ].map(([label, done]) => (
                    <li key={label} className="flex items-center gap-1.5">
                      <CheckCircle className="w-3 h-3 shrink-0" style={{ color: done ? C.secondary : C.border }} />
                      <span style={{ color: done ? C.fg : C.mutedFg, fontWeight: done ? 600 : 400 }}>{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


