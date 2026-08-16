'use client';

import { useState, useMemo } from 'react';
import { Plus, LayoutGrid, List, Tag, CheckCircle, BookOpen, XCircle, Search, ChevronDown } from 'lucide-react';
import { useCatalog } from '@/hooks-lms/useCatalog';
import { paginate } from '@/utils-lms';
import { ConfirmationDialog } from '@/components/ui-lms/Modal';
import CategoryCard, { CategoryRow } from '@/components/catalog/CategoryCard';
import StatCard from '@/components/ui-lms/StatCard';
import Pagination from '@/components/ui-lms/Pagination';
import EmptyState from '@/components/ui-lms/EmptyState';
import { DEFAULT_PAGE_SIZE } from '@/constants-lms';
import { useNavigate } from 'react-router-dom';

const SORT_OPTIONS = [
  { value: 'name',    label: 'Sort: Name A–Z' },
  { value: 'courses', label: 'Most Courses' },
  { value: 'created', label: 'Created Date' },
];

const STATUS_OPTIONS = [
  { value: 'all',      label: 'All Status' },
  { value: 'active',   label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'deleted',  label: 'Deleted' },
];

function SelectDropdown({ value, options, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none cursor-pointer rounded-md border bg-brand-background border-brand-border py-2 pl-3 pr-8 text-sm text-brand-text-primary focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-brand-text-secondary" />
    </div>
  );
}

