'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils-lms';
import Button from './Button';

export default function Modal({ open, onClose, title, description, children, size = 'md', footer }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className={cn(
                'pointer-events-auto w-full rounded-2xl bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 shadow-modal',
                size === 'sm' && 'max-w-md',
                size === 'md' && 'max-w-lg',
                size === 'lg' && 'max-w-2xl',
                size === 'xl' && 'max-w-4xl'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between border-b border-brand-border dark:border-slate-800 px-6 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-brand-text-primary dark:text-slate-100">{title}</h2>
                  {description && (
                    <p className="mt-0.5 text-sm text-brand-text-secondary dark:text-slate-400">{description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-brand-text-secondary dark:text-slate-400 hover:bg-brand-surface dark:hover:bg-slate-800"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="px-6 py-4 max-h-[70vh] overflow-y-auto scrollbar-thin text-brand-text-primary dark:text-slate-300">{children}</div>
              {footer && (
                <div className="flex items-center justify-end gap-2 border-t border-brand-border dark:border-slate-800 px-6 py-4">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  loading,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </>
      }
    >
      <p className="text-sm text-brand-text-secondary">{message}</p>
    </Modal>
  );
}

