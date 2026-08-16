package com.company.learningmanagement.controller.lms;

import com.company.learningmanagement.dto.lms.ContentRequestDTO;
import com.company.learningmanagement.dto.lms.ContentResponseDTO;
import com.company.learningmanagement.dto.lms.ApiResponse;
import com.company.learningmanagement.dto.lms.BulkOperationResponse;
import com.company.learningmanagement.service.lms.ContentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contents")
public class ContentController {

    private final ContentService contentService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final jakarta.validation.Validator validator;

    public ContentController(ContentService contentService,
                             com.fasterxml.jackson.databind.ObjectMapper objectMapper,
                             jakarta.validation.Validator validator) {
        this.contentService = contentService;
        this.objectMapper = objectMapper;
        this.validator = validator;
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createContent(@RequestBody String requestBody) throws Exception {
        String trimmed = requestBody.trim();
        if (trimmed.startsWith("[")) {
            List<ContentRequestDTO> requests = objectMapper.readValue(
                    trimmed,
                    new com.fasterxml.jackson.core.type.TypeReference<List<ContentRequestDTO>>() {}
            );
            BulkOperationResponse response = contentService.createBulk(requests);
            ApiResponse apiResponse = new ApiResponse("Bulk content creation completed", response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.CREATED : HttpStatus.OK);
        } else {
            ContentRequestDTO request = objectMapper.readValue(trimmed, ContentRequestDTO.class);
            java.util.Set<jakarta.validation.ConstraintViolation<ContentRequestDTO>> violations = validator.validate(request);
            if (!violations.isEmpty()) {
                String reason = violations.stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .collect(java.util.stream.Collectors.joining("; "));
                throw new java.lang.IllegalArgumentException("Validation failed: " + reason);
            }
            ContentResponseDTO content = contentService.create(request);
            ApiResponse apiResponse = new ApiResponse("Content created successfully", content);
            return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllContents() {
        List<ContentResponseDTO> contents = contentService.getAll();
        ApiResponse response = new ApiResponse("Contents retrieved successfully", contents);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getContentById(@PathVariable Long id) {
        ContentResponseDTO content = contentService.getById(id);
        ApiResponse response = new ApiResponse("Content retrieved successfully", content);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateContent(@PathVariable Long id, @Valid @RequestBody ContentRequestDTO request) {
        ContentResponseDTO content = contentService.update(id, request);
        ApiResponse response = new ApiResponse("Content updated successfully", content);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteContent(@PathVariable Long id) {
        contentService.delete(id);
        ApiResponse response = new ApiResponse("Content deleted successfully", null);
        return ResponseEntity.ok(response);
    }
}
