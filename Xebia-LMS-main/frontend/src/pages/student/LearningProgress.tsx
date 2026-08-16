import React, { useEffect, useState } from 'react';
import { TrendingUp, BookOpen, CheckCircle, Award, Star, Download } from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { Card, StatCard } from '../../components/ui/Card';
import { StatCardSkeleton, TableRowSkeleton } from '../../components/shared/LoadingSkeleton';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/shared/EmptyState';
import { studentService } from '../../services/student.service';
import { formatDateTime, getFileIcon } from '../../utils/helpers';
import type { LearningProgressData } from '../../types';

export const LearningProgress: React.FC = () => {
  const [data, setData] = useState<LearningProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getLearningProgress()
      .then((res) => setData(res.progress))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout role="student" title="Learning Progress" subtitle="Track your performance across subjects">
      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : data ? (
          <>
            <StatCard title="Total Published" value={data.totalPublished} icon={<BookOpen size={20} />} color="purple" />
            <StatCard title="Submissions Made" value={data.totalSubmitted} icon={<CheckCircle size={20} />} color="blue" />
            <StatCard title="Graded Assignments" value={data.totalReviewed} icon={<Award size={20} />} color="teal" />
          </>
        ) : null}
      </div>

      {/* Subject Progress Section */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-[#4A1F4F] dark:text-purple-400" />
          Subject-wise Performance
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} padding="md">
                <div className="skeleton h-4 w-32 mb-2" />
                <div className="skeleton h-3 w-full" />
              </Card>
            ))}
          </div>
        ) : !data || data.subjects.length === 0 ? (
          <Card>
            <EmptyState icon="file" title="No Subject Progress Yet" description="As teachers publish assignments and grade your submissions, your progress will appear here." />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.subjects.map((sub) => (
              <Card key={sub.subject} padding="md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)]">{sub.subject}</span>
                  <span className="text-sm font-bold text-[#4A1F4F] dark:text-purple-300">
                    {sub.percentage}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 mb-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#4A1F4F] to-[#2563EB] h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${sub.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span>{sub.submitted}/{sub.total} Submitted</span>
                  <span>{sub.reviewed} Graded</span>
                  {sub.totalMax > 0 && <span>{sub.totalEarned}/{sub.totalMax} Total Marks</span>}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Submissions Table */}
      <div className="bg-white dark:bg-[#1E293B] border border-[var(--brand-border)] rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--brand-border)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent Submissions</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Your recently uploaded assignments</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-[var(--brand-border)]">
                {['Assignment', 'Submitted On', 'File', 'Status', 'Score'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-border)]">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <TableRowSkeleton key={i} cols={5} />)
              ) : !data || data.recentSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState icon="inbox" title="No submissions yet" description="You haven't submitted any assignments yet." />
                  </td>
                </tr>
              ) : (
                data.recentSubmissions.map((sub) => (
                  <tr key={sub.id} className="table-row-hover">
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{sub.assignment?.title || 'Assignment'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                      {formatDateTime(sub.submittedAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <a
                        href={sub.uploadedFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-[#2563EB] hover:underline"
                      >
                        <span>{getFileIcon(sub.fileName)}</span>
                        <span className="max-w-[120px] truncate">{sub.fileName}</span>
                        <Download size={11} />
                      </a>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={sub.status as any} />
                    </td>
                    <td className="px-4 py-3.5">
                      {sub.marks !== null && sub.marks !== undefined ? (
                        <span className="text-sm font-bold text-[#4A1F4F] dark:text-purple-300">
                          {sub.marks}/{sub.assignment?.maxMarks}
                        </span>
                      ) : (
                        <span className="text-xs text-[var(--text-secondary)]">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};
