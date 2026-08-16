'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, FileText, StickyNote, Image, ExternalLink, FileType, Landmark, Calendar, User, Presentation } from 'lucide-react';
import { formatFileSize, formatDateTime } from '@/utils-lms';

export default function ContentPreviewDrawer({ content, open, onClose }) {
  if (!content) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col bg-white dark:bg-slate-900 border-l border-brand-border dark:border-slate-800 shadow-modal transition-colors duration-200"
          >
            <div className="flex items-center justify-between border-b border-brand-border dark:border-slate-800 px-5 py-4">
              <div>
                <h3 className="font-bold text-base text-brand-text-primary dark:text-slate-100">{content.title}</h3>
                <p className="text-xs text-brand-text-secondary dark:text-slate-400 capitalize mt-0.5">{content.type} File</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-brand-surface dark:hover:bg-slate-800 text-brand-text-secondary dark:text-slate-400 transition-colors"
                aria-label="Close Preview"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
              {/* Media Preview Player block */}
              <PreviewContent content={content} />
              
              {/* Metadata Details */}
              <div className="rounded-xl border border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-950 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary dark:text-slate-400">File Metadata</h4>
                <dl className="space-y-2 text-xs text-brand-text-primary dark:text-slate-200">
                  {content.fileSize > 0 && (
                    <div className="flex justify-between border-b border-brand-border/40 dark:border-slate-800/40 pb-1.5">
                      <dt className="text-brand-text-secondary dark:text-slate-400">File Size</dt>
                      <dd className="font-semibold">{formatFileSize(content.fileSize)}</dd>
                    </div>
                  )}
                  {content.duration && (
                    <div className="flex justify-between border-b border-brand-border/40 dark:border-slate-800/40 pb-1.5">
                      <dt className="text-brand-text-secondary dark:text-slate-400">Duration</dt>
                      <dd className="font-semibold">{content.duration}</dd>
                    </div>
                  )}
                  {content.pageCount && (
                    <div className="flex justify-between border-b border-brand-border/40 dark:border-slate-800/40 pb-1.5">
                      <dt className="text-brand-text-secondary dark:text-slate-400">Total Pages</dt>
                      <dd className="font-semibold">{content.pageCount} pages</dd>
                    </div>
                  )}
                  {content.slideCount && (
                    <div className="flex justify-between border-b border-brand-border/40 dark:border-slate-800/40 pb-1.5">
                      <dt className="text-brand-text-secondary dark:text-slate-400">Total Slides</dt>
                      <dd className="font-semibold">{content.slideCount} slides</dd>
                    </div>
                  )}
                  <div className="flex justify-between border-b border-brand-border/40 dark:border-slate-800/40 pb-1.5">
                    <dt className="text-brand-text-secondary dark:text-slate-400">Status</dt>
                    <dd className="font-semibold capitalize">{content.status || 'Active'}</dd>
                  </div>
                  <div className="flex justify-between border-b border-brand-border/40 dark:border-slate-800/40 pb-1.5">
                    <dt className="text-brand-text-secondary dark:text-slate-400">Uploaded By</dt>
                    <dd className="font-semibold flex items-center gap-1"><User className="h-3 w-3" /> {content.createdBy || 'Admin'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-brand-text-secondary dark:text-slate-400">Last Modified</dt>
                    <dd className="font-semibold flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDateTime(content.updatedAt)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PreviewContent({ content }) {
  switch (content.type) {
    case 'video':
      return (
        <div className="aspect-video rounded-xl bg-slate-950 flex flex-col items-center justify-center border border-brand-border dark:border-slate-800 relative group overflow-hidden">
          <Video className="h-12 w-12 text-red-500 fill-red-500/10 animate-pulse" />
          <p className="text-white/90 text-xs font-semibold mt-3">HTML5 Simulated Video Player</p>
          <p className="text-white/60 text-[10px] mt-1">Duration: {content.duration || '05:00'}</p>
          
          {/* Simulated Controls */}
          <div className="absolute bottom-0 inset-x-0 bg-black/60 px-3 py-2 flex items-center justify-between text-[10px] text-white">
            <div className="flex gap-2"><span>▶</span> <span>🔊</span></div>
            <div className="h-1 w-24 bg-white/30 rounded"><div className="h-full w-1/3 bg-red-650 rounded" /></div>
            <span>{content.duration || '05:00'}</span>
          </div>
        </div>
      );
    case 'pdf':
      return (
        <div className="rounded-xl border border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-950 p-6 text-center space-y-3">
          <FileText className="h-10 w-10 mx-auto text-orange-500" />
          <div>
            <p className="text-xs font-bold text-brand-text-primary dark:text-slate-200">PDF Technical Document Reader</p>
            <p className="text-[10px] text-brand-text-secondary dark:text-slate-400 mt-1">{content.pageCount || 10} pages · PDF Handout file</p>
          </div>
          <div className="h-24 border border-brand-border dark:border-slate-800/80 rounded bg-white dark:bg-slate-900 flex flex-col justify-center gap-1.5 p-3 text-[9px] text-brand-text-secondary pr-10">
            <div className="h-2 w-full bg-brand-border dark:bg-slate-800 rounded" />
            <div className="h-2 w-3/4 bg-brand-border dark:bg-slate-800 rounded" />
            <div className="h-2 w-5/6 bg-brand-border dark:bg-slate-800 rounded" />
          </div>
        </div>
      );
    case 'ppt':
      return (
        <div className="rounded-xl border border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-950 p-6 text-center space-y-3">
          <Presentation className="h-10 w-10 mx-auto text-amber-500" />
          <div>
            <p className="text-xs font-bold text-brand-text-primary dark:text-slate-200">Interactive Slide Deck Viewer</p>
            <p className="text-[10px] text-brand-text-secondary dark:text-slate-400 mt-1">{content.slideCount || 15} slides · PowerPoint presentation</p>
          </div>
          <div className="aspect-video border border-brand-border dark:border-slate-800 rounded bg-white dark:bg-slate-900 flex items-center justify-center p-3 relative">
            <div className="h-12 w-20 border border-dashed border-brand-border dark:border-slate-700 rounded flex items-center justify-center text-[9px]">Slide 1 of {content.slideCount || 15}</div>
            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-brand-surface dark:bg-slate-800 px-2 py-1 text-[9px]">Next</button>
          </div>
        </div>
      );
    case 'notes':
      return (
        <div className="rounded-xl border border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-950 p-4 prose prose-sm max-w-none">
          <h4 className="text-xs font-bold text-brand-text-secondary dark:text-slate-400 uppercase tracking-wider mb-2">Markdown Notes Preview</h4>
          <pre className="whitespace-pre-wrap text-xs text-brand-text-primary dark:text-slate-300 font-mono bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 rounded p-3">
            {content.markdown || '## Key Takeaways\n\n- No detailed markdown content set for this item.'}
          </pre>
        </div>
      );
    case 'image':
      return (
        <div className="rounded-xl overflow-hidden border border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-950">
          <img src={content.fileUrl || 'https://picsum.photos/600/400'} alt={content.title} className="w-full object-cover max-h-56" />
        </div>
      );
    case 'link':
      return (
        <div className="space-y-2">
          <p className="text-xs font-bold text-brand-text-secondary">External Web Resource</p>
          <a
            href={content.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl border border-brand-border dark:border-slate-800 p-4 hover:bg-brand-surface dark:hover:bg-slate-800/40 transition-colors"
          >
            <ExternalLink className="h-5 w-5 text-brand-primary dark:text-brand-secondary" />
            <span className="text-xs text-brand-primary dark:text-brand-secondary truncate font-semibold">{content.fileUrl || 'https://docs.example.com'}</span>
          </a>
        </div>
      );
    default:
      return (
        <div className="rounded-xl border border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-950 p-6 text-center space-y-2">
          <FileType className="h-10 w-10 mx-auto text-blue-500" />
          <p className="text-xs font-bold text-brand-text-primary dark:text-slate-200">Binary Document Resource</p>
          <p className="text-[10px] text-brand-text-secondary">File Size: {formatFileSize(content.fileSize)}</p>
        </div>
      );
  }
}

