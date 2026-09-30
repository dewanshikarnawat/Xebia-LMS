package com.company.learningmanagement.service.assignment.impl;

import com.company.learningmanagement.dto.assignment.response.CertificateResponse;
import com.company.learningmanagement.entity.assignment.Assignment;
import com.company.learningmanagement.entity.assignment.Certificate;
import com.company.learningmanagement.entity.assignment.Student;
import com.company.learningmanagement.entity.assignment.Submission;
import com.company.learningmanagement.enums.SubmissionStatus;
import com.company.learningmanagement.exception.assignment.BadRequestException;
import com.company.learningmanagement.exception.assignment.CustomException;
import com.company.learningmanagement.exception.assignment.ResourceNotFoundException;
import com.company.learningmanagement.exception.assignment.UnauthorizedException;
import com.company.learningmanagement.mapper.assignment.CertificateMapper;
import com.company.learningmanagement.repository.assignment.AssignmentRepository;
import com.company.learningmanagement.repository.assignment.CertificateRepository;
import com.company.learningmanagement.repository.assignment.StudentRepository;
import com.company.learningmanagement.repository.assignment.SubmissionRepository;
import com.company.learningmanagement.service.assignment.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository certificateRepository;
    private final SubmissionRepository submissionRepository;
    private final StudentRepository studentRepository;
    private final CertificateMapper certificateMapper;
    private final AssignmentRepository assignmentRepository;

    @Override
    @Transactional
    public CertificateResponse generateCertificateForSubmission(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));

        if (submission.getStatus() != SubmissionStatus.REVIEWED && submission.getStatus() != SubmissionStatus.SUBMITTED) {
            throw new BadRequestException("Submission must be submitted or reviewed before generating certificate");
        }

        Student student = submission.getStudent();
        Assignment assignment = submission.getAssignment();

        boolean isQuiz = assignment.getAssignmentType() == com.company.learningmanagement.enums.AssignmentType.QUIZ;
        
        // 1. Verify passing grade criteria
        Double maxMarks = assignment.getTotalMarks();
        Double marks = submission.getMarks();
        if (marks == null) {
            marks = maxMarks; // Default to maximum marks for completion certificate if not yet graded
        }
        Double passingMarks = assignment.getPassingMarks();
        if (passingMarks == null) {
            passingMarks = maxMarks * 0.4; // fallback to 40%
        }
        
        if (marks < passingMarks) {
            return null;
        }

        // 2. Validate / Check for duplicate certificate generation
        Optional<Certificate> existingCert = isQuiz ?
                certificateRepository.findByStudentIdAndQuizId(student.getId(), assignment.getId()) :
                certificateRepository.findByStudentIdAndAssignmentId(student.getId(), assignment.getId());

        if (existingCert.isPresent()) {
            return certificateMapper.toResponse(existingCert.get());
        }

        String studentName = student.getFullName();
        String title = assignment.getTitle();
        LocalDateTime completedAt = submission.getReviewedAt() != null ? submission.getReviewedAt() : submission.getSubmittedAt();
        if (completedAt == null) {
            completedAt = LocalDateTime.now();
        }
        String teacherName = assignment.getTeacher() != null ? assignment.getTeacher().getFullName() : "Course Instructor";

        // Generate IDs and verification tokens
        String certId = "CERT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String verificationToken = UUID.randomUUID().toString();

        // Save metadata to database
        Certificate certificate = Certificate.builder()
                .student(student)
                .assignment(isQuiz ? null : assignment)
                .quiz(isQuiz ? assignment : null)
                .certificateUrl("") // satisfy database not-null constraint
                .cloudinaryPublicId(certId)
                .marks(marks)
                .generatedAt(LocalDateTime.now())
                .certificateType(isQuiz ? "QUIZ" : "ASSIGNMENT")
                .certificateId(certId)
                .studentName(studentName)
                .assignmentName(title)
                .teacherId(assignment.getTeacher() != null ? assignment.getTeacher().getId() : null)
                .teacherName(teacherName)
                .completionDate(completedAt)
                .generatedDate(LocalDateTime.now())
                .verificationToken(verificationToken)
                .build();

        Certificate saved;
        try {
            saved = certificateRepository.saveAndFlush(certificate);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            Optional<Certificate> existingCertRetry = isQuiz ?
                    certificateRepository.findByStudentIdAndQuizId(student.getId(), assignment.getId()) :
                    certificateRepository.findByStudentIdAndAssignmentId(student.getId(), assignment.getId());
            if (existingCertRetry.isPresent()) {
                return certificateMapper.toResponse(existingCertRetry.get());
            }
            throw new BadRequestException("Certificate already exists or verification token conflict");
        }
        return certificateMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CertificateResponse> getStudentCertificates(String studentEmail) {
        Student student = studentRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        List<Certificate> certs = certificateRepository.findByStudentId(student.getId());
        return certificateMapper.toResponseList(certs);
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateResponse getCertificateById(Long id, String email, String role) {
        Certificate cert = certificateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));

        if ("STUDENT".equals(role)) {
            Student student = studentRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
            if (!cert.getStudent().getId().equals(student.getId())) {
                throw new UnauthorizedException("Access Denied: You can only view your own certificates");
            }
        }

        return certificateMapper.toResponse(cert);
    }

    @Override
    @Transactional
    public CertificateResponse getCertificateByAssignment(Long assignmentId, String studentEmail) {
        Student student = studentRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        Optional<Certificate> certOpt = certificateRepository.findByStudentIdAndAssignmentId(student.getId(), assignmentId);
        if (certOpt.isPresent()) {
            return certificateMapper.toResponse(certOpt.get());
        }
        
        // Fallback: Check if submission exists and generate on-the-fly
        Submission submission = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found. No submission found for this assignment."));
        
        if (submission.getStatus() == SubmissionStatus.SUBMITTED || submission.getStatus() == SubmissionStatus.REVIEWED) {
            CertificateResponse res = generateCertificateForSubmission(submission.getId());
            if (res == null) {
                throw new BadRequestException("Student did not pass the passing score required for certificate generation");
            }
            return res;
        } else {
            throw new BadRequestException("Submission has not been completed/submitted yet");
        }
    }
 
    @Override
    @Transactional
    public CertificateResponse getCertificateByQuiz(Long quizId, String studentEmail) {
        Student student = studentRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        Optional<Certificate> certOpt = certificateRepository.findByStudentIdAndQuizId(student.getId(), quizId);
        if (certOpt.isPresent()) {
            return certificateMapper.toResponse(certOpt.get());
        }
        
        // Fallback: Check if submission exists and generate on-the-fly
        Submission submission = submissionRepository.findByAssignmentIdAndStudentId(quizId, student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found. No submission found for this quiz."));
        
        if (submission.getStatus() == SubmissionStatus.SUBMITTED || submission.getStatus() == SubmissionStatus.REVIEWED) {
            CertificateResponse res = generateCertificateForSubmission(submission.getId());
            if (res == null) {
                throw new BadRequestException("Student did not pass the passing score required for certificate generation");
            }
            return res;
        } else {
            throw new BadRequestException("Submission has not been completed/submitted yet");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<CertificateResponse> searchCertificatesForTeacher(String teacherEmail, String studentName, String type) {
        String queryName = (studentName != null && !studentName.isBlank()) ? "%" + studentName.trim().toLowerCase() + "%" : null;
        String queryType = (type != null && !type.isBlank() && !"ALL".equalsIgnoreCase(type)) ? type.toUpperCase() : null;
        List<Certificate> certs = certificateRepository.searchCertificatesForTeacher(teacherEmail, queryName, queryType);
        return certificateMapper.toResponseList(certs);
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateResponse getCertificateByToken(String token) {
        Certificate cert = certificateRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid verification token or certificate not found"));
        return certificateMapper.toResponse(cert);
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateResponse getCertificatePreview(Long assignmentOrQuizId, String studentEmail) {
        Student student = studentRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        Assignment assignment = assignmentRepository.findById(assignmentOrQuizId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment/Quiz not found"));

        boolean isQuiz = assignment.getAssignmentType() == com.company.learningmanagement.enums.AssignmentType.QUIZ;

        // Check if certificate already exists in database
        Optional<Certificate> existingCert = isQuiz ?
                certificateRepository.findByStudentIdAndQuizId(student.getId(), assignment.getId()) :
                certificateRepository.findByStudentIdAndAssignmentId(student.getId(), assignment.getId());

        if (existingCert.isPresent()) {
            CertificateResponse res = certificateMapper.toResponse(existingCert.get());
            res.setMaxMarks(assignment.getTotalMarks());
            return res;
        }

        // Generate dynamic preview metadata
        Submission submission = submissionRepository.findByAssignmentIdAndStudentId(assignment.getId(), student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("No submission found for this assignment/quiz"));

        if (submission.getStatus() != SubmissionStatus.REVIEWED && submission.getStatus() != SubmissionStatus.SUBMITTED) {
            throw new BadRequestException("Submission has not been completed/submitted yet");
        }

        Double maxMarks = assignment.getTotalMarks();
        Double marks = submission.getMarks();
        if (marks == null) {
            marks = maxMarks; // Default to maximum marks for completion certificate if not yet graded
        }
        Double passingMarks = assignment.getPassingMarks() != null ? assignment.getPassingMarks() : maxMarks * 0.4;
        if (marks < passingMarks) {
            throw new BadRequestException("Student did not pass the required passing score");
        }

        LocalDateTime completedAt = submission.getReviewedAt() != null ? submission.getReviewedAt() : submission.getSubmittedAt();
        if (completedAt == null) {
            completedAt = LocalDateTime.now();
        }

        String teacherName = assignment.getTeacher() != null ? assignment.getTeacher().getFullName() : "Course Instructor";

        return CertificateResponse.builder()
                .studentId(student.getId())
                .studentName(student.getFullName())
                .assignmentId(isQuiz ? null : assignment.getId())
                .assignmentTitle(isQuiz ? null : assignment.getTitle())
                .quizId(isQuiz ? assignment.getId() : null)
                .quizTitle(isQuiz ? assignment.getTitle() : null)
                .marks(marks)
                .maxMarks(maxMarks)
                .certificateType(isQuiz ? "QUIZ" : "ASSIGNMENT")
                .teacherName(teacherName)
                .completionDate(completedAt)
                .generatedAt(LocalDateTime.now())
                .generatedDate(LocalDateTime.now())
                .certificateId("PREVIEW-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();
    }

    @Override
    @Transactional
    public byte[] downloadOrGenerateCertificate(Long assignmentOrQuizId, String studentEmail) {
        throw new BadRequestException("PDF generation has been migrated to the client side. Please download from the frontend certificate preview.");
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateResponse getCertificateByUuid(String uuid, String email, String role) {
        Certificate certificate = certificateRepository.findByCertificateId(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found"));
        
        if ("STUDENT".equals(role)) {
            Student student = studentRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
            if (!certificate.getStudent().getId().equals(student.getId())) {
                throw new UnauthorizedException("You are not authorized to access this certificate");
            }
        }
        return certificateMapper.toResponse(certificate);
    }

    @Override
    @Transactional
    public byte[] downloadCertificateByUuid(String idOrUuid, String studentEmail) {
        throw new BadRequestException("PDF generation has been migrated to the client side. Please download from the frontend certificate preview.");
    }
}
