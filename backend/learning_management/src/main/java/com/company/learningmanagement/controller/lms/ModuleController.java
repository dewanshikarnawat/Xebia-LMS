package com.company.learningmanagement.controller.lms;

import com.company.learningmanagement.dto.lms.ModuleRequestDTO;
import com.company.learningmanagement.dto.lms.ModuleResponseDTO;
import com.company.learningmanagement.dto.lms.ApiResponse;
import com.company.learningmanagement.dto.lms.BulkOperationResponse;
import com.company.learningmanagement.service.lms.ModuleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/modules")
public class ModuleController {

    private final ModuleService moduleService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final jakarta.validation.Validator validator;

    public ModuleController(ModuleService moduleService,
                            com.fasterxml.jackson.databind.ObjectMapper objectMapper,
                            jakarta.validation.Validator validator) {
        this.moduleService = moduleService;
        this.objectMapper = objectMapper;
        this.validator = validator;
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createModule(@RequestBody String requestBody) throws Exception {
        String trimmed = requestBody.trim();
        if (trimmed.startsWith("[")) {
            List<ModuleRequestDTO> requests = objectMapper.readValue(
                    trimmed,
                    new com.fasterxml.jackson.core.type.TypeReference<List<ModuleRequestDTO>>() {}
            );
            BulkOperationResponse response = moduleService.createBulk(requests);
            ApiResponse apiResponse = new ApiResponse("Bulk module creation completed", response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.CREATED : HttpStatus.OK);
        } else {
            ModuleRequestDTO request = objectMapper.readValue(trimmed, ModuleRequestDTO.class);
            java.util.Set<jakarta.validation.ConstraintViolation<ModuleRequestDTO>> violations = validator.validate(request);
            if (!violations.isEmpty()) {
                String reason = violations.stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .collect(java.util.stream.Collectors.joining("; "));
                throw new java.lang.IllegalArgumentException("Validation failed: " + reason);
            }
            ModuleResponseDTO module = moduleService.create(request);
            ApiResponse apiResponse = new ApiResponse("Module created successfully", module);
            return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllModules() {
        List<ModuleResponseDTO> modules = moduleService.getAll();
        ApiResponse response = new ApiResponse("Modules retrieved successfully", modules);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getModuleById(@PathVariable Long id) {
        ModuleResponseDTO module = moduleService.getById(id);
        ApiResponse response = new ApiResponse("Module retrieved successfully", module);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateModule(@PathVariable Long id, @Valid @RequestBody ModuleRequestDTO request) {
        ModuleResponseDTO module = moduleService.update(id, request);
        ApiResponse response = new ApiResponse("Module updated successfully", module);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteModule(@PathVariable Long id) {
        moduleService.delete(id);
        ApiResponse response = new ApiResponse("Module deleted successfully", null);
        return ResponseEntity.ok(response);
    }
}
