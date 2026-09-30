'use client';

import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Download, Search, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import Button from '@/components/ui-lms/Button';
import Input from '@/components/ui-lms/Input';
import { cn } from '@/utils-lms';

export function DataTable({ 
  columns, 
  data = [], 
  emptyMessage = 'No data found',
  searchable = true,
  searchKey = '',
  exportable = true,
  bulkActions = null, // Callback e.g. (selectedIds, actionType) => {}
  initialPageSize = 10
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [selectedIds, setSelectedIds] = useState([]);

  // 1. Filtering
  const filteredData = useMemo(() => {
    if (!searchTerm || !searchKey) return data;
    return data.filter(row => {
      const val = row[searchKey];
      if (val === null || val === undefined) return false;
      return String(val).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm, searchKey]);

  // 2. Sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    const sortableItems = [...filteredData];
    if (sortConfig.key !== '') {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        // Safely extract numeric or text values for sorting
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  // 3. Pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;

  // 4. Selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = paginatedData.map(row => row.id).filter(id => id !== undefined);
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = paginatedData.map(row => row.id);
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(x => x !== id));
    }
  };

  // 5. CSV Export
  const handleExportCSV = () => {
    const headers = columns.map(c => c.header).join(',');
    const rows = sortedData.map(row => 
      columns.map(col => {
        const val = row[col.key];
        if (val === null || val === undefined) return '""';
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(',')
    );
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "exported_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAllPageSelected = paginatedData.length > 0 && paginatedData.every(row => selectedIds.includes(row.id));

  return (
    <div className="space-y-4">
      {/* Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-brand-border dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          {searchable && searchKey && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text-secondary dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-full border border-brand-border dark:border-slate-800 bg-brand-surface dark:bg-slate-950 py-1.5 pl-9 pr-4 text-xs text-brand-text-primary dark:text-slate-100 placeholder:text-brand-text-secondary/50 focus:border-accent-teal focus:ring-2 focus:ring-accent-teal/20 transition-all outline-none"
              />
            </div>
          )}
        </div>

        {/* Action Panel */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && bulkActions && (
            <div className="flex items-center gap-1.5 bg-brand-surface dark:bg-slate-950 border border-brand-border dark:border-slate-800 rounded-lg px-3 py-1 text-xs">
              <span className="font-semibold text-brand-primary dark:text-brand-secondary">{selectedIds.length} selected</span>
              <div className="h-4 w-[1px] bg-brand-border dark:bg-slate-855 mx-2" />
              <button 
                onClick={() => {
                  bulkActions(selectedIds, 'delete');
                  setSelectedIds([]);
                }}
                className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                title="Bulk Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button 
                onClick={() => {
                  bulkActions(selectedIds, 'activate');
                  setSelectedIds([]);
                }}
                className="text-emerald-500 hover:text-emerald-600 p-1 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                title="Bulk Activate"
              >
                <CheckCircle2 className="h-4 w-4" />
              </button>
              <button 
                onClick={() => {
                  bulkActions(selectedIds, 'deactivate');
                  setSelectedIds([]);
                }}
                className="text-rose-500 hover:text-rose-600 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/20"
                title="Bulk Deactivate"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          )}

          {exportable && data.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Main Table Grid */}
      {!filteredData.length ? (
        <div className="rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm text-brand-text-secondary dark:text-slate-400">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
          <table className="w-full text-xs">
            <thead className="bg-brand-surface dark:bg-slate-950 border-b border-brand-border dark:border-slate-800 text-brand-text-secondary select-none">
              <tr>
                {bulkActions && (
                  <th className="px-4 py-3 text-left w-10">
                    <input 
                      type="checkbox"
                      checked={isAllPageSelected}
                      onChange={handleSelectAll}
                      className="rounded border-brand-border dark:border-slate-800"
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th 
                    key={col.key} 
                    onClick={() => col.sortable !== false && requestSort(col.key)}
                    className={cn(
                      "px-4 py-3 text-left font-semibold text-brand-text-primary dark:text-slate-200",
                      col.sortable !== false && "cursor-pointer hover:bg-brand-border dark:hover:bg-slate-800 transition-colors"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.sortable !== false && sortConfig.key === col.key && (
                        sortConfig.direction === 'ascending' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border dark:divide-slate-800">
              {paginatedData.map((row, i) => {
                const isSelected = selectedIds.includes(row.id);
                return (
                  <tr 
                    key={row.id ?? i} 
                    className={cn(
                      "hover:bg-brand-surface/50 dark:hover:bg-slate-850/50 transition-colors",
                      isSelected && "bg-brand-primary/5 dark:bg-brand-secondary/5"
                    )}
                  >
                    {bulkActions && (
                      <td className="px-4 py-3">
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                          className="rounded border-brand-border dark:border-slate-800"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-brand-text-primary dark:text-slate-350">
                        {col.render ? col.render(row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-brand-border dark:border-slate-800 px-4 py-3 bg-brand-surface dark:bg-slate-950 text-xs">
            <div className="flex items-center gap-2 text-brand-text-secondary dark:text-slate-400">
              <span>Show</span>
              <select 
                value={pageSize} 
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 rounded px-1.5 py-0.5 outline-none"
              >
                {[5, 10, 20, 50].map(sz => <option key={sz} value={sz}>{sz}</option>)}
              </select>
              <span>entries (showing {Math.min(filteredData.length, (currentPage - 1) * pageSize + 1)}-{Math.min(filteredData.length, currentPage * pageSize)} of {filteredData.length})</span>
            </div>

            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 text-[11px]"
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pg = idx + 1;
                return (
                  <button
                    key={pg}
                    onClick={() => setCurrentPage(pg)}
                    className={cn(
                      "h-7 w-7 rounded-lg border text-[11px] font-semibold transition-all",
                      currentPage === pg 
                        ? "bg-accent-teal text-white border-accent-teal shadow-sm"
                        : "border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 text-brand-text-secondary dark:text-slate-450 hover:bg-brand-surface dark:hover:bg-slate-800"
                    )}
                  >
                    {pg}
                  </button>
                );
              })}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 text-[11px]"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


