'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, ArrowRight } from 'lucide-react';
import Modal from '@/components/ui-lms/Modal';
import Button from '@/components/ui-lms/Button';
import Badge from '@/components/ui-lms/Badge';
import { countCourseStats } from '@/utils-lms';

export default function CoursePublishDialog({ course, open, onClose, onConfirm }) {
  if (!course) return null;

  const stats = countCourseStats(course);

  const checks = [
    {
      id: 'modules',
      label: 'Course Modules',
      description: 'At least one learning module configured.',
      passed: stats.moduleCount > 0,
      severity: 'error',
    },
    {
      id: 'submodules',
      label: 'Course Submodules',
      description: 'At least one learning submodule configured.',
      passed: stats.submoduleCount > 0,
      severity: 'warning',
    },
    {
      id: 'contents',
      label: 'Learning Contents',
      description: 'At least one lesson item uploaded.',
      passed: stats.contentCount > 0,
      severity: 'warning',
    },
    {
      id: 'metadata',
      label: 'Course Language & Level',
      description: 'Duration, language, and difficulty defined.',
      passed: !!(course.language && course.difficulty && course.duration),
      severity: 'info',
    },
  ];

  const errors = checks.filter((c) => !c.passed && c.severity === 'error');
  const warnings = checks.filter((c) => !c.passed && c.severity === 'warning');

  const getStatusAction = () => {
    if (course.status === 'draft') return { nextStatus: 'in_review', label: 'Submit for Review', color: 'primary' };
    if (course.status === 'in_review') return { nextStatus: 'published', label: 'Approve & Publish', color: 'success' };
    if (course.status === 'published') return { nextStatus: 'archived', label: 'Archive Course', color: 'cta' };
    return { nextStatus: 'draft', label: 'Restore to Draft', color: 'outline' };
  };

  const action = getStatusAction();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Publishing Workflow Console"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {errors.length === 0 ? (
            <Button
              variant={action.color === 'success' ? 'success' : action.color === 'cta' ? 'cta' : 'primary'}
              onClick={() => {
                onConfirm(action.nextStatus);
                onClose();
              }}
            >
              {action.label} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="outline" disabled title="Fix validation errors before publishing">
              Publishing Blocked
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-5">
        <div className="rounded-xl bg-brand-surface dark:bg-slate-950 p-4 border border-brand-border dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs text-brand-text-secondary dark:text-slate-400 font-semibold uppercase">Current Status</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-bold text-brand-text-primary dark:text-slate-200 capitalize">
                {course.status?.replace('_', ' ')}
              </span>
              <span className="text-brand-text-secondary dark:text-slate-400">→</span>
              <span className="font-bold text-brand-primary dark:text-brand-secondary capitalize">
                {action.nextStatus?.replace('_', ' ')}
              </span>
            </div>
          </div>
          <Badge color={course.status === 'published' ? 'green' : course.status === 'in_review' ? 'amber' : 'gray'}>
            {course.status}
          </Badge>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-brand-text-primary dark:text-slate-100 mb-3">Pre-Publish Checklist</h4>
          <div className="space-y-3">
            {checks.map((check) => (
              <div
                key={check.id}
                className="flex items-start gap-3 rounded-xl border border-brand-border dark:border-slate-800 bg-white dark:bg-slate-900 p-3"
              >
                <div className="shrink-0 mt-0.5">
                  {check.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : check.severity === 'error' ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : check.severity === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Info className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-brand-text-primary dark:text-slate-200">{check.label}</p>
                    {!check.passed && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-1 bg-slate-100 dark:bg-slate-800 text-brand-text-secondary dark:text-slate-400 rounded">
                        {check.severity}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-brand-text-secondary dark:text-slate-400 mt-0.5">{check.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {errors.length > 0 && (
          <div className="rounded-xl border border-red-200 dark:border-red-950/40 bg-red-50 dark:bg-red-950/15 p-4 flex gap-3">
            <XCircle className="h-5 w-5 text-red-650 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">Publishing Blocked</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                You must resolve all critical errors (flagged in red) before you can publish this course.
              </p>
            </div>
          </div>
        )}

        {errors.length === 0 && warnings.length > 0 && (
          <div className="rounded-xl border border-amber-250 dark:border-amber-950/40 bg-amber-50 dark:bg-amber-950/15 p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Outstanding Warnings</p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                There are warnings that may affect user experience, but publishing is permitted.
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}


