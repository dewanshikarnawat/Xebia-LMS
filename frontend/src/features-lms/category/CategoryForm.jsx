'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Plus, ChevronRight, CheckCircle, Circle, Save, Clock, Tag, Smile, Check,
  Upload, Link2, ImageIcon, X,
} from 'lucide-react';
import { useCatalog } from '@/hooks-lms/useCatalog';

/* ─── Design-token palette (matches createcategory.html) ─── */
const SWATCH_PALETTE = [
  { hex: '#6c1d5f', label: 'Plum'       },
  { hex: '#01ac9f', label: 'Teal'       },
  { hex: '#ff6200', label: 'Orange'     },
  { hex: '#84117c', label: 'Magenta'    },
  { hex: '#5c4f61', label: 'Slate'      },
  { hex: '#793b74', label: 'Violet'     },
];

const MORE_COLORS = [
  { hex: '#3b82f6', label: 'Blue' },
  { hex: '#60a5fa', label: 'Blue Light' },
  { hex: '#2563eb', label: 'Blue Dark' },
  { hex: '#0d9488', label: 'Teal' },
  { hex: '#14b8a6', label: 'Teal Light' },
  { hex: '#06b6d4', label: 'Cyan' },
  { hex: '#22d3ee', label: 'Cyan Light' },
  { hex: '#10b981', label: 'Green' },
  { hex: '#34d399', label: 'Green Light' },
  { hex: '#059669', label: 'Green Dark' },
  { hex: '#84cc16', label: 'Lime' },
  { hex: '#f97316', label: 'Orange' },
  { hex: '#fb923c', label: 'Orange Light' },
  { hex: '#f59e0b', label: 'Yellow' },
  { hex: '#facc15', label: 'Yellow Light' },
  { hex: '#ef4444', label: 'Red' },
  { hex: '#f87171', label: 'Red Light' },
  { hex: '#dc2626', label: 'Red Dark' },
  { hex: '#f43f5e', label: 'Rose' },
  { hex: '#ec4899', label: 'Pink' },
  { hex: '#f472b6', label: 'Pink Light' },
  { hex: '#d946ef', label: 'Fuchsia' },
  { hex: '#8b5cf6', label: 'Purple' },
  { hex: '#6b7280', label: 'Gray' }
];

const EMOJI_OPTIONS = [
  '💻', '🤖', '📊', '☁️', '⚙️', '🔒',
  '📱', '🎨', '💼', '🧠', '🚀', '📚',
  '🌐', '🎯', '🔬', '📐',
];

const EMPTY_FORM = {
  name:        '',
  description: '',
  status:      'active',
  icon:        '💻',
  color:       '#01AC9F',
};

/* ─── Small sub-components ──────────────────────────────── */

