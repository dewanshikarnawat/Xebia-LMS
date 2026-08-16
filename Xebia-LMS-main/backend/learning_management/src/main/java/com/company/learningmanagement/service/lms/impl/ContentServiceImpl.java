package com.company.learningmanagement.service.lms.impl;

import com.company.learningmanagement.cache.lms.RedisService;
import com.company.learningmanagement.dto.lms.ContentRequestDTO;
import com.company.learningmanagement.dto.lms.ContentResponseDTO;
import com.company.learningmanagement.entity.lms.learning.ContentEntity;
import com.company.learningmanagement.entity.lms.learning.SubmoduleEntity;
import com.company.learningmanagement.exception.lms.ResourceNotFoundException;
import com.company.learningmanagement.mapper.lms.ContentMapper;
import com.company.learningmanagement.repository.lms.ContentRepository;
import com.company.learningmanagement.repository.lms.SubmoduleRepository;
import com.company.learningmanagement.service.lms.ContentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ContentServiceImpl implements ContentService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ContentServiceImpl.class);

    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.transaction.support.TransactionTemplate transactionTemplate;

    @org.springframework.beans.factory.annotation.Autowired
    private jakarta.validation.Validator validator;

    private final ContentRepository contentRepository;
    private final SubmoduleRepository submoduleRepository;
    private final RedisService redisService;
    private final com.company.learningmanagement.repository.lms.CourseRepository courseRepository;

    public ContentServiceImpl(ContentRepository contentRepository, 
                              SubmoduleRepository submoduleRepository, 
                              RedisService redisService,
                              com.company.learningmanagement.repository.lms.CourseRepository courseRepository) {
        this.contentRepository = contentRepository;
        this.submoduleRepository = submoduleRepository;
        this.redisService = redisService;
        this.courseRepository = courseRepository;
    }

    @Override
    public ContentResponseDTO create(ContentRequestDTO request) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Only admins can create content");
        }

        SubmoduleEntity submodule = submoduleRepository.findById(request.getSubmoduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found with id: " + request.getSubmoduleId()));

        ContentEntity content = ContentMapper.toEntity(request, submodule);
        ContentEntity savedContent = contentRepository.save(content);

        // Invalidate cache
        redisService.delete("contents_submodule_" + request.getSubmoduleId());
        Long courseId = (submodule.getModule() != null && submodule.getModule().getCourse() != null) ? submodule.getModule().getCourse().getId() : null;
        if (courseId != null) {
            redisService.delete("course_" + courseId);
        }
        redisService.delete("courses_all");

        return ContentMapper.toResponseDTO(savedContent);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContentResponseDTO> getAll() {
        return contentRepository.findAllWithSubmodule().stream()
                .map(ContentMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ContentResponseDTO getById(Long id) {
        ContentEntity content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + id));
        return ContentMapper.toResponseDTO(content);
    }

    @Override
    public ContentResponseDTO update(Long id, ContentRequestDTO request) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Not authenticated");
        }
        if (user.getRole() == com.company.learningmanagement.enums.Role.STUDENT) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Students cannot modify content");
        }

        ContentEntity content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + id));

        Long oldSubmoduleId = content.getSubmodule() != null ? content.getSubmodule().getId() : null;
        Long oldCourseId = (content.getSubmodule() != null && content.getSubmodule().getModule() != null && content.getSubmodule().getModule().getCourse() != null) 
                ? content.getSubmodule().getModule().getCourse().getId() : null;

        SubmoduleEntity submodule = submoduleRepository.findById(request.getSubmoduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Submodule not found with id: " + request.getSubmoduleId()));

        Long newCourseId = (submodule.getModule() != null && submodule.getModule().getCourse() != null) ? submodule.getModule().getCourse().getId() : null;

        if (user.getRole() == com.company.learningmanagement.enums.Role.TEACHER) {
            if (oldCourseId != null && !courseRepository.isTeacherAssignedToCourse(oldCourseId, user.getUsername())) {
                throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: You are not assigned to this course");
            }
            if (newCourseId != null && !newCourseId.equals(oldCourseId) &&
                !courseRepository.isTeacherAssignedToCourse(newCourseId, user.getUsername())) {
                throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: You are not assigned to the target course");
            }
        }

        ContentMapper.updateEntity(content, request, submodule);
        ContentEntity updatedContent = contentRepository.save(content);

        // Invalidate cache
        if (oldSubmoduleId != null) {
            redisService.delete("contents_submodule_" + oldSubmoduleId);
        }
        redisService.delete("contents_submodule_" + request.getSubmoduleId());

        if (oldCourseId != null) {
            redisService.delete("course_" + oldCourseId);
        }
        if (newCourseId != null) {
            redisService.delete("course_" + newCourseId);
        }
        redisService.delete("courses_all");

        return ContentMapper.toResponseDTO(updatedContent);
    }

    @Override
    public void delete(Long id) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Only admins can delete content");
        }

        ContentEntity content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with id: " + id));

        Long submoduleId = content.getSubmodule() != null ? content.getSubmodule().getId() : null;
        Long courseId = (content.getSubmodule() != null && content.getSubmodule().getModule() != null && content.getSubmodule().getModule().getCourse() != null) 
                ? content.getSubmodule().getModule().getCourse().getId() : null;

        contentRepository.delete(content);

        // Invalidate cache
        if (submoduleId != null) {
            redisService.delete("contents_submodule_" + submoduleId);
        }
        if (courseId != null) {
            redisService.delete("course_" + courseId);
        }
        redisService.delete("courses_all");
    }

    @Override
    public com.company.learningmanagement.dto.lms.BulkOperationResponse createBulk(List<ContentRequestDTO> requests) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Only admins can perform bulk creations");
        }
        log.info("Bulk content creation started with {} requests", requests.size());
        List<com.company.learningmanagement.dto.lms.BulkOperationResultItem> results = new java.util.ArrayList<>();
        int successfulCount = 0;
        int failedCount = 0;

        for (int i = 0; i < requests.size(); i++) {
            ContentRequestDTO req = requests.get(i);
            int index = i + 1;
            log.info("Processing content in bulk at index: {}", index);

            // 1. Validation check
            java.util.Set<jakarta.validation.ConstraintViolation<ContentRequestDTO>> violations = validator.validate(req);
            if (!violations.isEmpty()) {
                String reason = violations.stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .collect(java.util.stream.Collectors.joining("; "));
                log.warn("Validation failed for content at index {}: {}", index, reason);
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
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", "Duplicate content or database constraint violation"));
                failedCount++;
            } catch (Exception ex) {
                log.error("Error creating content at index {}: {}", index, ex.getMessage());
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", ex.getMessage()));
                failedCount++;
            }
        }

        log.info("Bulk content creation completed. Total: {}, Successful: {}, Failed: {}", requests.size(), successfulCount, failedCount);
        return com.company.learningmanagement.dto.lms.BulkOperationResponse.builder()
                .success(successfulCount > 0)
                .total(requests.size())
                .successful(successfulCount)
                .failed(failedCount)
                .results(results)
                .build();
    }
}
