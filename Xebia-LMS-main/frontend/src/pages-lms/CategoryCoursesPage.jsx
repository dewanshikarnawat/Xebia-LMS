import React from 'react';
import { useParams } from 'react-router-dom';
import CourseManagement from '@/features-lms/course/CourseManagement';

export default function CategoryCoursesPage() {
  const { categoryId } = useParams();
  return <CourseManagement categoryId={categoryId} />;
}

