package com.company.learningmanagement.service.lms.impl;

import com.company.learningmanagement.cache.lms.RedisService;
import com.company.learningmanagement.dto.lms.CourseRequestDTO;
import com.company.learningmanagement.dto.lms.CourseResponseDTO;
import com.company.learningmanagement.entity.lms.learning.CategoryEntity;
import com.company.learningmanagement.entity.lms.learning.CourseEntity;
import com.company.learningmanagement.exception.lms.ResourceNotFoundException;
import com.company.learningmanagement.mapper.lms.CourseMapper;
import com.company.learningmanagement.repository.lms.CategoryRepository;
import com.company.learningmanagement.repository.lms.CourseRepository;
import com.company.learningmanagement.service.lms.CourseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseServiceImpl implements CourseService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CourseServiceImpl.class);

    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.transaction.support.TransactionTemplate transactionTemplate;

    @org.springframework.beans.factory.annotation.Autowired
    private jakarta.validation.Validator validator;

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final RedisService redisService;
    private final com.company.learningmanagement.repository.assignment.TeacherRepository teacherRepository;
    private final com.company.learningmanagement.repository.lms.CourseEnrollmentRepository courseEnrollmentRepository;

    public CourseServiceImpl(CourseRepository courseRepository, 
                             CategoryRepository categoryRepository, 
                             RedisService redisService,
                             com.company.learningmanagement.repository.assignment.TeacherRepository teacherRepository,
                             com.company.learningmanagement.repository.lms.CourseEnrollmentRepository courseEnrollmentRepository) {
        this.courseRepository = courseRepository;
        this.categoryRepository = categoryRepository;
        this.redisService = redisService;
        this.teacherRepository = teacherRepository;
        this.courseEnrollmentRepository = courseEnrollmentRepository;
    }

    @Override
    public CourseResponseDTO create(CourseRequestDTO request) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Only admins can create courses");
        }

        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        CourseEntity course = CourseMapper.toEntity(request, category);
        CourseEntity savedCourse = courseRepository.save(course);

        // Invalidate cache
        redisService.delete("courses_all");
        redisService.delete("category_courses_" + request.getCategoryId());

        return CourseMapper.toResponseDTO(savedCourse);
    }

    @Override
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<CourseResponseDTO> getAll() {
        String cacheKey = "courses_all";
        Object cached = redisService.get(cacheKey);
        if (cached instanceof List) {
            return (List<CourseResponseDTO>) cached;
        }

        List<CourseResponseDTO> result = courseRepository.findAllWithCategory().stream()
                .map(course -> {
                    if (course.getCategory() != null) {
                        course.getCategory().getName();
                    }
                    return CourseMapper.toResponseDTO(course);
                })
                .collect(Collectors.toList());

        redisService.set(cacheKey, result, 30L);
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public CourseResponseDTO getById(Long id) {
        String cacheKey = "course_" + id;
        Object cached = redisService.get(cacheKey);
        if (cached instanceof CourseResponseDTO) {
            return (CourseResponseDTO) cached;
        }

        CourseResponseDTO result;
        if (cached instanceof CourseResponseDTO) {
            result = (CourseResponseDTO) cached;
        } else {
            CourseEntity course = courseRepository.findByIdWithModules(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
            if (course.getModules() != null) {
                course.getModules().forEach(module -> {
                    if (module.getSubmodules() != null) {
                        module.getSubmodules().forEach(submodule -> {
                            if (submodule.getContents() != null) {
                                submodule.getContents().size();
                            }
                        });
                    }
                });
            }
            result = CourseMapper.toResponseDTOWithModules(course);
            redisService.set(cacheKey, result, 30L);
        }

        boolean isApproved = false;
        var currentUser = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (currentUser != null) {
            if (currentUser.getRole() == com.company.learningmanagement.enums.Role.ADMIN ||
                currentUser.getRole() == com.company.learningmanagement.enums.Role.TEACHER) {
                isApproved = true;
            } else if (currentUser.getRole() == com.company.learningmanagement.enums.Role.STUDENT) {
                isApproved = courseEnrollmentRepository.existsByStudentEmailAndCourseIdAndStatus(
                    currentUser.getUsername(), id, com.company.learningmanagement.entity.lms.learning.EnrollmentStatus.APPROVED
                );
            }
        }
        if (!isApproved) {
            if (result.getModules() != null) {
                result.getModules().forEach(m -> {
                    if (m.getSubmodules() != null) {
                        m.getSubmodules().forEach(sub -> {
                            sub.setContents(new java.util.ArrayList<>());
                        });
                    }
                });
            }
        }

        return result;
    }

    @Override
    public CourseResponseDTO update(Long id, CourseRequestDTO request) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Not authenticated");
        }
        if (user.getRole() == com.company.learningmanagement.enums.Role.STUDENT) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Students cannot modify courses");
        }
        if (user.getRole() == com.company.learningmanagement.enums.Role.TEACHER) {
            if (!courseRepository.isTeacherAssignedToCourse(id, user.getUsername())) {
                throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: You are not assigned to this course");
            }
        }

        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        Long oldCategoryId = course.getCategory() != null ? course.getCategory().getId() : null;

        CategoryEntity category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        CourseMapper.updateEntity(course, request, category);
        CourseEntity updatedCourse = courseRepository.save(course);

        // Invalidate cache
        redisService.delete("courses_all");
        redisService.delete("course_" + id);
        redisService.delete("modules_course_" + id);
        if (oldCategoryId != null) {
            redisService.delete("category_courses_" + oldCategoryId);
        }
        redisService.delete("category_courses_" + request.getCategoryId());

        return CourseMapper.toResponseDTO(updatedCourse);
    }

    @Override
    public void delete(Long id) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Only admins can delete courses");
        }

        CourseEntity course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        
        Long categoryId = course.getCategory() != null ? course.getCategory().getId() : null;

        courseRepository.delete(course);

        // Invalidate cache
        redisService.delete("courses_all");
        redisService.delete("course_" + id);
        redisService.delete("modules_course_" + id);
        if (categoryId != null) {
            redisService.delete("category_courses_" + categoryId);
        }
    }

    @Override
    public com.company.learningmanagement.dto.lms.BulkOperationResponse createBulk(List<CourseRequestDTO> requests) {
        var user = com.company.learningmanagement.util.SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new com.company.learningmanagement.exception.assignment.ForbiddenException("Access Denied: Only admins can perform bulk creations");
        }

        log.info("Bulk course creation started with {} requests", requests.size());
        List<com.company.learningmanagement.dto.lms.BulkOperationResultItem> results = new java.util.ArrayList<>();
        int successfulCount = 0;
        int failedCount = 0;

        for (int i = 0; i < requests.size(); i++) {
            CourseRequestDTO req = requests.get(i);
            int index = i + 1;
            log.info("Processing course in bulk at index: {}", index);

            // 1. Validation check
            java.util.Set<jakarta.validation.ConstraintViolation<CourseRequestDTO>> violations = validator.validate(req);
            if (!violations.isEmpty()) {
                String reason = violations.stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .collect(java.util.stream.Collectors.joining("; "));
                log.warn("Validation failed for course at index {}: {}", index, reason);
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
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", "Duplicate course or database constraint violation"));
                failedCount++;
            } catch (Exception ex) {
                log.error("Error creating course at index {}: {}", index, ex.getMessage());
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", ex.getMessage()));
                failedCount++;
            }
        }

        log.info("Bulk course creation completed. Total: {}, Successful: {}, Failed: {}", requests.size(), successfulCount, failedCount);
        return com.company.learningmanagement.dto.lms.BulkOperationResponse.builder()
                .success(successfulCount > 0)
                .total(requests.size())
                .successful(successfulCount)
                .failed(failedCount)
                .results(results)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<CourseResponseDTO> getAll(
            int page, int size, String sortBy, String sortDir,
            String search, Long categoryId, String level, Boolean isActive, Boolean isPublished
    ) {
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.unsorted();
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            org.springframework.data.domain.Sort.Direction direction = 
                (sortDir != null && "asc".equalsIgnoreCase(sortDir)) 
                ? org.springframework.data.domain.Sort.Direction.ASC 
                : org.springframework.data.domain.Sort.Direction.DESC;
            sort = org.springframework.data.domain.Sort.by(direction, sortBy);
        }
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, sort);

        org.springframework.data.jpa.domain.Specification<CourseEntity> spec = org.springframework.data.jpa.domain.Specification.where(
                com.company.learningmanagement.repository.lms.CourseSpecifications.hasCategoryId(categoryId)
        ).and(
                com.company.learningmanagement.repository.lms.CourseSpecifications.hasLevel(level)
        ).and(
                com.company.learningmanagement.repository.lms.CourseSpecifications.hasIsActive(isActive)
        ).and(
                com.company.learningmanagement.repository.lms.CourseSpecifications.hasIsPublished(isPublished)
        ).and(
                com.company.learningmanagement.repository.lms.CourseSpecifications.hasSearch(search)
        );

        return courseRepository.findAll(spec, pageable)
                .map(CourseMapper::toResponseDTO);
    }

    @Override
    public void assignTeachersToCourse(Long courseId, List<Long> teacherIds) {
        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        List<com.company.learningmanagement.entity.assignment.Teacher> teachers = teacherRepository.findAllById(teacherIds);
        if (teachers.size() != teacherIds.size()) {
            throw new ResourceNotFoundException("One or more teachers not found");
        }

        course.setTeachers(teachers);
        courseRepository.save(course);

        redisService.delete("course_" + courseId);
        redisService.delete("courses_all");
    }

    @Override
    public void removeTeacherFromCourse(Long courseId, Long teacherId) {
        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        com.company.learningmanagement.entity.assignment.Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + teacherId));

        course.getTeachers().remove(teacher);
        courseRepository.save(course);

        redisService.delete("course_" + courseId);
        redisService.delete("courses_all");
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.company.learningmanagement.dto.assignment.response.TeacherResponse> getAssignedTeachers(Long courseId) {
        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        return course.getTeachers().stream()
                .map(t -> com.company.learningmanagement.dto.assignment.response.TeacherResponse.builder()
                        .id(t.getId())
                        .fullName(t.getFullName())
                        .email(t.getEmail())
                        .phone(t.getPhone())
                        .role(t.getRole())
                        .createdAt(t.getCreatedAt())
                        .updatedAt(t.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.company.learningmanagement.dto.lms.CourseTeacherMappingResponseDTO> getCourseTeacherMappings() {
        return courseRepository.findAll().stream()
                .map(c -> {
                    List<com.company.learningmanagement.dto.assignment.response.TeacherResponse> teachers = c.getTeachers().stream()
                            .map(t -> com.company.learningmanagement.dto.assignment.response.TeacherResponse.builder()
                                    .id(t.getId())
                                    .fullName(t.getFullName())
                                    .email(t.getEmail())
                                    .phone(t.getPhone())
                                    .role(t.getRole())
                                    .createdAt(t.getCreatedAt())
                                    .updatedAt(t.getUpdatedAt())
                                    .build())
                            .collect(Collectors.toList());
                    return com.company.learningmanagement.dto.lms.CourseTeacherMappingResponseDTO.builder()
                            .courseId(c.getId())
                            .courseTitle(c.getTitle())
                            .assignedTeachers(teachers)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
