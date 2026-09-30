import api from './api';
import type { CreateAssignmentData, GradeSubmissionData, Assignment, Submission } from '../types';

const getOrCreateDefaultBatchId = async () => {
  try {
    const res = await api.get('/teacher/batches');
    const data = res.data.data;
    const batches = Array.isArray(data) ? data : (data?.content || []);
    if (batches.length > 0) {
      return batches[0].id;
    }
    const createRes = await api.post('/teacher/batches', {
      batchName: 'General Class',
      description: 'Default batch for all students',
    });
    return createRes.data.data.id;
  } catch (e) {
    console.error("Error getting/creating default batch", e);
    throw e;
  }
};

const mapSubmission = (s: any, assignmentMaxMarks: number = 100): Submission => {
  let fileName = s.submissionUrl ? s.submissionUrl.substring(s.submissionUrl.lastIndexOf('/') + 1) : 'submission-file';
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
    quizAnswers: s.quizAnswers,
    status: s.status === 'REVIEWED' ? 'reviewed' : 'submitted',
    student: {
      id: String(s.studentId),
      name: s.studentName || 'Student',
      email: s.studentEmail || '',
      enrollmentNumber: s.studentEnrollment || 'ENR-' + s.studentId,
      batchName: s.studentBatchName || 'General Class',
    },
    assignment: {
      id: String(s.assignmentId),
      title: s.assignmentTitle || 'Assignment',
      maxMarks: assignmentMaxMarks,
    }
  };
};

const getDashboardStats = async () => {
  const res = await api.get('/teacher/dashboard');
  const dbData = res.data.data;
  
  let submittedCount = 0;
  let pendingCount = 0;

  try {
    const assignmentsRes = await api.get('/teacher/assignments', { params: { page: '0', size: '100' } });
    const data = assignmentsRes.data.data;
    const assignments = Array.isArray(data) ? data : (data?.content || []);
    
    const submissionPromises = assignments.map(async (assignment: any) => {
      try {
        const subRes = await api.get(`/teacher/assignments/${assignment.id}/submitted`);
        const submissions = subRes.data.data || [];
        const submittedSubmissions = submissions.length;
        
        const pendingReview = submissions.filter((s: any) => s.status === 'SUBMITTED').length;
        return { submittedSubmissions, pendingReview };
      } catch {
        return { submittedSubmissions: 0, pendingReview: 0 };
      }
    });
    
    const results = await Promise.all(submissionPromises);
    results.forEach(r => {
      submittedCount += r.submittedSubmissions;
      pendingCount += r.pendingReview;
    });
  } catch (e) {
    console.error("Error calculating submissions count", e);
  }
  
  return {
    stats: {
      totalAssignments: dbData.totalAssignments,
      activeAssignments: dbData.activeAssignments,
      submittedAssignments: submittedCount,
      pendingAssignments: pendingCount,
      totalStudents: dbData.totalStudents,
    }
  };
};

