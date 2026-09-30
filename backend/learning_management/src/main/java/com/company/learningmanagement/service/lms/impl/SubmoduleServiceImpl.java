package com.company.learningmanagement.service.lms.impl;

import com.company.learningmanagement.cache.lms.RedisService;
import com.company.learningmanagement.dto.lms.SubmoduleRequestDTO;
import com.company.learningmanagement.dto.lms.SubmoduleResponseDTO;
import com.company.learningmanagement.entity.lms.learning.ModuleEntity;
import com.company.learningmanagement.entity.lms.learning.SubmoduleEntity;
import com.company.learningmanagement.exception.lms.ResourceNotFoundException;
import com.company.learningmanagement.mapper.lms.SubmoduleMapper;
import com.company.learningmanagement.repository.lms.ModuleRepository;
import com.company.learningmanagement.repository.lms.SubmoduleRepository;
import com.company.learningmanagement.service.lms.SubmoduleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SubmoduleServiceImpl implements SubmoduleService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(SubmoduleServiceImpl.class);

    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.transaction.support.TransactionTemplate transactionTemplate;

    @org.springframework.beans.factory.annotation.Autowired
    private jakarta.validation.Validator validator;

    private final SubmoduleRepository submoduleRepository;
    private final ModuleRepository moduleRepository;
    private final RedisService redisService;
    private final com.company.learningmanagement.repository.lms.CourseRepository courseRepository;

    public SubmoduleServiceImpl(SubmoduleRepository submoduleRepository, 
                                ModuleRepository moduleRepository, 
                                RedisService redisService,
                                com.company.learningmanagement.repository.lms.CourseRepository courseRepository) {
        this.submoduleRepository = submoduleRepository;
        this.moduleRepository = moduleRepository;
        this.redisService = redisService;
        this.courseRepository = courseRepository;
    }

    @Override
    public SubmoduleResponseDTO create(SubmoduleRequestDTO request) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Only admins can create submodules");
        }

        ModuleEntity module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + request.getModuleId()));

        SubmoduleEntity submodule = SubmoduleMapper.toEntity(request, module);
        SubmoduleEntity savedSubmodule = submoduleRepository.save(submodule);

        // Invalidate cache
        redisService.delete("submodules_module_" + request.getModuleId());
        if (module.getCourse() != null) {
            redisService.delete("course_" + module.getCourse().getId());
        }
        redisService.delete("courses_all");

        return SubmoduleMapper.toResponseDTO(savedSubmodule);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmoduleResponseDTO> getAll() {
        return submoduleRepository.findAllWithModule().stream()
                .map(SubmoduleMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SubmoduleResponseDTO getById(Long id) {
        String cacheKey = "contents_submodule_" + id;
        Object cached = redisService.get(cacheKey);
        if (cached instanceof SubmoduleResponseDTO) {
            return (SubmoduleResponseDTO) cached;
        }

        SubmoduleEntity submodule = submoduleRepository.findByIdWithContents(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found with id: " + id));
        SubmoduleResponseDTO result = SubmoduleMapper.toResponseDTOWithContents(submodule);

        redisService.set(cacheKey, result, 30L);
        return result;
    }

    @Override
    public SubmoduleResponseDTO update(Long id, SubmoduleRequestDTO request) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Not authenticated");
        }
        if (user.getRole() == com.company.learningmanagement.enums.Role.STUDENT) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Students cannot modify submodules");
        }

        SubmoduleEntity submodule = submoduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found with id: " + id));

        Long oldModuleId = submodule.getModule() != null ? submodule.getModule().getId() : null;
        Long oldCourseId = (submodule.getModule() != null && submodule.getModule().getCourse() != null) ? submodule.getModule().getCourse().getId() : null;

        ModuleEntity module = moduleRepository.findById(request.getModuleId())
                .orElseThrow(() -> new ResourceNotFoundException("Module not found with id: " + request.getModuleId()));

        Long newCourseId = module.getCourse() != null ? module.getCourse().getId() : null;

        if (user.getRole() == com.company.learningmanagement.enums.Role.TEACHER) {
            if (oldCourseId != null && !courseRepository.isTeacherAssignedToCourse(oldCourseId, user.getUsername())) {
                throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: You are not assigned to this course");
            }
            if (newCourseId != null && !newCourseId.equals(oldCourseId) &&
                !courseRepository.isTeacherAssignedToCourse(newCourseId, user.getUsername())) {
                throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: You are not assigned to the target course");
            }
        }

        SubmoduleMapper.updateEntity(submodule, request, module);
        SubmoduleEntity updatedSubmodule = submoduleRepository.save(submodule);

        // Invalidate cache
        redisService.delete("contents_submodule_" + id);
        if (oldModuleId != null) {
            redisService.delete("submodules_module_" + oldModuleId);
        }
        redisService.delete("submodules_module_" + request.getModuleId());
        
        if (oldCourseId != null) {
            redisService.delete("course_" + oldCourseId);
        }
        if (module.getCourse() != null) {
            redisService.delete("course_" + module.getCourse().getId());
        }
        redisService.delete("courses_all");

        return SubmoduleMapper.toResponseDTO(updatedSubmodule);
    }

    @Override
    public void delete(Long id) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Only admins can delete submodules");
        }

        SubmoduleEntity submodule = submoduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found with id: " + id));

        Long moduleId = submodule.getModule() != null ? submodule.getModule().getId() : null;
        Long courseId = (submodule.getModule() != null && submodule.getModule().getCourse() != null) ? submodule.getModule().getCourse().getId() : null;

        submoduleRepository.delete(submodule);

        // Invalidate cache
        redisService.delete("contents_submodule_" + id);
        if (moduleId != null) {
            redisService.delete("submodules_module_" + moduleId);
        }
        if (courseId != null) {
            redisService.delete("course_" + courseId);
        }
        redisService.delete("courses_all");
    }

    @Override
    public com.company.learningmanagement.dto.lms.BulkOperationResponse createBulk(List<SubmoduleRequestDTO> requests) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Only admins can perform bulk creations");
        }
        log.info("Bulk submodule creation started with {} requests", requests.size());
        List<com.company.learningmanagement.dto.lms.BulkOperationResultItem> results = new java.util.ArrayList<>();
        int successfulCount = 0;
        int failedCount = 0;

        for (int i = 0; i < requests.size(); i++) {
            SubmoduleRequestDTO req = requests.get(i);
            int index = i + 1;
            log.info("Processing submodule in bulk at index: {}", index);

            // 1. Validation check
            java.util.Set<jakarta.validation.ConstraintViolation<SubmoduleRequestDTO>> violations = validator.validate(req);
            if (!violations.isEmpty()) {
                String reason = violations.stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .collect(java.util.stream.Collectors.joining("; "));
                log.warn("Validation failed for submodule at index {}: {}", index, reason);
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
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", "Duplicate submodule or database constraint violation"));
                failedCount++;
            } catch (Exception ex) {
                log.error("Error creating submodule at index {}: {}", index, ex.getMessage());
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", ex.getMessage()));
                failedCount++;
            }
        }

        log.info("Bulk submodule creation completed. Total: {}, Successful: {}, Failed: {}", requests.size(), successfulCount, failedCount);
        return com.company.learningmanagement.dto.lms.BulkOperationResponse.builder()
                .success(successfulCount > 0)
                .total(requests.size())
                .successful(successfulCount)
                .failed(failedCount)
                .results(results)
                .build();
    }
}
