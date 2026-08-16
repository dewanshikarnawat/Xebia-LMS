'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '@/services-lms/api';
import { generateId } from '@/utils-lms';
import { initialMockData } from '@/services-lms/mockData';
import { BRAND_DEFAULTS } from '@/constants-lms';
import { useToast } from '@/hooks-lms/useToast';
import { getAIPlaceholderImage } from '@/utils-lms/placeholderUtils';

const BRAND_KEY = 'xebia-lms-branding';
const NOTIFICATIONS_KEY = 'xebia-lms-notifications';

// ── Backend Mappings ──

function mapBackendCategory(cat) {
  const logo = cat.logo || getAIPlaceholderImage(cat.name, 'logo', cat.color);
  const bannerImage = cat.bannerImage || getAIPlaceholderImage(cat.name, 'banner', cat.color);
  const backgroundImage = cat.backgroundImage || getAIPlaceholderImage(cat.name, 'background', cat.color);
  const thumbnail = cat.thumbnail || getAIPlaceholderImage(cat.name, 'thumbnail', cat.color);

  return {
    id: cat.id,
    name: cat.name,
    description: cat.description || '',
    icon: cat.icon || logo || '💻',
    color: cat.color || '#007ACC',
    status: cat.isActive ? 'active' : 'inactive',
    logo,
    bannerImage,
    backgroundImage,
    thumbnail,
    courseCount: 0, // Computed dynamically from courses list
    createdAt: cat.createdAt || new Date().toISOString(),
    updatedAt: cat.updatedAt || new Date().toISOString(),
    deletedAt: cat.isActive ? null : new Date().toISOString(),
  };
}

function mapBackendContent(ct) {
  let extraMeta = {};
  if (ct.text && !['text', 'notes', 'code', 'heading', 'callout', 'table'].includes(ct.type)) {
    try {
      extraMeta = JSON.parse(ct.text);
    } catch {
      // Fallback if it is not valid JSON
    }
  }

  return {
    id: ct.id,
    submoduleId: ct.submodule?.id,
    title: ct.title || 'Untitled Content',
    type: ct.type || 'notes',
    contentOrder: ct.contentOrder || 1,
    fileSize: extraMeta.fileSize || 0,
    fileUrl: extraMeta.fileUrl || ct.videoUrl || (ct.type === 'image' ? ct.imageUrl : '') || '',
    thumbnail: ct.type === 'image' ? null : (ct.imageUrl || ''),
    duration: extraMeta.duration || ct.caption || null,
    pageCount: extraMeta.pageCount || null,
    slideCount: extraMeta.slideCount || null,
    markdown: ['notes', 'text', 'heading', 'callout', 'table'].includes(ct.type) ? ct.text : (extraMeta.markdown || ''),
    code: ct.code || '',
    language: ct.language || '',
    alt: ct.alt || '',
    caption: ct.caption || '',
    headingLevel: ct.headingLevel || 2,
    status: ct.isActive ? 'active' : 'inactive',
    createdAt: ct.createdAt || new Date().toISOString(),
    updatedAt: ct.updatedAt || new Date().toISOString(),
  };
}

function mapBackendSubmodule(sub) {
  const logo = sub.logo || getAIPlaceholderImage(sub.title, 'logo');
  const banner = sub.banner || getAIPlaceholderImage(sub.title, 'banner');
  const backgroundImage = sub.backgroundImage || getAIPlaceholderImage(sub.title, 'background');
  const thumbnail = sub.thumbnail || getAIPlaceholderImage(sub.title, 'thumbnail');

  return {
    id: sub.id,
    moduleId: sub.moduleId,
    title: sub.title || 'Untitled Submodule',
    description: sub.description || '',
    slug: sub.slug || '',
    metaTitle: sub.metaTitle || '',
    metaDescription: sub.metaDescription || '',
    canonicalUrl: sub.canonicalUrl || '',
    ogTitle: sub.ogTitle || '',
    ogImage: sub.ogImage || '',
    submoduleOrder: sub.submoduleOrder || 1,
    status: sub.isActive ? 'active' : 'inactive',
    logo,
    banner,
    backgroundImage,
    thumbnail,
    contents: (sub.contents || []).map(mapBackendContent),
    createdAt: sub.createdAt || new Date().toISOString(),
    updatedAt: sub.updatedAt || new Date().toISOString(),
  };
}

