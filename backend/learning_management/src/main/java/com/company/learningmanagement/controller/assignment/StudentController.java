package com.company.learningmanagement.controller.assignment;

import com.company.learningmanagement.dto.assignment.request.AddStudentRequest;
import com.company.learningmanagement.dto.assignment.response.ApiResponse;
import com.company.learningmanagement.dto.assignment.response.StudentResponse;
import com.company.learningmanagement.service.assignment.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final jakarta.validation.Validator validator;

    @PostMapping("/students")
    public ResponseEntity<ApiResponse<Object>> addStudentToBatch(
            @RequestBody String requestBody,
            Principal principal
    ) throws Exception {
        String trimmed = requestBody.trim();
        if (trimmed.startsWith("[")) {
            java.util.List<AddStudentRequest> requests = objectMapper.readValue(
                    trimmed,
                    new com.fasterxml.jackson.core.type.TypeReference<java.util.List<AddStudentRequest>>() {}
            );
            com.company.learningmanagement.dto.lms.BulkOperationResponse response = studentService.addStudentToBatchBulk(requests, principal.getName());
            return ResponseEntity.ok(ApiResponse.success("Bulk student addition completed", response));
        } else {
            AddStudentRequest request = objectMapper.readValue(trimmed, AddStudentRequest.class);
            java.util.Set<jakarta.validation.ConstraintViolation<AddStudentRequest>> violations = validator.validate(request);
            if (!violations.isEmpty()) {
                String reason = violations.stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .collect(java.util.stream.Collectors.joining("; "));
                throw new com.company.learningmanagement.exception.assignment.BadRequestException("Validation failed: " + reason);
            }
            StudentResponse response = studentService.addStudentToBatch(request, principal.getName());
            return ResponseEntity.ok(ApiResponse.success("Student added to batch successfully", response));
        }
    }

    @GetMapping("/batches/{batchId}/students")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> getStudentsByBatch(
            @PathVariable Long batchId,
            Principal principal
    ) {
        List<StudentResponse> response = studentService.getStudentsByBatch(batchId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Students retrieved successfully", response));
    }

    @DeleteMapping("/students/{studentId}")
    public ResponseEntity<ApiResponse<Void>> removeStudentFromBatch(
            @PathVariable Long studentId,
            Principal principal
    ) {
        studentService.removeStudentFromBatch(studentId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Student removed from batch successfully", null));
    }
}
