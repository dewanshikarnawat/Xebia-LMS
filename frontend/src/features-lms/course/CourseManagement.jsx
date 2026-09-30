'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ChevronDown } from 'lucide-react';
import { useCatalog } from '@/hooks-lms/useCatalog';
import { useToast } from '@/hooks-lms/useToast';
import { paginate } from '@/utils-lms';
import { ConfirmationDialog } from '@/components/ui-lms/Modal';
import CourseCard from '@/components/catalog/CourseCard';
import Pagination from '@/components/ui-lms/Pagination';
import EmptyState from '@/components/ui-lms/EmptyState';
import { DEFAULT_PAGE_SIZE, DIFFICULTY_LEVELS, COURSE_STATUSES } from '@/constants-lms';

function SelectDropdown({ value, options, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none cursor-pointer rounded-lg border bg-brand-background border-brand-border py-2.5 pl-3.5 pr-8 text-sm text-brand-text-primary focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-text-secondary" />
    </div>
  );
}

export default function CourseManagement({ categoryId = null }) {
  const { categories, courses, getCategory, deleteCourse, duplicateCourse, hydrated, fetchCoursesPage } = useCatalog();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const category = categoryId ? getCategory(categoryId) : null;

  const [search, setSearch]                   = useState('');
  const [statusFilter, setStatusFilter]       = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [categoryFilter, setCategoryFilter]   = useState('all');
  const [sortBy, setSortBy]                   = useState('updated');
  const [page, setPage]                       = useState(1);
  const [pageSize, setPageSize]               = useState(DEFAULT_PAGE_SIZE);
  const [deleteTarget, setDeleteTarget]       = useState(null);

  // Paginated state
  const [coursesList, setCoursesList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const baseCourses = useMemo(() => {
    let list = (courses || []).filter((c) => !c.deletedAt);
    if (categoryId) list = list.filter((c) => c.categoryId === Number(categoryId) || c.categoryId === categoryId);
    return list;
  }, [courses, categoryId]);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      let sortByField = 'updatedAt';
      let sortDir = 'desc';
      if (sortBy === 'title') {
        sortByField = 'title';
        sortDir = 'asc';
      } else if (sortBy === 'created') {
        sortByField = 'createdAt';
        sortDir = 'desc';
      }

      const activeParam = statusFilter === 'archived' ? false : true;
      const publishedParam = statusFilter === 'published' ? true : (statusFilter === 'draft' ? false : null);
      const catParam = categoryId || (categoryFilter !== 'all' ? categoryFilter : null);

      const data = await fetchCoursesPage(
        page - 1,
        pageSize,
        sortByField,
        sortDir,
        search,
        catParam,
        difficultyFilter,
        activeParam,
        publishedParam
      );
      setCoursesList(data?.content || []);
      setTotalPages(data?.totalPages || 0);
      setTotalElements(data?.totalElements || 0);
    } catch (err) {
      console.error('Error loading paginated courses:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, search, statusFilter, difficultyFilter, categoryFilter, categoryId, fetchCoursesPage, refreshTrigger]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCourse(deleteTarget.id);
      showToast('Course archived successfully.');
      setRefreshTrigger(t => t + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await duplicateCourse(id);
      showToast('Course duplicated successfully.');
      setRefreshTrigger(t => t + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const data = coursesList;
  const total = totalElements;

  const handleCreate = () => {
    if (!categories?.length) {
      showToast('Create a category first before adding a course.', 'error');
      return;
    }
    navigate('/admin/courses/new');
  };

  const emptyStateConfig = useMemo(() => {
    if (search) {
      return {
        title: "No matching courses found",
        description: `We couldn't find any courses matching "${search}".`,
        actionLabel: null,
        onAction: null
      };
    }
    if (statusFilter !== 'all') {
      return {
        title: `No ${statusFilter} courses found`,
        description: `There are currently no courses marked as ${statusFilter}.`,
        actionLabel: statusFilter !== 'archived' ? "Create Course" : null,
        onAction: statusFilter !== 'archived' ? handleCreate : null
      };
    }
    if (difficultyFilter !== 'all') {
      return {
        title: `No ${difficultyFilter} courses found`,
        description: `There are currently no courses found for the ${difficultyFilter} difficulty level.`,
        actionLabel: "Create Course",
        onAction: handleCreate
      };
    }
    if (categoryFilter !== 'all') {
      const catName = categories.find(c => String(c.id) === categoryFilter)?.name || 'this category';
      return {
        title: `No courses in ${catName}`,
        description: `There are currently no courses assigned to ${catName}.`,
        actionLabel: "Create Course",
        onAction: handleCreate
      };
    }
    return {
      title: "No courses found",
      description: "Create a course to get started.",
      actionLabel: "Create Course",
      onAction: handleCreate
    };
  }, [search, statusFilter, difficultyFilter, categoryFilter, categories, handleCreate]);

  const getCategoryName  = (id) => categories.find((c) => c.id === id)?.name  || '—';
  const getCategoryColor = (id) => categories.find((c) => c.id === id)?.color || '#6c1d5f';

  const activeCourses   = baseCourses.filter((c) => c.status !== 'archived').length;
  const publishedCourses = baseCourses.filter((c) => c.status === 'published').length;

  if (!hydrated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-brand-surface text-brand-text-primary transition-colors">
      {/* Page header bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-brand-background border-b border-brand-border">
        <div>
          <h1 className="text-2xl font-bold text-brand-text-primary">
            {category ? `${category.name} — Courses` : 'All Courses'}
          </h1>
          <p className="mt-0.5 text-sm text-brand-text-secondary">
            {category ? `Manage courses under category ${category.name}` : 'Browse and manage all courses on the platform.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Quick stat pills */}
          <span
            className="rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{ color: '#6c1d5f', borderColor: '#6c1d5f40', backgroundColor: '#6c1d5f0d' }}
          >
            {baseCourses.length} Courses
          </span>
          <span
            className="rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{ color: '#01ac9f', borderColor: '#01ac9f40', backgroundColor: '#01ac9f0d' }}
          >
            {activeCourses} Active
          </span>
          <span
            className="rounded-full border px-3 py-1.5 text-xs font-semibold"
            style={{ color: '#ff6200', borderColor: '#ff620040', backgroundColor: '#ff62000d' }}
          >
            {publishedCourses} Published
          </span>
          <button
            type="button"
            onClick={handleCreate}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: '#01ac9f' }}
          >
            <Plus className="h-3.5 w-3.5" />
            Create Course
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 px-8 py-7">

        {/* Filters toolbar */}
        <div className="mb-6 flex items-center gap-3">
          {/* Search */}
          <div
            className="flex flex-1 items-center gap-2.5 rounded-lg border bg-brand-background border-brand-border px-4 py-2.5 text-sm"
            style={{ maxWidth: 420 }}
          >
            <Search className="h-[15px] w-[15px] shrink-0 text-brand-text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search courses by title or slug..."
              className="w-full bg-transparent text-sm text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none"
            />
          </div>

          {/* Level filter */}
          <SelectDropdown
            value={difficultyFilter}
            onChange={(v) => { setDifficultyFilter(v); setPage(1); }}
            options={[{ value: 'all', label: 'All Levels' }, ...DIFFICULTY_LEVELS.map((d) => ({ value: d, label: d }))]}
          />

          {/* Category filter (only when not scoped) */}
          {!categoryId && (
            <SelectDropdown
              value={categoryFilter}
              onChange={(v) => { setCategoryFilter(v); setPage(1); }}
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories.filter((c) => !c.deletedAt).map((c) => ({ value: String(c.id), label: c.name })),
              ]}
            />
          )}

          {/* Status filter */}
          <SelectDropdown
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            options={[
              { value: 'all', label: 'All Status' },
              ...COURSE_STATUSES.map((s) => ({ value: s.value, label: s.label })),
            ]}
          />

          <span className="ml-auto whitespace-nowrap text-xs font-medium text-brand-text-secondary">
            {totalElements} courses
          </span>
        </div>

        {/* Course grid */}
        {data.length === 0 ? (
          <EmptyState
            icon={Plus}
            title={emptyStateConfig.title}
            description={emptyStateConfig.description}
            actionLabel={emptyStateConfig.actionLabel}
            onAction={emptyStateConfig.onAction}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {data.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                categoryName={getCategoryName(course.categoryId)}
                categoryColor={getCategoryColor(course.categoryId)}
                onEdit={(c)      => navigate(`/admin/courses/${c.id}/edit`)}
                onDelete={setDeleteTarget}
                onDuplicate={(c) => handleDuplicate(c.id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-6">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            itemLabel="courses"
          />
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Course"
        message="Archive this course? You can restore it later."
      />
    </div>
  );
}


