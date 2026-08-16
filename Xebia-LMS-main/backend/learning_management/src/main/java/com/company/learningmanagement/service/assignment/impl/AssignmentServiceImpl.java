package com.company.learningmanagement.service.assignment.impl;

import com.company.learningmanagement.dto.assignment.request.AssignmentRequest;
import com.company.learningmanagement.dto.assignment.response.AssignmentResponse;
import com.company.learningmanagement.dto.assignment.response.AssignmentStatusResponse;
import com.company.learningmanagement.entity.assignment.Assignment;
import com.company.learningmanagement.entity.assignment.Batch;
import com.company.learningmanagement.entity.assignment.Student;
import com.company.learningmanagement.entity.assignment.Submission;
import com.company.learningmanagement.entity.assignment.Teacher;
import com.company.learningmanagement.enums.AssignmentStatus;
import com.company.learningmanagement.enums.SubmissionStatus;
import com.company.learningmanagement.exception.assignment.BadRequestException;
import com.company.learningmanagement.exception.assignment.ResourceNotFoundException;
import com.company.learningmanagement.exception.assignment.UnauthorizedException;
import com.company.learningmanagement.mapper.assignment.AssignmentMapper;
import com.company.learningmanagement.repository.assignment.AssignmentRepository;
import com.company.learningmanagement.repository.assignment.AssignmentSpecifications;
import com.company.learningmanagement.repository.assignment.BatchRepository;
import com.company.learningmanagement.repository.assignment.StudentRepository;
import com.company.learningmanagement.repository.assignment.SubmissionRepository;
import com.company.learningmanagement.repository.assignment.TeacherRepository;
import com.company.learningmanagement.service.assignment.AssignmentService;
import com.company.learningmanagement.service.assignment.CloudinaryService;
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
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final TeacherRepository teacherRepository;
    private final BatchRepository batchRepository;
    private final StudentRepository studentRepository;
    private final SubmissionRepository submissionRepository;
    private final CloudinaryService cloudinaryService;
    private final RedisService redisService;
    private final AssignmentMapper assignmentMapper;
    private final com.company.learningmanagement.repository.assignment.QuestionRepository questionRepository;
    private final com.company.learningmanagement.mapper.assignment.QuestionMapper questionMapper;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final com.company.learningmanagement.service.assignment.ExcelImportService excelImportService;
    private final com.company.learningmanagement.service.assignment.ExcelExportService excelExportService;
    private final com.company.learningmanagement.repository.assignment.CertificateRepository certificateRepository;

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AssignmentServiceImpl.class);

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

    private Student getStudent(String email) {
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
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

    private void populateResponseCounts(AssignmentResponse res) {
        if (res == null) return;
        if (res.getBatchId() == null) {
            res.setTotalStudents(0);
            res.setSubmittedCount(0);
            res.setPendingCount(0);
            res.setSubmissionPercentage(0.0);
            return;
        }
        List<Student> students = studentRepository.findByBatchId(res.getBatchId());
        List<Long> allStudentIds = students.stream().map(Student::getId).toList();

        List<Submission> submissions = submissionRepository.findByAssignmentId(res.getId());
        List<Long> submittedStudentIds = submissions.stream()
                .filter(sub -> sub.getStatus() == SubmissionStatus.SUBMITTED || sub.getStatus() == SubmissionStatus.REVIEWED)
                .map(sub -> sub.getStudent().getId())
                .toList();

        int total = allStudentIds.size();
        int submitted = submittedStudentIds.size();
        int pending = total - submitted;
        double pct = total > 0 ? ((double) submitted / total) * 100.0 : 0.0;

        res.setTotalStudents(total);
        res.setSubmittedCount(submitted);
        res.setPendingCount(pending);
        res.setSubmissionPercentage(Math.round(pct * 100.0) / 100.0);
    }

    private List<AssignmentResponse> populateResponseCounts(List<AssignmentResponse> responses) {
        if (responses == null) return null;
        for (AssignmentResponse res : responses) {
            populateResponseCounts(res);
        }
        return responses;
    }

    @Override
    @Transactional
    public AssignmentResponse createAssignment(AssignmentRequest request, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Batch batch = null;
        if (request.getBatchId() != null) {
            batch = batchRepository.findByIdAndTeacherId(request.getBatchId(), teacher.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Batch not found or unauthorized"));
        }

        String statusStr = request.getStatus();
        boolean isDraft = "draft".equalsIgnoreCase(statusStr);
        boolean isPublished = "published".equalsIgnoreCase(statusStr) || "active".equalsIgnoreCase(statusStr);

        if (statusStr == null || statusStr.isBlank()) {
            isDraft = (request.getBatchId() == null);
            isPublished = !isDraft;
        }

        if (isPublished && request.getBatchId() == null) {
            throw new BadRequestException("Target Batch is required for publishing.");
        }

        if (request.getPassingMarks() > request.getTotalMarks()) {
            throw new BadRequestException("Passing marks cannot exceed total marks");
        }

        String resourceUrl = null;
        if (request.getResourceFile() != null && !request.getResourceFile().isEmpty()) {
            // Validate size
            if (request.getResourceFile().getSize() > request.getMaxFileSize()) {
                throw new BadRequestException("Uploaded resource file exceeds max allowed size of " + (request.getMaxFileSize() / (1024 * 1024)) + " MB");
            }
            resourceUrl = cloudinaryService.uploadFile(request.getResourceFile(), "assignment_system/resources");
        }

        Assignment assignment = Assignment.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .instructions(request.getInstructions())
                .assignmentType(request.getAssignmentType())
                .subject(request.getSubject())
                .topic(request.getTopic())
                .batch(batch)
                .teacher(teacher)
                .resourceUrl(resourceUrl)
                .externalLink(request.getExternalLink())
                .submissionType(request.getSubmissionType())
                .totalMarks(request.getTotalMarks())
                .passingMarks(request.getPassingMarks())
                .dueDate(request.getDueDate())
                .dueTime(request.getDueTime())
                .lateSubmissionAllowed(request.getLateSubmissionAllowed() != null ? request.getLateSubmissionAllowed() : false)
                .maxFileSize(request.getMaxFileSize() != null ? request.getMaxFileSize() : 10485760L)
                .status(isDraft ? AssignmentStatus.DRAFT : AssignmentStatus.ACTIVE)
                .build();

        Assignment savedAssignment = assignmentRepository.save(assignment);

        // Parse and save questions if QUIZ type and questionsJson is provided
        if (request.getAssignmentType() == com.company.learningmanagement.enums.AssignmentType.QUIZ && request.getQuestionsJson() != null && !request.getQuestionsJson().isBlank()) {
            try {
                List<com.company.learningmanagement.dto.assignment.request.QuestionRequest> questionRequests = objectMapper.readValue(
                        request.getQuestionsJson(),
                        new com.fasterxml.jackson.core.type.TypeReference<List<com.company.learningmanagement.dto.assignment.request.QuestionRequest>>() {}
                );
                for (com.company.learningmanagement.dto.assignment.request.QuestionRequest qReq : questionRequests) {
                    com.company.learningmanagement.entity.assignment.Question question = questionMapper.toEntity(qReq);
                    question.setAssignment(savedAssignment);
                    savedAssignment.getQuestions().add(question);
                }
                savedAssignment = assignmentRepository.save(savedAssignment);
            } catch (Exception e) {
                throw new BadRequestException("Failed to parse quiz questions: " + e.getMessage());
            }
        }

        // Initialize Redis cache
        rebuildAssignmentStatusCache(savedAssignment.getId());

        Assignment loadedAssignment = assignmentRepository.findById(savedAssignment.getId()).orElse(savedAssignment);
        AssignmentResponse response = assignmentMapper.toResponse(loadedAssignment);
        populateResponseCounts(response);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<AssignmentResponse> getAllAssignments(
            String teacherEmail,
            int page,
            int size,
            String sortBy,
            String sortDir,
            String search,
            String subject,
            String status,
            String assignmentType,
            Long batchId
    ) {
        Teacher teacher = getTeacher(teacherEmail);
        org.springframework.data.domain.Sort sort = sortDir.equalsIgnoreCase("asc")
                ? org.springframework.data.domain.Sort.by(sortBy).ascending()
                : org.springframework.data.domain.Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        org.springframework.data.jpa.domain.Specification<Assignment> spec = org.springframework.data.jpa.domain.Specification
                .where(AssignmentSpecifications.hasTeacherId(teacher.getId()));

        if (org.springframework.util.StringUtils.hasText(assignmentType)) {
            try {
                spec = spec.and(AssignmentSpecifications.hasAssignmentType(com.company.learningmanagement.enums.AssignmentType.valueOf(assignmentType.toUpperCase())));
            } catch (Exception e) {
                // ignore
            }
        }
        if (org.springframework.util.StringUtils.hasText(subject)) {
            spec = spec.and(AssignmentSpecifications.hasSubject(subject));
        }
        if (org.springframework.util.StringUtils.hasText(status)) {
            try {
                spec = spec.and(AssignmentSpecifications.hasStatus(com.company.learningmanagement.enums.AssignmentStatus.valueOf(status.toUpperCase())));
            } catch (Exception e) {
                // ignore
            }
        }
        if (batchId != null) {
            spec = spec.and(AssignmentSpecifications.hasBatchId(batchId));
        }
        if (org.springframework.util.StringUtils.hasText(search)) {
            spec = spec.and(AssignmentSpecifications.searchByText(search));
        }

        Page<Assignment> assignmentPage = assignmentRepository.findAll(spec, pageable);
        return assignmentPage.map(assignment -> {
            AssignmentResponse res = assignmentMapper.toResponse(assignment);
            populateResponseCounts(res);
            return res;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<AssignmentResponse> getStudentAssignments(
            String studentEmail,
            int page,
            int size,
            String sortBy,
            String sortDir,
            String search,
            String subject,
            String status,
            String assignmentType,
            Long batchId
    ) {
        Student student = getStudent(studentEmail);
        org.springframework.data.domain.Sort sort = sortDir.equalsIgnoreCase("asc")
                ? org.springframework.data.domain.Sort.by(sortBy).ascending()
                : org.springframework.data.domain.Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        if (student.getBatch() == null) {
            return org.springframework.data.domain.Page.empty(pageable);
        }

        org.springframework.data.jpa.domain.Specification<Assignment> spec = org.springframework.data.jpa.domain.Specification
                .where(AssignmentSpecifications.hasBatchId(student.getBatch().getId()));

        if (org.springframework.util.StringUtils.hasText(status)) {
            try {
                spec = spec.and(AssignmentSpecifications.hasStatus(com.company.learningmanagement.enums.AssignmentStatus.valueOf(status.toUpperCase())));
            } catch (Exception e) {
                spec = spec.and(AssignmentSpecifications.hasStatus(com.company.learningmanagement.enums.AssignmentStatus.ACTIVE));
            }
        } else {
            spec = spec.and(AssignmentSpecifications.hasStatus(com.company.learningmanagement.enums.AssignmentStatus.ACTIVE));
        }

        if (org.springframework.util.StringUtils.hasText(assignmentType)) {
            try {
                spec = spec.and(AssignmentSpecifications.hasAssignmentType(com.company.learningmanagement.enums.AssignmentType.valueOf(assignmentType.toUpperCase())));
            } catch (Exception e) {
                // ignore
            }
        }
        if (org.springframework.util.StringUtils.hasText(subject)) {
            spec = spec.and(AssignmentSpecifications.hasSubject(subject));
        }
        if (org.springframework.util.StringUtils.hasText(search)) {
            spec = spec.and(AssignmentSpecifications.searchByText(search));
        }

        Page<Assignment> assignmentPage = assignmentRepository.findAll(spec, pageable);
        return assignmentPage.map(assignment -> {
            AssignmentResponse res = assignmentMapper.toResponse(assignment);
            populateResponseCounts(res);

            boolean hasSubmitted = submissionRepository.findByAssignmentIdAndStudentId(assignment.getId(), student.getId()).isPresent();
            if (!hasSubmitted && res.getQuestions() != null) {
                for (com.company.learningmanagement.dto.assignment.response.QuestionResponse qr : res.getQuestions()) {
                    qr.setCorrectAnswer(null);
                }
            }
            return res;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public AssignmentResponse getAssignmentById(Long id, String email, String role) {
        Assignment assignment;
        if ("TEACHER".equals(role)) {
            Teacher teacher = getTeacher(email);
            assignment = assignmentRepository.findByIdAndTeacherId(id, teacher.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignment not found or unauthorized"));
        } else {
            Student student = getStudent(email);
            if (student.getBatch() == null) {
                throw new BadRequestException("Student has not been assigned to a batch yet");
            }
            assignment = assignmentRepository.findByIdAndBatchIdAndStatus(id, student.getBatch().getId(), AssignmentStatus.ACTIVE)
                    .orElseThrow(() -> new ResourceNotFoundException("Assignment not found or unauthorized"));
        }
        
        boolean hasSubmitted = false;
        if (!"TEACHER".equals(role)) {
            Student student = getStudent(email);
            hasSubmitted = submissionRepository.findByAssignmentIdAndStudentId(id, student.getId()).isPresent();
        }
        
        AssignmentResponse response = assignmentMapper.toResponse(assignment);
        populateResponseCounts(response);
        if (!"TEACHER".equals(role) && !hasSubmitted && response.getQuestions() != null) {
            for (com.company.learningmanagement.dto.assignment.response.QuestionResponse qr : response.getQuestions()) {
                qr.setCorrectAnswer(null);
            }
        }
        return response;
    }

    @Override
    @Transactional
    public AssignmentResponse updateAssignment(Long id, AssignmentRequest request, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Assignment assignment = assignmentRepository.findByIdAndTeacherId(id, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found or unauthorized"));

        Batch batch = null;
        if (request.getBatchId() != null) {
            batch = batchRepository.findByIdAndTeacherId(request.getBatchId(), teacher.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Batch not found or unauthorized"));
        }

        String statusStr = request.getStatus();
        boolean isDraft = "draft".equalsIgnoreCase(statusStr);
        boolean isPublished = "published".equalsIgnoreCase(statusStr) || "active".equalsIgnoreCase(statusStr);

        if (statusStr == null || statusStr.isBlank()) {
            isDraft = (request.getBatchId() == null);
            isPublished = !isDraft;
        }

        if (isPublished && request.getBatchId() == null) {
            throw new BadRequestException("Target Batch is required for publishing.");
        }

        if (request.getPassingMarks() > request.getTotalMarks()) {
            throw new BadRequestException("Passing marks cannot exceed total marks");
        }

        // Check if batch changed (if so, we will need to update Redis status cache later)
        boolean batchChanged = false;
        if (assignment.getBatch() == null && batch != null) {
            batchChanged = true;
        } else if (assignment.getBatch() != null && batch == null) {
            batchChanged = true;
        } else if (assignment.getBatch() != null && batch != null) {
            batchChanged = !assignment.getBatch().getId().equals(batch.getId());
        }

        if (request.getResourceFile() != null && !request.getResourceFile().isEmpty()) {
            if (request.getResourceFile().getSize() > request.getMaxFileSize()) {
                throw new BadRequestException("Uploaded resource file exceeds max allowed size of " + (request.getMaxFileSize() / (1024 * 1024)) + " MB");
            }
            String resourceUrl = cloudinaryService.uploadFile(request.getResourceFile(), "assignment_system/resources");
            assignment.setResourceUrl(resourceUrl);
        }

        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setInstructions(request.getInstructions());
        assignment.setAssignmentType(request.getAssignmentType());
        assignment.setSubject(request.getSubject());
        assignment.setTopic(request.getTopic());
        assignment.setBatch(batch);
        assignment.setStatus(isDraft ? AssignmentStatus.DRAFT : AssignmentStatus.ACTIVE);
        assignment.setExternalLink(request.getExternalLink());
        assignment.setSubmissionType(request.getSubmissionType());
        assignment.setTotalMarks(request.getTotalMarks());
        assignment.setPassingMarks(request.getPassingMarks());
        assignment.setDueDate(request.getDueDate());
        assignment.setDueTime(request.getDueTime());
        assignment.setLateSubmissionAllowed(request.getLateSubmissionAllowed() != null ? request.getLateSubmissionAllowed() : false);
        assignment.setMaxFileSize(request.getMaxFileSize() != null ? request.getMaxFileSize() : 10485760L);

        Assignment updatedAssignment = assignmentRepository.save(assignment);

        // Parse and update questions if QUIZ type
        if (request.getAssignmentType() == com.company.learningmanagement.enums.AssignmentType.QUIZ && request.getQuestionsJson() != null && !request.getQuestionsJson().isBlank()) {
            try {
                // Clear existing questions to trigger orphan removal
                assignment.getQuestions().clear();
                assignmentRepository.saveAndFlush(assignment);

                List<com.company.learningmanagement.dto.assignment.request.QuestionRequest> questionRequests = objectMapper.readValue(
                        request.getQuestionsJson(),
                        new com.fasterxml.jackson.core.type.TypeReference<List<com.company.learningmanagement.dto.assignment.request.QuestionRequest>>() {}
                );
                for (com.company.learningmanagement.dto.assignment.request.QuestionRequest qReq : questionRequests) {
                    com.company.learningmanagement.entity.assignment.Question question = questionMapper.toEntity(qReq);
                    question.setAssignment(assignment);
                    assignment.getQuestions().add(question);
                }
                updatedAssignment = assignmentRepository.save(assignment);
            } catch (Exception e) {
                throw new BadRequestException("Failed to update quiz questions: " + e.getMessage());
            }
        }

        // Sync Redis cache
        rebuildAssignmentStatusCache(updatedAssignment.getId());

        Assignment loadedAssignment = assignmentRepository.findById(updatedAssignment.getId()).orElse(updatedAssignment);
        AssignmentResponse response = assignmentMapper.toResponse(loadedAssignment);
        populateResponseCounts(response);
        return response;
    }

    @Override
    @Transactional
    public void deleteAssignment(Long id, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Assignment assignment = assignmentRepository.findByIdAndTeacherId(id, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found or unauthorized"));

        if (certificateRepository.existsByAssignmentId(id) || certificateRepository.existsByQuizId(id)) {
            throw new BadRequestException("Cannot delete this assignment because certificates have already been generated.");
        }

        assignmentRepository.delete(assignment);

        // Delete Redis cache key
        redisService.deleteAssignmentStatus(id);
    }

    @Override
    public List<com.company.learningmanagement.dto.assignment.request.QuestionRequest> importExcelQuestions(org.springframework.web.multipart.MultipartFile file) {
        try {
            return ExcelParserHelper.parseExcel(file);
        } catch (Exception e) {
            throw new BadRequestException("Failed to parse Excel file: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public AssignmentResponse importAssignment(
            String title,
            String description,
            Long batchId,
            java.time.LocalDate dueDate,
            org.springframework.web.multipart.MultipartFile file,
            String teacherEmail
    ) {
        Teacher teacher = getTeacher(teacherEmail);
        Batch batch = batchRepository.findByIdAndTeacherId(batchId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found or unauthorized"));

        // Validate file size and type first
        com.company.learningmanagement.util.ExcelValidator.validateFile(file);

        // Parse questions from file
        List<com.company.learningmanagement.dto.assignment.QuizImportDTO> importedQuestions = excelImportService.parseExcelFile(file);

        // Validate questions
        List<String> validationErrors = com.company.learningmanagement.util.ExcelValidator.validateQuestions(importedQuestions);
        if (!validationErrors.isEmpty()) {
            throw new BadRequestException("Excel validation failed: " + String.join("; ", validationErrors));
        }

        if (importedQuestions.isEmpty()) {
            throw new BadRequestException("Excel file contains no questions");
        }

        // Calculate total marks and passing marks (50% of total)
        double totalMarks = importedQuestions.stream().mapToDouble(com.company.learningmanagement.dto.assignment.QuizImportDTO::getMarks).sum();
        double passingMarks = totalMarks * 0.5;

        // Build Assignment
        Assignment assignment = Assignment.builder()
                .title(title)
                .description(description)
                .instructions("Imported Quiz Assignment")
                .assignmentType(com.company.learningmanagement.enums.AssignmentType.QUIZ)
                .subject("General")
                .topic("Quiz")
                .batch(batch)
                .teacher(teacher)
                .totalMarks(totalMarks)
                .passingMarks(passingMarks)
                .dueDate(dueDate)
                .dueTime(java.time.LocalTime.of(23, 59))
                .lateSubmissionAllowed(false)
                .maxFileSize(10485760L) // Default 10MB
                .status(com.company.learningmanagement.enums.AssignmentStatus.ACTIVE)
                .build();

        Assignment savedAssignment = assignmentRepository.save(assignment);

        // Save imported questions
        for (com.company.learningmanagement.dto.assignment.QuizImportDTO qImport : importedQuestions) {
            com.company.learningmanagement.entity.assignment.Question question = com.company.learningmanagement.entity.assignment.Question.builder()
                    .assignment(savedAssignment)
                    .questionText(qImport.getQuestionText())
                    .optionA(qImport.getOptionA())
                    .optionB(qImport.getOptionB())
                    .optionC(qImport.getOptionC())
                    .optionD(qImport.getOptionD())
                    .correctAnswer(qImport.getCorrectAnswer().toUpperCase())
                    .marks(qImport.getMarks())
                    .difficulty("Medium")
                    .questionType("MCQ")
                    .build();
            savedAssignment.getQuestions().add(question);
        }
        savedAssignment = assignmentRepository.save(savedAssignment);

        // Initialize Redis cache
        rebuildAssignmentStatusCache(savedAssignment.getId());

        Assignment loadedAssignment = assignmentRepository.findById(savedAssignment.getId()).orElse(savedAssignment);
        AssignmentResponse response = assignmentMapper.toResponse(loadedAssignment);
        populateResponseCounts(response);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportAssignmentResults(Long assignmentId, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (!assignment.getTeacher().getId().equals(teacher.getId())) {
            throw new com.company.learningmanagement.exception.assignment.UnauthorizedException("Access Denied: Only the teacher who created this assignment can download the report");
        }

        // Fetch students of the batch
        List<Student> students = studentRepository.findByBatchId(assignment.getBatch().getId());

        // Fetch submissions for this assignment
        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);

        return excelExportService.generateAssignmentResultExcel(assignment, students, submissions);
    }

    @Override
    @Transactional
    public List<AssignmentResponse> assignBatch(Long assignmentId, List<Long> batchIds, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Assignment assignment = assignmentRepository.findByIdAndTeacherId(assignmentId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found or unauthorized"));

        if (batchIds == null || batchIds.isEmpty()) {
            throw new BadRequestException("At least one batch ID is required");
        }

        List<Batch> batches = batchRepository.findAllById(batchIds);
        if (batches.size() != batchIds.size()) {
            throw new ResourceNotFoundException("One or more batches not found");
        }

        for (Batch b : batches) {
            if (!b.getTeacher().getId().equals(teacher.getId())) {
                throw new UnauthorizedException("Unauthorized: batch " + b.getBatchName() + " does not belong to you");
            }
        }

        List<AssignmentResponse> responses = new java.util.ArrayList<>();
        int startIndex = 0;

        // If the assignment is currently a draft (has no batch), use it for the first batch
        if (assignment.getBatch() == null) {
            Batch firstBatch = batches.get(0);
            assignment.setBatch(firstBatch);
            assignment.setStatus(AssignmentStatus.ACTIVE);
            Assignment saved = assignmentRepository.save(assignment);
            rebuildAssignmentStatusCache(saved.getId());
            AssignmentResponse res = assignmentMapper.toResponse(saved);
            populateResponseCounts(res);
            responses.add(res);
            startIndex = 1;
        }

        // For any subsequent batches, duplicate (clone) the quiz
        for (int i = startIndex; i < batches.size(); i++) {
            Batch currentBatch = batches.get(i);

            Assignment cloned = Assignment.builder()
                    .title(assignment.getTitle())
                    .description(assignment.getDescription())
                    .instructions(assignment.getInstructions())
                    .assignmentType(assignment.getAssignmentType())
                    .subject(assignment.getSubject())
                    .topic(assignment.getTopic())
                    .batch(currentBatch)
                    .teacher(teacher)
                    .resourceUrl(assignment.getResourceUrl())
                    .externalLink(assignment.getExternalLink())
                    .submissionType(assignment.getSubmissionType())
                    .totalMarks(assignment.getTotalMarks())
                    .passingMarks(assignment.getPassingMarks())
                    .dueDate(assignment.getDueDate())
                    .dueTime(assignment.getDueTime())
                    .lateSubmissionAllowed(assignment.getLateSubmissionAllowed())
                    .maxFileSize(assignment.getMaxFileSize())
                    .status(AssignmentStatus.ACTIVE)
                    .build();

            Assignment savedCloned = assignmentRepository.save(cloned);

            if (assignment.getQuestions() != null) {
                for (com.company.learningmanagement.entity.assignment.Question q : assignment.getQuestions()) {
                    com.company.learningmanagement.entity.assignment.Question clonedQ = com.company.learningmanagement.entity.assignment.Question.builder()
                            .assignment(savedCloned)
                            .questionText(q.getQuestionText())
                            .optionA(q.getOptionA())
                            .optionB(q.getOptionB())
                            .optionC(q.getOptionC())
                            .optionD(q.getOptionD())
                            .correctAnswer(q.getCorrectAnswer())
                            .marks(q.getMarks())
                            .difficulty(q.getDifficulty())
                            .questionType(q.getQuestionType())
                            .build();
                    savedCloned.getQuestions().add(clonedQ);
                }
                assignmentRepository.save(savedCloned);
            }

            rebuildAssignmentStatusCache(savedCloned.getId());
            Assignment loadedCloned = assignmentRepository.findById(savedCloned.getId()).orElse(savedCloned);
            AssignmentResponse res = assignmentMapper.toResponse(loadedCloned);
            populateResponseCounts(res);
            responses.add(res);
        }

        return responses;
    }

    @Override
    @Transactional
    public AssignmentResponse unassignBatch(Long assignmentId, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Assignment assignment = assignmentRepository.findByIdAndTeacherId(assignmentId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found or unauthorized"));

        long submissionsCount = submissionRepository.countByAssignmentId(assignmentId);
        if (submissionsCount > 0) {
            throw new BadRequestException("Cannot unassign batch from quiz: students have already submitted answers");
        }

        assignment.setBatch(null);
        assignment.setStatus(AssignmentStatus.DRAFT);
        Assignment saved = assignmentRepository.save(assignment);

        redisService.deleteAssignmentStatus(assignmentId);

        AssignmentResponse res = assignmentMapper.toResponse(saved);
        populateResponseCounts(res);
        return res;
    }

    @Override
    public com.company.learningmanagement.dto.lms.BulkOperationResponse createAssignmentBulk(List<AssignmentRequest> requests, String teacherEmail) {
        log.info("Bulk assignment creation started for teacher {} with {} requests", teacherEmail, requests.size());
        List<com.company.learningmanagement.dto.lms.BulkOperationResultItem> results = new java.util.ArrayList<>();
        int successfulCount = 0;
        int failedCount = 0;

        for (int i = 0; i < requests.size(); i++) {
            AssignmentRequest req = requests.get(i);
            int index = i + 1;
            log.info("Processing assignment in bulk at index: {}", index);

            // 1. Validation check
            java.util.Set<jakarta.validation.ConstraintViolation<AssignmentRequest>> violations = validator.validate(req);
            if (!violations.isEmpty()) {
                String reason = violations.stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .collect(java.util.stream.Collectors.joining("; "));
                log.warn("Validation failed for assignment at index {}: {}", index, reason);
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", reason));
                failedCount++;
                continue;
            }

            // 2. Perform create in independent transaction
            try {
                transactionTemplate.executeWithoutResult(status -> {
                    createAssignment(req, teacherEmail);
                });
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "SUCCESS", null));
                successfulCount++;
            } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                log.error("Database integrity violation at index {}: {}", index, ex.getMessage());
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", "Duplicate assignment or database constraint violation"));
                failedCount++;
            } catch (Exception ex) {
                log.error("Error creating assignment at index {}: {}", index, ex.getMessage());
                results.add(new com.company.learningmanagement.dto.lms.BulkOperationResultItem(index, "FAILED", ex.getMessage()));
                failedCount++;
            }
        }

        log.info("Bulk assignment creation completed. Total: {}, Successful: {}, Failed: {}", requests.size(), successfulCount, failedCount);
        return com.company.learningmanagement.dto.lms.BulkOperationResponse.builder()
                .success(successfulCount > 0)
                .total(requests.size())
                .successful(successfulCount)
                .failed(failedCount)
                .results(results)
                .build();
    }
}

