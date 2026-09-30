package com.company.learningmanagement.service.lms;

import com.company.learningmanagement.dto.lms.CategoryRequestDTO;
import com.company.learningmanagement.dto.lms.CategoryResponseDTO;
import com.company.learningmanagement.dto.lms.CategoryWiseCourseResponseDTO;

import com.company.learningmanagement.dto.lms.BulkOperationResponse;
import java.util.List;

public interface CategoryService {
    CategoryResponseDTO create(CategoryRequestDTO request);
    List<CategoryResponseDTO> getAll();
    CategoryResponseDTO getById(Long id);
    CategoryWiseCourseResponseDTO getCategoryCourses(Long categoryId);
    CategoryResponseDTO update(Long id, CategoryRequestDTO request);
    void delete(Long id);
    BulkOperationResponse createBulk(List<CategoryRequestDTO> requests);
}

