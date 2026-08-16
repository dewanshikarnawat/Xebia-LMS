package com.company.learningmanagement.service.lms;

import com.company.learningmanagement.dto.lms.CourseRequestDTO;
import com.company.learningmanagement.dto.lms.CourseResponseDTO;

import com.company.learningmanagement.dto.lms.BulkOperationResponse;
import java.util.List;

public interface CourseService {
    CourseResponseDTO create(CourseRequestDTO request);
    List<CourseResponseDTO> getAll();
    CourseResponseDTO getById(Long id);
    CourseResponseDTO update(Long id, CourseRequestDTO request);
    void delete(Long id);
    BulkOperationResponse createBulk(List<CourseRequestDTO> requests);
    
    org.springframework.data.domain.Page<CourseResponseDTO> getAll(
            int page, int size, String sortBy, String sortDir,
            String search, Long categoryId, String level, Boolean isActive, Boolean isPublished
    );
    void assignTeachersToCourse(Long courseId, List<Long> teacherIds);
    void removeTeacherFromCourse(Long courseId, Long teacherId);
    List<com.company.learningmanagement.dto.assignment.response.TeacherResponse> getAssignedTeachers(Long courseId);
    List<com.company.learningmanagement.dto.lms.CourseTeacherMappingResponseDTO> getCourseTeacherMappings();
}
