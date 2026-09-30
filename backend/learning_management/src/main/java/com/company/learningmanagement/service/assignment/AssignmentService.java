package com.company.learningmanagement.service.assignment;

import com.company.learningmanagement.dto.assignment.request.AssignmentRequest;
import com.company.learningmanagement.dto.assignment.response.AssignmentResponse;

import java.util.List;

public interface AssignmentService {
    AssignmentResponse createAssignment(AssignmentRequest request, String teacherEmail);
    com.company.learningmanagement.dto.lms.BulkOperationResponse createAssignmentBulk(List<AssignmentRequest> requests, String teacherEmail);
    org.springframework.data.domain.Page<AssignmentResponse> getAllAssignments(
            String teacherEmail,
            int page,
            int size,
            String sortBy,
            String sortDir,
            String search,
            String subject,
            String status,
            String assignmentType,
            Long batchId
    );
    org.springframework.data.domain.Page<AssignmentResponse> getStudentAssignments(
            String studentEmail,
            int page,
            int size,
            String sortBy,
            String sortDir,
            String search,
            String subject,
            String status,
            String assignmentType,
            Long batchId
    );
    AssignmentResponse getAssignmentById(Long id, String email, String role);
    AssignmentResponse updateAssignment(Long id, AssignmentRequest request, String teacherEmail);
    void deleteAssignment(Long id, String teacherEmail);
    List<com.company.learningmanagement.dto.assignment.request.QuestionRequest> importExcelQuestions(org.springframework.web.multipart.MultipartFile file);
    AssignmentResponse importAssignment(
            String title,
            String description,
            Long batchId,
            java.time.LocalDate dueDate,
            org.springframework.web.multipart.MultipartFile file,
            String teacherEmail
    );
    byte[] exportAssignmentResults(Long assignmentId, String teacherEmail);
    List<AssignmentResponse> assignBatch(Long assignmentId, List<Long> batchIds, String teacherEmail);
    AssignmentResponse unassignBatch(Long assignmentId, String teacherEmail);
}
