'use client';

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, BookOpen, FileStack, FolderTree, ArrowRight, PlayCircle, Clock } from 'lucide-react';
import { useCatalog } from '@/hooks-lms/useCatalog';
import { countCourseStats } from '@/utils-lms';
import PageHeader from '@/components/layout-lms/PageHeader';
import Breadcrumb from '@/components/layout-lms/Breadcrumb';
import SearchBar from '@/components/ui-lms/SearchBar';
import FilterDropdown from '@/components/ui-lms/FilterDropdown';
import EmptyState from '@/components/ui-lms/EmptyState';
import Badge from '@/components/ui-lms/Badge';
import CourseCard from '@/components/catalog/CourseCard';

export default function CurriculumLanding() {
  const { courses, categories, hydrated } = useCatalog();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const liveCourses = useMemo(() => courses.filter((c) => !c.deletedAt), [courses]);

  const totals = useMemo(() => {
    let modules = 0, submodules = 0, contents = 0;
    liveCourses.forEach((c) => {
      const s = countCourseStats(c);
      modules += s.moduleCount;
      submodules += s.submoduleCount;
      contents += s.contentCount;
    });
    return { modules, submodules, contents };
  }, [liveCourses]);

  const filtered = useMemo(() => {
    return liveCourses.filter((c) => {
      const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || String(c.categoryId) === String(categoryFilter);
      return matchSearch && matchCategory;
    });
  }, [liveCourses, search, categoryFilter]);

  const getCategoryName = (id) => categories.find((c) => c.id === id)?.name || '—';
  const getCategoryColor = (id) => categories.find((c) => c.id === id)?.color || '#0EA89C';

  if (!hydrated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-brand-surface text-brand-text-primary transition-colors">
      {/* Page header bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-brand-background border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-bold text-brand-text-primary">Curriculum Builder</h1>
          <p className="mt-0.5 text-sm text-brand-text-secondary">Select a course below to manage its modules, submodules and content blocks</p>
        </div>
        <div className="flex gap-2">
          <Badge color="purple"><Layers className="h-3 w-3" /> {totals.modules} modules</Badge>
          <Badge color="teal"><FileStack className="h-3 w-3" /> {totals.submodules} submodules</Badge>
          <Badge color="orange"><BookOpen className="h-3 w-3" /> {totals.contents} content items</Badge>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 px-8 py-7 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar value={search} onChange={setSearch} placeholder="Search courses..." className="flex-1" />
          <FilterDropdown
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[{ value: 'all', label: 'All Categories' }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Layers} title="No courses found" description="Create a course first, then come back here to build its curriculum." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                categoryName={getCategoryName(course.categoryId)}
                categoryColor={getCategoryColor(course.categoryId)}
                isCurriculumView={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


