package com.company.learningmanagement.controller.assignment;

import com.company.learningmanagement.dto.assignment.request.AssignmentRequest;
import com.company.learningmanagement.dto.assignment.response.ApiResponse;
import com.company.learningmanagement.dto.assignment.response.AssignmentResponse;
import com.company.learningmanagement.service.assignment.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final jakarta.validation.Validator validator;

    // --- Teacher Assignment Endpoints ---

    @GetMapping("/api/teacher/assignments/template")
    public ResponseEntity<org.springframework.core.io.Resource> downloadTemplate(Principal principal) {
        try (org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook()) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("Quiz Template");
            org.apache.poi.ss.usermodel.Row header = sheet.createRow(0);
            String[] headers = { "Question Text", "Option A", "Option B", "Option C", "Option D", "Correct Answer", "Marks", "Difficulty" };
            for (int i = 0; i < headers.length; i++) {
                header.createCell(i).setCellValue(headers[i]);
            }
            org.apache.poi.ss.usermodel.Row row = sheet.createRow(1);
            row.createCell(0).setCellValue("What is the capital of France?");
            row.createCell(1).setCellValue("Berlin");
            row.createCell(2).setCellValue("Paris");
            row.createCell(3).setCellValue("Rome");
            row.createCell(4).setCellValue("Madrid");
            row.createCell(5).setCellValue("B");
            row.createCell(6).setCellValue(2.0);
            row.createCell(7).setCellValue("Easy");

            java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
            workbook.write(bos);
            byte[] bytes = bos.toByteArray();
            org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource(bytes);

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"quiz_template.xlsx\"")
                    .contentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .contentLength(bytes.length)
                    .body(resource);
        } catch (Exception e) {
            throw new com.company.learningmanagement.exception.assignment.BadRequestException("Failed to generate template: " + e.getMessage());
        }
    }

    @PostMapping(value = "/api/teacher/assignments/import-excel", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<List<com.company.learningmanagement.dto.assignment.request.QuestionRequest>>> importExcel(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            Principal principal
    ) {
        List<com.company.learningmanagement.dto.assignment.request.QuestionRequest> response = assignmentService.importExcelQuestions(file);
        return ResponseEntity.ok(ApiResponse.success("Excel file imported successfully", response));
    }

    @PostMapping(value = "/api/teacher/assignments/import", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<AssignmentResponse>> importAssignmentExcel(
            @RequestParam("assignmentTitle") String assignmentTitle,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("batchId") Long batchId,
            @RequestParam("dueDate") @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate dueDate,
            @RequestParam("excelFile") org.springframework.web.multipart.MultipartFile excelFile,
            Principal principal
    ) {
        AssignmentResponse response = assignmentService.importAssignment(
                assignmentTitle,
                description,
                batchId,
                dueDate,
                excelFile,
                principal.getName()
        );
        return ResponseEntity.status(201).body(ApiResponse.success("Assignment created successfully via Excel", response, 201));
    }

    @GetMapping("/api/teacher/assignments/{assignmentId}/results/download")
    public ResponseEntity<org.springframework.core.io.Resource> downloadResults(
            @PathVariable Long assignmentId,
            Principal principal
    ) {
        byte[] excelBytes = assignmentService.exportAssignmentResults(assignmentId, principal.getName());
        org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource(excelBytes);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"assignment_results_" + assignmentId + ".xlsx\"")
                .contentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excelBytes.length)
                .body(resource);
    }


    @PostMapping(value = "/api/teacher/assignments", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<AssignmentResponse>> createAssignment(
            @Valid @ModelAttribute AssignmentRequest request,
            Principal principal
    ) {
        AssignmentResponse response = assignmentService.createAssignment(request, principal.getName());
        return ResponseEntity.status(201).body(ApiResponse.success("Assignment created successfully", response, 201));
    }

    @PostMapping(value = "/api/teacher/assignments", consumes = {"application/json"})
    public ResponseEntity<ApiResponse<Object>> createAssignmentJson(
            @RequestBody String requestBody,
            Principal principal
    ) throws Exception {
        String trimmed = requestBody.trim();
        if (trimmed.startsWith("[")) {
            java.util.List<AssignmentRequest> requests = objectMapper.readValue(
                    trimmed,
                    new com.fasterxml.jackson.core.type.TypeReference<java.util.List<AssignmentRequest>>() {}
            );
            com.company.learningmanagement.dto.lms.BulkOperationResponse response = assignmentService.createAssignmentBulk(requests, principal.getName());
            return ResponseEntity.status(201).body(ApiResponse.success("Bulk assignment creation completed", response, 201));
        } else {
            AssignmentRequest request = objectMapper.readValue(trimmed, AssignmentRequest.class);
            java.util.Set<jakarta.validation.ConstraintViolation<AssignmentRequest>> violations = validator.validate(request);
            if (!violations.isEmpty()) {
                String reason = violations.stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .collect(java.util.stream.Collectors.joining("; "));
                throw new com.company.learningmanagement.exception.assignment.BadRequestException("Validation failed: " + reason);
            }
            AssignmentResponse response = assignmentService.createAssignment(request, principal.getName());
            return ResponseEntity.status(201).body(ApiResponse.success("Assignment created successfully", response, 201));
        }
    }

    @GetMapping("/api/teacher/assignments")
    public ResponseEntity<ApiResponse<com.company.learningmanagement.dto.assignment.response.CustomPage<AssignmentResponse>>> getAllAssignments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String assignmentType,
            @RequestParam(required = false) Long batchId,
            Principal principal
    ) {
        org.springframework.data.domain.Page<AssignmentResponse> paged = assignmentService.getAllAssignments(
                principal.getName(), page, size, sortBy, sortDir, search, subject, status, assignmentType, batchId
        );
        com.company.learningmanagement.dto.assignment.response.CustomPage<AssignmentResponse> response = 
                com.company.learningmanagement.dto.assignment.response.CustomPage.of(paged);
        return ResponseEntity.ok(ApiResponse.success("Assignments retrieved successfully", response));
    }

    @GetMapping("/api/teacher/assignments/{assignmentId}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignmentDetailsTeacher(
            @PathVariable Long assignmentId,
            Principal principal
    ) {
        AssignmentResponse response = assignmentService.getAssignmentById(assignmentId, principal.getName(), "TEACHER");
        return ResponseEntity.ok(ApiResponse.success("Assignment details retrieved successfully", response));
    }

    @PutMapping(value = "/api/teacher/assignments/{assignmentId}", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<AssignmentResponse>> updateAssignment(
            @PathVariable Long assignmentId,
            @Valid @ModelAttribute AssignmentRequest request,
            Principal principal
    ) {
        AssignmentResponse response = assignmentService.updateAssignment(assignmentId, request, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Assignment updated successfully", response));
    }

    @DeleteMapping("/api/teacher/assignments/{assignmentId}")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(
            @PathVariable Long assignmentId,
            Principal principal
    ) {
        assignmentService.deleteAssignment(assignmentId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Assignment deleted successfully", null));
    }

    @PostMapping("/api/teacher/assignments/{assignmentId}/assign")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> assignBatch(
            @PathVariable Long assignmentId,
            @RequestBody java.util.Map<String, List<Long>> request,
            Principal principal
    ) {
        List<Long> batchIds = request.get("batchIds");
        List<AssignmentResponse> response = assignmentService.assignBatch(assignmentId, batchIds, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Quiz assigned to batches successfully", response));
    }

    @PostMapping("/api/teacher/assignments/{assignmentId}/unassign")
    public ResponseEntity<ApiResponse<AssignmentResponse>> unassignBatch(
            @PathVariable Long assignmentId,
            Principal principal
    ) {
        AssignmentResponse response = assignmentService.unassignBatch(assignmentId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Quiz unassigned successfully", response));
    }

    // --- Student Assignment Endpoints ---

    @GetMapping("/api/student/assignments")
    public ResponseEntity<ApiResponse<com.company.learningmanagement.dto.assignment.response.CustomPage<AssignmentResponse>>> getStudentAssignments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String assignmentType,
            @RequestParam(required = false) Long batchId,
            Principal principal
    ) {
        org.springframework.data.domain.Page<AssignmentResponse> paged = assignmentService.getStudentAssignments(
                principal.getName(), page, size, sortBy, sortDir, search, subject, status, assignmentType, batchId
        );
        com.company.learningmanagement.dto.assignment.response.CustomPage<AssignmentResponse> response = 
                com.company.learningmanagement.dto.assignment.response.CustomPage.of(paged);
        return ResponseEntity.ok(ApiResponse.success("Assigned assignments retrieved successfully", response));
    }

    @GetMapping("/api/student/assignments/{assignmentId}")
    public ResponseEntity<ApiResponse<AssignmentResponse>> getAssignmentDetailsStudent(
            @PathVariable Long assignmentId,
            Principal principal
    ) {
        AssignmentResponse response = assignmentService.getAssignmentById(assignmentId, principal.getName(), "STUDENT");
        return ResponseEntity.ok(ApiResponse.success("Assignment details retrieved successfully", response));
    }
}