/** Pill toggle: Emoji | Image */
function MediaToggle({ mode, onChange }) {
  const tabs = [
    { id: 'emoji',  label: 'Emoji' },
    { id: 'upload', label: 'Image' },
  ];
  return (
    <div className="inline-flex rounded-full border p-0.5 mb-3"
      style={{ borderColor: '#dadcea', backgroundColor: '#f7f8fc' }}>
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className="px-4 py-1 rounded-full text-xs font-semibold transition-colors"
          style={
            mode === t.id
              ? { backgroundColor: '#6c1d5f', color: '#fff' }
              : { color: '#5a5a5a' }
          }
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** Emoji picker panel */
function EmojiPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="flex items-center gap-3" ref={ref}>
      {/* Preview swatch */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
        style={{ border: '1px solid #dadcea', backgroundColor: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      >
        {value && (value.startsWith('http') || value.startsWith('/') || value.startsWith('data:') || value.startsWith('blob:')) ? (
          <img src={value} alt="icon" className="w-full h-full object-cover" />
        ) : (
          value || '💻'
        )}
      </div>

      {/* Trigger input */}
      <div className="relative flex-1">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-md text-sm text-left"
          style={{ border: '1px solid #dadcea', backgroundColor: '#fff', color: '#5a5a5a' }}
        >
          <span>{value ? `${value} Selected` : 'Click to pick an emoji…'}</span>
          <Smile className="w-[15px] h-[15px] shrink-0" style={{ color: '#5a5a5a' }} />
        </button>

        {open && (
          <div
            className="absolute left-0 top-full z-20 mt-1 grid grid-cols-8 gap-1.5 p-2.5 rounded-xl shadow-lg"
            style={{ border: '1px solid #dadcea', backgroundColor: '#fff', width: '100%' }}
          >
            {EMOJI_OPTIONS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => { onChange(em); setOpen(false); }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-lg hover:bg-gray-100"
                style={value === em ? { backgroundColor: '#01ac9f18', outline: '1.5px solid #01ac9f' } : {}}
              >
                {em}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** File upload + URL picker for the icon/thumbnail */
function ImageMedia({ value, onChange }) {
  const [subTab, setSubTab] = useState('upload'); // upload | url
  const [urlInput, setUrlInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  // Determine if current value is an image URL/data URL
  const isImageValue = value && (value.startsWith('http') || value.startsWith('data:') || value.startsWith('blob:'));

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const objectUrl = URL.createObjectURL(file);
    onChange(objectUrl);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) onChange(urlInput.trim());
  };

  return (
    <div>
      {/* Sub-tab: Upload | URL */}
      <div className="flex gap-2 mb-3">
        {[{ id: 'upload', label: 'Upload File' }, { id: 'url', label: 'Paste URL' }].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border transition-colors"
            style={
              subTab === t.id
                ? { backgroundColor: '#01ac9f18', borderColor: '#01ac9f', color: '#01ac9f' }
                : { borderColor: '#dadcea', color: '#5a5a5a', backgroundColor: '#fff' }
            }
          >
            {t.id === 'upload' ? <Upload className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-start gap-3">
        {/* Preview */}
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ border: '1.5px solid #dadcea', backgroundColor: '#f7f8fc' }}
        >
          {isImageValue ? (
            <img src={value} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6" style={{ color: '#dadcea' }} />
          )}
        </div>

        {/* Right side */}
        <div className="flex-1">
          {subTab === 'upload' ? (
            /* ── Drag-and-drop zone ── */
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 transition-colors"
              style={{
                borderColor: dragOver ? '#01ac9f' : '#dadcea',
                backgroundColor: dragOver ? '#01ac9f08' : '#fafafa',
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
              <Upload className="w-5 h-5" style={{ color: dragOver ? '#01ac9f' : '#9ca3af' }} />
              <div className="text-center">
                <p className="text-xs font-semibold" style={{ color: dragOver ? '#01ac9f' : '#5a5a5a' }}>
                  Drop image here or <span style={{ color: '#6c1d5f', textDecoration: 'underline' }}>browse</span>
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>PNG, JPG, SVG, WEBP up to 5 MB</p>
              </div>
            </div>
          ) : (
            /* ── URL input ── */
            <div>
              <div
                className="flex items-center gap-2 rounded-md overflow-hidden"
                style={{ border: '1px solid #dadcea', backgroundColor: '#fff' }}
              >
                <Link2 className="w-4 h-4 ml-3 flex-shrink-0" style={{ color: '#9ca3af' }} />
                <input
                  type="url"
                  placeholder="https://cdn.example.com/icon.png"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUrlApply()}
                  className="flex-1 py-3 text-sm focus:outline-none"
                  style={{ color: '#000', backgroundColor: 'transparent' }}
                />
                {urlInput && (
                  <button
                    type="button"
                    onClick={() => setUrlInput('')}
                    className="mr-1 p-1 rounded hover:bg-gray-100"
                  >
                    <X className="w-3 h-3" style={{ color: '#9ca3af' }} />
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleUrlApply}
                className="mt-2 px-4 py-1.5 rounded-md text-xs font-semibold text-white"
                style={{ backgroundColor: '#01ac9f' }}
              >
                Apply URL
              </button>
            </div>
          )}

          {/* Clear button */}
          {isImageValue && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="mt-2 flex items-center gap-1 text-xs font-medium hover:underline"
              style={{ color: '#ef4444' }}
            >
              <X className="w-3 h-3" /> Clear image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Accent Color card (big circle + hex input + palette swatches) */
function AccentColorPicker({ value, onChange }) {
  const [hex, setHex] = useState(value?.replace('#', '') || '01AC9F');
  const [showMore, setShowMore] = useState(false);

  useEffect(() => { setHex((value || '#01AC9F').replace('#', '')); }, [value]);

  const handleHexInput = (v) => {
    setHex(v.replace('#', ''));
    if (/^[0-9a-fA-F]{6}$/.test(v.replace('#', ''))) {
      onChange('#' + v.replace('#', '').toUpperCase());
    }
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: '#000' }}>
        Accent Color
      </label>
      <div className="rounded-lg p-4" style={{ border: '1px solid #dadcea', backgroundColor: '#fff' }}>
        {/* Big preview + hex input */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full border-2 border-white flex-shrink-0"
            style={{
              backgroundColor: value || '#01AC9F',
              boxShadow: `0 0 0 2px ${value || '#01AC9F'}`,
            }}
          />
          <div
            className="flex-1 flex items-center gap-1.5 px-3 py-2 rounded-md text-sm"
            style={{ border: '1px solid #dadcea', backgroundColor: '#f7f8fc' }}
          >
            <span style={{ color: '#5a5a5a' }}>#</span>
            <input
              type="text"
              maxLength={6}
              value={hex}
              onChange={(e) => handleHexInput(e.target.value)}
              className="flex-1 bg-transparent font-mono font-medium focus:outline-none text-sm"
              style={{ color: '#000', fontFamily: 'IBM Plex Mono, monospace' }}
            />
          </div>
        </div>

        {/* Swatches */}
        <div className="flex flex-wrap items-center gap-2">
          {SWATCH_PALETTE.map((s) => (
            <button
              key={s.hex}
              type="button"
              aria-label={s.label}
              onClick={() => onChange(s.hex.toUpperCase())}
              className="w-6 h-6 rounded-full flex-shrink-0 transition-transform hover:scale-110"
              style={{
                backgroundColor: s.hex,
                boxShadow:
                  value?.toLowerCase() === s.hex.toLowerCase()
                    ? '0 0 0 2px white, 0 0 0 3.5px ' + s.hex
                    : 'none',
              }}
            />
          ))}
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="text-xs font-semibold px-2 py-1 rounded border transition-all hover:bg-gray-50 ml-1"
            style={{ borderColor: '#dadcea', color: '#5a5a5a', backgroundColor: '#fff' }}
          >
            {showMore ? 'Less' : 'More'}
          </button>
        </div>

        {showMore && (
          <div className="mt-3 grid grid-cols-6 gap-2 p-2.5 rounded-lg border bg-gray-50/50" style={{ borderColor: '#dadcea' }}>
            {MORE_COLORS.map((s) => (
              <button
                key={s.hex}
                type="button"
                aria-label={s.label}
                onClick={() => onChange(s.hex.toUpperCase())}
                className="w-6 h-6 rounded-full mx-auto transition-transform hover:scale-110"
                style={{
                  backgroundColor: s.hex,
                  boxShadow:
                    value?.toLowerCase() === s.hex.toLowerCase()
                      ? '0 0 0 2px white, 0 0 0 3px ' + s.hex
                      : 'none',
                }}
              />
            ))}
          </div>
        )}

        <p className="text-xs mt-3" style={{ color: '#5a5a5a' }}>
          Used for badges and highlights.
        </p>
      </div>
    </div>
  );
}

/** Status toggle card */
function StatusCard({ value, onChange }) {
  const isActive = value === 'active';
  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: '#000' }}>
        Status
      </label>
      <div className="rounded-lg p-4" style={{ border: '1px solid #dadcea', backgroundColor: '#fff' }}>
        {/* Toggle + label */}
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => onChange(isActive ? 'inactive' : 'active')}
            className="flex h-6 w-12 items-center rounded-full px-0.5 transition-colors"
            style={{ backgroundColor: isActive ? '#01ac9f' : '#dadcea' }}
          >
            <div
              className="h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
              style={{ transform: isActive ? 'translateX(24px)' : 'translateX(0)' }}
            />
          </button>
          <span className="text-sm font-semibold" style={{ color: isActive ? '#01ac9f' : '#5a5a5a' }}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Status badge */}
        {isActive ? (
          <div
            className="flex items-center gap-2 p-3 rounded-lg"
            style={{ backgroundColor: '#01ac9f12' }}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#01ac9f' }} />
            <span className="text-xs font-medium" style={{ color: '#01ac9f' }}>
              Visible to all learners
            </span>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 p-3 rounded-lg"
            style={{ backgroundColor: '#f7f8fc' }}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#9ca3af' }} />
            <span className="text-xs font-medium text-gray-400">Hidden from learners</span>
          </div>
        )}

        <p className="text-xs mt-3" style={{ color: '#5a5a5a' }}>
          Inactive categories won't be visible to learners.
        </p>
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────── */
export default function CategoryForm() {
  const { categoryId } = useParams();
  const navigate       = useNavigate();
  const { categories, createCategory, updateCategory, hydrated } = useCatalog();

  const isEdit   = !!categoryId;
  const existing = isEdit ? categories.find((c) => String(c.id) === String(categoryId)) : null;

  const [form,   setForm]   = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saved,  setSaved]  = useState(false);
  const [media,  setMedia]  = useState('emoji'); // emoji | url

  useEffect(() => {
    if (existing) {
      const isUrl = existing.icon && (
        existing.icon.startsWith('http') ||
        existing.icon.startsWith('/') ||
        existing.icon.startsWith('data:') ||
        existing.icon.startsWith('blob:')
      );
      setMedia(isUrl ? 'upload' : 'emoji');
      setForm({
        name:        existing.name        || '',
        description: existing.description || '',
        status:      existing.status      || 'active',
        icon:        existing.icon        || '💻',
        color:       existing.color       || '#01AC9F',
      });
    }
  }, [existing]);

  const fieldChecks = useMemo(() => [
    { label: 'Name',        done: !!form.name.trim() },
    { label: 'Icon',        done: !!form.icon },
    { label: 'Description', done: !!form.description.trim() },
    { label: 'Color',       done: !!form.color },
    { label: 'Status',      done: !!form.status },
  ], [form]);

  if (!hydrated) return null;
  if (isEdit && !existing) {
    return (
      <div className="p-10 text-center text-gray-500">
        Category not found.{' '}
        <button className="font-semibold" style={{ color: '#01ac9f' }} onClick={() => navigate('/admin/categories')}>
          Go back
        </button>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.name.trim())        e.name        = 'Name is required';
    if (!form.description.trim()) e.description = 'Description is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async (asDraft = false) => {
    if (!validate()) return;
    const payload = { ...form, status: asDraft ? 'inactive' : form.status };
    try {
      if (isEdit) await updateCategory(existing.id, payload);
      else        await createCategory(payload);
      setSaved(true);
      setTimeout(() => navigate('/admin/categories'), 1200);
    } catch { /* toast shown in useCatalog */ }
  };

  const accentColor = form.color || '#01AC9F';

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: '#f7f8fc' }}>

      {/* ── Top breadcrumb bar ──────────────────────────── */}
      <div
        className="flex items-center justify-between px-8 py-3"
        style={{ backgroundColor: '#fff', borderBottom: '1px solid #dadcea' }}
      >
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm" style={{ color: '#5a5a5a' }}>
          <Link to="/admin/dashboard" className="hover:underline" style={{ color: '#5a5a5a' }}>
            Dashboard
          </Link>
          <ChevronRight className="h-[13px] w-[13px]" />
          <Link to="/admin/categories" className="hover:underline" style={{ color: '#5a5a5a' }}>
            Categories
          </Link>
          <ChevronRight className="h-[13px] w-[13px]" />
          <span style={{ color: '#000', fontWeight: 500 }}>{isEdit ? 'Edit' : 'Create'}</span>
        </nav>

        {/* Draft badge + avatar */}
        <div className="flex items-center gap-3">
          <span
            className="flex items-center gap-1.5 text-xs rounded-full px-3 py-1"
            style={{ border: '1px solid #dadcea', color: '#5a5a5a' }}
          >
            <Clock className="w-3 h-3" />
            Draft recovered
          </span>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
            style={{ backgroundColor: '#6c1d5f' }}
          >
            A
          </div>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="flex flex-1">

        {/* ── Left: form ───────────────────────────────── */}
        <div className="flex-1 min-w-0 px-10 py-8" style={{ backgroundColor: '#f7f8fc' }}>

          {/* Page title row */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#6c1d5f18' }}
                >
                  <Tag className="w-4 h-4" style={{ color: '#6c1d5f' }} />
                </div>
                <h1 className="text-2xl font-bold" style={{ color: '#000' }}>
                  {isEdit ? 'Edit Category' : 'Create New Category'}
                </h1>
              </div>
              <p className="text-sm ml-11" style={{ color: '#5a5a5a' }}>
                Fill in the details below to set up a new learning category.
              </p>
            </div>
            {/* Xebia logo placeholder */}
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ backgroundColor: '#6c1d5f', opacity: 0.85 }}
            >
              X
            </div>
          </div>

          {/* Success banner */}
          {saved && (
            <div
              className="mb-6 flex items-center gap-3 rounded-lg px-5 py-3 text-white"
              style={{ backgroundColor: '#01ac9f' }}
            >
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">
                Category {isEdit ? 'updated' : 'created'} successfully!
              </span>
              <button
                type="button"
                className="ml-auto text-xs font-semibold opacity-80 hover:opacity-100"
                onClick={() => setSaved(false)}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ── Category Name ──────────────────────────── */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#000' }}>
              Category Name <span style={{ color: '#ff6200' }}>*</span>
            </label>
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-md text-sm"
              style={{
                border: '1px solid #dadcea',
                borderLeft: errors.name ? '3px solid #ef4444' : '3px solid #6c1d5f',
                backgroundColor: '#fff',
              }}
            >
              <input
                type="text"
                maxLength={100}
                placeholder="e.g. Web Development"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="flex-1 bg-transparent focus:outline-none text-sm"
                style={{ color: '#000' }}
              />
              {form.name.trim() && (
                <span
                  className="flex items-center gap-1 text-xs font-semibold shrink-0"
                  style={{ color: '#01ac9f' }}
                >
                  <CheckCircle className="w-[13px] h-[13px]" />
                  Unique
                </span>
              )}
            </div>
            <div className="flex justify-between mt-1.5">
              {errors.name
                ? <p className="text-xs" style={{ color: '#ef4444' }}>{errors.name}</p>
                : <span className="text-xs" style={{ color: '#5a5a5a' }}>Must be unique. Checked in real-time.</span>
              }
              <span className="text-xs" style={{ color: '#5a5a5a' }}>{form.name.length}/100</span>
            </div>
          </div>

          {/* ── Icon / Thumbnail ────────────────────────── */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#000' }}>
              Icon / Thumbnail
            </label>
            <MediaToggle mode={media} onChange={setMedia} />
            {media === 'emoji' ? (
              <EmojiPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
            ) : (
              <ImageMedia
                value={typeof form.icon === 'string' && !EMOJI_OPTIONS.includes(form.icon) ? form.icon : ''}
                onChange={(img) => setForm({ ...form, icon: img })}
              />
            )}
            <p className="text-xs mt-2" style={{ color: '#5a5a5a' }}>
              Upload a file or paste a CDN URL. Emoji or image will appear as the category thumbnail.
            </p>
          </div>

          {/* ── Description ─────────────────────────────── */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-1.5" style={{ color: '#000' }}>
              Description <span style={{ color: '#ff6200' }}>*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Describe what this category covers..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full resize-none rounded-md px-4 py-3 text-sm focus:outline-none leading-relaxed"
              style={{
                border: '1px solid #dadcea',
                borderLeft: errors.description ? '3px solid #ef4444' : '3px solid #dadcea',
                backgroundColor: '#fff',
                color: form.description ? '#000' : '#5a5a5a',
                minHeight: 108,
              }}
            />
            {errors.description && (
              <p className="mt-1 text-xs" style={{ color: '#ef4444' }}>{errors.description}</p>
            )}
            <p className="text-xs mt-1.5" style={{ color: '#5a5a5a' }}>
              No character limit. Appears in category listings and SEO previews.
            </p>
          </div>

          {/* ── Accent Color + Status side by side ──────── */}
          <div className="grid grid-cols-2 gap-5 mb-8">
            <AccentColorPicker
              value={form.color}
              onChange={(color) => setForm({ ...form, color })}
            />
            <StatusCard
              value={form.status}
              onChange={(status) => setForm({ ...form, status })}
            />
          </div>

          {/* ── Footer actions ────────────────────────────── */}
          <div
            className="flex items-center justify-between pt-5"
            style={{ borderTop: '1px solid #dadcea' }}
          >
            <span className="flex items-center gap-2 text-xs" style={{ color: '#5a5a5a' }}>
              <Save className="h-[13px] w-[13px]" />
              Auto-saved · just now
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/categories')}
                className="rounded-md px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-50"
                style={{ border: '1px solid #dadcea', color: '#5a5a5a' }}
              >
                Cancel
              </button>
              {!isEdit && (
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  className="rounded-md px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-purple-50"
                  style={{ border: '1px solid #6c1d5f', color: '#6c1d5f' }}
                >
                  Save as Draft
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSave(false)}
                className="flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: '#01ac9f' }}
              >
                <Plus className="h-[14px] w-[14px]" />
                {isEdit ? 'Save Changes' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>

        {/* ── Right: preview sidebar ───────────────────── */}
        <div
          className="w-80 shrink-0 px-7 py-8 flex flex-col gap-6"
          style={{ borderLeft: '1px solid #dadcea', backgroundColor: '#fff' }}
        >
          {/* Live Preview label */}
          <div
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: '#5a5a5a', letterSpacing: '0.1em' }}
          >
            Live Preview
          </div>

          {/* Preview card */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid #dadcea', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
          >
            {/* Color stripe */}
            <div className="h-2 w-full" style={{ backgroundColor: accentColor }} />

            {/* Card body */}
            <div
              className="px-5 pt-5 pb-4"
              style={{ background: `linear-gradient(135deg, ${accentColor}18 0%, #ffffff 60%)` }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: `${accentColor}20`, border: `1.5px solid ${accentColor}40` }}
                >
                  {form.icon && (form.icon.startsWith('http') || form.icon.startsWith('data:') || form.icon.startsWith('blob:'))
                    ? <img src={form.icon} alt="icon" className="w-full h-full object-cover" />
                    : (form.icon || '💻')
                  }
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="text-base font-bold leading-tight" style={{ color: '#000' }}>
                    {form.name || 'Category Name'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={
                        form.status === 'active'
                          ? { backgroundColor: `${accentColor}18`, color: accentColor }
                          : { backgroundColor: '#f1f1f7', color: '#6b7280' }
                      }
                    >
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: accentColor }} />
                      {form.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs leading-relaxed mt-3 line-clamp-3" style={{ color: '#5a5a5a' }}>
                {form.description || 'Learn the fundamentals of building modern web applications using industry-standard tools and best practices.'}
              </p>
              {/* Stats row */}
              <div className="flex items-center gap-3 text-xs mt-3.5" style={{ color: '#5a5a5a' }}>
                <span className="flex items-center gap-1">📖 0 Courses</span>
                <span className="flex items-center gap-1">👥 0 Learners</span>
              </div>
            </div>

            {/* Card footer */}
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ borderTop: '1px solid #dadcea', backgroundColor: '#fafafd' }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor }} />
                <span className="text-xs font-mono" style={{ color: '#5a5a5a' }}>
                  {accentColor.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Field Summary */}
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #dadcea' }}>
            <div
              className="px-4 py-3 text-xs font-semibold"
              style={{ borderBottom: '1px solid #dadcea', backgroundColor: '#fafafd', color: '#000' }}
            >
              Field Summary
            </div>
            <div>
              {fieldChecks.map((f, i) => (
                <div
                  key={f.label}
                  className="flex items-center justify-between px-4 py-2.5"
                  style={i < fieldChecks.length - 1 ? { borderBottom: '1px solid #dadcea' } : {}}
                >
                  <span className="text-xs" style={{ color: '#5a5a5a' }}>{f.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium" style={{ color: f.done ? '#000' : '#9ca3af' }}>
                      {f.done ? 'Filled' : 'Not filled'}
                    </span>
                    {f.done
                      ? <CheckCircle className="w-3 h-3" style={{ color: '#01ac9f' }} />
                      : <Circle     className="w-3 h-3" style={{ color: '#dadcea' }} />
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div
            className="rounded-lg p-4"
            style={{ backgroundColor: '#6c1d5f08', border: '1px solid #6c1d5f20' }}
          >
            <p className="text-xs font-bold mb-2 flex items-center gap-1" style={{ color: '#6c1d5f' }}>
              💡 Quick Tips
            </p>
            <ul className="space-y-1.5 text-xs" style={{ color: '#5a5a5a' }}>
              <li className="flex items-start gap-1.5"><span style={{ color: '#01ac9f' }}>→</span>Use a clear, descriptive name</li>
              <li className="flex items-start gap-1.5"><span style={{ color: '#01ac9f' }}>→</span>Pick a brand-aligned accent color</li>
              <li className="flex items-start gap-1.5"><span style={{ color: '#01ac9f' }}>→</span>Write a short SEO-friendly description</li>
              <li className="flex items-start gap-1.5"><span style={{ color: '#ff6200' }}>→</span>Keep inactive until content is ready</li>
            </ul>
          </div>


        </div>
      </div>
    </div>
  );
}