function mapBackendModule(mod) {
  const logo = mod.logo || getAIPlaceholderImage(mod.title, 'logo');
  const banner = mod.banner || getAIPlaceholderImage(mod.title, 'banner');
  const backgroundImage = mod.backgroundImage || getAIPlaceholderImage(mod.title, 'background');
  const thumbnail = mod.thumbnail || getAIPlaceholderImage(mod.title, 'thumbnail');

  return {
    id: mod.id,
    courseId: mod.courseId,
    title: mod.title || 'Untitled Module',
    description: mod.description || '',
    moduleOrder: mod.moduleOrder || 1,
    status: mod.isActive ? 'active' : 'inactive',
    logo,
    banner,
    backgroundImage,
    thumbnail,
    submodules: (mod.submodules || []).map(mapBackendSubmodule),
    createdAt: mod.createdAt || new Date().toISOString(),
    updatedAt: mod.updatedAt || new Date().toISOString(),
  };
}

function mapBackendCourse(course) {
  let status = 'draft';
  if (course.isPublished) status = 'published';
  else if (course.isActive === false) status = 'archived';

  const logo = course.icon || getAIPlaceholderImage(course.title, 'logo');
  const bannerImage = course.bannerImage || getAIPlaceholderImage(course.title, 'banner');
  const thumbnail = course.thumbnail || getAIPlaceholderImage(course.title, 'thumbnail');

  return {
    id: course.id,
    categoryId: course.category?.id || course.categoryId,
    category: course.category,
    title: course.title,
    slug: course.slug,
    description: course.description || '',
    shortDescription: course.shortDescription || '',
    technology: course.seoCategory || 'Python', // Map seoCategory to technology
    difficulty: course.level || 'Intermediate', // Map level to difficulty
    duration: course.duration || '8 weeks',
    language: course.language || 'English',
    status,
    logo,
    bannerImage,
    thumbnail,
    youtubeVideoUrl: course.youtubeVideoUrl || '',
    previewVideoUrl: course.previewVideoUrl || '',
    createdAt: course.createdAt || new Date().toISOString(),
    updatedAt: course.updatedAt || new Date().toISOString(),
    modules: (course.modules || []).map(mapBackendModule),
    enrolledStudents: course.totalClicks || 0, // Map clicks/views

    // SEO Details
    metaTitle: course.metaTitle || '',
    metaDescription: course.metaDescription || '',
    metaKeywords: course.metaKeywords || '',
    canonicalUrl: course.canonicalUrl || '',
    primaryKeyword: course.primaryKeyword || '',
    secondaryKeywords: course.secondaryKeywords || '',
    focusKeywords: course.focusKeywords || '',
    robots: course.robots || 'index, follow',
    ogTitle: course.ogTitle || '',
    ogDescription: course.ogDescription || '',
    ogImage: course.ogImage || '',
    ogUrl: course.ogUrl || '',
    ogType: course.ogType || 'website',
    twitterTitle: course.twitterTitle || '',
    twitterDescription: course.twitterDescription || '',
    twitterImage: course.twitterImage || '',
    twitterCard: course.twitterCard || 'summary_large_image',
    schemaMarkup: course.schemaMarkup || '',
    faqSchema: course.faqSchema || '',
    breadcrumbSchema: course.breadcrumbSchema || '',
    learningOutcomes: course.learningOutcomes || '',
    prerequisites: course.prerequisites || '',
    targetAudience: course.targetAudience || '',
    courseHighlights: course.courseHighlights || '',
    careerOpportunities: course.careerOpportunities || '',
    seoScore: course.seoScore || 0,
    allowIndexing: course.allowIndexing !== false,
    showInSearch: course.showInSearch !== false,
    enableCertificate: course.enableCertificate !== undefined ? course.enableCertificate : false,
    minQuizScore: course.minQuizScore !== undefined && course.minQuizScore !== null ? course.minQuizScore : null,
    minCourseCompletion: course.minCourseCompletion !== undefined && course.minCourseCompletion !== null ? course.minCourseCompletion : 100,
    assignmentRequirement: course.assignmentRequirement || 'Optional',
    finalAssessmentRequirement: course.finalAssessmentRequirement !== undefined ? course.finalAssessmentRequirement : false,
    minAttendanceHours: course.minAttendanceHours !== undefined && course.minAttendanceHours !== null ? course.minAttendanceHours : null,
  };
}

// ── Payload Generators ──

