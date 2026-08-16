package com.company.learningmanagement.controller.lms;

import com.company.learningmanagement.dto.lms.CourseRequestDTO;
import com.company.learningmanagement.dto.lms.CourseResponseDTO;
import com.company.learningmanagement.dto.lms.ApiResponse;
import com.company.learningmanagement.dto.lms.BulkOperationResponse;
import com.company.learningmanagement.service.lms.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final jakarta.validation.Validator validator;

    public CourseController(CourseService courseService,
                            com.fasterxml.jackson.databind.ObjectMapper objectMapper,
                            jakarta.validation.Validator validator) {
        this.courseService = courseService;
        this.objectMapper = objectMapper;
        this.validator = validator;
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createCourse(@RequestBody String requestBody) throws Exception {
        String trimmed = requestBody.trim();
        if (trimmed.startsWith("[")) {
            List<CourseRequestDTO> requests = objectMapper.readValue(
                    trimmed,
                    new com.fasterxml.jackson.core.type.TypeReference<List<CourseRequestDTO>>() {}
            );
            BulkOperationResponse response = courseService.createBulk(requests);
            ApiResponse apiResponse = new ApiResponse("Bulk course creation completed", response);
            return new ResponseEntity<>(apiResponse, response.isSuccess() ? HttpStatus.CREATED : HttpStatus.OK);
        } else {
            CourseRequestDTO request = objectMapper.readValue(trimmed, CourseRequestDTO.class);
            java.util.Set<jakarta.validation.ConstraintViolation<CourseRequestDTO>> violations = validator.validate(request);
            if (!violations.isEmpty()) {
                String reason = violations.stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .collect(java.util.stream.Collectors.joining("; "));
                throw new java.lang.IllegalArgumentException("Validation failed: " + reason);
            }
            CourseResponseDTO course = courseService.create(request);
            ApiResponse apiResponse = new ApiResponse("Course created successfully", course);
            return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse> getAllCourses(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Boolean isPublished
    ) {
        if (page != null && size != null) {
            org.springframework.data.domain.Page<CourseResponseDTO> courses = courseService.getAll(
                    page, size, sortBy, sortDir, search, categoryId, level, isActive, isPublished
            );
            com.company.learningmanagement.dto.assignment.response.CustomPage<CourseResponseDTO> customPage = 
                    com.company.learningmanagement.dto.assignment.response.CustomPage.of(courses);
            ApiResponse response = new ApiResponse("Courses retrieved successfully", customPage);
            return ResponseEntity.ok(response);
        } else {
            org.springframework.data.domain.Page<CourseResponseDTO> courses = courseService.getAll(
                    0, 1000, sortBy, sortDir, search, categoryId, level, isActive, isPublished
            );
            ApiResponse response = new ApiResponse("Courses retrieved successfully", courses.getContent());
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getCourseById(@PathVariable Long id) {
        CourseResponseDTO course = courseService.getById(id);
        ApiResponse response = new ApiResponse("Course retrieved successfully", course);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseRequestDTO request) {
        CourseResponseDTO course = courseService.update(id, request);
        ApiResponse response = new ApiResponse("Course updated successfully", course);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteCourse(@PathVariable Long id) {
        courseService.delete(id);
        ApiResponse response = new ApiResponse("Course deleted successfully", null);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{courseId}/teachers")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> assignTeachers(
            @PathVariable Long courseId,
            @RequestBody List<Long> teacherIds
    ) {
        courseService.assignTeachersToCourse(courseId, teacherIds);
        ApiResponse response = new ApiResponse("Teachers assigned successfully", null);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{courseId}/teachers/{teacherId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> removeTeacher(
            @PathVariable Long courseId,
            @PathVariable Long teacherId
    ) {
        courseService.removeTeacherFromCourse(courseId, teacherId);
        ApiResponse response = new ApiResponse("Teacher assignment removed successfully", null);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{courseId}/teachers")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getTeachers(@PathVariable Long courseId) {
        List<com.company.learningmanagement.dto.assignment.response.TeacherResponse> teachers = courseService.getAssignedTeachers(courseId);
        ApiResponse response = new ApiResponse("Assigned teachers retrieved successfully", teachers);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/teacher-mappings")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getTeacherMappings() {
        List<com.company.learningmanagement.dto.lms.CourseTeacherMappingResponseDTO> mappings = courseService.getCourseTeacherMappings();
        ApiResponse response = new ApiResponse("Teacher-course mappings retrieved successfully", mappings);
        return ResponseEntity.ok(response);
    }
}
