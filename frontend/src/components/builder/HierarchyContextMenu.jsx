'use client';

import { useEffect, useRef } from 'react';
import { Plus, Pencil, Copy, Trash2 } from 'lucide-react';

export default function HierarchyContextMenu({
  position, node, onClose, onAddModule, onAddSubmodule, onAddContent, onRename, onDuplicate, onDelete,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const items = [];

  if (node.type === 'course') {
    items.push({ label: 'Add Module', icon: Plus, action: () => onAddModule?.() });
  }
  if (node.type === 'module') {
    items.push({ label: 'Add Submodule', icon: Plus, action: () => onAddSubmodule?.(node) });
  }
  if (node.type === 'submodule') {
    items.push({ label: 'Add Content', icon: Plus, action: () => onAddContent?.(node) });
  }
  items.push(
    { label: 'Rename', icon: Pencil, action: () => onRename?.(node) },
    { label: 'Duplicate', icon: Copy, action: () => onDuplicate?.(node) },
    { label: 'Delete', icon: Trash2, action: () => onDelete?.(node), danger: true },
  );

  return (
    <div
      ref={ref}
      className="fixed z-[60] min-w-[160px] rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 py-1 shadow-modal"
      style={{ left: position.x, top: position.y }}
    >
      {items.map(({ label, icon: Icon, action, danger }) => (
        <button
          key={label}
          type="button"
          className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-brand-surface dark:hover:bg-slate-800 text-brand-text-primary dark:text-slate-350 ${danger ? 'text-red-650 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30' : ''}`}
          onClick={() => { action(); onClose(); }}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}

