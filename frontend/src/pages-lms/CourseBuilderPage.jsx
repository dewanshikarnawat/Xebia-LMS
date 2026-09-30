import React from 'react';
import { useParams } from 'react-router-dom';
import { useCatalog } from '@/hooks-lms/useCatalog';
import { useToast } from '@/hooks-lms/useToast';
import Breadcrumb from '@/components/layout-lms/Breadcrumb';
import CourseBuilderWorkspace from '@/features-lms/course/CourseBuilderWorkspace';

export default function CourseBuilderPage() {
  const { courseId } = useParams();
  const catalog = useCatalog();
  const { showToast } = useToast();
  const course = catalog.getCourse(courseId);

  if (!catalog.hydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-primary border-t-transparent" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-brand-surface dark:bg-slate-950 p-6">
        <div className="text-center bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 rounded-2xl p-8 max-w-md shadow-card">
          <h2 className="text-2xl font-bold text-brand-cta mb-2">Course Not Found</h2>
          <p className="text-brand-text-secondary dark:text-slate-400 mb-6">
            The course you are trying to access does not exist or has been deleted.
          </p>
        </div>
      </div>
    );
  }

  const category = catalog.getCategory(course.categoryId);

  const breadcrumbItems = [
    { label: category?.name || 'Category', href: `/admin/categories/${course.categoryId}` },
    { label: course.title },
  ];

  return (
    <div className="flex flex-col h-screen">
      <CourseBuilderWorkspace
        course={course}
        category={category}
        students={catalog.students}
        catalog={catalog}
        showToast={showToast}
      />
    </div>
  );
}

