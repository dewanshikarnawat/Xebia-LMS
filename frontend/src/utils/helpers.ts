import { format, formatDistanceToNow, isPast, differenceInDays, differenceInHours } from 'date-fns';

export const formatDate = (date: string | Date) =>
  format(new Date(date), 'MMM dd, yyyy');

export const formatDateTime = (date: string | Date) =>
  format(new Date(date), 'MMM dd, yyyy • hh:mm a');

export const timeAgo = (date: string | Date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

export const isOverdue = (dueDate: string | Date) => isPast(new Date(dueDate));

export const getDueDateCountdown = (dueDate: string | Date): string => {
  const due = new Date(dueDate);
  if (isPast(due)) return 'Overdue';

  const days = differenceInDays(due, new Date());
  const hours = differenceInHours(due, new Date()) % 24;

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h left`;
  return 'Due soon';
};

export const getDueDateColor = (dueDate: string | Date): string => {
  const due = new Date(dueDate);
  if (isPast(due)) return 'text-red-500';
  const days = differenceInDays(due, new Date());
  if (days <= 2) return 'text-amber-500';
  return 'text-emerald-500';
};

export const truncate = (str: string, n: number) =>
  str.length > n ? `${str.slice(0, n)}...` : str;

export const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

export const getFileIcon = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return '📄';
    case 'doc':
    case 'docx': return '📝';
    case 'zip': return '📦';
    case 'jpg':
    case 'jpeg':
    case 'png': return '🖼️';
    default: return '📎';
  }
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
