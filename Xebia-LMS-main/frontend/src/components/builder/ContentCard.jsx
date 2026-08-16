'use client';

import { motion } from 'framer-motion';
import {
  Video, FileText, Presentation, FileType, StickyNote, Image, ExternalLink,
  Download, Eye, MoreHorizontal, Pencil, Trash2, Replace,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn, formatDate, formatFileSize } from '@/utils-lms';
import { CourseStatusBadge } from '@/components/ui-lms/Badge';
import Button from '@/components/ui-lms/Button';

const TYPE_ICONS = {
  video: Video,
  pdf: FileText,
  ppt: Presentation,
  doc: FileType,
  notes: StickyNote,
  image: Image,
  link: ExternalLink,
};

const TYPE_COLORS = {
  video: 'bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400',
  pdf: 'bg-orange-50 text-orange-650 dark:bg-orange-950/20 dark:text-orange-400',
  ppt: 'bg-amber-50 text-amber-650 dark:bg-amber-950/20 dark:text-amber-400',
  doc: 'bg-blue-50 text-blue-650 dark:bg-blue-950/20 dark:text-blue-400',
  notes: 'bg-purple-50 text-purple-650 dark:bg-purple-950/20 dark:text-purple-400',
  image: 'bg-green-50 text-green-650 dark:bg-green-950/20 dark:text-green-400',
  link: 'bg-cyan-50 text-cyan-650 dark:bg-cyan-950/20 dark:text-cyan-400',
};

export default function ContentCard({ content, onPreview, onEdit, onDelete, onDownload, selected, onSelect }) {
  const Icon = TYPE_ICONS[content.type] || FileText;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'group relative rounded-2xl border bg-white dark:bg-slate-900 p-4 shadow-card transition-all hover:shadow-card-hover',
        selected ? 'border-accent-teal ring-2 ring-accent-teal/20' : 'border-brand-border dark:border-slate-800'
      )}
    >
      {onSelect && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(content.id)}
          className="absolute top-3 left-3 z-15 rounded border-brand-border dark:border-slate-700 bg-white dark:bg-slate-950 text-brand-primary"
        />
      )}

      {/* Top Media Thumbnail Preview */}
      <div className="relative aspect-video rounded-lg bg-brand-surface dark:bg-slate-950 border border-brand-border dark:border-slate-800 mb-3 overflow-hidden flex items-center justify-center group/thumb">
        {content.type === 'video' ? (
          <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)]" />
            <svg viewBox="0 0 100 60" className="w-full h-full opacity-20 stroke-white p-2">
              <path d="M10 20 L40 20 M10 30 L80 30 M10 40 L60 40" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <div className="absolute h-9 w-9 rounded-full bg-red-650/95 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-all group-hover/thumb:scale-110">
              <Video className="h-4.5 w-4.5 fill-white ml-0.5" />
            </div>
          </div>
        ) : content.type === 'pdf' ? (
          <div className="relative w-full h-full flex flex-col justify-between bg-gradient-to-br from-orange-500/10 to-red-500/10 p-3">
            <FileText className="h-8 w-8 text-orange-500/80" />
            <span className="text-[10px] font-bold text-orange-650 dark:text-orange-400 uppercase tracking-widest">PDF DOCUMENT</span>
          </div>
        ) : content.type === 'ppt' ? (
          <div className="relative w-full h-full flex flex-col justify-between bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-3">
            <Presentation className="h-8 w-8 text-amber-500/80" />
            <span className="text-[10px] font-bold text-amber-650 dark:text-amber-400 uppercase tracking-widest">SLIDE SHOW</span>
          </div>
        ) : content.type === 'image' ? (
          <img src={content.fileUrl || 'https://picsum.photos/400/240'} alt="" className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300" />
        ) : content.type === 'notes' ? (
          <div className="relative w-full h-full flex flex-col justify-between bg-gradient-to-br from-purple-500/10 to-indigo-500/10 p-3">
            <StickyNote className="h-8 w-8 text-purple-500/80" />
            <span className="text-[10px] font-bold text-purple-650 dark:text-purple-400 uppercase tracking-widest font-sans">MARKDOWN NOTES</span>
          </div>
        ) : content.type === 'link' ? (
          <div className="relative w-full h-full flex flex-col justify-between bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-3">
            <ExternalLink className="h-8 w-8 text-cyan-500/80" />
            <span className="text-[9px] font-bold text-cyan-650 dark:text-cyan-400 truncate tracking-wider max-w-full">{content.fileUrl || 'EXTERNAL LINK'}</span>
          </div>
        ) : (
          <div className="relative w-full h-full flex flex-col justify-between bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-3">
            <FileType className="h-8 w-8 text-blue-500/80" />
            <span className="text-[10px] font-bold text-blue-650 dark:text-blue-400 uppercase tracking-widest">ASSIGNMENT / DOC</span>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3">
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', TYPE_COLORS[content.type])}>
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-semibold text-sm text-brand-text-primary dark:text-slate-100 truncate">{content.title}</h4>
              <p className="text-[10px] text-brand-text-secondary dark:text-slate-400 capitalize mt-0.5">{content.type}</p>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded-lg p-1 text-brand-text-secondary dark:text-slate-400 hover:bg-brand-surface dark:hover:bg-slate-800"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 py-1 shadow-card overflow-hidden">
                  <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-brand-surface dark:hover:bg-slate-850 text-brand-text-primary dark:text-slate-200" onClick={() => { onPreview(content); setMenuOpen(false); }}>
                    <Eye className="h-3.5 w-3.5" /> Preview
                  </button>
                  <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-brand-surface dark:hover:bg-slate-850 text-brand-text-primary dark:text-slate-200" onClick={() => { onEdit(content); setMenuOpen(false); }}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  {content.downloadEnabled && (
                    <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-xs hover:bg-brand-surface dark:hover:bg-slate-850 text-brand-text-primary dark:text-slate-200" onClick={() => { onDownload?.(content); setMenuOpen(false); }}>
                      <Download className="h-3.5 w-3.5" /> Download
                    </button>
                  )}
                  <button type="button" className="flex w-full items-center gap-2 px-3 py-2 text-xs text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => { onDelete(content); setMenuOpen(false); }}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] text-brand-text-secondary dark:text-slate-400">
            {content.fileSize > 0 && <span>{formatFileSize(content.fileSize)}</span>}
            {content.duration && <span>{content.duration}</span>}
            {content.pageCount && <span>{content.pageCount} pages</span>}
            {content.slideCount && <span>{content.slideCount} slides</span>}
            <CourseStatusBadge status={content.status} />
          </div>
          <p className="mt-1 text-[9px] text-brand-text-secondary dark:text-slate-400">{formatDate(content.updatedAt)}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="xs" className="w-full" onClick={() => onPreview(content)}>
          <Eye className="h-3 w-3 mr-1" /> View Preview
        </Button>
      </div>
    </motion.div>
  );
}


