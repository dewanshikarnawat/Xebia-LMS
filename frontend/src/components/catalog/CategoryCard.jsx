'use client';

import { motion } from 'framer-motion';
import { Pencil, Trash2, BookOpen, Users } from 'lucide-react';

function slugify(name) {
  return (name || 'category').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Status badge matching the design: teal for active, gray for inactive */
function StatusBadge({ status }) {
  const isActive = status === 'active';
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={
        isActive
          ? { backgroundColor: '#01ac9f18', color: '#01ac9f' }
          : { backgroundColor: '#f1f1f7', color: '#6b7280' }
      }
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

export default function CategoryCard({ category, courseCount, onEdit, onDelete, onView }) {
  const color = category.color || '#01AC9F';
  const studentCount = category.studentCount ?? Math.max((courseCount ?? 0) * 120, 0);
  const slug = slugify(category.name);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => onView(category)}
      className="group relative cursor-pointer overflow-hidden rounded-xl border bg-brand-background border-brand-border transition-shadow hover:shadow-md"
    >
      {/* Top color accent bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

      <div className="p-5">
        {/* Icon + Status badge */}
        <div className="mb-3 flex items-start justify-between">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl overflow-hidden"
            style={{
              backgroundColor: `${color}18`,
              border: `1.5px solid ${color}30`,
            }}
          >
            {category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/') || category.icon.startsWith('data:') || category.icon.startsWith('blob:')) ? (
              <img src={category.icon} alt={category.name} className="w-full h-full object-cover" />
            ) : (
              category.icon || '💻'
            )}
          </div>
          <StatusBadge status={category.deletedAt ? 'inactive' : (category.status || 'active')} />
        </div>

        {/* Name + slug */}
        <div className="mb-2">
          <p className="text-sm font-bold text-brand-text-primary">{category.name}</p>
          <p className="mt-0.5 font-mono text-xs text-brand-text-secondary">{slug}</p>
        </div>

        {/* Description */}
        <p
          className="mb-4 text-xs leading-relaxed text-brand-text-secondary"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {category.description || 'No description provided.'}
        </p>

        {/* Stats row */}
        <div className="mb-4 flex items-center gap-3 text-xs text-brand-text-secondary">
          <span className="flex items-center gap-1">
            <BookOpen className="h-2.5 w-2.5" />
            {(courseCount ?? category.courseCount ?? 0)} courses
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-2.5 w-2.5" />
            {studentCount.toLocaleString()}
          </span>
        </div>

        {/* Footer: color swatch + action buttons */}
        <div
          className="flex items-center justify-between border-t border-brand-border pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="font-mono text-xs text-brand-text-secondary">{color.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onEdit(category); }}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-border bg-brand-background transition-colors hover:bg-brand-surface"
              title="Edit"
            >
              <Pencil className="h-3 w-3" style={{ color: '#6c1d5f' }} />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(category); }}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-border bg-brand-background transition-colors hover:bg-red-50 dark:hover:bg-red-950/20"
              title="Delete"
            >
              <Trash2 className="h-3 w-3" style={{ color: '#ff6200' }} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function CategoryRow({ category, courseCount, onEdit, onDelete, onView }) {
  const color = category.color || '#01AC9F';
  const slug = slugify(category.name);

  return (
    <tr className="border-b border-brand-border transition-colors hover:bg-brand-surface/40">
      <td className="px-4 py-3">
        <button type="button" onClick={() => onView(category)} className="flex items-center gap-2.5 text-left">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl text-base overflow-hidden"
            style={{ backgroundColor: `${color}18`, border: `1.5px solid ${color}30` }}
          >
            {category.icon && (category.icon.startsWith('http') || category.icon.startsWith('/') || category.icon.startsWith('data:') || category.icon.startsWith('blob:')) ? (
              <img src={category.icon} alt={category.name} className="w-full h-full object-cover" />
            ) : (
              category.icon || '💻'
            )}
          </span>
          <div>
            <p className="text-sm font-semibold text-brand-text-primary">{category.name}</p>
            <p className="font-mono text-xs text-brand-text-secondary">{slug}</p>
          </div>
        </button>
      </td>
      <td className="max-w-xs truncate px-4 py-3 text-xs text-brand-text-secondary">{category.description}</td>
      <td className="px-4 py-3 text-sm text-brand-text-primary">{courseCount ?? 0}</td>
      <td className="px-4 py-3">
        <StatusBadge status={category.status} />
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(category)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-border bg-brand-background hover:bg-brand-surface"
          >
            <Pencil className="h-3 w-3" style={{ color: '#6c1d5f' }} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(category)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-brand-border bg-brand-background hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-3 w-3" style={{ color: '#ff6200' }} />
          </button>
        </div>
      </td>
    </tr>
  );
}
