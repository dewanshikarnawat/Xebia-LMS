'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, ChevronDown, GripVertical, Plus,
  BookOpen, Layers, FileStack, FileText, Video, File, Presentation, FileCode, StickyNote, Image, ExternalLink
} from 'lucide-react';
import { cn } from '@/utils-lms';
import HierarchyContextMenu from './HierarchyContextMenu';

const TYPE_ICONS = {
  course: BookOpen,
  module: Layers,
  submodule: FileStack,
  content: FileText,
};

const CONTENT_TYPE_ICONS = {
  video: Video,
  pdf: File,
  ppt: Presentation,
  doc: FileCode,
  notes: StickyNote,
  image: Image,
  link: ExternalLink,
};

function SortableNode({ id, children, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style}>
      {children({ dragHandleProps: { ...attributes, ...listeners } })}
    </div>
  );
}

function HierarchyNode({
  node, level, expanded, selected, onToggle, onSelect, onContextMenu,
  dragHandleProps, onInlineRename,
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.label);
  const Icon = node.type === 'content' ? (CONTENT_TYPE_ICONS[node.contentType] || FileText) : (TYPE_ICONS[node.type] || FileText);
  const hasChildren = node.children?.length > 0;
  const isSelected = selected?.type === node.type && selected?.id === node.id;

  const handleRename = () => {
    if (editValue.trim() && editValue !== node.label) {
      onInlineRename?.(node, editValue.trim());
    }
    setEditing(false);
  };

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1 rounded-lg px-1 py-1 text-sm cursor-pointer transition-colors select-none',
          isSelected
            ? 'bg-accent-teal/10 text-accent-teal-dark dark:bg-accent-teal/20 dark:text-slate-100'
            : 'hover:bg-brand-surface dark:hover:bg-slate-800/60 text-brand-text-primary dark:text-slate-300'
        )}
        style={{ paddingLeft: `${level * 12 + 4}px` }}
        onClick={() => {
          onSelect(node);
          if (node.type === 'module' || node.type === 'course') {
            onToggle(node.id);
          }
        }}
        onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, node); }}
      >
        <button
          type="button"
          className="shrink-0 p-0.5 text-brand-text-secondary dark:text-slate-400 hover:text-brand-text-primary dark:hover:text-slate-100"
          onClick={(e) => { e.stopPropagation(); if (hasChildren) onToggle(node.id); }}
        >
          {hasChildren ? (
            expanded.has(node.id) ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
          ) : <span className="inline-block w-3.5" />}
        </button>
        {dragHandleProps && node.type !== 'course' && (
          <button type="button" className="shrink-0 cursor-grab opacity-0 group-hover:opacity-60 text-brand-text-secondary dark:text-slate-400" {...dragHandleProps}>
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        )}
        <Icon className="h-3.5 w-3.5 shrink-0 opacity-70 text-accent-teal-dark dark:text-accent-teal" />
        {editing ? (
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditing(false); }}
            className="flex-1 min-w-0 rounded border border-brand-primary bg-white dark:bg-slate-900 px-1 py-0.5 text-xs text-brand-text-primary dark:text-slate-100"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span
            className="flex-1 truncate"
            onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); setEditValue(node.label); }}
          >
            {node.label}
          </span>
        )}
        {node.type === 'content' && (
          <span className="text-[10px] uppercase text-brand-text-secondary dark:text-slate-500 mr-1 px-1 bg-brand-surface dark:bg-slate-800 rounded">
            {node.contentType}
          </span>
        )}
      </div>
      <AnimatePresence>
        {hasChildren && expanded.has(node.id) && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <SortableContext items={node.children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {node.children.map((child) => (
                <HierarchyNodeInner key={`${child.type}-${child.id}`} node={child} level={level + 1} {...{ expanded, selected, onToggle, onSelect, onContextMenu, onInlineRename }} />
              ))}
            </SortableContext>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HierarchyNodeInner(props) {
  if (props.node.type === 'module' || props.node.type === 'submodule' || props.node.type === 'content') {
    return (
      <SortableNode id={props.node.id} disabled={props.node.type === 'course'}>
        {({ dragHandleProps }) => <HierarchyNode {...props} dragHandleProps={dragHandleProps} />}
      </SortableNode>
    );
  }
  return <HierarchyNode {...props} />;
}

export default function CourseHierarchyTree({
  course,
  selected,
  onSelect,
  onAddModule,
  onAddSubmodule,
  onAddContent,
  onDelete,
  onDuplicate,
  onRename,
  onReorderModules,
  onReorderSubmodules,
  onReorderContent,
}) {
  const [expanded, setExpanded] = useState(new Set([course?.id]));
  const [contextMenu, setContextMenu] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const buildTree = useCallback(() => {
    if (!course) return null;
    return {
      id: course.id,
      type: 'course',
      label: course.title,
      children: (course.modules || []).map((mod) => ({
        id: mod.id,
        type: 'module',
        label: mod.title,
        moduleId: mod.id,
        children: (mod.submodules || []).map((sub) => ({
          id: sub.id,
          type: 'submodule',
          label: sub.title,
          moduleId: mod.id,
          submoduleId: sub.id,
          children: (sub.contents || []).map((ct) => ({
            id: ct.id,
            type: 'content',
            label: ct.title,
            contentType: ct.type,
            moduleId: mod.id,
            submoduleId: sub.id,
            contentId: ct.id,
          })),
        })),
      })),
    };
  }, [course]);

  const tree = buildTree();

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleContextMenu = (e, node) => {
    setContextMenu({ x: e.clientX, y: e.clientY, node });
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeNode = findNode(tree, active.id);
    const overNode = findNode(tree, over.id);
    if (!activeNode || !overNode || activeNode.type !== overNode.type) return;

    if (activeNode.type === 'module') {
      const ids = tree.children.map((c) => c.id);
      const oldIndex = ids.indexOf(active.id);
      const newIndex = ids.indexOf(over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = [...ids];
        reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, active.id);
        onReorderModules?.(reordered);
      }
    } else if (activeNode.type === 'submodule') {
      const parent = findParentNode(tree, active.id);
      if (parent) {
        const ids = parent.children.map((c) => c.id);
        const oldIndex = ids.indexOf(active.id);
        const newIndex = ids.indexOf(over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = [...ids];
          reordered.splice(oldIndex, 1);
          reordered.splice(newIndex, 0, active.id);
          onReorderSubmodules?.(parent.id, reordered);
        }
      }
    } else if (activeNode.type === 'content') {
      const parent = findParentNode(tree, active.id);
      const grandParent = parent ? findParentNode(tree, parent.id) : null;
      if (parent && grandParent) {
        const ids = parent.children.map((c) => c.id);
        const oldIndex = ids.indexOf(active.id);
        const newIndex = ids.indexOf(over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = [...ids];
          reordered.splice(oldIndex, 1);
          reordered.splice(newIndex, 0, active.id);
          onReorderContent?.(grandParent.id, parent.id, reordered);
        }
      }
    }
  };

  if (!tree) return null;

  const moduleIds = tree.children.map((c) => c.id);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-brand-border dark:border-slate-800">
      <div className="flex items-center justify-between px-3 py-2 border-b border-brand-border dark:border-slate-800">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-text-secondary dark:text-slate-400">Hierarchy</span>
        <button type="button" onClick={onAddModule} className="rounded-lg p-1 hover:bg-brand-surface dark:hover:bg-slate-800 text-accent-teal-dark dark:text-slate-300" title="Add Module">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={moduleIds} strategy={verticalListSortingStrategy}>
            <HierarchyNode
              node={tree}
              level={0}
              expanded={expanded}
              selected={selected}
              onToggle={toggle}
              onSelect={onSelect}
              onContextMenu={handleContextMenu}
              onInlineRename={onRename}
            />
          </SortableContext>
        </DndContext>
      </div>
      {contextMenu && (
        <HierarchyContextMenu
          position={contextMenu}
          node={contextMenu.node}
          onClose={() => setContextMenu(null)}
          onAddModule={onAddModule}
          onAddSubmodule={(node) => onAddSubmodule(node.moduleId || node.id)}
          onAddContent={(node) => onAddContent(node.moduleId, node.submoduleId || node.id)}
          onRename={(node) => onRename?.(node, node.label)}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}

function findNode(tree, id) {
  if (tree.id === id) return tree;
  for (const child of tree.children || []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

function findParentNode(tree, childId) {
  if (!tree.children) return null;
  if (tree.children.some((c) => c.id === childId)) return tree;
  for (const child of tree.children) {
    const found = findParentNode(child, childId);
    if (found) return found;
  }
  return null;
}

