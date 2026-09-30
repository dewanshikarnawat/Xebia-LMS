package com.company.learningmanagement.controller.lms;

import com.company.learningmanagement.dto.lms.SubmoduleRequestDTO;
import com.company.learningmanagement.dto.lms.SubmoduleResponseDTO;
import com.company.learningmanagement.dto.lms.ApiResponse;
import com.company.learningmanagement.dto.lms.BulkOperationResponse;
import com.company.learningmanagement.service.lms.SubmoduleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submodules")
public class SubmoduleController {

    private final SubmoduleService submoduleService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final jakarta.validation.Validator validator;

    public SubmoduleController(SubmoduleService submoduleService,
                               com.fasterxml.jackson.databind.ObjectMapper objectMapper,
                               jakarta.validation.Validator validator) {
        this.submoduleService = submoduleService;
        this.objectMapper = objectMapper;
        this.validator = validator;
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createSubmodule(@RequestBody String requestBody) throws Exception {
        String trimmed = requestBody.trim();
        if (trimmed.startsWith("[")) {
            List<SubmoduleRequestDTO> requests = objectMapper.readValue(
                    trimmed,
                    new com.fasterxml.jackson.core.type.TypeReference<List<SubmoduleRequestDTO>>() {}
            );
            BulkOperationResponse response = submoduleService.createBulk(requests);
            ApiResponse apiResponse = new ApiResponse("Bulk submodule creation completed", response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.CREATED : HttpStatus.OK);
        } else {
            SubmoduleRequestDTO request = objectMapper.readValue(trimmed, SubmoduleRequestDTO.class);
            java.util.Set<jakarta.validation.ConstraintViolation<SubmoduleRequestDTO>> violations = validator.validate(request);
            if (!violations.isEmpty()) {
                String reason = violations.stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .collect(java.util.stream.Collectors.joining("; "));
                throw new java.lang.IllegalArgumentException("Validation failed: " + reason);
            }
            SubmoduleResponseDTO submodule = submoduleService.create(request);
            ApiResponse apiResponse = new ApiResponse("Submodule created successfully", submodule);
            return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllSubmodules() {
        List<SubmoduleResponseDTO> submodules = submoduleService.getAll();
        ApiResponse response = new ApiResponse("Submodules retrieved successfully", submodules);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getSubmoduleById(@PathVariable Long id) {
        SubmoduleResponseDTO submodule = submoduleService.getById(id);
        ApiResponse response = new ApiResponse("Submodule retrieved successfully", submodule);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateSubmodule(@PathVariable Long id, @Valid @RequestBody SubmoduleRequestDTO request) {
        SubmoduleResponseDTO submodule = submoduleService.update(id, request);
        ApiResponse response = new ApiResponse("Submodule updated successfully", submodule);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteSubmodule(@PathVariable Long id) {
        submoduleService.delete(id);
        ApiResponse response = new ApiResponse("Submodule deleted successfully", null);
        return ResponseEntity.ok(response);
    }
}
