'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, FileText, Presentation, FileImage, Link2, Download, ExternalLink, HelpCircle, CheckCircle, FileSpreadsheet, FileArchive } from 'lucide-react';
import Button from '@/components/ui-lms/Button';
import { useCatalog } from '@/hooks-lms/useCatalog';

const iconMap = {
  video: PlayCircle,
  pdf: FileText,
  ppt: Presentation,
  word: FileText,
  excel: FileSpreadsheet,
  zip: FileArchive,
  image: FileImage,
  link: Link2,
  quiz: HelpCircle,
  assignment: CheckCircle,
};

export default function StudentLearningContentPage() {
  const { courses } = useCatalog();

  // Extract all content blocks across all published courses & modules
  const allContents = useMemo(() => {
    const list = [];
    (courses || []).forEach(c => {
      (c.modules || []).forEach(m => {
        (m.submodules || []).forEach(s => {
          (s.contents || []).forEach(ct => {
            list.push({
              ...ct,
              courseTitle: c.title,
              moduleTitle: m.title,
              submoduleTitle: s.title
            });
          });
        });
      });
    });
    return list;
  }, [courses]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] p-6 lg:p-8 text-slate-800 dark:text-[#F8FAFC]">


      {allContents.length === 0 ? (
        <div className="mt-12 text-center p-12 rounded-3xl border border-dashed border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] max-w-md mx-auto">
          <FileText className="h-10 w-10 text-purple-500 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No Learning Materials Found</h3>
          <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1">
            When an Admin uploads videos, slides, or documents in the Course Builder, they will instantly appear here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {allContents.map((resource, idx) => {
            const Icon = iconMap[resource.type] || FileText;
            return (
              <motion.div
                key={resource.id || idx}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[24px] border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] p-5 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="rounded-2xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 p-3">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 dark:bg-[#111827] px-2.5 py-1 text-[10px] font-extrabold uppercase text-purple-600 dark:text-purple-400">
                      {resource.type}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900 dark:text-white line-clamp-1">{resource.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-[#CBD5E1] mt-1 line-clamp-1">{resource.courseTitle} • {resource.submoduleTitle}</p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-[#334155] flex gap-2">
                  {resource.fileUrl ? (
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-bold hover:bg-purple-700 transition-colors"
                    >
                      Open Resource <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">Text / Quiz Material</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

