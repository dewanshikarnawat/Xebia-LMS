package com.company.learningmanagement.service.lms;

import com.company.learningmanagement.dto.lms.EnrollmentDashboardResponseDTO;
import com.company.learningmanagement.entity.lms.learning.CourseEnrollment;
import org.springframework.data.domain.Page;

public interface CourseEnrollmentService {
    CourseEnrollment requestEnrollment(Long courseId);
    CourseEnrollment approveEnrollment(Long enrollmentId, String remarks);
    CourseEnrollment rejectEnrollment(Long enrollmentId, String remarks);
    Page<EnrollmentDashboardResponseDTO> getEnrollments(String status, int page, int size);
    Page<EnrollmentDashboardResponseDTO> getMyEnrollments(int page, int size);
}
