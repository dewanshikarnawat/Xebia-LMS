package com.company.learningmanagement.repository.lms;

import com.company.learningmanagement.entity.lms.learning.CourseEnrollment;
import com.company.learningmanagement.entity.lms.learning.EnrollmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {

    Optional<CourseEnrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);
    
    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);
    
    boolean existsByStudentEmailAndCourseIdAndStatus(String email, Long courseId, EnrollmentStatus status);

    List<CourseEnrollment> findByStudentEmail(String email);

    @Query("SELECT e FROM CourseEnrollment e JOIN FETCH e.student s JOIN FETCH e.course c WHERE s.email = :email")
    Page<CourseEnrollment> findByStudentEmailWithStudentAndCourse(@Param("email") String email, Pageable pageable);

    Page<CourseEnrollment> findByStatus(EnrollmentStatus status, Pageable pageable);

    @Query("SELECT e FROM CourseEnrollment e JOIN FETCH e.student s JOIN FETCH e.course c")
    Page<CourseEnrollment> findAllWithStudentAndCourse(Pageable pageable);

    @Query("SELECT e FROM CourseEnrollment e JOIN FETCH e.student s JOIN FETCH e.course c WHERE e.status = :status")
    Page<CourseEnrollment> findByStatusWithStudentAndCourse(@Param("status") EnrollmentStatus status, Pageable pageable);
}