function mapCourseToBackendPayload(form) {
  let isActive = true;
  let isPublished = false;
  if (form.status === 'published') {
    isPublished = true;
  } else if (form.status === 'archived') {
    isActive = false;
  }

  return {
    title: form.title,
    slug: form.slug || `${form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${generateId().split('-').pop()}`,
    description: form.description || '',
    shortDescription: form.shortDescription || '',
    level: form.difficulty || 'Intermediate',
    language: form.language || 'English',
    duration: form.duration || '8 weeks',
    seoCategory: form.technology || 'Python',
    categoryId: Number(form.categoryId),
    isActive,
    isPublished,
    icon: form.logo || form.icon || '',
    bannerImage: form.bannerImage || '',
    thumbnail: form.thumbnail || '',
    youtubeVideoUrl: form.youtubeVideoUrl || '',
    previewVideoUrl: form.previewVideoUrl || '',

    // SEO Details
    metaTitle: form.metaTitle || '',
    metaDescription: form.metaDescription || '',
    metaKeywords: form.metaKeywords || '',
    canonicalUrl: form.canonicalUrl || '',
    primaryKeyword: form.primaryKeyword || '',
    secondaryKeywords: form.secondaryKeywords || '',
    focusKeywords: form.focusKeywords || '',
    robots: form.robots || 'index, follow',
    ogTitle: form.ogTitle || '',
    ogDescription: form.ogDescription || '',
    ogImage: form.ogImage || '',
    ogUrl: form.ogUrl || '',
    ogType: form.ogType || 'website',
    twitterTitle: form.twitterTitle || '',
    twitterDescription: form.twitterDescription || '',
    twitterImage: form.twitterImage || '',
    twitterCard: form.twitterCard || 'summary_large_image',
    schemaMarkup: form.schemaMarkup || '',
    faqSchema: form.faqSchema || '',
    breadcrumbSchema: form.breadcrumbSchema || '',
    learningOutcomes: form.learningOutcomes || '',
    prerequisites: form.prerequisites || '',
    targetAudience: form.targetAudience || '',
    courseHighlights: form.courseHighlights || '',
    careerOpportunities: form.careerOpportunities || '',
    seoScore: Number(form.seoScore) || 0,
    allowIndexing: form.allowIndexing !== false,
    showInSearch: form.showInSearch !== false,
    enableCertificate: form.enableCertificate !== undefined ? form.enableCertificate : false,
    minQuizScore: form.minQuizScore !== undefined && form.minQuizScore !== '' && form.minQuizScore !== null ? Number(form.minQuizScore) : null,
    minCourseCompletion: form.minCourseCompletion !== undefined && form.minCourseCompletion !== '' && form.minCourseCompletion !== null ? Number(form.minCourseCompletion) : 100,
    assignmentRequirement: form.assignmentRequirement || 'Optional',
    finalAssessmentRequirement: form.finalAssessmentRequirement !== undefined ? form.finalAssessmentRequirement : false,
    minAttendanceHours: form.minAttendanceHours !== undefined && form.minAttendanceHours !== '' && form.minAttendanceHours !== null ? Number(form.minAttendanceHours) : null,
  };
}

function mapCategoryToBackendPayload(form) {
  return {
    name: form.name,
    description: form.description || '',
    icon: form.icon || '💻',
    color: form.color || '#007ACC',
    isActive: form.status !== 'inactive',
    logo: form.logo || '',
    bannerImage: form.bannerImage || '',
    backgroundImage: form.backgroundImage || '',
    thumbnail: form.thumbnail || '',
  };
}

function mapModuleToBackendPayload(courseId, form) {
  return {
    title: form.title || 'New Module',
    description: form.description || '',
    moduleOrder: form.moduleOrder || 1,
    isActive: form.status !== 'inactive',
    courseId: Number(courseId),
    logo: form.logo || '',
    banner: form.banner || '',
    backgroundImage: form.backgroundImage || '',
    thumbnail: form.thumbnail || '',
  };
}

function mapSubmoduleToBackendPayload(moduleId, form) {
  const rawSlug = form.slug || form.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'submodule';
  const cleanSlug = rawSlug.includes('-') && rawSlug.split('-').pop().length === 7 ? rawSlug : `${rawSlug}-${generateId().split('-').pop()}`;

  return {
    title: form.title || 'New Submodule',
    description: form.description || '',
    slug: cleanSlug,
    metaTitle: form.metaTitle || '',
    metaDescription: form.metaDescription || '',
    canonicalUrl: form.canonicalUrl || '',
    ogTitle: form.ogTitle || '',
    ogImage: form.ogImage || form.ogImageUrl || '',
    submoduleOrder: form.submoduleOrder || 1,
    isActive: form.status !== 'inactive',
    moduleId: Number(moduleId),
    logo: form.logo || '',
    banner: form.banner || '',
    backgroundImage: form.backgroundImage || '',
    thumbnail: form.thumbnail || '',
  };
}

