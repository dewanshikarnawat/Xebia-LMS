package com.company.learningmanagement.controller.lms;

import com.company.learningmanagement.dto.lms.CategoryRequestDTO;
import com.company.learningmanagement.dto.lms.CategoryResponseDTO;
import com.company.learningmanagement.dto.lms.CategoryWiseCourseResponseDTO;
import com.company.learningmanagement.dto.lms.ApiResponse;
import com.company.learningmanagement.dto.lms.BulkOperationResponse;
import com.company.learningmanagement.service.lms.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final jakarta.validation.Validator validator;

    public CategoryController(CategoryService categoryService, 
                              com.fasterxml.jackson.databind.ObjectMapper objectMapper,
                              jakarta.validation.Validator validator) {
        this.categoryService = categoryService;
        this.objectMapper = objectMapper;
        this.validator = validator;
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createCategory(@RequestBody String requestBody) throws Exception {
        String trimmed = requestBody.trim();
        if (trimmed.startsWith("[")) {
            List<CategoryRequestDTO> requests = objectMapper.readValue(
                    trimmed,
                    new com.fasterxml.jackson.core.type.TypeReference<List<CategoryRequestDTO>>() {}
            );
            BulkOperationResponse response = categoryService.createBulk(requests);
            ApiResponse apiResponse = new ApiResponse("Bulk category creation completed", response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.CREATED : HttpStatus.OK);
        } else {
            CategoryRequestDTO request = objectMapper.readValue(trimmed, CategoryRequestDTO.class);
            java.util.Set<jakarta.validation.ConstraintViolation<CategoryRequestDTO>> violations = validator.validate(request);
            if (!violations.isEmpty()) {
                String reason = violations.stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .collect(java.util.stream.Collectors.joining("; "));
                throw new java.lang.IllegalArgumentException("Validation failed: " + reason);
            }
            CategoryResponseDTO category = categoryService.create(request);
            ApiResponse apiResponse = new ApiResponse("Category created successfully", category);
            return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllCategories() {
        List<CategoryResponseDTO> categories = categoryService.getAll();
        ApiResponse response = new ApiResponse("Categories retrieved successfully", categories);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getCategoryById(@PathVariable Long id) {
        CategoryResponseDTO category = categoryService.getById(id);
        ApiResponse response = new ApiResponse("Category retrieved successfully", category);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{categoryId}/courses")
    public ResponseEntity<ApiResponse> getCategoryCourses(@PathVariable Long categoryId) {
        CategoryWiseCourseResponseDTO categoryWiseCourses = categoryService.getCategoryCourses(categoryId);
        ApiResponse response = new ApiResponse("Courses retrieved successfully", categoryWiseCourses);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequestDTO request) {
        CategoryResponseDTO category = categoryService.update(id, request);
        ApiResponse response = new ApiResponse("Category updated successfully", category);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        ApiResponse response = new ApiResponse("Category deleted successfully", null);
        return ResponseEntity.ok(response);
    }
}
