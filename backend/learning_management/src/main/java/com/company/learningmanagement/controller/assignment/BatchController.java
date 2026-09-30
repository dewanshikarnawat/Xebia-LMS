package com.company.learningmanagement.controller.assignment;

import com.company.learningmanagement.dto.assignment.request.BatchRequest;
import com.company.learningmanagement.dto.assignment.response.ApiResponse;
import com.company.learningmanagement.dto.assignment.response.BatchResponse;
import com.company.learningmanagement.service.assignment.BatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/teacher/batches")
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final jakarta.validation.Validator validator;

    @PostMapping
    public ResponseEntity<ApiResponse<Object>> createBatch(
            @RequestBody String requestBody,
            Principal principal
    ) throws Exception {
        String trimmed = requestBody.trim();
        if (trimmed.startsWith("[")) {
            java.util.List<BatchRequest> requests = objectMapper.readValue(
                    trimmed,
                    new com.fasterxml.jackson.core.type.TypeReference<java.util.List<BatchRequest>>() {}
            );
            com.company.learningmanagement.dto.lms.BulkOperationResponse response = batchService.createBatchBulk(requests, principal.getName());
            return ResponseEntity.status(201).body(ApiResponse.success("Bulk batch creation completed", response, 201));
        } else {
            BatchRequest request = objectMapper.readValue(trimmed, BatchRequest.class);
            java.util.Set<jakarta.validation.ConstraintViolation<BatchRequest>> violations = validator.validate(request);
            if (!violations.isEmpty()) {
                String reason = violations.stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .collect(java.util.stream.Collectors.joining("; "));
                throw new com.company.learningmanagement.exception.assignment.BadRequestException("Validation failed: " + reason);
            }
            BatchResponse response = batchService.createBatch(request, principal.getName());
            return ResponseEntity.status(201).body(ApiResponse.success("Batch created successfully", response, 201));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<com.company.learningmanagement.dto.assignment.response.CustomPage<BatchResponse>>> getAllBatches(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            Principal principal
    ) {
        org.springframework.data.domain.Page<BatchResponse> response = batchService.getAllBatches(principal.getName(), page, size, search);
        com.company.learningmanagement.dto.assignment.response.CustomPage<BatchResponse> customPage = 
                com.company.learningmanagement.dto.assignment.response.CustomPage.of(response);
        return ResponseEntity.ok(ApiResponse.success("Batches retrieved successfully", customPage));
    }

    @GetMapping("/{batchId}")
    public ResponseEntity<ApiResponse<BatchResponse>> getBatch(
            @PathVariable Long batchId,
            Principal principal
    ) {
        BatchResponse response = batchService.getBatchById(batchId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Batch details retrieved successfully", response));
    }

    @PutMapping("/{batchId}")
    public ResponseEntity<ApiResponse<BatchResponse>> updateBatch(
            @PathVariable Long batchId,
            @Valid @RequestBody BatchRequest request,
            Principal principal
    ) {
        BatchResponse response = batchService.updateBatch(batchId, request, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Batch updated successfully", response));
    }

    @DeleteMapping("/{batchId}")
    public ResponseEntity<ApiResponse<Void>> deleteBatch(
            @PathVariable Long batchId,
            Principal principal
    ) {
        batchService.deleteBatch(batchId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Batch deleted successfully", null));
    }
}
