import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';
import { useCatalog } from '@/hooks-lms/useCatalog';

export default function StudentLayout({ children }) {
  const { branding, hydrated } = useCatalog();
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    document.title = 'Xebia LMS | Student Portal';
    if (hydrated && branding) {
      document.documentElement.style.setProperty('--brand-primary', branding.primaryColor || '#6C1D5F');
      document.documentElement.style.setProperty('--brand-secondary', branding.secondaryColor || '#84117C');
    }
  }, [branding, hydrated]);

  let title = 'Student Portal';
  let subtitle = 'Learning dashboard and student workspace';

  if (path.includes('/student/dashboard')) {
    title = 'Student Dashboard';
    subtitle = 'Welcome back! Here is a summary of your learning progress, statistics, and course certifications.';
  } else if (path.includes('/student/courses')) {
    title = 'My Courses & Learning Paths';
    subtitle = 'Explore real-time enterprise training courses and skill programs published by your organization.';
  } else if (path.includes('/student/learning-content')) {
    title = 'Learning Content';
    subtitle = 'Access study materials, videos, PDFs, and lectures for your enrolled courses.';
  } else if (path.includes('/student/assignments')) {
    title = 'Assignments';
    subtitle = 'View, download, and submit your homework assignments and project work.';
  } else if (path.includes('/student/assessments')) {
    title = 'Assessments & Quizzes';
    subtitle = 'Test your knowledge with quizzes, final exams, and self-assessments.';
  } else if (path.includes('/student/notifications')) {
    title = 'Notifications';
    subtitle = 'Stay updated with notifications regarding course updates, assignments, and grades.';
  } else if (path.includes('/student/profile')) {
    title = 'My Profile';
    subtitle = 'Manage your personal details, academic focus, and profile biography.';
  } else if (path.includes('/student/settings')) {
    title = 'Settings';
    subtitle = 'Configure account settings, security options, and notification preferences.';
  } else if (path.includes('/student/discussion')) {
    title = 'Discussion Board';
    subtitle = 'Collaborate and ask questions with instructors and peer students.';
  } else if (path.includes('/student/leaderboard')) {
    title = 'Leaderboard & Champions';
    subtitle = 'See where you stand among your peers and check your ranking metrics.';
  }

  return (
    <div className="min-h-screen bg-brand-surface dark:bg-[#0B1120] text-brand-text-primary dark:text-[#F8FAFC] transition-colors duration-300">
      <StudentSidebar />
      <div style={{ paddingLeft: 220 }}>
        <StudentHeader title={title} subtitle={subtitle} />
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}

