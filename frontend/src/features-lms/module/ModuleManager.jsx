'use client';

import { useState, useEffect } from 'react';
import { Plus, GripVertical, Pencil, Copy, Trash2, Layers, FileStack } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Button from '@/components/ui-lms/Button';
import Input from '@/components/ui-lms/Input';
import TextArea from '@/components/ui-lms/TextArea';
import Toggle from '@/components/ui-lms/Toggle';
import SectionCard from '@/components/ui-lms/SectionCard';
import { CourseStatusBadge } from '@/components/ui-lms/Badge';
import { getAIPlaceholderImage } from '@/utils-lms/placeholderUtils';
import ImageUploader from '@/components/ui-lms/ImageUploader';

function SortableRow({ id, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <tr ref={setNodeRef} style={style} className="border-b border-brand-border dark:border-slate-800 hover:bg-brand-surface/40 dark:hover:bg-slate-800/40">
      <td className="px-4 py-3 cursor-grab" {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4 text-brand-text-secondary dark:text-slate-500" />
      </td>
      {children}
    </tr>
  );
}

export default function ModuleManager({ module, courseId, catalog, showToast, onSelect }) {
  const [form, setForm] = useState({ title: '', description: '', status: 'active' });
  const [errors, setErrors] = useState({});
  const [editingSub, setEditingSub] = useState(null);
  const [subForm, setSubForm] = useState({ title: '', description: '', status: 'active' });

  const course = catalog.courses?.find((c) => c.id === courseId);
  const courseTitle = course?.title || 'Course';

  useEffect(() => {
    if (module) {
      setForm({
        title: module.title || '',
        description: module.description || '',
        status: module.status || 'active',
        logo: module.logo || '',
        banner: module.banner || '',
        backgroundImage: module.backgroundImage || '',
        thumbnail: module.thumbnail || '',
      });
      setErrors({});
    }
  }, [module]);

  if (!module) return null;

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Module name is required';
    if (form.title.length > 100) e.title = 'Maximum 100 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSaveModule = () => {
    if (!validate()) return;
    catalog.updateModule(courseId, module.id, form);
    showToast('Module details updated');
  };

  const handleAddSubmodule = () => {
    catalog.addSubmodule(courseId, module.id, {
      title: 'New Submodule',
      description: 'Structured learning unit.',
    });
    showToast('Submodule created successfully');
  };

  const handleEditSubmodule = (sub) => {
    setSubForm({ title: sub.title, description: sub.description, status: sub.status });
    setEditingSub(sub.id);
  };

  const handleSaveSubmodule = () => {
    if (!subForm.title.trim()) return;
    catalog.updateSubmodule(courseId, module.id, editingSub, subForm);
    setEditingSub(null);
    showToast('Submodule updated');
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const subIds = (module.submodules || []).map((s) => s.id);
    const oldIndex = subIds.indexOf(active.id);
    const newIndex = subIds.indexOf(over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = [...subIds];
      reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, active.id);
      catalog.reorderSubmodules(courseId, module.id, reordered);
      showToast('Submodule order updated');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const submodules = module.submodules || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-brand-text-secondary dark:text-slate-400">
        <button
          type="button"
          onClick={() => onSelect?.({ type: 'course', id: courseId })}
          className="hover:text-accent-teal-dark dark:hover:text-accent-teal transition-colors"
        >
          {courseTitle}
        </button>
        <span className="text-brand-border dark:text-slate-700">/</span>
        <span className="text-brand-text-primary dark:text-slate-200 truncate max-w-[200px]">
          {module.title}
        </span>
      </div>

      {/* Module Edit Form */}
      <SectionCard icon={Layers} title="Module Settings" accent="teal">
        <div className="space-y-4">
          <Input
            label="Module Name"
            required
            maxLength={100}
            value={form.title}
            error={errors.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextArea
            label="Description"
            maxLength={500}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="border-t border-brand-border dark:border-slate-800 pt-4 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">Module Graphics & Assets</h4>
            <div className="grid gap-6 sm:grid-cols-2">
              <ImageUploader 
                label="Module Logo"
                value={form.logo} 
                onChange={(val) => setForm({ ...form, logo: val })}
                aspectRatio="square"
              />
              <ImageUploader 
                label="Module Thumbnail"
                value={form.thumbnail} 
                onChange={(val) => setForm({ ...form, thumbnail: val })}
                aspectRatio="video"
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <ImageUploader 
                label="Module Banner"
                value={form.banner} 
                onChange={(val) => setForm({ ...form, banner: val })}
                aspectRatio="banner"
              />
              <ImageUploader 
                label="Module Background Image"
                value={form.backgroundImage} 
                onChange={(val) => setForm({ ...form, backgroundImage: val })}
                aspectRatio="banner"
              />
            </div>
          </div>

          <Toggle
            label="Active"
            description="Inactive modules are hidden from learners."
            checked={form.status === 'active'}
            onChange={(checked) => setForm({ ...form, status: checked ? 'active' : 'inactive' })}
          />
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveModule}>Save Settings</Button>
          </div>
        </div>
      </SectionCard>

      {/* Submodule Section */}
      <SectionCard
        icon={FileStack}
        title="Submodules"
        subtitle="Drag rows to reorder"
        accent="purple"
        delay={0.05}
        actions={<Button size="sm" onClick={handleAddSubmodule}><Plus className="h-4 w-4" /> Add Submodule</Button>}
      >
        {submodules.length === 0 ? (
          <div className="text-center py-8 text-sm text-brand-text-secondary dark:text-slate-400 border-2 border-dashed border-brand-border dark:border-slate-800 rounded-xl">
            No submodules inside this module yet. Click Add Submodule to create one.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead className="bg-brand-surface dark:bg-slate-950 border-b border-brand-border dark:border-slate-800 text-left font-semibold">
                <tr>
                  <th className="w-10 px-4 py-3" />
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Contents</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={submodules.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    {submodules.map((sub) => {
                      const isEditing = editingSub === sub.id;
                      return (
                        <SortableRow key={sub.id} id={sub.id}>
                          <td className="px-4 py-3 font-medium">
                            {isEditing ? (
                              <input
                                autoFocus
                                value={subForm.title}
                                onChange={(e) => setSubForm({ ...subForm, title: e.target.value })}
                                className="rounded border border-brand-primary dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-brand-text-primary dark:text-slate-100"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={() => onSelect?.({ type: 'submodule', id: sub.id, moduleId: module.id })}
                                className="font-semibold text-accent-teal-dark dark:text-accent-teal hover:underline text-left transition-colors focus:outline-none"
                              >
                                {sub.title}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 text-brand-text-secondary dark:text-slate-400">
                            {isEditing ? (
                              <input
                                value={subForm.description}
                                onChange={(e) => setSubForm({ ...subForm, description: e.target.value })}
                                className="rounded border border-brand-primary dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm text-brand-text-primary dark:text-slate-100 w-full"
                              />
                            ) : sub.description ? (
                              <button
                                type="button"
                                onClick={() => onSelect?.({ type: 'submodule', id: sub.id, moduleId: module.id })}
                                className="hover:text-accent-teal-dark dark:hover:text-accent-teal text-left transition-colors focus:outline-none w-full"
                              >
                                {sub.description}
                              </button>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="px-4 py-3 text-brand-text-secondary dark:text-slate-400">
                            {sub.contents?.length || 0} items
                          </td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <Toggle
                                size="sm"
                                checked={subForm.status === 'active'}
                                onChange={(checked) => setSubForm({ ...subForm, status: checked ? 'active' : 'inactive' })}
                              />
                            ) : (
                              <CourseStatusBadge status={sub.status} />
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {isEditing ? (
                              <div className="flex gap-1.5">
                                <Button size="xs" onClick={handleSaveSubmodule}>Save</Button>
                                <Button size="xs" variant="outline" onClick={() => setEditingSub(null)}>Cancel</Button>
                              </div>
                            ) : (
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditSubmodule(sub)}
                                  className="rounded-full p-1.5 hover:bg-brand-surface dark:hover:bg-slate-800"
                                  title="Edit Submodule"
                                >
                                  <Pencil className="h-4 w-4 text-brand-text-secondary dark:text-slate-400" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    catalog.duplicateSubmodule(courseId, module.id, sub.id);
                                    showToast('Submodule duplicated');
                                  }}
                                  className="rounded-full p-1.5 hover:bg-brand-surface dark:hover:bg-slate-800"
                                  title="Duplicate Submodule"
                                >
                                  <Copy className="h-4 w-4 text-brand-text-secondary dark:text-slate-400" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    catalog.deleteSubmodule(courseId, module.id, sub.id);
                                    showToast('Submodule deleted');
                                  }}
                                  className="rounded-full p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-650 dark:text-red-400"
                                  title="Delete Submodule"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </SortableRow>
                      );
                    })}
                  </SortableContext>
                </DndContext>
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

