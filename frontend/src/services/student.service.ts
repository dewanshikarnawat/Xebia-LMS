import api from './api';
import type { Assignment, Submission } from '../types';

const mapAssignment = (a: any, submissions: any[] = []): Assignment => {
  const sub = submissions.find((s: any) => String(s.assignmentId) === String(a.id));
  let submissionStatus: 'not_submitted' | 'submitted' | 'reviewed' = 'not_submitted';
  let submissionObj: Submission | null = null;

  if (sub) {
    submissionStatus = sub.status === 'REVIEWED' ? 'reviewed' : 'submitted';
    
    let fileName = sub.submissionUrl ? sub.submissionUrl.substring(sub.submissionUrl.lastIndexOf('/') + 1) : 'submission-file';
    try {
      fileName = decodeURIComponent(fileName);
    } catch {}
    if (fileName.includes('_')) {
      fileName = fileName.substring(fileName.indexOf('_') + 1);
    }
    
    submissionObj = {
      id: String(sub.id),
      assignmentId: String(sub.assignmentId),
      studentId: String(sub.studentId),
      uploadedFile: sub.submissionUrl,
      fileName: fileName,
      submittedAt: sub.submittedAt,
      marks: sub.marks,
      feedback: sub.feedback,
      status: sub.status === 'REVIEWED' ? 'reviewed' : 'submitted',
      quizAnswers: sub.quizAnswers,
    };
  }

  let attachmentName = a.resourceUrl ? a.resourceUrl.substring(a.resourceUrl.lastIndexOf('/') + 1) : undefined;
  if (attachmentName) {
    try {
      attachmentName = decodeURIComponent(attachmentName);
    } catch {}
    if (attachmentName.includes('_')) {
      attachmentName = attachmentName.substring(attachmentName.indexOf('_') + 1);
    }
  }

  return {
    id: String(a.id),
    title: a.title,
    subject: a.subject || 'General',
    topic: a.topic || '',
    description: a.description || '',
    instructions: a.instructions || '',
    dueDate: a.dueDate || '',
    dueTime: a.dueTime || '23:59:00',
    maxMarks: a.totalMarks || 100,
    attachment: a.resourceUrl || undefined,
    attachmentName: attachmentName,
    status: a.status === 'ACTIVE' ? 'published' : 'draft',
    assignmentType: a.assignmentType || 'PDF',
    teacherId: String(a.teacherId || ''),
    teacher: {
      id: String(a.teacherId || ''),
      name: a.teacherName || 'Teacher',
    },
    createdAt: a.createdAt || '',
    updatedAt: a.updatedAt || '',
    submissionStatus,
    submission: submissionObj,
    questions: a.questions || [],
    passingMarks: a.passingMarks || (a.totalMarks ? a.totalMarks * 0.4 : 40),
  };
};

