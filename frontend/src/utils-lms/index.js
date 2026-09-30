import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    total: items.length,
    totalPages: Math.ceil(items.length / pageSize) || 1,
    page,
    pageSize,
  };
}

export function getTechLogoUrl(technology) {
  const slug = technology?.toLowerCase().replace(/[^a-z0-9+]/g, '') || 'code';
  const map = {
    python: 'python',
    java: 'java',
    c: 'c',
    'c++': 'cplusplus',
    javascript: 'javascript',
    typescript: 'typescript',
    react: 'react',
    angular: 'angular',
    'node.js': 'nodejs',
    'spring boot': 'spring',
    docker: 'docker',
    kubernetes: 'kubernetes',
    aws: 'amazonaws',
    azure: 'azure',
    gcp: 'googlecloud',
    tensorflow: 'tensorflow',
    pytorch: 'pytorch',
    mongodb: 'mongodb',
    mysql: 'mysql',
    postgresql: 'postgresql',
    ai: 'tensorflow',
    'machine learning': 'pytorch',
    'data science': 'jupyter',
    sql: 'mysql',
    devops: 'docker',
  };
  const icon = map[technology?.toLowerCase()] || slug;
  return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${icon}/${icon}-original.svg`;
}

export function countCourseStats(course) {
  const modules = course?.modules || [];
  const submodules = modules.flatMap((m) => m.submodules || []);
  const contents = submodules.flatMap((s) => s.contents || []);
  return {
    moduleCount: modules.length,
    submoduleCount: submodules.length,
    contentCount: contents.length,
  };
}

export function getCompletionPercentage(course) {
  const { moduleCount, submoduleCount, contentCount } = countCourseStats(course);
  if (contentCount === 0) return 0;
  const activeModules = (course?.modules || []).filter((m) => m.status === 'active').length;
  const activeSubmodules = (course?.modules || [])
    .flatMap((m) => m.submodules || [])
    .filter((s) => s.status === 'active').length;
  const activeContents = (course?.modules || [])
    .flatMap((m) => m.submodules || [])
    .flatMap((s) => s.contents || [])
    .filter((c) => c.status === 'active').length;
  const score =
    (activeModules / Math.max(moduleCount, 1)) * 0.3 +
    (activeSubmodules / Math.max(submoduleCount, 1)) * 0.3 +
    (activeContents / Math.max(contentCount, 1)) * 0.4;
  return Math.round(score * 100);
}
