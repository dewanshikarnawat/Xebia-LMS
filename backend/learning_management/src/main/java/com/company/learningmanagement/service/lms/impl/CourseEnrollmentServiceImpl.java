package com.company.learningmanagement.service.lms.impl;

import com.company.learningmanagement.dto.lms.EnrollmentDashboardResponseDTO;
import com.company.learningmanagement.entity.assignment.Student;
import com.company.learningmanagement.entity.lms.learning.CourseEntity;
import com.company.learningmanagement.entity.lms.learning.CourseEnrollment;
import com.company.learningmanagement.entity.lms.learning.EnrollmentStatus;
import com.company.learningmanagement.exception.assignment.BadRequestException;
import com.company.learningmanagement.exception.assignment.ConflictException;
import com.company.learningmanagement.exception.assignment.ForbiddenException;
import com.company.learningmanagement.exception.lms.ResourceNotFoundException;
import com.company.learningmanagement.repository.assignment.StudentRepository;
import com.company.learningmanagement.repository.lms.CourseEnrollmentRepository;
import com.company.learningmanagement.repository.lms.CourseRepository;
import com.company.learningmanagement.service.lms.CourseEnrollmentService;
import com.company.learningmanagement.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class CourseEnrollmentServiceImpl implements CourseEnrollmentService {

    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;

    @Override
    public CourseEnrollment requestEnrollment(Long courseId) {
        var user = SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.STUDENT) {
            throw new ForbiddenException("Access Denied: Only students can request enrollments");
        }

        Student student = studentRepository.findByEmail(user.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with email: " + user.getUsername()));

        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        if (courseEnrollmentRepository.existsByStudentIdAndCourseId(student.getId(), course.getId())) {
            throw new ConflictException("Enrollment already requested");
        }

        CourseEnrollment enrollment = CourseEnrollment.builder()
                .student(student)
                .course(course)
                .status(EnrollmentStatus.PENDING)
                .enrolledAt(LocalDateTime.now())
                .build();

        return courseEnrollmentRepository.save(enrollment);
    }

    @Override
    public CourseEnrollment approveEnrollment(Long enrollmentId, String remarks) {
        var user = SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new ForbiddenException("Access Denied: Only admins can approve enrollments");
        }

        CourseEnrollment enrollment = courseEnrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + enrollmentId));

        if (enrollment.getStatus() != EnrollmentStatus.PENDING) {
            throw new BadRequestException("Enrollment is not in PENDING status");
        }

        enrollment.setStatus(EnrollmentStatus.APPROVED);
        enrollment.setApprovedBy(user.getUsername());
        enrollment.setApprovedAt(LocalDateTime.now());
        enrollment.setRemarks(remarks);

        return courseEnrollmentRepository.save(enrollment);
    }

    @Override
    public CourseEnrollment rejectEnrollment(Long enrollmentId, String remarks) {
        var user = SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new ForbiddenException("Access Denied: Only admins can reject enrollments");
        }

        CourseEnrollment enrollment = courseEnrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + enrollmentId));

        if (enrollment.getStatus() != EnrollmentStatus.PENDING) {
            throw new BadRequestException("Enrollment is not in PENDING status");
        }

        enrollment.setStatus(EnrollmentStatus.REJECTED);
        enrollment.setApprovedBy(user.getUsername());
        enrollment.setApprovedAt(LocalDateTime.now());
        enrollment.setRemarks(remarks);

        return courseEnrollmentRepository.save(enrollment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EnrollmentDashboardResponseDTO> getEnrollments(String status, int page, int size) {
        var user = SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new ForbiddenException("Access Denied: Only admins can view enrollment dashboard");
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<CourseEnrollment> enrollments;

        if (status != null && !status.trim().isEmpty()) {
            try {
                EnrollmentStatus statusEnum = EnrollmentStatus.valueOf(status.trim().toUpperCase());
                enrollments = courseEnrollmentRepository.findByStatusWithStudentAndCourse(statusEnum, pageable);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status filter: " + status);
            }
        } else {
            enrollments = courseEnrollmentRepository.findAllWithStudentAndCourse(pageable);
        }

        return enrollments.map(this::mapToDashboardDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EnrollmentDashboardResponseDTO> getMyEnrollments(int page, int size) {
        var user = SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.STUDENT) {
            throw new ForbiddenException("Access Denied: Only students can view their enrollments");
        }

        Pageable pageable = PageRequest.of(page, size);
        // StudentRepository exists
        Student student = studentRepository.findByEmail(user.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Page<CourseEnrollment> enrollments = courseEnrollmentRepository.findByStudentEmailWithStudentAndCourse(user.getUsername(), pageable);
        return enrollments.map(this::mapToDashboardDTO);
    }

    private EnrollmentDashboardResponseDTO mapToDashboardDTO(CourseEnrollment e) {
        return EnrollmentDashboardResponseDTO.builder()
                .id(e.getId())
                .studentName(e.getStudent() != null ? e.getStudent().getFullName() : null)
                .studentEmail(e.getStudent() != null ? e.getStudent().getEmail() : null)
                .courseName(e.getCourse() != null ? e.getCourse().getTitle() : null)
                .enrollmentDate(e.getEnrolledAt())
                .status(e.getStatus().name())
                .approvedBy(e.getApprovedBy())
                .approvedAt(e.getApprovedAt())
                .remarks(e.getRemarks())
                .courseId(e.getCourse() != null ? e.getCourse().getId() : null)
                .build();
    }
}
