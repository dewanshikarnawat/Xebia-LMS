package com.company.learningmanagement.service.assignment;

import com.company.learningmanagement.dto.assignment.response.CertificateResponse;
import java.util.List;

public interface CertificateService {
    CertificateResponse generateCertificateForSubmission(Long submissionId);
    List<CertificateResponse> getStudentCertificates(String studentEmail);
    CertificateResponse getCertificateById(Long id, String email, String role);
    CertificateResponse getCertificateByAssignment(Long assignmentId, String studentEmail);
    CertificateResponse getCertificateByQuiz(Long quizId, String studentEmail);
    List<CertificateResponse> searchCertificatesForTeacher(String teacherEmail, String studentName, String type);
    CertificateResponse getCertificateByToken(String token);
    
    // New preview and download endpoints
    CertificateResponse getCertificatePreview(Long assignmentOrQuizId, String studentEmail);
    byte[] downloadOrGenerateCertificate(Long assignmentOrQuizId, String studentEmail);
    CertificateResponse getCertificateByUuid(String uuid, String email, String role);
    byte[] downloadCertificateByUuid(String idOrUuid, String studentEmail);
}
