import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { Layout } from './components/layout/Layout';

// LMS Providers
import { Providers as LmsProviders } from './providers-lms';

// Pages
import { AuthPage } from './pages/auth/AuthPage';
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { TeacherAssignments } from './pages/teacher/TeacherAssignments';
import { TeacherQuizzes } from './pages/teacher/TeacherQuizzes';
import { CreateAssignment } from './pages/teacher/CreateAssignment';
import { SubmittedAssignments } from './pages/teacher/SubmittedAssignments';
import { TeacherProfile } from './pages/teacher/TeacherProfile';
import { BatchManagement } from './pages/teacher/BatchManagement';
import { CourseCatalog } from './pages/teacher/CourseCatalog';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentAssignments } from './pages/student/StudentAssignments';
import { AssignmentDetail } from './pages/student/AssignmentDetail';
import { LearningProgress } from './pages/student/LearningProgress';
import { StudentProfile } from './pages/student/StudentProfile';
import { StudentQuizzes } from './pages/student/StudentQuizzes';
import { QuizAttempt } from './pages/student/QuizAttempt';
import { QuizReview } from './pages/student/QuizReview';
import { StudentCertificates } from './pages/student/StudentCertificates';
import { CertificatePreview } from './pages/student/CertificatePreview';
import { TeacherCertificates } from './pages/teacher/TeacherCertificates';
import { VerifyCertificate } from './pages/shared/VerifyCertificate';
import { StudentMyCoursesPage } from './pages/student/StudentMyCoursesPage';
import { AdminCourseEnrollmentsPage } from './pages/admin/AdminCourseEnrollmentsPage';
import { NotFoundPage } from './pages/shared/NotFoundPage';

// LMS Admin Portal Pages & Features
import CategoryManagement from '@/features-lms/category/CategoryManagement';
import CategoryForm from '@/features-lms/category/CategoryForm';
import MediaLibrary from '@/features-lms/content/MediaLibrary';
import AllCoursesPage from '@/pages-lms/AllCoursesPage';
import CategoryCoursesPage from '@/pages-lms/CategoryCoursesPage';
import CourseBuilderPage from '@/pages-lms/CourseBuilderPage';
import CourseFormPage from '@/pages-lms/CourseFormPage';
import LmsDashboard from '@/features-lms/dashboard/Dashboard';
import UploadContentPage from '@/pages-lms/UploadContentPage';
import LmsAppLayout from '@/components/layout-lms/AppLayout';
import LmsProtectedRoute from '@/components/layout-lms/ProtectedRoute';

// LMS Student Portal Pages & Features
import StudentCoursesPage from '@/features-lms/student/StudentCoursesPage';
import StudentCourseDetailsPage from '@/features-lms/student/StudentCourseDetailsPage';
import StudentLearningContentPage from '@/features-lms/student/StudentLearningContentPage';
import StudentDiscussionPage from '@/features-lms/student/StudentDiscussionPage';
import StudentLeaderboardPage from '@/features-lms/student/StudentLeaderboardPage';

