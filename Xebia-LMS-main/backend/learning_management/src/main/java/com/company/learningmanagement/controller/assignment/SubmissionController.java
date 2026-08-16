package com.company.learningmanagement.controller.assignment;

import com.company.learningmanagement.dto.assignment.request.StudentSubmitRequest;
import com.company.learningmanagement.dto.assignment.request.SubmissionReviewRequest;
import com.company.learningmanagement.dto.assignment.response.ApiResponse;
import com.company.learningmanagement.dto.assignment.response.StudentResponse;
import com.company.learningmanagement.dto.assignment.response.SubmissionResponse;
import com.company.learningmanagement.service.assignment.SubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class SubmissionController {

    private final SubmissionService submissionService;

    // --- Teacher Submission Endpoints ---

    @GetMapping("/api/teacher/assignments/{assignmentId}/submitted")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getSubmittedSubmissions(
            @PathVariable Long assignmentId,
            Principal principal
    ) {
        List<SubmissionResponse> response = submissionService.getSubmittedSubmissions(assignmentId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Submitted submissions retrieved successfully", response));
    }

    @GetMapping("/api/teacher/assignments/{assignmentId}/pending")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getPendingStudents(
            @PathVariable Long assignmentId,
            Principal principal
    ) {
        List<StudentResponse> response = submissionService.getPendingStudents(assignmentId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Pending students retrieved successfully", response));
    }

    @PutMapping("/api/teacher/submissions/{submissionId}/review")
    public ResponseEntity<ApiResponse<SubmissionResponse>> reviewSubmission(
            @PathVariable Long submissionId,
            @Valid @RequestBody SubmissionReviewRequest request,
            Principal principal
    ) {
        SubmissionResponse response = submissionService.reviewSubmission(submissionId, request, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Submission reviewed and graded successfully", response));
    }

    // --- Student Submission Endpoints ---

    @PostMapping(value = "/api/student/assignments/{assignmentId}/submit", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<SubmissionResponse>> submitAssignment(
            @PathVariable Long assignmentId,
            @Valid @ModelAttribute StudentSubmitRequest request,
            Principal principal
    ) {
        SubmissionResponse response = submissionService.submitAssignment(assignmentId, request, principal.getName());
        return ResponseEntity.status(201).body(ApiResponse.success("Assignment submitted successfully", response, 201));
    }

    @GetMapping("/api/student/submissions")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> getStudentSubmissions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal
    ) {
        List<SubmissionResponse> response = submissionService.getStudentSubmissions(principal.getName(), page, size);
        return ResponseEntity.ok(ApiResponse.success("Submissions retrieved successfully", response));
    }

    @GetMapping("/api/student/submissions/{submissionId}")
    public ResponseEntity<ApiResponse<SubmissionResponse>> getSubmissionDetails(
            @PathVariable Long submissionId,
            Principal principal
    ) {
        SubmissionResponse response = submissionService.getSubmissionById(submissionId, principal.getName(), "STUDENT");
        return ResponseEntity.ok(ApiResponse.success("Submission details retrieved successfully", response));
    }
}
