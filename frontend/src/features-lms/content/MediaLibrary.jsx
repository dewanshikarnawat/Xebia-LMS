'use client';

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image as ImageIcon, LayoutGrid, List, Eye, Video, FileText, Presentation, FileCode as FileType, Clock } from 'lucide-react';
import { useCatalog } from '@/hooks-lms/useCatalog';
import { paginate, formatFileSize, formatDate } from '@/utils-lms';
import PageHeader from '@/components/layout-lms/PageHeader';
import Breadcrumb from '@/components/layout-lms/Breadcrumb';
import Button from '@/components/ui-lms/Button';
import SearchBar from '@/components/ui-lms/SearchBar';
import FilterDropdown from '@/components/ui-lms/FilterDropdown';
import Pagination from '@/components/ui-lms/Pagination';
import EmptyState from '@/components/ui-lms/EmptyState';
import ContentPreviewDrawer from '@/components/builder/ContentPreviewDrawer';
import { CONTENT_TYPES, DEFAULT_PAGE_SIZE } from '@/constants-lms';
import Badge from '@/components/ui-lms/Badge';

export default function MediaLibrary() {
  const { mediaLibrary, hydrated } = useCatalog();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('uploaded');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [preview, setPreview] = useState(null);

  const sortedAndFiltered = useMemo(() => {
    let list = (mediaLibrary || []).filter((item) => {
      const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.courseName?.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || item.type === typeFilter;
      return matchSearch && matchType;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'size') return b.fileSize - a.fileSize;
      return new Date(b.uploadedAt) - new Date(a.uploadedAt);
    });

    return list;
  }, [mediaLibrary, search, typeFilter, sortBy]);

  const { data, total, totalPages } = paginate(sortedAndFiltered, page, pageSize);

  if (!hydrated) return null;

  return (
    <div className="min-h-screen bg-brand-surface p-6 lg:p-8">
      <PageHeader title="Media Library" subtitle="Centralized asset management" />
      <div className="space-y-6">
        <Breadcrumb items={[{ label: 'Media Library' }]} />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Enterprise Media Library</h2>
            <p className="text-sm text-brand-text-secondary">{sortedAndFiltered.length} assets</p>
          </div>
          <Link to="/admin/upload-content">
            <Button size="sm" variant="cta">Upload Content</Button>
          </Link>
        </motion.div>

        {/* Filters and Sorting bar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchBar value={search} onChange={setSearch} placeholder="Search media..." className="flex-1" />
          
          <FilterDropdown
            label="Type"
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'all', label: 'All Types' },
              ...CONTENT_TYPES.filter((t) => !['notes', 'link'].includes(t.value)).map((t) => ({ value: t.value, label: t.label }))
            ]}
          />

          <FilterDropdown
            label="Sort By"
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'uploaded', label: 'Upload Date' },
              { value: 'name', label: 'File Name' },
              { value: 'size', label: 'File Size' }
            ]}
          />

          <div className="flex rounded-xl border border-brand-border dark:border-slate-800 p-0.5 bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`p-2 rounded-lg ${view === 'grid' ? 'bg-brand-primary text-white' : 'text-brand-text-secondary dark:text-slate-400'}`}
              aria-label="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setView('list')}
              className={`p-2 rounded-lg ${view === 'list' ? 'bg-brand-primary text-white' : 'text-brand-text-secondary dark:text-slate-400'}`}
              aria-label="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Media Grid / Table View */}
        {data.length === 0 ? (
          <EmptyState icon={ImageIcon} title="No media found" description="Upload content through the Course Builder to populate the library." />
        ) : view === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((item) => (
              <div key={item.id} className="group rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between">
                <div>
                  {/* Aspect video Thumbnail Preview */}
                  <div className="aspect-video rounded-lg bg-brand-surface dark:bg-slate-950 flex items-center justify-center mb-3 border border-brand-border dark:border-slate-800 overflow-hidden relative">
                    {item.type === 'video' ? (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent)]" />
                        <Video className="h-6 w-6 text-red-500 fill-red-500/10" />
                        <span className="absolute bottom-2 right-2 text-[9px] bg-black/60 text-white px-1 rounded">MP4</span>
                      </div>
                    ) : item.type === 'pdf' ? (
                      <div className="relative w-full h-full flex flex-col justify-between bg-gradient-to-br from-orange-500/10 to-red-500/10 p-3">
                        <FileText className="h-7 w-7 text-orange-500/80" />
                        <span className="text-[9px] font-bold text-orange-650 dark:text-orange-400 uppercase tracking-wider">PDF DOCUMENT</span>
                      </div>
                    ) : item.type === 'ppt' ? (
                      <div className="relative w-full h-full flex flex-col justify-between bg-gradient-to-br from-amber-500/10 to-yellow-500/10 p-3">
                        <Presentation className="h-7 w-7 text-amber-500/80" />
                        <span className="text-[9px] font-bold text-amber-650 dark:text-amber-400 uppercase tracking-wider">SLIDE SHOW</span>
                      </div>
                    ) : item.type === 'image' ? (
                      <img src={item.fileUrl || 'https://picsum.photos/400/240'} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="relative w-full h-full flex flex-col justify-between bg-gradient-to-br from-blue-500/10 to-indigo-500/10 p-3">
                        <FileType className="h-7 w-7 text-blue-500/80" />
                        <span className="text-[9px] font-bold text-blue-650 dark:text-blue-400 uppercase tracking-wider">ZIP / CODE</span>
                      </div>
                    )}
                  </div>
                  
                  <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                  <p className="text-xs text-brand-text-secondary truncate mt-0.5">{item.courseName}</p>
                </div>
                
                <div className="mt-3">
                  <div className="flex items-center justify-between border-t border-brand-border dark:border-slate-800/60 pt-2 text-xs">
                    <Badge color="purple">{item.type}</Badge>
                    <span className="text-[10px] text-brand-text-secondary font-medium">{formatFileSize(item.fileSize)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreview({ ...item, type: item.type })}
                    className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border border-brand-border dark:border-slate-800 py-1.5 text-xs text-brand-text-primary dark:text-slate-350 hover:bg-brand-surface dark:hover:bg-slate-800 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview Asset
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
            <table className="w-full text-sm">
              <thead className="bg-brand-surface dark:bg-slate-950 border-b border-brand-border dark:border-slate-800 text-left font-semibold">
                <tr className="text-brand-text-primary dark:text-slate-200">
                  <th className="px-4 py-3">Asset Preview</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Course Catalog Source</th>
                  <th className="px-4 py-3">File Size</th>
                  <th className="px-4 py-3">Uploaded Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="border-t border-brand-border dark:border-slate-800 hover:bg-brand-surface/40 dark:hover:bg-slate-850/40 text-brand-text-primary dark:text-slate-300 transition-colors">
                    <td className="px-4 py-3">
                      <div className="h-8 w-14 rounded bg-brand-surface dark:bg-slate-950 border border-brand-border dark:border-slate-800 overflow-hidden flex items-center justify-center">
                        {item.type === 'video' ? <Video className="h-4 w-4 text-red-500" /> : <FileText className="h-4 w-4 text-orange-500" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{item.title}</td>
                    <td className="px-4 py-3">
                      <Badge color="blue">{item.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-brand-text-secondary dark:text-slate-400">{item.courseName}</td>
                    <td className="px-4 py-3 font-medium">{formatFileSize(item.fileSize)}</td>
                    <td className="px-4 py-3 text-brand-text-secondary dark:text-slate-400">{formatDate(item.uploadedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" onClick={() => setPreview(item)} className="text-brand-primary dark:text-brand-secondary text-xs font-bold hover:underline">
                        Preview
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
      </div>

      <ContentPreviewDrawer content={preview} open={!!preview} onClose={() => setPreview(null)} />
    </div>
  );
}


