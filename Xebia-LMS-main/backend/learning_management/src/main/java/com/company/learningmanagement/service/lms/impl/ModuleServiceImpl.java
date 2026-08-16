package com.company.learningmanagement.service.lms.impl;

import com.company.learningmanagement.cache.lms.RedisService;
import com.company.learningmanagement.dto.lms.ModuleRequestDTO;
import com.company.learningmanagement.dto.lms.ModuleResponseDTO;
import com.company.learningmanagement.entity.lms.learning.CourseEntity;
import com.company.learningmanagement.entity.lms.learning.ModuleEntity;
import com.company.learningmanagement.exception.lms.ResourceNotFoundException;
import com.company.learningmanagement.mapper.lms.ModuleMapper;
import com.company.learningmanagement.repository.lms.CourseRepository;
import com.company.learningmanagement.repository.lms.ModuleRepository;
import com.company.learningmanagement.service.lms.ModuleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ModuleServiceImpl implements ModuleService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ModuleServiceImpl.class);

    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.transaction.support.TransactionTemplate transactionTemplate;

    @org.springframework.beans.factory.annotation.Autowired
    private jakarta.validation.Validator validator;

    private final ModuleRepository moduleRepository;
    private final CourseRepository courseRepository;
    private final RedisService redisService;

    public ModuleServiceImpl(ModuleRepository moduleRepository, CourseRepository courseRepository, RedisService redisService) {
        this.moduleRepository = moduleRepository;
        this.courseRepository = courseRepository;
        this.redisService = redisService;
    }

    @Override
    public ModuleResponseDTO create(ModuleRequestDTO request) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Only admins can create modules");
        }

        CourseEntity course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        ModuleEntity module = ModuleMapper.toEntity(request, course);
        ModuleEntity savedModule = moduleRepository.save(module);

        // Invalidate cache
        redisService.delete("modules_course_" + request.getCourseId());
        redisService.delete("course_" + request.getCourseId());
        redisService.delete("courses_all");

        return ModuleMapper.toResponseDTO(savedModule);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ModuleResponseDTO> getAll() {
        return moduleRepository.findAllWithCourse().stream()
                .map(ModuleMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ModuleResponseDTO getById(Long id) {
        String cacheKey = "submodules_module_" + id;
        Object cached = redisService.get(cacheKey);
        if (cached instanceof ModuleResponseDTO) {
            return (ModuleResponseDTO) cached;
        }

        ModuleEntity module = moduleRepository.findByIdWithSubmodules(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + id));
        ModuleResponseDTO result = ModuleMapper.toResponseDTOWithSubmodules(module);

        redisService.set(cacheKey, result, 30L);
        return result;
    }

    @Override
    public ModuleResponseDTO update(Long id, ModuleRequestDTO request) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Not authenticated");
        }
        if (user.getRole() == com.company.learningmanagement.enums.Role.STUDENT) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Students cannot modify modules");
        }

        ModuleEntity module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + id));

        Long oldCourseId = module.getCourse() != null ? module.getCourse().getId() : null;

        if (user.getRole() == com.company.learningmanagement.enums.Role.TEACHER) {
            if (oldCourseId != null && !courseRepository.isTeacherAssignedToCourse(oldCourseId, user.getUsername())) {
                throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: You are not assigned to this course");
            }
            if (request.getCourseId() != null && !request.getCourseId().equals(oldCourseId) &&
                !courseRepository.isTeacherAssignedToCourse(request.getCourseId(), user.getUsername())) {
                throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: You are not assigned to the target course");
            }
        }

        CourseEntity course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        ModuleMapper.updateEntity(module, request, course);
        ModuleEntity updatedModule = moduleRepository.save(module);

        // Invalidate cache
        redisService.delete("submodules_module_" + id);
        if (oldCourseId != null) {
            redisService.delete("modules_course_" + oldCourseId);
            redisService.delete("course_" + oldCourseId);
        }
        redisService.delete("modules_course_" + request.getCourseId());
        redisService.delete("course_" + request.getCourseId());
        redisService.delete("courses_all");

        return ModuleMapper.toResponseDTO(updatedModule);
    }

    @Override
    public void delete(Long id) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Only admins can delete modules");
        }

        ModuleEntity module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + id));

        Long courseId = module.getCourse() != null ? module.getCourse().getId() : null;

        moduleRepository.delete(module);

        // Invalidate cache
        redisService.delete("submodules_module_" + id);
        if (courseId != null) {
            redisService.delete("modules_course_" + courseId);
            redisService.delete("course_" + courseId);
        }
        redisService.delete("courses_all");
    }

    @Override
    public com.company.learningmanagement.dto.lms.BulkOperationResponse createBulk(List<ModuleRequestDTO> requests) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Only admins can perform bulk creations");
        }

        log.info("Bulk module creation started with {} requests", requests.size());
        List<com.company.learningmanagement.dto.lms.BulkOperationResultItem> results = new java.util.ArrayList<>();
        int successfulCount = 0;
        int failedCount = 0;

        for (int i = 0; i < requests.size(); i++) {
            ModuleRequestDTO req = requests.get(i);
            int index = i + 1;
            log.info("Processing module in bulk at index: {}", index);

            // 1. Validation check
            java.util.Set<jakarta.validation.ConstraintViolation<ModuleRequestDTO>> violations = validator.validate(req);
            if (!violations.isEmpty()) {
                String reason = violations.stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .collect(java.util.stream.Collectors.joining("; "));
                log.warn("Validation failed for module at index {}: {}", index, reason);
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
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", "Duplicate module or database constraint violation"));
                failedCount++;
            } catch (Exception ex) {
                log.error("Error creating module at index {}: {}", index, ex.getMessage());
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", ex.getMessage()));
                failedCount++;
            }
        }

        log.info("Bulk module creation completed. Total: {}, Successful: {}, Failed: {}", requests.size(), successfulCount, failedCount);
        return com.company.learningmanagement.dto.lms.BulkOperationResponse.builder()
                .success(successfulCount > 0)
                .total(requests.size())
                .successful(successfulCount)
                .failed(failedCount)
                .results(results)
                .build();
    }
}
