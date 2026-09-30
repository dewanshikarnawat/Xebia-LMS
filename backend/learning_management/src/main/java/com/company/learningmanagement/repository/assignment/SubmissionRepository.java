package com.company.learningmanagement.repository.assignment;

import com.company.learningmanagement.entity.assignment.Submission;
import com.company.learningmanagement.enums.SubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    Optional<Submission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
    List<Submission> findByAssignmentId(Long assignmentId);
    long countByAssignmentId(Long assignmentId);
    List<Submission> findByAssignmentIdAndStatus(Long assignmentId, SubmissionStatus status);
    Page<Submission> findByStudentId(Long studentId, Pageable pageable);
    List<Submission> findByStudentId(Long studentId);
    Optional<Submission> findByIdAndAssignmentTeacherId(Long id, Long teacherId);
    long countByStudentId(Long studentId);
    long countByStudentIdAndStatus(Long studentId, SubmissionStatus status);
    List<Submission> findTop5ByStudentIdOrderBySubmittedAtDesc(Long studentId);
}
