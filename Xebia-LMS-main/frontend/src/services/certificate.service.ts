import api from './api';

export interface Certificate {
  id: string;
  studentId: string;
  studentName: string;
  assignmentId: string | null;
  assignmentTitle: string | null;
  quizId: string | null;
  quizTitle: string | null;
  certificateUrl: string;
  cloudinaryPublicId: string | null;
  marks: number;
  generatedAt: string;
  certificateType: 'ASSIGNMENT' | 'QUIZ';

  // New verification / PDF details
  certificateId?: string;
  teacherId?: string;
  teacherName?: string;
  completionDate?: string;
  generatedDate?: string;
  pdfFileUrl?: string;
  verificationToken?: string;
  qrCodeUrl?: string;
  assignmentName?: string;
  maxMarks?: number;
  courseId?: string;
  courseTitle?: string;
}

export const certificateService = {
  getMyCertificates: async (): Promise<Certificate[]> => {
    const res = await api.get('/student/certificates');
    return res.data.data || [];
  },

  getCertificateById: async (id: string): Promise<Certificate> => {
    const res = await api.get(`/student/certificates/${id}`);
    return res.data.data;
  },

  getCertificateByAssignment: async (assignmentId: string): Promise<Certificate> => {
    const res = await api.get(`/student/certificates/assignment/${assignmentId}`);
    return res.data.data;
  },

  getCertificateByQuiz: async (quizId: string): Promise<Certificate> => {
    const res = await api.get(`/student/certificates/quiz/${quizId}`);
    return res.data.data;
  },

  getDownloadUrl: (idOrUuid: string): string => {
    return `${api.defaults.baseURL}/student/certificates/download/${idOrUuid}`;
  },

  downloadCertificate: async (idOrUuid: string, fileName = 'certificate.pdf'): Promise<void> => {
    const res = await api.get(`/student/certificates/download/${idOrUuid}`, {
      responseType: 'blob'
    });
    const pdfBlob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  searchCertificatesForTeacher: async (studentName?: string, type?: string): Promise<Certificate[]> => {
    const params: Record<string, string> = {};
    if (studentName) params.studentName = studentName;
    if (type) params.type = type;
    const res = await api.get('/teacher/certificates', { params });
    return res.data.data || [];
  },

  verifyCertificate: async (token: string): Promise<Certificate> => {
    const res = await api.get(`/certificates/verify/${token}`);
    return res.data.data;
  },

  getCertificatePreview: async (assignmentOrQuizId: string): Promise<Certificate> => {
    const res = await api.get(`/student/certificates/preview/${assignmentOrQuizId}`);
    return res.data.data;
  },

  downloadOrGenerateCertificate: async (assignmentOrQuizId: string, fileName = 'certificate.pdf'): Promise<void> => {
    const res = await api.post(`/student/certificates/download/${assignmentOrQuizId}`, null, {
      responseType: 'blob'
    });
    const pdfBlob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  },

  getCourseCertificate: async (courseId: string): Promise<Certificate | null> => {
    try {
      const res = await api.get(`/student/certificates/course/${courseId}`);
      return res.data.data;
    } catch {
      return null;
    }
  },

  claimCourseCertificate: async (courseId: string): Promise<Certificate> => {
    const res = await api.post(`/student/certificates/course/${courseId}/claim`);
    return res.data.data;
  },

  getCourseCertificatePreview: async (courseId: string): Promise<Certificate> => {
    const res = await api.get(`/student/certificates/course/${courseId}/preview`);
    return res.data.data;
  }
};