// Assignments
export const teacherService = {
  getDashboardStats: async () => {
    return await getDashboardStats();
  },

  getAssignments: async (params?: Record<string, string>) => {
    const backendPage = params?.page ? String(Math.max(0, Number(params.page) - 1)) : '0';
    const query = {
      ...params,
      page: backendPage,
      size: params?.limit ?? params?.size ?? '10',
    };
    const res = await api.get('/teacher/assignments', { params: query });
    const content = res.data.data;
    const rawAssignments = content?.content || [];

    const mapped = rawAssignments.map((a: any) => {
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
        status: a.status === 'DRAFT' ? 'draft' : 'published',
        assignmentType: a.assignmentType || 'PDF',
        teacherId: String(a.teacherId || ''),
        createdAt: a.createdAt || '',
        updatedAt: a.updatedAt || '',
        batchId: String(a.batchId || ''),
        batchName: a.batchName || '',
        totalStudents: a.totalStudents || 0,
        submittedCount: a.submittedCount || 0,
        pendingCount: a.pendingCount || 0,
        submissionPercentage: a.submissionPercentage || 0,
      };
    });

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

  getAssignmentById: async (id: string) => {
    const res = await api.get(`/teacher/assignments/${id}`);
    const a = res.data.data;
    
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
      createdAt: a.createdAt || '',
      updatedAt: a.updatedAt || '',
      batchId: String(a.batchId || ''),
      batchName: a.batchName || '',
      questions: a.questions || [],
      passingMarks: a.passingMarks || 0,
      totalMarks: a.totalMarks || 0,
    };
  },

  createAssignment: async (data: CreateAssignmentData & { batchId?: string }) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description || '');
    formData.append('instructions', data.instructions || '');
    formData.append('subject', data.subject);
    if (data.topic !== undefined) formData.append('topic', data.topic);
    if (data.batchId !== undefined && data.batchId !== null && data.batchId !== 'null' && data.batchId !== '') {
      formData.append('batchId', String(data.batchId));
    }
    formData.append('totalMarks', String(data.maxMarks));
    
    const passingMarks = data.passingMarks !== undefined ? data.passingMarks : Math.round(data.maxMarks * 0.4);
    formData.append('passingMarks', String(passingMarks));
    
    formData.append('dueDate', data.dueDate);
    formData.append('dueTime', '23:59:00');
    formData.append('assignmentType', data.assignmentType || 'PDF');
    
    if (data.questions) {
      formData.append('questionsJson', JSON.stringify(data.questions));
    }
    
    if (data.status !== undefined) {
      formData.append('status', data.status);
    }
    
    if (data.attachment) {
      formData.append('resourceFile', data.attachment);
    }
    
    formData.append('lateSubmissionAllowed', 'true');
    formData.append('maxFileSize', '26214400');
    
    const res = await api.post('/teacher/assignments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  updateAssignment: async (id: string, data: Partial<CreateAssignmentData> & { batchId?: string }) => {
    const formData = new FormData();
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.instructions !== undefined) formData.append('instructions', data.instructions || '');
    if (data.subject !== undefined) formData.append('subject', data.subject);
    if (data.topic !== undefined) formData.append('topic', data.topic);
    if (data.batchId !== undefined && data.batchId !== null && data.batchId !== 'null' && data.batchId !== '') {
      formData.append('batchId', String(data.batchId));
    }
    
    if (data.maxMarks !== undefined) {
      formData.append('totalMarks', String(data.maxMarks));
    }
    if (data.passingMarks !== undefined) {
      formData.append('passingMarks', String(data.passingMarks));
    } else if (data.maxMarks !== undefined) {
      const passingMarks = Math.round(data.maxMarks * 0.4);
      formData.append('passingMarks', String(passingMarks));
    }
    
    if (data.dueDate !== undefined) {
      formData.append('dueDate', data.dueDate);
    }
    formData.append('dueTime', '23:59:00');
    if (data.assignmentType !== undefined) {
      formData.append('assignmentType', data.assignmentType);
    }
    
    if (data.questions) {
      formData.append('questionsJson', JSON.stringify(data.questions));
    }
    
    if (data.status !== undefined) {
      formData.append('status', data.status);
    }
    
    if (data.attachment) {
      formData.append('resourceFile', data.attachment);
    }
    
    const res = await api.put(`/teacher/assignments/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  deleteAssignment: async (id: string) => {
    const res = await api.delete(`/teacher/assignments/${id}`);
    return res.data;
  },

  importExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/teacher/assignments/import-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  downloadTemplate: async () => {
    const res = await api.get('/teacher/assignments/template', {
      responseType: 'blob',
    });
    return res.data;
  },

  getSubjects: async (params?: { semester?: string; department?: string }) => {
    const res = await api.get('/teacher/subjects', { params });
    return res.data;
  },

  // Submissions
  getSubmissions: async (assignmentId: string) => {
    const [assignmentRes, submissionsRes, pendingRes] = await Promise.all([
      api.get(`/teacher/assignments/${assignmentId}`),
      api.get(`/teacher/assignments/${assignmentId}/submitted`),
      api.get(`/teacher/assignments/${assignmentId}/pending`),
    ]);
    
    const maxMarks = assignmentRes.data.data?.totalMarks || 100;
    const rawSubmissions = submissionsRes.data.data || [];
    const rawPending = pendingRes.data.data || [];
    
    const mappedSubmissions = rawSubmissions.map((s: any) => mapSubmission(s, maxMarks));
    
    const mappedPending = rawPending.map((p: any): Submission => ({
      id: `pending-${p.id}`,
      assignmentId: String(assignmentId),
      studentId: String(p.id),
      uploadedFile: '',
      fileName: '',
      submittedAt: '',
      marks: null,
      feedback: null,
      status: 'pending' as any,
      student: {
        id: String(p.id),
        name: p.fullName || 'Student',
        email: p.email || '',
        enrollmentNumber: p.enrollmentNumber || 'ENR-' + p.id,
        batchName: p.batchName || 'General Class',
      },
      assignment: {
        id: String(assignmentId),
        title: assignmentRes.data.data?.title || 'Assignment',
        maxMarks: maxMarks,
      }
    }));
    
    return {
      submissions: [...mappedSubmissions, ...mappedPending],
    };
  },

  gradeSubmission: async (data: GradeSubmissionData) => {
    const res = await api.put(`/teacher/submissions/${data.submissionId}/review`, {
      marks: data.marks,
      feedback: data.feedback || '',
    });
    
    const s = res.data.data;
    const mapped = mapSubmission(s);
    return {
      submission: mapped,
    };
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

  assignBatch: async (assignmentId: string, batchIds: string[]) => {
    const res = await api.post(`/teacher/assignments/${assignmentId}/assign`, {
      batchIds: batchIds.map(Number),
    });
    return res.data;
  },

  unassignBatch: async (assignmentId: string) => {
    const res = await api.post(`/teacher/assignments/${assignmentId}/unassign`);
    return res.data;
  },
};