export default function CategoryManagement() {
  const { categories, courses, deleteCategory, restoreCategory, hydrated } = useCatalog();
  const navigate = useNavigate();

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy]           = useState('name');
  const [view, setView]               = useState('grid');
  const [page, setPage]               = useState(1);
  const [pageSize, setPageSize]       = useState(DEFAULT_PAGE_SIZE);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const getCourseCount = (catId) =>
    courses.filter((c) => c.categoryId === catId && !c.deletedAt).length;

  const liveCategories = categories.filter((c) => !c.deletedAt);
  const stats = {
    total: liveCategories.length,
    active: liveCategories.filter((c) => c.status === 'active').length,
    inactive: liveCategories.filter((c) => c.status === 'inactive').length,
    totalCourses: courses.filter((c) => !c.deletedAt).length,
  };

  const filtered = useMemo(() => {
    let list = categories.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch = !search || c.name.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      if (statusFilter === 'deleted') return !!c.deletedAt;
      return matchSearch && matchStatus && !c.deletedAt;
    });
    list = [...list].sort((a, b) => {
      if (sortBy === 'courses') return getCourseCount(b.id) - getCourseCount(a.id);
      if (sortBy === 'status')  return a.status.localeCompare(b.status);
      if (sortBy === 'created') return new Date(b.createdAt) - new Date(a.createdAt);
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [categories, search, statusFilter, sortBy, courses]);

  const { data, total, totalPages } = paginate(filtered, page, pageSize);

  const emptyStateConfig = useMemo(() => {
    if (search) {
      return {
        title: "No matching categories found",
        description: `We couldn't find any categories matching "${search}".`,
        actionLabel: null,
        onAction: null
      };
    }
    switch (statusFilter) {
      case 'active':
        return {
          title: "No active categories found",
          description: "There are currently no active categories. You can create one or change an existing category to active.",
          actionLabel: "Create Category",
          onAction: () => navigate('/admin/categories/new')
        };
      case 'inactive':
        return {
          title: "No inactive categories found",
          description: "There are currently no inactive categories.",
          actionLabel: null,
          onAction: null
        };
      case 'deleted':
        return {
          title: "No deleted categories found",
          description: "There are currently no deleted categories in the trash.",
          actionLabel: null,
          onAction: null
        };
      default:
        return {
          title: "No categories found",
          description: "Create your first category to organize courses.",
          actionLabel: "Create Category",
          onAction: () => navigate('/admin/categories/new')
        };
    }
  }, [statusFilter, search, navigate]);

  if (!hydrated) return null;

  return (
    <div className="flex min-h-screen flex-col bg-brand-surface text-brand-text-primary transition-colors">
      {/* Page header bar */}
      <div
        className="flex items-center justify-between px-8 py-4 bg-brand-background border-b border-brand-border"
      >
        <div>
          <h1 className="text-2xl font-bold text-brand-text-primary">Categories</h1>
          <p className="mt-0.5 text-sm text-brand-text-secondary">Manage all learning categories on the platform</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/categories/new')}
          className="flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#01ac9f' }}
        >
          <Plus className="h-[15px] w-[15px]" />
          Create Category
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 px-8 py-6">
        {/* Stats grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Tag}          label="Total Categories" value={stats.total}        color="purple" index={0} />
          <StatCard icon={CheckCircle}  label="Active"           value={stats.active}       color="teal"   index={1} />
          <StatCard icon={XCircle}      label="Inactive"         value={stats.inactive}     color="orange" index={2} />
          <StatCard icon={BookOpen}     label="Total Courses"    value={stats.totalCourses} color="plum"   index={3} />
        </div>

        {/* Filters toolbar */}
        <div className="mb-5 flex items-center gap-3">
          {/* Search */}
          <div
            className="flex flex-1 items-center gap-2 rounded-md border bg-brand-background border-brand-border px-3 py-2"
            style={{ maxWidth: 280 }}
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-brand-text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search categories..."
              className="w-full bg-transparent text-sm text-brand-text-primary placeholder:text-brand-text-secondary focus:outline-none"
            />
          </div>

          {/* Status filter */}
          <SelectDropdown value={statusFilter} options={STATUS_OPTIONS} onChange={(v) => { setStatusFilter(v); setPage(1); }} />

          {/* Sort */}
          <SelectDropdown value={sortBy} options={SORT_OPTIONS} onChange={(v) => { setSortBy(v); setPage(1); }} />

          {/* View toggle */}
          <div
            className="ml-auto flex items-center gap-1 rounded-md border bg-brand-background border-brand-border p-1"
          >
            <button
              type="button"
              onClick={() => setView('grid')}
              className="flex h-7 w-8 items-center justify-center rounded"
              style={view === 'grid' ? { backgroundColor: '#6c1d5f18' } : {}}
              title="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" style={{ color: view === 'grid' ? '#01ac9f' : '#9ca3af' }} />
            </button>
            <button
              type="button"
              onClick={() => setView('table')}
              className="flex h-7 w-8 items-center justify-center rounded"
              style={view === 'table' ? { backgroundColor: '#6c1d5f18' } : {}}
              title="List view"
            >
              <List className="h-3.5 w-3.5" style={{ color: view === 'table' ? '#01ac9f' : '#9ca3af' }} />
            </button>
          </div>

          {/* Result count */}
          <span className="whitespace-nowrap text-sm text-brand-text-secondary">
            {filtered.length} categories
          </span>
        </div>

        {/* Grid / Table */}
        {data.length === 0 ? (
          <EmptyState
            icon={Tag}
            title={emptyStateConfig.title}
            description={emptyStateConfig.description}
            actionLabel={emptyStateConfig.actionLabel}
            onAction={emptyStateConfig.onAction}
          />
        ) : view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                courseCount={getCourseCount(cat.id)}
                onEdit={(c)   => navigate(`/admin/categories/${c.id}/edit`)}
                onDelete={setDeleteTarget}
                onView={(c)   => navigate(`/admin/categories/${c.id}`)}
              />
            ))}
          </div>
        ) : (
          <div
            className="overflow-x-auto rounded-xl border bg-brand-background border-brand-border"
          >
            <table className="w-full text-sm">
              <thead className="border-b border-brand-border bg-brand-surface">
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-brand-text-secondary">
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Courses</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((cat) => (
                  <CategoryRow
                    key={cat.id}
                    category={cat}
                    courseCount={getCourseCount(cat.id)}
                    onEdit={(c)   => navigate(`/admin/categories/${c.id}/edit`)}
                    onDelete={setDeleteTarget}
                    onView={(c)   => navigate(`/admin/categories/${c.id}`)}
                  />
                ))}
              </tbody>
            </table>
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
            itemLabel="categories"
          />
        </div>
      </div>

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget?.deletedAt) restoreCategory(deleteTarget.id);
          else deleteCategory(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title={deleteTarget?.deletedAt ? 'Restore Category' : 'Delete Category'}
        message={
          deleteTarget?.deletedAt
            ? 'Restore this category?'
            : 'This will delete the category. Courses will remain.'
        }
        confirmLabel={deleteTarget?.deletedAt ? 'Restore' : 'Delete'}
        variant={deleteTarget?.deletedAt ? 'primary' : 'danger'}
      />
    </div>
  );
}


