'use client';

import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Pencil, Trash2, Globe, Clock, ChevronRight, Star } from 'lucide-react';
import { countCourseStats } from '@/utils-lms';

function StatusPill({ children, color }) {
  const colors = {
    active:    { bg: '#01ac9f18', text: '#01ac9f' },
    inactive:  { bg: '#f1f1f7',   text: '#6b7280' },
    published: { bg: '#6c1d5f18', text: '#6c1d5f' },
    draft:     { bg: '#f1f1f7',   text: '#6b7280' },
    archived:  { bg: '#ff620015', text: '#ff6200' },
  };
  const s = colors[color] || colors.draft;
  return (
    <span
      className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ backgroundColor: s.text }} />
      {children}
    </span>
  );
}

export default function CourseCard({ course, categoryName, categoryColor = '#6c1d5f', onEdit, onDelete, isCurriculumView = false }) {
  const navigate = useNavigate();
  const stats = countCourseStats(course);
  const isPublished = course.status === 'published';
  const isActive = course.status !== 'archived';

  const targetUrl = `/admin/courses/${course.id}/builder`;

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    navigate(targetUrl);
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={handleCardClick}
      className="group flex flex-col overflow-hidden rounded-xl border bg-brand-background border-brand-border h-full shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      {/* Thumbnail */}
      <Link to={targetUrl} className="relative block" style={{ aspectRatio: '16/9', backgroundColor: '#e8e8e8' }}>
        {course.thumbnail && (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            style={{ aspectRatio: '16/9' }}
          />
        )}
        {/* Featured star */}
        {(course.isFeatured || isPublished) && (
          <div
            className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full text-sm"
            style={{ backgroundColor: '#ff6200' }}
          >
            ⭐
          </div>
        )}
        {/* Tech icon bottom left */}
        <div
          className="absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center rounded-lg border bg-brand-background border-brand-border text-base shadow-sm overflow-hidden"
        >
          {(() => {
            const logoVal = course.logo || course.icon || '';
            if (logoVal) {
              if (logoVal.startsWith('http') || logoVal.startsWith('/') || logoVal.startsWith('data:') || logoVal.startsWith('blob:')) {
                const srcUrl = (logoVal.startsWith('/') && !logoVal.startsWith('/uploads/'))
                  ? `https://res.cloudinary.com${logoVal}`
                  : logoVal;
                return <img src={srcUrl} alt="icon" className="h-full w-full object-cover" />;
              }
            }
            return <span>{logoVal || '💻'}</span>;
          })()}
        </div>
      </Link>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Category + level tags */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ backgroundColor: `${categoryColor}18`, color: categoryColor }}
          >
            {categoryName}
          </span>
          <span
            className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
            style={{ backgroundColor: categoryColor }}
          >
            {course.difficulty || 'Intermediate'}
          </span>
        </div>

        {/* Title + slug */}
        <div>
          <Link
            to={targetUrl}
            className="block text-sm font-bold leading-snug text-brand-text-primary hover:underline truncate"
          >
            {course.title}
          </Link>
          <p className="mt-0.5 font-mono text-xs text-brand-text-secondary">/{course.slug}</p>
        </div>

        <div className="border-t border-brand-border" />

        {/* Meta stats */}
        <div className="flex items-center gap-4 text-xs text-brand-text-secondary">
          <span className="flex items-center gap-1.5">
            <Globe className="h-3 w-3" />
            {course.language || 'English'}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            {course.duration || '—'}
          </span>
          <span className="flex items-center gap-1.5">
            📦 {stats.moduleCount} Modules
          </span>
        </div>

        {/* Status pills + action buttons */}
        <div className="mt-auto flex items-center gap-2">
          <StatusPill color={isActive ? 'active' : 'inactive'}>
            {isActive ? 'Active' : 'Inactive'}
          </StatusPill>
          <StatusPill color={isPublished ? 'published' : 'draft'}>
            {isPublished ? 'Published' : 'Draft'}
          </StatusPill>

          {isCurriculumView ? (
            <Link
              to={`/admin/courses/${course.id}/builder`}
              className="ml-auto flex items-center gap-0.5 text-xs font-bold text-accent-teal-dark hover:underline"
            >
              Manage →
            </Link>
          ) : (
            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); onEdit(course); }}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-border bg-brand-background hover:bg-brand-surface"
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" style={{ color: '#6c1d5f' }} />
              </button>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); onDelete(course); }}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-border bg-brand-background hover:bg-red-50 dark:hover:bg-red-950/20"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" style={{ color: '#ff6200' }} />
              </button>
              <Link
                to={targetUrl}
                className="flex items-center gap-0.5 text-xs text-brand-text-secondary hover:text-brand-text-primary ml-1"
              >
                Open <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function CourseRow({ course, index, categoryName, categoryColor = '#6c1d5f', onEdit, onDelete }) {
  const isPublished = course.status === 'published';
  const isActive    = course.status !== 'archived';
  const isFeatured  = course.isFeatured || isPublished;

  return (
    <tr className="border-b border-brand-border transition-colors hover:bg-brand-surface/40">
      <td className="px-4 py-4 text-sm text-brand-text-secondary">{index}</td>
      <td className="px-4 py-4">
        <Link to={`/admin/courses/${course.id}/builder`} className="flex items-center gap-3">
          <img
            src={course.thumbnail}
            alt=""
            className="h-10 w-14 shrink-0 rounded-lg border border-brand-border bg-brand-surface object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-brand-text-primary hover:underline">{course.title}</p>
            <p className="truncate font-mono text-xs text-brand-text-secondary">{course.slug}</p>
          </div>
        </Link>
      </td>
      <td className="px-4 py-4">
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{ backgroundColor: `${categoryColor}18`, color: categoryColor }}
        >
          {categoryName}
        </span>
      </td>
      <td className="px-4 py-4">
        <span
          className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: categoryColor }}
        >
          {course.difficulty || 'Intermediate'}
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-brand-text-secondary">{course.language || 'English'}</td>
      <td className="px-4 py-4 text-sm text-brand-text-secondary">{course.duration || '—'}</td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-1.5">
          <StatusPill color={isActive ? 'active' : 'inactive'}>{isActive ? 'Active' : 'Inactive'}</StatusPill>
          <StatusPill color={isPublished ? 'published' : 'draft'}>{isPublished ? 'Published' : 'Draft'}</StatusPill>
        </div>
      </td>
      <td className="px-4 py-4">
        <Star className={`h-4 w-4 ${isFeatured ? 'fill-amber-400 text-amber-400' : 'text-brand-border'}`} />
      </td>
      <td className="px-4 py-4">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(course)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-border bg-brand-background hover:bg-brand-surface"
          >
            <Pencil className="h-3.5 w-3.5" style={{ color: '#6c1d5f' }} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(course)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-border bg-brand-background hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-3.5 w-3.5" style={{ color: '#ff6200' }} />
          </button>
        </div>
      </td>
    </tr>
  );
}