// Events
import EventsDashboard from '@/features-lms/events/EventsDashboard';
import CreateEventPage from '@/features-lms/events/CreateEventPage';
import EventDetailsPage from '@/features-lms/events/EventDetailsPage';
import AdminRegistrationsPage from '@/features-lms/events/AdminRegistrationsPage';
import StudentEventsPage from '@/features-lms/events/StudentEventsPage';
import TeacherEventsPage from '@/features-lms/events/TeacherEventsPage';
import AdminEnrollmentsPage from '@/features-lms/events/AdminEnrollmentsPage';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LmsProviders>
          <BrowserRouter>
            <Routes>
              {/* Unified Auth Page as default route */}
              <Route path="/" element={<AuthPage />} />
              
              {/* Public Certificate Verification Link */}
              <Route path="/verify-certificate/:token" element={<VerifyCertificate />} />

              {/* Redirect legacy teacher login */}
              <Route path="/teacher/login" element={<Navigate to="/?role=teacher" replace />} />

              {/* Teacher Protected */}
              <Route
                path="/teacher/dashboard"
                element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>}
              />
              <Route
                path="/teacher/batches"
                element={<ProtectedRoute role="teacher"><BatchManagement /></ProtectedRoute>}
              />
              <Route
                path="/teacher/assignments"
                element={<ProtectedRoute role="teacher"><TeacherAssignments /></ProtectedRoute>}
              />
              <Route
                path="/teacher/quizzes"
                element={<ProtectedRoute role="teacher"><TeacherQuizzes /></ProtectedRoute>}
              />
              <Route
                path="/teacher/assignments/create"
                element={<ProtectedRoute role="teacher"><CreateAssignment /></ProtectedRoute>}
              />
              <Route
                path="/teacher/assignments/edit/:id"
                element={<ProtectedRoute role="teacher"><CreateAssignment /></ProtectedRoute>}
              />
              <Route
                path="/teacher/submitted"
                element={<ProtectedRoute role="teacher"><SubmittedAssignments /></ProtectedRoute>}
              />
              <Route
                path="/teacher/certificates"
                element={<ProtectedRoute role="teacher"><TeacherCertificates /></ProtectedRoute>}
              />
              <Route
                path="/teacher/profile"
                element={<ProtectedRoute role="teacher"><TeacherProfile /></ProtectedRoute>}
              />
              <Route
                path="/teacher/catalog"
                element={<ProtectedRoute role="teacher"><CourseCatalog /></ProtectedRoute>}
              />
              <Route
                path="/teacher/events"
                element={
                  <ProtectedRoute role="teacher">
                    <Layout role="teacher" title="Events">
                      <TeacherEventsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/events/:id"
                element={
                  <ProtectedRoute role="teacher">
                    <Layout role="teacher" title="Event Details">
                      <EventDetailsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Redirect legacy student login */}
              <Route path="/student/login" element={<Navigate to="/?role=student" replace />} />

              {/* Student Protected (Existing AMS routes) */}
              <Route
                path="/student/dashboard"
                element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>}
              />
              <Route
                path="/student/assignments"
                element={<ProtectedRoute role="student"><StudentAssignments /></ProtectedRoute>}
              />
              <Route
                path="/student/assignments/:id"
                element={<ProtectedRoute role="student"><AssignmentDetail /></ProtectedRoute>}
              />
              <Route
                path="/student/quizzes"
                element={<ProtectedRoute role="student"><StudentQuizzes /></ProtectedRoute>}
              />
              <Route
                path="/student/quizzes/:id/attempt"
                element={<ProtectedRoute role="student"><QuizAttempt /></ProtectedRoute>}
              />
              <Route
                path="/student/quizzes/:id/review"
                element={<ProtectedRoute role="student"><QuizReview /></ProtectedRoute>}
              />
              <Route
                path="/student/certificates"
                element={<ProtectedRoute role="student"><StudentCertificates /></ProtectedRoute>}
              />
              <Route
                path="/student/certificates/preview/:id"
                element={<ProtectedRoute role="student"><CertificatePreview /></ProtectedRoute>}
              />
              <Route
                path="/student/progress"
                element={<ProtectedRoute role="student"><LearningProgress /></ProtectedRoute>}
              />
              <Route
                path="/student/profile"
                element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>}
              />

              {/* Student Protected (New LMS routes wrapped in AMS layout) */}
              <Route
                path="/student/courses"
                element={
                  <ProtectedRoute role="student">
                    <Layout role="student" title="All Courses">
                      <StudentCoursesPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/my-courses"
                element={
                  <ProtectedRoute role="student">
                    <Layout role="student" title="" subtitle="">
                      <StudentMyCoursesPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/courses/:courseId"
                element={
                  <ProtectedRoute role="student">
                    <Layout role="student" title="Course Details">
                      <StudentCourseDetailsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/learning-content"
                element={
                  <ProtectedRoute role="student">
                    <Layout role="student" title="Learning Content">
                      <StudentLearningContentPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/discussion"
                element={
                  <ProtectedRoute role="student">
                    <Layout role="student" title="Discussion Forum">
                      <StudentDiscussionPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/leaderboard"
                element={
                  <ProtectedRoute role="student">
                    <Layout role="student" title="Leaderboard">
                      <StudentLeaderboardPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/events"
                element={
                  <ProtectedRoute role="student">
                    <Layout role="student" title="Events">
                      <StudentEventsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/events/:id"
                element={
                  <ProtectedRoute role="student">
                    <Layout role="student" title="Event Details">
                      <EventDetailsPage />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              {/* Redirect portals to their dashboards */}
              <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
              <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

              {/* Redirect legacy admin login */}
              <Route path="/admin/login" element={<Navigate to="/?role=admin" replace />} />

              {/* LMS Admin Portal Routes */}
              <Route
                path="/admin/*"
                element={
                  <LmsProtectedRoute>
                    <LmsAppLayout>
                      <Routes>
                        <Route path="dashboard" element={<LmsDashboard />} />
                        <Route path="categories" element={<CategoryManagement />} />
                        <Route path="categories/new" element={<CategoryForm />} />
                        <Route path="categories/:categoryId/edit" element={<CategoryForm />} />
                        <Route path="categories/:categoryId" element={<CategoryCoursesPage />} />
                        <Route path="courses" element={<AllCoursesPage />} />
                        <Route path="courses/new" element={<CourseFormPage />} />
                        <Route path="courses/:courseId/edit" element={<CourseFormPage />} />
                        <Route path="courses/:courseId/builder" element={<CourseBuilderPage />} />
                        <Route path="media" element={<MediaLibrary />} />
                        <Route path="upload-content" element={<UploadContentPage />} />
                        <Route path="enrollments" element={<AdminCourseEnrollmentsPage />} />
                        <Route path="events" element={<EventsDashboard />} />
                        <Route path="events/create" element={<CreateEventPage />} />
                        <Route path="events/enrollments" element={<AdminEnrollmentsPage />} />
                        <Route path="events/:id" element={<EventDetailsPage />} />
                        <Route path="events/:id/edit" element={<CreateEventPage />} />
                        <Route path="events/:id/registrations" element={<AdminRegistrationsPage />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </LmsAppLayout>
                  </LmsProtectedRoute>
                }
              />

              {/* Catch all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </LmsProviders>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--brand-background)',
              color: 'var(--text-primary)',
              border: '1px solid var(--brand-border)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#2563EB', secondary: 'white' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: 'white' },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
