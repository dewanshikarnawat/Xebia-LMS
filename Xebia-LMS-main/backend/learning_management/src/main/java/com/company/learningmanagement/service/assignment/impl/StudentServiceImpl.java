package com.company.learningmanagement.service.assignment.impl;

import com.company.learningmanagement.dto.assignment.request.AddStudentRequest;
import com.company.learningmanagement.dto.assignment.response.StudentResponse;
import com.company.learningmanagement.entity.assignment.Assignment;
import com.company.learningmanagement.entity.assignment.Batch;
import com.company.learningmanagement.entity.assignment.Student;
import com.company.learningmanagement.entity.assignment.Teacher;
import com.company.learningmanagement.enums.Role;
import com.company.learningmanagement.exception.assignment.BadRequestException;
import com.company.learningmanagement.exception.assignment.ResourceNotFoundException;
import com.company.learningmanagement.mapper.assignment.UserMapper;
import com.company.learningmanagement.repository.assignment.AssignmentRepository;
import com.company.learningmanagement.repository.assignment.BatchRepository;
import com.company.learningmanagement.repository.assignment.StudentRepository;
import com.company.learningmanagement.repository.assignment.TeacherRepository;
import com.company.learningmanagement.service.assignment.StudentService;
import com.company.learningmanagement.service.assignment.RedisService;
import com.company.learningmanagement.dto.assignment.response.AssignmentStatusResponse;
import com.company.learningmanagement.entity.assignment.Submission;
import com.company.learningmanagement.enums.SubmissionStatus;
import com.company.learningmanagement.repository.assignment.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final BatchRepository batchRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final RedisService redisService;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(StudentServiceImpl.class);

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

    private void syncBatchAssignmentsRedis(Long batchId) {
        List<Assignment> assignments = assignmentRepository.findByBatchId(batchId, Pageable.unpaged()).getContent();
        for (Assignment assignment : assignments) {
            rebuildAssignmentStatusCache(assignment.getId());
        }
    }

    private void rebuildAssignmentStatusCache(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId).orElse(null);
        if (assignment == null) return;

        if (assignment.getBatch() == null) {
            AssignmentStatusResponse cache = AssignmentStatusResponse.builder()
                    .submittedStudentIds(List.of())
                    .pendingStudentIds(List.of())
                    .submittedCount(0)
                    .pendingCount(0)
                    .completionPercentage(0.0)
                    .build();
            redisService.saveAssignmentStatus(assignmentId, cache);
            return;
        }

        List<Student> students = studentRepository.findByBatchId(assignment.getBatch().getId());
        List<Long> allStudentIds = students.stream().map(Student::getId).toList();

        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        List<Long> submittedStudentIds = submissions.stream()
                .filter(sub -> sub.getStatus() == SubmissionStatus.SUBMITTED || sub.getStatus() == SubmissionStatus.REVIEWED)
                .map(sub -> sub.getStudent().getId())
                .toList();

        List<Long> pendingStudentIds = allStudentIds.stream()
                .filter(id -> !submittedStudentIds.contains(id))
                .toList();

        int total = allStudentIds.size();
        int submitted = submittedStudentIds.size();
        int pending = pendingStudentIds.size();
        double pct = total > 0 ? ((double) submitted / total) * 100.0 : 0.0;

        AssignmentStatusResponse cache = AssignmentStatusResponse.builder()
                .submittedStudentIds(submittedStudentIds)
                .pendingStudentIds(pendingStudentIds)
                .submittedCount(submitted)
                .pendingCount(pending)
                .completionPercentage(Math.round(pct * 100.0) / 100.0)
                .build();

        redisService.saveAssignmentStatus(assignmentId, cache);
    }

    @Override
    @Transactional
    public StudentResponse addStudentToBatch(AddStudentRequest request, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Batch batch = batchRepository.findByIdAndTeacherId(request.getBatchId(), teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found or unauthorized"));

        Student student;

        if (request.getStudentId() != null) {
            student = studentRepository.findById(request.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        } else if (request.getStudentEmail() != null && !request.getStudentEmail().isBlank()) {
            student = studentRepository.findByEmail(request.getStudentEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with email: " + request.getStudentEmail()));
        } else if (request.getEmail() != null && !request.getEmail().isBlank()) {
            // Register a new student directly
            if (teacherRepository.existsByEmail(request.getEmail()) || studentRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email is already registered");
            }
            student = Student.builder()
                    .fullName(request.getFullName())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : "Password123"))
                    .phone(request.getPhone())
                    .role(Role.STUDENT)
                    .build();
        } else {
            throw new BadRequestException("Provide either studentId, studentEmail, or new student details to add to batch");
        }

        student.setBatch(batch);
        Student savedStudent = studentRepository.save(student);

        // Sync Redis for all assignments of this batch
        syncBatchAssignmentsRedis(batch.getId());

        return userMapper.toStudentResponse(savedStudent);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponse> getStudentsByBatch(Long batchId, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Batch batch = batchRepository.findByIdAndTeacherId(batchId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found or unauthorized"));

        List<Student> students = studentRepository.findByBatchId(batch.getId());
        return userMapper.toStudentResponseList(students);
    }

    @Override
    @Transactional
    public void removeStudentFromBatch(Long studentId, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (student.getBatch() == null) {
            throw new BadRequestException("Student is not assigned to any batch");
        }

        Batch batch = student.getBatch();
        if (!batch.getTeacher().getId().equals(teacher.getId())) {
            throw new BadRequestException("Unauthorized: You do not own the batch this student belongs to");
        }

        student.setBatch(null);
        studentRepository.save(student);

        // Sync Redis cache for assignments of the old batch
    }

    @Override
    public com.company.learningmanagement.dto.lms.BulkOperationResponse addStudentToBatchBulk(List<AddStudentRequest> requests, String teacherEmail) {
        log.info("Bulk student addition started for teacher {} with {} requests", teacherEmail, requests.size());
        List<com.company.learningmanagement.dto.lms.BulkOperationResultItem> results = new java.util.ArrayList<>();
        int successfulCount = 0;
        int failedCount = 0;

        for (int i = 0; i < requests.size(); i++) {
            AddStudentRequest req = requests.get(i);
            int index = i + 1;
            log.info("Processing student addition in bulk at index: {}", index);

            // 1. Validation check
            java.util.Set<jakarta.validation.ConstraintViolation<AddStudentRequest>> violations = validator.validate(req);
            if (!violations.isEmpty()) {
                String reason = violations.stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .collect(java.util.stream.Collectors.joining("; "));
                log.warn("Validation failed for student at index {}: {}", index, reason);
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", reason));
                failedCount++;
                continue;
            }

            // 2. Perform create in independent transaction
            try {
                transactionTemplate.executeWithoutResult(status -> {
                    addStudentToBatch(req, teacherEmail);
                });
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "SUCCESS", null));
                successfulCount++;
            } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                log.error("Database integrity violation at index {}: {}", index, ex.getMessage());
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", "Duplicate entry or database constraint violation"));
                failedCount++;
            } catch (Exception ex) {
                log.error("Error adding student at index {}: {}", index, ex.getMessage());
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", ex.getMessage()));
                failedCount++;
            }
        }

        log.info("Bulk student addition completed. Total: {}, Successful: {}, Failed: {}", requests.size(), successfulCount, failedCount);
        return com.company.learningmanagement.dto.lms.BulkOperationResponse.builder()
                .success(successfulCount > 0)
                .total(requests.size())
                .successful(successfulCount)
                .failed(failedCount)
                .results(results)
                .build();
    }
}
