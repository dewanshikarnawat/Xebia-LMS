package com.company.learningmanagement.controller.lms;

import com.company.learningmanagement.dto.lms.ApiResponse;
import com.company.learningmanagement.dto.lms.EnrollmentDashboardResponseDTO;
import com.company.learningmanagement.entity.lms.learning.CourseEnrollment;
import com.company.learningmanagement.service.lms.CourseEnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class CourseEnrollmentController {

    private final CourseEnrollmentService courseEnrollmentService;

    @PostMapping("/request/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse> requestEnrollment(@PathVariable Long courseId) {
        CourseEnrollment enrollment = courseEnrollmentService.requestEnrollment(courseId);
        ApiResponse response = new ApiResponse("Enrollment requested successfully", enrollment);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> approveEnrollment(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String remarks = (body != null) ? body.get("remarks") : null;
        CourseEnrollment enrollment = courseEnrollmentService.approveEnrollment(id, remarks);
        ApiResponse response = new ApiResponse("Enrollment request approved successfully", enrollment);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> rejectEnrollment(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String remarks = (body != null) ? body.get("remarks") : null;
        CourseEnrollment enrollment = courseEnrollmentService.rejectEnrollment(id, remarks);
        ApiResponse response = new ApiResponse("Enrollment request rejected successfully", enrollment);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getEnrollments(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<EnrollmentDashboardResponseDTO> enrollments = courseEnrollmentService.getEnrollments(status, page, size);
        ApiResponse response = new ApiResponse("Enrollment requests retrieved successfully", enrollments);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse> getMyEnrollments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<EnrollmentDashboardResponseDTO> enrollments = courseEnrollmentService.getMyEnrollments(page, size);
        ApiResponse response = new ApiResponse("Your enrollments retrieved successfully", enrollments);
        return ResponseEntity.ok(response);
    }
}
