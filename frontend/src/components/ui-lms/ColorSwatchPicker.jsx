'use client';

import { Check } from 'lucide-react';
import { cn } from '@/utils-lms';

export const SWATCH_PALETTE = [
  '#0EA89C', // teal
  '#0B7F76', // deep teal
  '#7C3AED', // purple
  '#F97316', // orange
  '#6C1D5F', // plum
  '#DB2777', // pink / magenta
];

export default function ColorSwatchPicker({ value, onChange, label = 'Category Color' }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-brand-text-primary dark:text-slate-200">{label}</label>}
      <div className="flex items-center gap-2.5">
        {SWATCH_PALETTE.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => onChange(hex)}
            aria-label={`Select color ${hex}`}
            className="relative h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 transition-transform hover:scale-110"
            style={{ backgroundColor: hex, '--tw-ring-color': value === hex ? hex : 'transparent' }}
          >
            {value === hex && <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />}
          </button>
        ))}
      </div>
    </div>
  );
}

