// ─── User Types ──────────────────────────────────────────────────────────────

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject?: string;
  role: 'teacher';
  avatar?: string;
  createdAt?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  enrollmentNumber: string;
  role: 'student';
  avatar?: string;
  createdAt?: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  avatar?: string;
  createdAt?: string;
}

export type User = Teacher | Student | Admin;

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TeacherRegisterData {
  name: string;
  email: string;
  password: string;
  subject?: string;
}

export interface StudentRegisterData {
  name: string;
  email: string;
  enrollmentNumber: string;
  password: string;
}

// ─── Assignment Types ─────────────────────────────────────────────────────────

export interface Question {
  id?: string;
  assignmentId?: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer?: string;
  marks: number;
  difficulty: string;
  questionType?: string; // MCQ, TRUE_FALSE, SHORT_ANSWER
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  topic?: string;
  description: string;
  instructions?: string;
  dueDate: string;
  dueTime?: string;
  maxMarks: number;
  attachment?: string;
  attachmentName?: string;
  status: 'draft' | 'published';
  teacherId: string;
  teacher?: { id: string; name: string; email?: string };
  createdAt: string;
  updatedAt: string;
  batchId?: string;
  batchName?: string;
  submittedCount?: number;
  pendingCount?: number;
  totalStudents?: number;
  submissionStatus?: 'not_submitted' | 'submitted' | 'reviewed';
  submission?: Submission | null;
  _count?: { submissions: number };
  assignmentType?: 'PDF' | 'QUIZ' | 'CODING' | 'PROJECT' | 'PRESENTATION' | 'VIDEO' | 'LINK';
  questions?: Question[];
  passingMarks?: number;
  totalMarks?: number;
}

export interface CreateAssignmentData {
  title: string;
  subject: string;
  topic?: string;
  description: string;
  instructions?: string;
  dueDate: string;
  maxMarks: number;
  passingMarks?: number;
  status: 'draft' | 'published';
  attachment?: File;
  batchId: string;
  assignmentType?: 'PDF' | 'QUIZ' | 'CODING' | 'PROJECT' | 'PRESENTATION' | 'VIDEO' | 'LINK';
  questions?: Question[];
}

// ─── Submission Types ─────────────────────────────────────────────────────────

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  uploadedFile: string;
  fileName: string;
  submittedAt: string;
  marks?: number | null;
  feedback?: string | null;
  status: 'submitted' | 'reviewed' | 'pending';
  quizAnswers?: string;
  student?: {
    id: string;
    name: string;
    email: string;
    enrollmentNumber: string;
    batchName?: string;
  };
  assignment?: {
    id: string;
    title: string;
    maxMarks: number;
    teacher?: { name: string };
  };
  updatedAt?: string;
}

export interface GradeSubmissionData {
  submissionId: string;
  marks: number;
  feedback?: string;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalAssignments: number;
  activeAssignments: number;
  submittedAssignments: number;
  pendingAssignments: number;
  totalStudents: number;
}

export interface StudentDashboardStats {
  totalAssignments: number;
  pendingAssignments: number;
  submittedAssignments: number;
  reviewedAssignments: number;
  averageGrade: number;
  batchName?: string;
}

export interface SubjectProgress {
  subject: string;
  total: number;
  submitted: number;
  reviewed: number;
  totalEarned: number;
  totalMax: number;
  percentage: number;
}

export interface LearningProgressData {
  totalPublished: number;
  totalSubmitted: number;
  totalReviewed: number;
  subjects: SubjectProgress[];
  recentSubmissions: Submission[];
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface Subject {
  id: string;
  subjectCode: string;
  subjectName: string;
  semester?: string;
  department?: string;
}