export const studentService = {
  // Dashboard & Progress
  getDashboardStats: async () => {
    const res = await api.get('/student/dashboard');
    const dbData = res.data.data;
    
    let reviewedCount = 0;
    let averageGrade = 0;
    try {
      const submissionsRes = await api.get('/student/submissions', { params: { page: '0', size: '1000' } });
      const submissions = submissionsRes.data.data || [];
      
      const reviewed = submissions.filter((s: any) => s.status === 'REVIEWED');
      reviewedCount = reviewed.length;
      
      if (reviewedCount > 0) {
        const assignmentsRes = await api.get('/student/assignments', { params: { page: '0', size: '1000' } });
        const assignments = assignmentsRes.data.data || [];
        const assignmentMap = new Map(assignments.map((a: any) => [a.id, a.totalMarks || 100]));
        
        let totalPercent = 0;
        reviewed.forEach((s: any) => {
          const maxMarks = (assignmentMap.get(s.assignmentId) as number) || 100;
          const marks = (s.marks as number) || 0;
          totalPercent += (marks / maxMarks) * 100;
        });
        averageGrade = Math.round(totalPercent / reviewedCount);
      }
    } catch (e) {
      console.error("Error calculating student dashboard stats", e);
    }
    
    return {
      stats: {
        totalAssignments: dbData.totalAssignments,
        pendingAssignments: dbData.pendingAssignments,
        submittedAssignments: dbData.submittedAssignments,
        reviewedAssignments: reviewedCount,
        averageGrade: averageGrade,
        batchName: dbData.batch,
      }
    };
  },

  getLearningProgress: async () => {
    const [assignmentsRes, submissionsRes] = await Promise.all([
      api.get('/student/assignments', { params: { page: '0', size: '1000' } }),
      api.get('/student/submissions', { params: { page: '0', size: '1000' } }),
    ]);
    
    const assignments = assignmentsRes.data.data || [];
    const submissions = submissionsRes.data.data || [];
    
    const assignmentMap = new Map<number, any>(assignments.map((a: any) => [a.id, a]));
    
    const totalPublished = assignments.length;
    const totalSubmitted = submissions.length;
    const totalReviewed = submissions.filter((s: any) => s.status === 'REVIEWED').length;
    
    const subjectStats = new Map<string, {
      subject: string;
      total: number;
      submitted: number;
      reviewed: number;
      totalEarned: number;
      totalMax: number;
    }>();
    
    assignments.forEach((a: any) => {
      const subName = a.subject || 'General';
      if (!subjectStats.has(subName)) {
        subjectStats.set(subName, {
          subject: subName,
          total: 0,
          submitted: 0,
          reviewed: 0,
          totalEarned: 0,
          totalMax: 0,
        });
      }
      const stat = subjectStats.get(subName)!;
      stat.total += 1;
    });
    
    submissions.forEach((s: any) => {
      const assignment = assignmentMap.get(s.assignmentId);
      const subName = assignment?.subject || 'General';
      
      if (!subjectStats.has(subName)) {
        subjectStats.set(subName, {
          subject: subName,
          total: 0,
          submitted: 0,
          reviewed: 0,
          totalEarned: 0,
          totalMax: 0,
        });
      }
      
      const stat = subjectStats.get(subName)!;
      stat.submitted += 1;
      
      if (s.status === 'REVIEWED') {
        stat.reviewed += 1;
        stat.totalEarned += s.marks || 0;
        stat.totalMax += assignment?.totalMarks || 100;
      }
    });
    
    const subjects = Array.from(subjectStats.values()).map(sub => {
      let percentage = 0;
      if (sub.totalMax > 0) {
        percentage = Math.round((sub.totalEarned / sub.totalMax) * 100);
      } else if (sub.reviewed > 0) {
        percentage = 100;
      }
      return {
        ...sub,
        percentage,
      };
    });
    
    const recentSubmissions = submissions.map((s: any) => {
      const assignment = assignmentMap.get(s.assignmentId);
      let fileName = s.submissionUrl ? s.submissionUrl.substring(s.submissionUrl.lastIndexOf('/') + 1) : 'attachment';
      try {
        fileName = decodeURIComponent(fileName);
      } catch {}
      if (fileName.includes('_')) {
        fileName = fileName.substring(fileName.indexOf('_') + 1);
      }
      
      return {
        id: String(s.id),
        assignmentId: String(s.assignmentId),
        studentId: String(s.studentId),
        uploadedFile: s.submissionUrl,
        fileName: fileName,
        submittedAt: s.submittedAt,
        marks: s.marks,
        feedback: s.feedback,
        status: s.status === 'REVIEWED' ? 'reviewed' : 'submitted',
        assignment: {
          id: String(s.assignmentId),
          title: s.assignmentTitle || assignment?.title || 'Assignment',
          maxMarks: assignment?.totalMarks || 100,
        }
      };
    });
    
    return {
      progress: {
        totalPublished,
        totalSubmitted,
        totalReviewed,
        subjects,
        recentSubmissions,
      }
    };
  },

  getSubmissions: async () => {
    const res = await api.get('/student/submissions', { params: { page: '0', size: '1000' } });
    return res.data.data || [];
  },

  // Assignments
  getAssignments: async (params?: Record<string, string>) => {
    const backendPage = params?.page ? String(Math.max(0, Number(params.page) - 1)) : '0';
    const query = {
      ...params,
      page: backendPage,
      size: params?.limit ?? params?.size ?? '10',
    };

    const [assignmentsRes, submissionsRes] = await Promise.all([
      api.get('/student/assignments', { params: query }),
      api.get('/student/submissions', { params: { page: '0', size: '1000' } }),
    ]);

    const content = assignmentsRes.data.data;
    const rawAssignments = content?.content || [];
    const submissions = submissionsRes.data.data || [];

    const mapped = rawAssignments.map((a: any) => mapAssignment(a, submissions));

    const page = content?.page !== undefined ? content.page + 1 : 1;
    const limit = content?.size || 10;
    const total = content?.totalElements || 0;
    const totalPages = content?.totalPages || 0;

    return {
      assignments: mapped,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  getAssignmentDetail: async (id: string) => {
    const [assignmentRes, submissionsRes] = await Promise.all([
      api.get(`/student/assignments/${id}`),
      api.get('/student/submissions', { params: { page: '0', size: '1000' } }),
    ]);

    const rawAssignment = assignmentRes.data.data;
    const submissions = submissionsRes.data.data || [];
    const assignment = mapAssignment(rawAssignment, submissions);

    return {
      assignment,
    };
  },

  // Submissions
  submitAssignment: async (assignmentId: string, payload: File | { quizAnswersJson: string }, onProgress?: (pct: number) => void) => {
    console.log("Submitting Quiz Payload:", payload);
    const formData = new FormData();
    if (payload instanceof File) {
      formData.append('file', payload);
    } else {
      formData.append('quizAnswersJson', payload.quizAnswersJson);
    }
    try {
      const res = await api.post(`/student/assignments/${assignmentId}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded * 100) / e.total));
          }
        },
      });
      console.log("API Response:", res.data);
      return res.data;
    } catch (error) {
      console.log("API Error:", error);
      throw error;
    }
  },

  getMySubmissions: async () => {
    const res = await api.get('/student/submissions');
    return res.data;
  },

  // Profile
  updateProfile: async (data: FormData) => {
    const name = data.get('name') as string;
    const res = await api.put('/auth/profile/update', null, { params: { name } });
    const userStr = localStorage.getItem('lms_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      user.name = res.data.data.fullName;
      localStorage.setItem('lms_user', JSON.stringify(user));
      return { user };
    }
    throw new Error('User not found');
  },

  // Course Enrollments
  requestCourseEnrollment: async (courseId: string | number) => {
    const res = await api.post(`/enrollments/request/${courseId}`);
    return res.data;
  },

  getMyCourseEnrollments: async (page = 0, size = 1000) => {
    const res = await api.get('/enrollments/my', { params: { page: String(page), size: String(size) } });
    return res.data;
  },

  getCourseEnrollments: async (status?: string, page = 0, size = 1000) => {
    const params: Record<string, string> = { page: String(page), size: String(size) };
    if (status && status !== 'all') {
      params.status = status;
    }
    const res = await api.get('/enrollments', { params });
    return res.data;
  },

  approveCourseEnrollment: async (id: number | string, remarks?: string) => {
    const res = await api.put(`/enrollments/${id}/approve`, remarks ? { remarks } : {});
    return res.data;
  },

  rejectCourseEnrollment: async (id: number | string, remarks?: string) => {
    const res = await api.put(`/enrollments/${id}/reject`, remarks ? { remarks } : {});
    return res.data;
  },
};