function mapContentToBackendPayload(submoduleId, form) {
  let text = form.markdown || '';
  if (!['text', 'notes', 'code', 'heading', 'callout', 'table'].includes(form.type)) {
    text = JSON.stringify({
      fileSize: form.fileSize || 0,
      fileUrl: form.fileUrl || '',
      duration: form.duration || '',
      pageCount: form.pageCount || null,
      slideCount: form.slideCount || null,
      markdown: form.markdown || '',
    });
  }

  return {
    type: form.type || 'notes',
    text,
    code: form.code || '',
    language: form.language || '',
    videoUrl: form.type === 'video' ? (form.fileUrl || '') : '',
    imageUrl: form.type === 'image' ? (form.fileUrl || '') : (form.thumbnail || ''),
    alt: form.alt || '',
    caption: form.caption || '',
    headingLevel: form.headingLevel || 2,
    title: form.title || 'Untitled Content',
    contentOrder: form.contentOrder || 1,
    isActive: form.status !== 'inactive',
    submoduleId: Number(submoduleId),
  };
}

function loadNotifications() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    /* use defaults */
  }
  return [
    { id: 'notif-1', type: 'student_registered', title: 'Student Registered', message: 'Aarav Sharma registered for Python Masterclass', read: false, createdAt: new Date(Date.now() - 3600 * 2000).toISOString() },
    { id: 'notif-2', type: 'course_updated', title: 'Course Updated', message: 'DevOps Pipeline Mastery course was updated by Student', read: false, createdAt: new Date(Date.now() - 3600 * 8000).toISOString() },
    { id: 'notif-3', type: 'content_uploaded', title: 'Content Uploaded', message: 'Lab Manual.pdf (12.4 MB) added to AWS Solutions Architect', read: true, createdAt: new Date(Date.now() - 3600 * 24000).toISOString() },
    { id: 'notif-4', type: 'course_created', title: 'New Course Added', message: 'New Course: Azure AI Engineer created as Draft', read: true, createdAt: new Date(Date.now() - 3600 * 48000).toISOString() },
  ];
}

