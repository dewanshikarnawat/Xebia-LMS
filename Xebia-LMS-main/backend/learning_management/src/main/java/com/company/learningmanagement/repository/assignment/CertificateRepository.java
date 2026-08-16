package com.company.learningmanagement.repository.assignment;

import com.company.learningmanagement.entity.assignment.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    List<Certificate> findByStudentId(Long studentId);
    Optional<Certificate> findByStudentIdAndAssignmentId(Long studentId, Long assignmentId);
    Optional<Certificate> findByStudentIdAndQuizId(Long studentId, Long quizId);
    Optional<Certificate> findByVerificationToken(String verificationToken);
    Optional<Certificate> findByCertificateId(String certificateId);
    boolean existsByAssignmentId(Long assignmentId);
    boolean existsByQuizId(Long quizId);

    @Query("SELECT c FROM Certificate c WHERE " +
           "((c.assignment IS NOT NULL AND c.assignment.teacher.email = :email) OR " +
           " (c.quiz IS NOT NULL AND c.quiz.teacher.email = :email)) " +
           "AND (:studentName IS NULL OR LOWER(c.studentName) LIKE :studentName) " +
           "AND (:type IS NULL OR c.certificateType = :type) " +
           "ORDER BY c.generatedAt DESC")
    List<Certificate> searchCertificatesForTeacher(
            @Param("email") String email,
            @Param("studentName") String studentName,
            @Param("type") String type
    );
}
