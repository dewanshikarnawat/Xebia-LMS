import { cn } from '@/utils-lms';

const colors = {
  teal:          'bg-accent-teal text-white',
  orange:        'bg-accent-orange text-white',
  purple:        'bg-brand-primary text-white',
  plum:          'bg-brand-primary text-white',
  slate:         'bg-slate-400 text-white',
  gray:          'bg-slate-100 text-slate-600',
  amber:         'bg-amber-500 text-white',
  red:           'bg-red-500 text-white',
  green:         'bg-accent-teal text-white',
  blue:          'bg-blue-500 text-white',
  'soft-teal':   '',
  'soft-orange': '',
  'soft-purple': '',
  'soft-gray':   '',
  'soft-plum':   '',
};

/** Generic badge – kept for backward compat */
export default function Badge({ children, color = 'gray', className, dot }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        colors[color] || colors.gray,
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}

/**
 * Status badge matching the reference design.
 * active → teal pill | inactive → gray pill | published → plum pill | draft → gray pill
 */
export function CourseStatusBadge({ status }) {
  const map = {
    active:    { label: 'Active',    bg: '#01ac9f18', text: '#01ac9f' },
    inactive:  { label: 'Inactive',  bg: '#f1f1f7',   text: '#6b7280' },
    published: { label: 'Published', bg: '#6c1d5f18', text: '#6c1d5f' },
    draft:     { label: 'Draft',     bg: '#f1f1f7',   text: '#6b7280' },
    in_review: { label: 'In Review', bg: '#fef3c718', text: '#d97706' },
    archived:  { label: 'Archived',  bg: '#ff620015', text: '#ff6200' },
    completed: { label: 'Completed', bg: '#01ac9f18', text: '#01ac9f' },
  };
  const cfg = map[status] || map.draft;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
    >
      {cfg.label}
    </span>
  );
}

export function LevelBadge({ level }) {
  const map = {
    Beginner:             { bg: '#01ac9f18', text: '#01ac9f' },
    Intermediate:         { bg: '#6c1d5f18', text: '#6c1d5f' },
    Advanced:             { bg: '#ff620015', text: '#ff6200' },
    Expert:               { bg: '#f1f1f7',   text: '#6b7280' },
    'Beginner to Advanced':{ bg: '#6c1d5f18', text: '#6c1d5f' },
  };
  const s = map[level] || { bg: '#f1f1f7', text: '#6b7280' };
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {level}
    </span>
  );
}

export function CategoryBadge({ name, color = '#6c1d5f' }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: `${color}14`, color, borderColor: `${color}33` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {name}
    </span>
  );
}

