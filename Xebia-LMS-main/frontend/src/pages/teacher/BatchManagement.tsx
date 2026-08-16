import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, Users, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { Layout } from '../../components/layout/Layout';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAppDispatch, useAppSelector } from '../../store';
import { getAllBatches, createBatch, updateBatch, deleteBatch } from '../../store/batchSlice';
import type { Batch } from '../../services/batch.service';
import { TableRowSkeleton } from '../../components/shared/LoadingSkeleton';
import { EmptyState } from '../../components/shared/EmptyState';
import { Pagination } from '../../components/shared/Pagination';

export const BatchManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { batches, loading, totalPages, totalElements } = useAppSelector((state) => state.batch);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<Batch | null>(null);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  const [batchName, setBatchName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Pagination states
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const loadBatches = useCallback(() => {
    dispatch(getAllBatches({ page, size: limit, search: searchQuery }));
  }, [dispatch, page, limit, searchQuery]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const openCreateModal = () => {
    setEditingBatch(null);
    setBatchName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (batch: Batch) => {
    setEditingBatch(batch);
    setBatchName(batch.batchName);
    setDescription(batch.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim()) {
      toast.error('Batch name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBatch) {
        await dispatch(updateBatch({ id: editingBatch.id, data: { batchName, description } })).unwrap();
        toast.success('Batch updated successfully!');
      } else {
        await dispatch(createBatch({ batchName, description })).unwrap();
        toast.success('Batch created successfully!');
      }
      setIsModalOpen(false);
      loadBatches();
    } catch (err: any) {
      toast.error(err || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setSubmitting(true);
    try {
      await dispatch(deleteBatch(deleteModal.id)).unwrap();
      toast.success('Batch deleted successfully!');
      setDeleteModal(null);
      loadBatches();
    } catch (err: any) {
      toast.error(err || 'Failed to delete batch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const filteredBatches = batches;

  return (
    <Layout role="teacher" title="Batch Management" subtitle="Create and manage your student groups">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
          <input
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search batches by name or description..."
            className="w-full search-bar-modern"
          />
        </div>

        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={openCreateModal}
          className="shrink-0"
        >
          New Batch
        </Button>
      </div>

      {/* Batches Table */}
      <div className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--brand-border)]">
                {['Batch Name', 'Description', 'Students Count', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-border)]">
              {loading && batches.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />)
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState
                      icon="inbox"
                      title="No batches found"
                      description="Create a batch to start organizing students and scheduling assignments."
                      action={{ label: 'Create Batch', onClick: openCreateModal }}
                    />
                  </td>
                </tr>
              ) : (
                filteredBatches.map((b) => (
                  <tr key={b.id} className="table-row-hover">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Users size={13} className="text-[#2563EB]" />
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">{b.batchName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[var(--text-secondary)] max-w-xs truncate">
                      {b.description || 'No description provided'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-primary)]">
                        <Users size={12} className="text-[var(--text-secondary)]" />
                        {b.studentCount !== undefined ? b.studentCount : '—'} Students
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Edit size={14} />}
                          onClick={() => openEditModal(b)}
                          title="Edit Batch"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-white hover:bg-[#F5EAF8]0"
                          icon={<Trash2 size={14} />}
                          onClick={() => setDeleteModal(b)}
                          title="Delete Batch"
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination footer */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--brand-border)] p-4 sm:flex-row bg-slate-50 dark:bg-slate-800/20 text-xs select-none">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Rows per page:</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(0); }}
                className="rounded-lg border border-[var(--brand-border)] bg-white dark:bg-[#1E293B] px-2 py-1 text-xs font-bold text-[var(--text-primary)] outline-none cursor-pointer"
              >
                {[10, 20, 50, 100].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Pagination
              page={page + 1}
              totalPages={totalPages}
              total={totalElements}
              limit={limit}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBatch ? 'Edit Batch' : 'Create New Batch'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Batch Name"
            placeholder="e.g. Science Batch 2026"
            required
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
          />
          <Textarea
            label="Description"
            placeholder="Provide detail about this student group..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--brand-border)]">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              {editingBatch ? 'Save Changes' : 'Create Batch'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal !== null} onClose={() => setDeleteModal(null)} title="Delete Batch">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Are you sure you want to delete batch <strong className="text-[var(--text-primary)]">"{deleteModal?.batchName}"</strong>? This action cannot be undone and may affect associated assignments.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--brand-border)]">
            <Button type="button" variant="outline" onClick={() => setDeleteModal(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white border-transparent"
              loading={submitting}
              onClick={handleDelete}
            >
              Delete Batch
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};
