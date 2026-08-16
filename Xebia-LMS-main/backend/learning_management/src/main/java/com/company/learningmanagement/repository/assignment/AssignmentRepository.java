package com.company.learningmanagement.repository.assignment;

import com.company.learningmanagement.entity.assignment.Assignment;
import com.company.learningmanagement.enums.AssignmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Assignment> {
    Page<Assignment> findByTeacherId(Long teacherId, Pageable pageable);
    Optional<Assignment> findByIdAndTeacherId(Long id, Long teacherId);
    long countByTeacherId(Long teacherId);
    long countByTeacherIdAndStatus(Long teacherId, AssignmentStatus status);
    List<Assignment> findTop5ByTeacherIdOrderByCreatedAtDesc(Long teacherId);
    List<Assignment> findByTeacherIdAndDueDateGreaterThanEqualOrderByDueDateAscDueTimeAsc(Long teacherId, LocalDate date);

    Page<Assignment> findByBatchId(Long batchId, Pageable pageable);
    Page<Assignment> findByBatchIdAndStatus(Long batchId, AssignmentStatus status, Pageable pageable);
    Optional<Assignment> findByIdAndBatchId(Long id, Long batchId);
    Optional<Assignment> findByIdAndBatchIdAndStatus(Long id, Long batchId, AssignmentStatus status);
    long countByBatchId(Long batchId);
    long countByBatchIdAndStatus(Long batchId, AssignmentStatus status);
    List<Assignment> findTop5ByBatchIdOrderByCreatedAtDesc(Long batchId);
    List<Assignment> findTop5ByBatchIdAndStatusOrderByCreatedAtDesc(Long batchId, AssignmentStatus status);
    List<Assignment> findByBatchIdAndDueDateGreaterThanEqualOrderByDueDateAscDueTimeAsc(Long batchId, LocalDate date);
    List<Assignment> findByBatchIdAndStatusAndDueDateGreaterThanEqualOrderByDueDateAscDueTimeAsc(Long batchId, AssignmentStatus status, LocalDate date);
}
