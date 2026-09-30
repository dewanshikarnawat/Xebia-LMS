package com.company.learningmanagement.service.lms.impl;

import com.company.learningmanagement.cache.lms.RedisService;
import com.company.learningmanagement.dto.lms.CategoryRequestDTO;
import com.company.learningmanagement.dto.lms.CategoryResponseDTO;
import com.company.learningmanagement.dto.lms.CategoryWiseCourseResponseDTO;
import com.company.learningmanagement.entity.lms.learning.CategoryEntity;
import com.company.learningmanagement.exception.lms.ResourceNotFoundException;
import com.company.learningmanagement.mapper.lms.CategoryMapper;
import com.company.learningmanagement.repository.lms.CategoryRepository;
import com.company.learningmanagement.service.lms.CategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CategoryServiceImpl.class);

    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.transaction.support.TransactionTemplate transactionTemplate;

    @org.springframework.beans.factory.annotation.Autowired
    private jakarta.validation.Validator validator;

    private final CategoryRepository categoryRepository;
    private final RedisService redisService;

    public CategoryServiceImpl(CategoryRepository categoryRepository, RedisService redisService) {
        this.categoryRepository = categoryRepository;
        this.redisService = redisService;
    }

    @Override
    public CategoryResponseDTO create(CategoryRequestDTO request) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Only admins can manage categories");
        }

        CategoryEntity category = CategoryMapper.toEntity(request);
        CategoryEntity savedCategory = categoryRepository.save(category);
        
        // Invalidate categories list cache
        redisService.delete("categories_all");
        
        return CategoryMapper.toResponseDTO(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<CategoryResponseDTO> getAll() {
        String cacheKey = "categories_all";
        Object cached = redisService.get(cacheKey);
        if (cached instanceof List) {
            return (List<CategoryResponseDTO>) cached;
        }

        List<CategoryResponseDTO> result = categoryRepository.findAll().stream()
                .map(CategoryMapper::toResponseDTO)
                .collect(Collectors.toList());

        redisService.set(cacheKey, result, 30L);
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponseDTO getById(Long id) {
        String cacheKey = "category_" + id;
        Object cached = redisService.get(cacheKey);
        if (cached instanceof CategoryResponseDTO) {
            return (CategoryResponseDTO) cached;
        }

        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        CategoryResponseDTO result = CategoryMapper.toResponseDTO(category);

        redisService.set(cacheKey, result, 30L);
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryWiseCourseResponseDTO getCategoryCourses(Long categoryId) {
        String cacheKey = "category_courses_" + categoryId;
        Object cached = redisService.get(cacheKey);
        if (cached instanceof CategoryWiseCourseResponseDTO) {
            return (CategoryWiseCourseResponseDTO) cached;
        }

        CategoryEntity category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        if (category.getCourses() != null) {
            category.getCourses().size();
        }
        CategoryWiseCourseResponseDTO result = CategoryMapper.toCategoryWiseCourseResponseDTO(category);

        redisService.set(cacheKey, result, 30L);
        return result;
    }

    @Override
    public CategoryResponseDTO update(Long id, CategoryRequestDTO request) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Only admins can manage categories");
        }

        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        CategoryMapper.updateEntity(category, request);
        CategoryEntity updatedCategory = categoryRepository.save(category);

        // Invalidate cache
        redisService.delete("categories_all");
        redisService.delete("category_" + id);
        redisService.delete("category_courses_" + id);

        return CategoryMapper.toResponseDTO(updatedCategory);
    }

    @Override
    public void delete(Long id) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Only admins can manage categories");
        }

        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        categoryRepository.delete(category);

        // Invalidate cache
        redisService.delete("categories_all");
        redisService.delete("category_" + id);
        redisService.delete("category_courses_" + id);
    }

    @Override
    public com.company.learningmanagement.dto.lms.BulkOperationResponse createBulk(List<CategoryRequestDTO> requests) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Only admins can manage categories");
        }

        log.info("Bulk category creation started with {} requests", requests.size());
        List<com.company.learningmanagement.dto.lms.BulkOperationResultItem> results = new java.util.ArrayList<>();
        int successfulCount = 0;
        int failedCount = 0;

        for (int i = 0; i < requests.size(); i++) {
            CategoryRequestDTO req = requests.get(i);
            int index = i + 1;
            log.info("Processing category in bulk at index: {}", index);

            // 1. Validation check
            java.util.Set<jakarta.validation.ConstraintViolation<CategoryRequestDTO>> violations = validator.validate(req);
            if (!violations.isEmpty()) {
                String reason = violations.stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .collect(java.util.stream.Collectors.joining("; "));
                log.warn("Validation failed for category at index {}: {}", index, reason);
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", reason));
                failedCount++;
                continue;
            }

            // 2. Perform create in independent transaction
            try {
                transactionTemplate.executeWithoutResult(status -> {
                    create(req);
                });
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "SUCCESS", null));
                successfulCount++;
            } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                log.error("Database integrity violation at index {}: {}", index, ex.getMessage());
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", "Duplicate category or database constraint violation"));
                failedCount++;
            } catch (Exception ex) {
                log.error("Error creating category at index {}: {}", index, ex.getMessage());
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", ex.getMessage()));
                failedCount++;
            }
        }

        log.info("Bulk category creation completed. Total: {}, Successful: {}, Failed: {}", requests.size(), successfulCount, failedCount);
        return com.company.learningmanagement.dto.lms.BulkOperationResponse.builder()
                .success(successfulCount > 0)
                .total(requests.size())
                .successful(successfulCount)
                .failed(failedCount)
                .results(results)
                .build();
    }
}
