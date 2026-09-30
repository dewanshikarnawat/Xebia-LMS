export const BRAND_DEFAULTS = {
  companyName: 'Xebia LMS',
  primaryColor: '#6C1D5F',
  secondaryColor: '#84117C',
  sidebarLogo: '/xebia_logo.png',
  headerLogo: '/xebia_logo.png',
  favicon: '/favicon.png',
  loginBackground: null,
  lightModeLogo: '/xebia_logo.png',
  darkModeLogo: '/xebia_logo.png',
  websiteLogo: '/xebia_logo.png',
  loginLogo: '/xebia_logo.png',
  mobileLogo: '/xebia_logo.png',
  footerLogo: '/xebia_logo.png',
};

export const COURSE_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'gray' },
  { value: 'in_review', label: 'In Review', color: 'amber' },
  { value: 'published', label: 'Published', color: 'green' },
  { value: 'archived', label: 'Archived', color: 'slate' },
];

export const ENTITY_STATUSES = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'inactive', label: 'Inactive', color: 'gray' },
];

export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

export const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Dutch'];

export const CONTENT_TYPES = [
  { value: 'video', label: 'Video', icon: 'Video' },
  { value: 'pdf', label: 'PDF', icon: 'FileText' },
  { value: 'ppt', label: 'PPT', icon: 'Presentation' },
  { value: 'doc', label: 'DOC/DOCX', icon: 'FileType' },
  { value: 'notes', label: 'Notes', icon: 'StickyNote' },
  { value: 'image', label: 'Image', icon: 'Image' },
  { value: 'link', label: 'External Link', icon: 'ExternalLink' },
];

export const TECHNOLOGIES = {
  Python: { slug: 'python', color: '#3776AB' },
  Java: { slug: 'java', color: '#007396' },
  C: { slug: 'c', color: '#A8B9CC' },
  'C++': { slug: 'cplusplus', color: '#00599C' },
  JavaScript: { slug: 'javascript', color: '#F7DF1E' },
  TypeScript: { slug: 'typescript', color: '#3178C6' },
  React: { slug: 'react', color: '#61DAFB' },
  Angular: { slug: 'angular', color: '#DD0031' },
  'Node.js': { slug: 'nodejs', color: '#339933' },
  'Spring Boot': { slug: 'spring', color: '#6DB33F' },
  Docker: { slug: 'docker', color: '#2496ED' },
  Kubernetes: { slug: 'kubernetes', color: '#326CE5' },
  AWS: { slug: 'amazonaws', color: '#FF9900' },
  Azure: { slug: 'azure', color: '#0078D4' },
  GCP: { slug: 'googlecloud', color: '#4285F4' },
  TensorFlow: { slug: 'tensorflow', color: '#FF6F00' },
  PyTorch: { slug: 'pytorch', color: '#EE4C2C' },
  MongoDB: { slug: 'mongodb', color: '#47A248' },
  MySQL: { slug: 'mysql', color: '#4479A1' },
  PostgreSQL: { slug: 'postgresql', color: '#4169E1' },
  AI: { slug: 'ai', color: '#8A2BE2' },
  'Machine Learning': { slug: 'ml', color: '#FF1493' },
  'Data Science': { slug: 'datascience', color: '#20B2AA' },
  SQL: { slug: 'sql', color: '#4682B4' },
  DevOps: { slug: 'devops', color: '#7FFF00' },
};

export const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const DEFAULT_PAGE_SIZE = 10;