function loadBranding() {
  if (typeof window === 'undefined') return BRAND_DEFAULTS;
  try {
    const stored = localStorage.getItem(BRAND_KEY);
    if (stored) return { ...BRAND_DEFAULTS, ...JSON.parse(stored) };
  } catch {
    /* use defaults */
  }
  return BRAND_DEFAULTS;
}

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const [data, setData] = useState({
    categories: [],
    courses: [],
    students: initialMockData.students,
    instructors: initialMockData.instructors,
  });
  
  const [branding, setBrandingState] = useState(BRAND_DEFAULTS);
  const [notifications, setNotifications] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const { showToast } = useToast();

  // Load backend data and initialize local store configs
  const refreshData = useCallback(async () => {
    try {
      const [resCat, resCourse] = await Promise.all([
        api.get('/categories'),
        api.get('/courses')
      ]);

      const rawCats = resCat.data.data || [];
      const rawCourses = resCourse.data.data || [];

      const mappedCourses = rawCourses.map(mapBackendCourse);
      const mappedCats = rawCats.map(cat => {
        const catCourses = mappedCourses.filter(c => c.categoryId === cat.id);
        const mappedCat = mapBackendCategory(cat);
        mappedCat.courseCount = catCourses.length;
        return mappedCat;
      });

      setData(prev => ({
        ...prev,
        categories: mappedCats,
        courses: mappedCourses,
      }));
    } catch (err) {
      console.error('Error fetching data from API:', err);
      showToast('Error syncing with backend server', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    refreshData().then(() => {
      setBrandingState(loadBranding());
      setNotifications(loadNotifications());
      setHydrated(true);
    });

    const interval = setInterval(() => {
      refreshData();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshData]);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }
  }, [notifications, hydrated]);

  const addNotification = useCallback((type, title, message) => {
    const newNotif = {
      id: generateId(),
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const setBranding = useCallback((updates) => {
    setBrandingState((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(BRAND_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // ── Categories ──
  const getCategory = useCallback(
    (id) => data.categories.find((c) => c.id === Number(id) || c.id === id),
    [data.categories]
  );

  const createCategory = useCallback(async (payload) => {
    try {
      const backendPayload = mapCategoryToBackendPayload(payload);
      const res = await api.post('/categories', backendPayload);
      await refreshData();
      showToast('Category created successfully');
      return mapBackendCategory(res.data.data);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create category', 'error');
      throw error;
    }
  }, [showToast, refreshData]);

  const updateCategory = useCallback(async (id, updates) => {
    try {
      const category = data.categories.find((c) => c.id === id);
      const merged = { ...category, ...updates };
      const backendPayload = mapCategoryToBackendPayload(merged);
      await api.put(`/categories/${id}`, backendPayload);
      await refreshData();
      showToast('Category updated successfully');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update category', 'error');
      throw error;
    }
  }, [data.categories, showToast, refreshData]);

  const deleteCategory = useCallback(async (id, hard = false) => {
    try {
      await api.delete(`/categories/${id}`);
      await refreshData();
      showToast('Category deleted successfully');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete category', 'error');
      throw error;
    }
  }, [showToast, refreshData]);

  const restoreCategory = useCallback((id) => {
    showToast('Restore is not supported by the backend database', 'info');
  }, [showToast]);

  // ── Courses ──
  const fetchCoursesPage = useCallback(async (page, size, sortBy = 'createdAt', sortDir = 'desc', search = '', categoryId = null, level = '', isActive = null, isPublished = null) => {
    try {
      const params = {
        page: String(page),
        size: String(size),
        sortBy,
        sortDir
      };
      if (search) params.search = search;
      if (categoryId && categoryId !== 'All' && categoryId !== 'all') params.categoryId = String(categoryId);
      if (level && level !== 'All' && level !== 'all') params.level = level;
      if (isActive !== null) params.isActive = String(isActive);
      if (isPublished !== null) params.isPublished = String(isPublished);

      const res = await api.get('/courses', { params });
      const rawData = res.data.data;
      if (rawData && rawData.content) {
        rawData.content = rawData.content.map(mapBackendCourse);
      }
      return rawData;
    } catch (err) {
      console.error('Error fetching paginated courses:', err);
      throw err;
    }
  }, []);

  const getCourse = useCallback(
    (id) => data.courses.find((c) => c.id === Number(id) || c.id === id),
    [data.courses]
  );

  const getCoursesByCategory = useCallback(
    (categoryId) => data.courses.filter((c) => c.categoryId === Number(categoryId) || c.categoryId === categoryId),
    [data.courses]
  );

  const createCourse = useCallback(async (payload) => {
    try {
      const backendPayload = mapCourseToBackendPayload(payload);
      const res = await api.post('/courses', backendPayload);
      await refreshData();
      showToast('Course created successfully');
      return mapBackendCourse(res.data.data);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create course', 'error');
      throw error;
    }
  }, [showToast, refreshData]);

  const updateCourse = useCallback(async (id, updates) => {
    try {
      const course = data.courses.find((c) => c.id === id);
      const merged = { ...course, ...updates };
      const backendPayload = mapCourseToBackendPayload(merged);
      await api.put(`/courses/${id}`, backendPayload);
      await refreshData();
      showToast('Course updated successfully');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update course', 'error');
      throw error;
    }
  }, [data.courses, showToast, refreshData]);

  const deleteCourse = useCallback(async (id, hard = false) => {
    try {
      await api.delete(`/courses/${id}`);
      await refreshData();
      showToast('Course deleted successfully');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete course', 'error');
      throw error;
    }
  }, [showToast, refreshData]);

  const duplicateCourse = useCallback(async (id) => {
    try {
      const course = data.courses.find((c) => c.id === id);
      if (!course) return null;

      // 1. Create duplicate course
      const duplicatedCoursePayload = {
        ...course,
        title: `${course.title} (Copy)`,
        slug: `${course.slug}-copy-${Date.now()}`,
        status: 'draft',
      };
      const resCourse = await api.post('/courses', mapCourseToBackendPayload(duplicatedCoursePayload));
      const newCourse = mapBackendCourse(resCourse.data.data);

      // 2. Duplicate modules recursively
      for (const mod of course.modules || []) {
        const resMod = await api.post('/modules', mapModuleToBackendPayload(newCourse.id, {
          title: mod.title,
          description: mod.description,
          moduleOrder: mod.moduleOrder,
          status: mod.status,
        }));
        const newMod = resMod.data.data;

        // 3. Duplicate submodules
        for (const sub of mod.submodules || []) {
          const resSub = await api.post('/submodules', mapSubmoduleToBackendPayload(newMod.id, {
            title: sub.title,
            description: sub.description,
            slug: `${sub.slug}-copy-${Date.now()}`,
            metaTitle: sub.metaTitle,
            metaDescription: sub.metaDescription,
            submoduleOrder: sub.submoduleOrder,
            status: sub.status,
          }));
          const newSub = resSub.data.data;

          // 4. Duplicate contents
          for (const ct of sub.contents || []) {
            await api.post('/contents', mapContentToBackendPayload(newSub.id, {
              type: ct.type,
              title: ct.title,
              markdown: ct.markdown,
              code: ct.code,
              language: ct.language,
              fileSize: ct.fileSize,
              fileUrl: ct.fileUrl,
              duration: ct.duration,
              pageCount: ct.pageCount,
              slideCount: ct.slideCount,
              status: ct.status,
              contentOrder: ct.contentOrder,
            }));
          }
        }
      }

      await refreshData();
      showToast('Course duplicated successfully');
      return newCourse;
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to duplicate course', 'error');
      throw error;
    }
  }, [data.courses, showToast, refreshData]);

  // ── Modules ──
  const addModule = useCallback(async (courseId, payload = {}) => {
    try {
      const course = data.courses.find((c) => c.id === courseId);
      const order = (course?.modules?.length || 0) + 1;
      const backendPayload = mapModuleToBackendPayload(courseId, { ...payload, moduleOrder: order });
      const res = await api.post('/modules', backendPayload);
      await refreshData();
      showToast('Module created successfully');
      return res.data.data;
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to add module', 'error');
      throw error;
    }
  }, [data.courses, showToast, refreshData]);

  const updateModule = useCallback(async (courseId, moduleId, updates) => {
    try {
      const course = data.courses.find((c) => c.id === courseId);
      const mod = course?.modules?.find((m) => m.id === moduleId);
      const merged = { ...mod, ...updates };
      const backendPayload = mapModuleToBackendPayload(courseId, merged);
      await api.put(`/modules/${moduleId}`, backendPayload);
      await refreshData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update module', 'error');
      throw error;
    }
  }, [data.courses, showToast, refreshData]);

  const deleteModule = useCallback(async (courseId, moduleId) => {
    try {
      await api.delete(`/modules/${moduleId}`);
      await refreshData();
      showToast('Module deleted successfully');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete module', 'error');
      throw error;
    }
  }, [showToast, refreshData]);

  const duplicateModule = useCallback(async (courseId, moduleId) => {
    try {
      const course = data.courses.find((c) => c.id === courseId);
      const mod = course?.modules?.find((m) => m.id === moduleId);
      if (!mod) return null;

      // 1. Create duplicate module
      const resMod = await api.post('/modules', mapModuleToBackendPayload(courseId, {
        title: `${mod.title} (Copy)`,
        description: mod.description,
        moduleOrder: (course.modules?.length || 0) + 1,
        status: mod.status,
      }));
      const newMod = resMod.data.data;

      // 2. Duplicate submodules
      for (const sub of mod.submodules || []) {
        const resSub = await api.post('/submodules', mapSubmoduleToBackendPayload(newMod.id, {
          title: sub.title,
          description: sub.description,
          slug: `${sub.slug}-copy-${Date.now()}`,
          metaTitle: sub.metaTitle,
          metaDescription: sub.metaDescription,
          submoduleOrder: sub.submoduleOrder,
          status: sub.status,
        }));
        const newSub = resSub.data.data;

        // 3. Duplicate contents
        for (const ct of sub.contents || []) {
          await api.post('/contents', mapContentToBackendPayload(newSub.id, {
            type: ct.type,
            title: ct.title,
            markdown: ct.markdown,
            code: ct.code,
            language: ct.language,
            fileSize: ct.fileSize,
            fileUrl: ct.fileUrl,
            duration: ct.duration,
            pageCount: ct.pageCount,
            slideCount: ct.slideCount,
            status: ct.status,
            contentOrder: ct.contentOrder,
          }));
        }
      }

      await refreshData();
      showToast('Module duplicated successfully');
      return newMod;
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to duplicate module', 'error');
      throw error;
    }
  }, [data.courses, showToast, refreshData]);

  const reorderModules = useCallback(async (courseId, moduleIds) => {
    try {
      const course = data.courses.find((c) => c.id === courseId);
      const promises = moduleIds.map((id, index) => {
        const mod = course?.modules?.find((m) => m.id === id);
        const updated = { ...mod, moduleOrder: index + 1 };
        return api.put(`/modules/${id}`, mapModuleToBackendPayload(courseId, updated));
      });
      await Promise.all(promises);
      await refreshData();
      showToast('Modules reordered');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to reorder modules', 'error');
      throw error;
    }
  }, [data.courses, showToast, refreshData]);

  // ── Submodules ──
  const addSubmodule = useCallback(async (courseId, moduleId, payload = {}) => {
    try {
      const course = data.courses.find((c) => c.id === courseId);
      const mod = course?.modules?.find((m) => m.id === moduleId);
      const order = (mod?.submodules?.length || 0) + 1;
      const backendPayload = mapSubmoduleToBackendPayload(moduleId, { ...payload, submoduleOrder: order });
      const res = await api.post('/submodules', backendPayload);
      await refreshData();
      showToast('Submodule created successfully');
      return res.data.data;
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to add submodule', 'error');
      throw error;
    }
  }, [data.courses, showToast, refreshData]);

  const updateSubmodule = useCallback(async (courseId, moduleId, submoduleId, updates) => {
    try {
      const course = data.courses.find((c) => c.id === courseId);
      const mod = course?.modules?.find((m) => m.id === moduleId);
      const sub = mod?.submodules?.find((s) => s.id === submoduleId);
      const merged = { ...sub, ...updates };
      const backendPayload = mapSubmoduleToBackendPayload(moduleId, merged);
      await api.put(`/submodules/${submoduleId}`, backendPayload);
      await refreshData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update submodule', 'error');
      throw error;
    }
  }, [data.courses, showToast, refreshData]);

  const deleteSubmodule = useCallback(async (courseId, moduleId, submoduleId) => {
    try {
      await api.delete(`/submodules/${submoduleId}`);
      await refreshData();
      showToast('Submodule deleted successfully');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete submodule', 'error');
      throw error;
    }
  }, [showToast, refreshData]);

  const duplicateSubmodule = useCallback(async (courseId, moduleId, submoduleId) => {
    try {
      const course = data.courses.find((c) => c.id === courseId);
      const mod = course?.modules?.find((m) => m.id === moduleId);
      const sub = mod?.submodules?.find((s) => s.id === submoduleId);
      if (!sub) return null;

      // 1. Create duplicate submodule
      const resSub = await api.post('/submodules', mapSubmoduleToBackendPayload(moduleId, {
        title: `${sub.title} (Copy)`,
        description: sub.description,
        slug: `${sub.slug}-copy-${Date.now()}`,
        metaTitle: sub.metaTitle,
        metaDescription: sub.metaDescription,
        submoduleOrder: (mod.submodules?.length || 0) + 1,
        status: sub.status,
      }));
      const newSub = resSub.data.data;

      // 2. Duplicate contents
      for (const ct of sub.contents || []) {
        await api.post('/contents', mapContentToBackendPayload(newSub.id, {
          type: ct.type,
          title: ct.title,
          markdown: ct.markdown,
          code: ct.code,
          language: ct.language,
          fileSize: ct.fileSize,
          fileUrl: ct.fileUrl,
          duration: ct.duration,
          pageCount: ct.pageCount,
          slideCount: ct.slideCount,
          status: ct.status,
          contentOrder: ct.contentOrder,
        }));
      }

      await refreshData();
      showToast('Submodule duplicated successfully');
      return newSub;
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to duplicate submodule', 'error');
      throw error;
    }
  }, [data.courses, showToast, refreshData]);

  const reorderSubmodules = useCallback(async (courseId, moduleId, submoduleIds) => {
    try {
      const course = data.courses.find((c) => c.id === courseId);
      const mod = course?.modules?.find((m) => m.id === moduleId);
      const promises = submoduleIds.map((id, index) => {
        const sub = mod?.submodules?.find((s) => s.id === id);
        const updated = { ...sub, submoduleOrder: index + 1 };
        return api.put(`/submodules/${id}`, mapSubmoduleToBackendPayload(moduleId, updated));
      });
      await Promise.all(promises);
      await refreshData();
      showToast('Submodules reordered');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to reorder submodules', 'error');
      throw error;
    }
  }, [data.courses, showToast, refreshData]);

  // ── Content ──
  const addContent = useCallback(async (courseId, moduleId, submoduleId, payload) => {
    if (!submoduleId || Number(submoduleId) <= 0) {
      showToast('Please create or select a lesson/submodule first.', 'error');
      throw new Error('Invalid submoduleId');
    }
    try {
      const course = data.courses.find((c) => c.id === courseId);
      const mod = course?.modules?.find((m) => m.id === moduleId);
      const sub = mod?.submodules?.find((s) => s.id === submoduleId);
      const order = (sub?.contents?.length || 0) + 1;
      const backendPayload = mapContentToBackendPayload(submoduleId, { ...payload, contentOrder: order });
      const res = await api.post('/contents', backendPayload);
      await refreshData();
      showToast('Content created successfully');
      return res.data.data;
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to add content', 'error');
      throw error;
    }
  }, [data.courses, showToast, refreshData]);

  const updateContent = useCallback(async (courseId, moduleId, submoduleId, contentId, updates) => {
    if (!submoduleId || Number(submoduleId) <= 0) {
      showToast('Please create or select a lesson/submodule first.', 'error');
      throw new Error('Invalid submoduleId');
    }
    try {
      const course = data.courses.find((c) => c.id === courseId);
      const mod = course?.modules?.find((m) => m.id === moduleId);
      const sub = mod?.submodules?.find((s) => s.id === submoduleId);
      const ct = sub?.contents?.find((c) => c.id === contentId);
      const merged = { ...ct, ...updates };
      const backendPayload = mapContentToBackendPayload(submoduleId, merged);
      await api.put(`/contents/${contentId}`, backendPayload);
      await refreshData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update content', 'error');
      throw error;
    }
  }, [data.courses, showToast, refreshData]);

  const deleteContent = useCallback(async (courseId, moduleId, submoduleId, contentId) => {
    try {
      await api.delete(`/contents/${contentId}`);
      await refreshData();
      showToast('Content deleted successfully');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete content', 'error');
      throw error;
    }
  }, [showToast, refreshData]);

  const duplicateContent = useCallback(async (courseId, moduleId, submoduleId, contentId) => {
    try {
      const course = data.courses.find((c) => c.id === courseId);
      const mod = course?.modules?.find((m) => m.id === moduleId);
      const sub = mod?.submodules?.find((s) => s.id === submoduleId);
      const ct = sub?.contents?.find((c) => c.id === contentId);
      if (!ct) return null;

      const res = await api.post('/contents', mapContentToBackendPayload(submoduleId, {
        type: ct.type,
        title: `${ct.title} (Copy)`,
        markdown: ct.markdown,
        code: ct.code,
        language: ct.language,
        fileSize: ct.fileSize,
        fileUrl: ct.fileUrl,
        duration: ct.duration,
        pageCount: ct.pageCount,
        slideCount: ct.slideCount,
        status: ct.status,
        contentOrder: (sub.contents?.length || 0) + 1,
      }));

      await refreshData();
      showToast('Content duplicated successfully');
      return res.data.data;
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to duplicate content', 'error');
      throw error;
    }
  }, [data.courses, showToast, refreshData]);

  const reorderContent = useCallback(async (courseId, moduleId, submoduleId, contentIds) => {
    try {
      const course = data.courses.find((c) => c.id === courseId);
      const mod = course?.modules?.find((m) => m.id === moduleId);
      const sub = mod?.submodules?.find((s) => s.id === submoduleId);
      const promises = contentIds.map((id, index) => {
        const ct = sub?.contents?.find((c) => c.id === id);
        const updated = { ...ct, contentOrder: index + 1 };
        return api.put(`/contents/${id}`, mapContentToBackendPayload(submoduleId, updated));
      });
      await Promise.all(promises);
      await refreshData();
      showToast('Content items reordered');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to reorder contents', 'error');
      throw error;
    }
  }, [data.courses, showToast, refreshData]);

  const mediaLibrary = useMemo(() => {
    const items = [];
    data.courses.forEach((course) => {
      course.modules?.forEach((mod) => {
        mod.submodules?.forEach((sub) => {
          sub.contents?.forEach((content) => {
            if (content.type !== 'link' && content.type !== 'notes') {
              items.push({
                id: `${course.id}-${mod.id}-${sub.id}-${content.id}`,
                title: content.title,
                type: content.type,
                fileSize: content.fileSize,
                fileUrl: content.fileUrl,
                courseId: course.id,
                courseName: course.title,
                uploadedAt: content.createdAt,
                updatedAt: content.updatedAt,
              });
            }
          });
        });
      });
    });
    return items;
  }, [data.courses]);

  const value = useMemo(
    () => ({
      ...data,
      mediaLibrary,
      notifications,
      addNotification,
      markAllNotificationsAsRead,
      clearNotifications,
      hydrated,
      branding,
      setBranding,
      getCategory,
      getCourse,
      getCoursesByCategory,
      fetchCoursesPage,
      createCategory,
      updateCategory,
      deleteCategory,
      restoreCategory,
      createCourse,
      updateCourse,
      deleteCourse,
      duplicateCourse,
      addModule,
      updateModule,
      deleteModule,
      duplicateModule,
      reorderModules,
      addSubmodule,
      updateSubmodule,
      deleteSubmodule,
      duplicateSubmodule,
      reorderSubmodules,
      addContent,
      updateContent,
      deleteContent,
      duplicateContent,
      reorderContent,
    }),
    [
      data, mediaLibrary, notifications, addNotification, markAllNotificationsAsRead, clearNotifications, hydrated, branding, setBranding,
      getCategory, getCourse, getCoursesByCategory, fetchCoursesPage,
      createCategory, updateCategory, deleteCategory, restoreCategory,
      createCourse, updateCourse, deleteCourse, duplicateCourse,
      addModule, updateModule, deleteModule, duplicateModule, reorderModules,
      addSubmodule, updateSubmodule, deleteSubmodule, duplicateSubmodule, reorderSubmodules,
      addContent, updateContent, deleteContent, duplicateContent, reorderContent,
    ]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used within CatalogProvider');
  return ctx;
}


