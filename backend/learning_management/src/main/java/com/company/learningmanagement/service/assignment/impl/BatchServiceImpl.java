package com.company.learningmanagement.service.assignment.impl;

import com.company.learningmanagement.dto.assignment.request.BatchRequest;
import com.company.learningmanagement.dto.assignment.response.BatchResponse;
import com.company.learningmanagement.entity.assignment.Assignment;
import com.company.learningmanagement.entity.assignment.Batch;
import com.company.learningmanagement.entity.assignment.Student;
import com.company.learningmanagement.entity.assignment.Teacher;
import com.company.learningmanagement.exception.assignment.ResourceNotFoundException;
import com.company.learningmanagement.mapper.assignment.BatchMapper;
import com.company.learningmanagement.repository.assignment.AssignmentRepository;
import com.company.learningmanagement.repository.assignment.BatchRepository;
import com.company.learningmanagement.repository.assignment.StudentRepository;
import com.company.learningmanagement.repository.assignment.TeacherRepository;
import com.company.learningmanagement.service.assignment.BatchService;
import com.company.learningmanagement.service.assignment.RedisService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BatchServiceImpl implements BatchService {

    private final BatchRepository batchRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final AssignmentRepository assignmentRepository;
    private final RedisService redisService;
    private final BatchMapper batchMapper;

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(BatchServiceImpl.class);

    @org.springframework.beans.factory.annotation.Autowired
    private org.springframework.transaction.support.TransactionTemplate transactionTemplate;

    @org.springframework.beans.factory.annotation.Autowired
    private jakarta.validation.Validator validator;

    private Teacher getTeacher(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));
        if (teacher.getRole() != com.company.learningmanagement.enums.Role.TEACHER) {
            throw new com.company.learningmanagement.exception.assignment.UnauthorizedException("Access Denied: Only teachers can perform this action");
        }
        return teacher;
    }

    @Override
    @Transactional
    public BatchResponse createBatch(BatchRequest request, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Batch batch = Batch.builder()
                .batchName(request.getBatchName())
                .description(request.getDescription())
                .teacher(teacher)
                .build();
        Batch savedBatch = batchRepository.save(batch);
        return batchMapper.toResponse(savedBatch);
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<BatchResponse> getAllBatches(String teacherEmail, int page, int size, String search) {
        Teacher teacher = getTeacher(teacherEmail);
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.jpa.domain.Specification<Batch> spec = org.springframework.data.jpa.domain.Specification.where(
                com.company.learningmanagement.repository.assignment.BatchSpecifications.hasTeacherId(teacher.getId())
        ).and(
                com.company.learningmanagement.repository.assignment.BatchSpecifications.hasSearch(search)
        );
        org.springframework.data.domain.Page<Batch> batchPage = batchRepository.findAll(spec, pageable);
        return batchPage.map(batchMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public BatchResponse getBatchById(Long id, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Batch batch = batchRepository.findByIdAndTeacherId(id, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found or unauthorized"));
        return batchMapper.toResponse(batch);
    }

    @Override
    @Transactional
    public BatchResponse updateBatch(Long id, BatchRequest request, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Batch batch = batchRepository.findByIdAndTeacherId(id, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found or unauthorized"));

        batch.setBatchName(request.getBatchName());
        batch.setDescription(request.getDescription());

        Batch updatedBatch = batchRepository.save(batch);
        return batchMapper.toResponse(updatedBatch);
    }

    @Override
    @Transactional
    public void deleteBatch(Long id, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Batch batch = batchRepository.findByIdAndTeacherId(id, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found or unauthorized"));

        // 1. Unlink students
        for (Student student : batch.getStudents()) {
            student.setBatch(null);
            studentRepository.save(student);
        }

        // 2. Fetch and delete assignments of this batch + their Redis status keys
        Pageable unpaged = Pageable.unpaged();
        Page<Assignment> assignments = assignmentRepository.findByBatchId(batch.getId(), unpaged);
        for (Assignment assignment : assignments.getContent()) {
            redisService.deleteAssignmentStatus(assignment.getId());
            assignmentRepository.delete(assignment);
        }

        // 3. Delete the batch
        batchRepository.delete(batch);
    }

    @Override
    public com.company.learningmanagement.dto.lms.BulkOperationResponse createBatchBulk(List<BatchRequest> requests, String teacherEmail) {
        log.info("Bulk batch creation started for teacher {} with {} requests", teacherEmail, requests.size());
        List<com.company.learningmanagement.dto.lms.BulkOperationResultItem> results = new java.util.ArrayList<>();
        int successfulCount = 0;
        int failedCount = 0;

        for (int i = 0; i < requests.size(); i++) {
            BatchRequest req = requests.get(i);
            int index = i + 1;
            log.info("Processing batch in bulk at index: {}", index);

            // 1. Validation check
            java.util.Set<jakarta.validation.ConstraintViolation<BatchRequest>> violations = validator.validate(req);
            if (!violations.isEmpty()) {
                String reason = violations.stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .collect(java.util.stream.Collectors.joining("; "));
                log.warn("Validation failed for batch at index {}: {}", index, reason);
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", reason));
                failedCount++;
                continue;
            }

            // 2. Perform create in independent transaction
            try {
                transactionTemplate.executeWithoutResult(status -> {
                    createBatch(req, teacherEmail);
                });
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "SUCCESS", null));
                successfulCount++;
            } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                log.error("Database integrity violation at index {}: {}", index, ex.getMessage());
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", "Duplicate batch or database constraint violation"));
                failedCount++;
            } catch (Exception ex) {
                log.error("Error creating batch at index {}: {}", index, ex.getMessage());
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", ex.getMessage()));
                failedCount++;
            }
        }

        log.info("Bulk batch creation completed. Total: {}, Successful: {}, Failed: {}", requests.size(), successfulCount, failedCount);
        return com.company.learningmanagement.dto.lms.BulkOperationResponse.builder()
                .success(successfulCount > 0)
                .total(requests.size())
                .successful(successfulCount)
                .failed(failedCount)
                .results(results)
                .build();
    }
}
