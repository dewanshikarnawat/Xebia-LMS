package com.company.learningmanagement.service.assignment.impl;

import com.company.learningmanagement.dto.assignment.request.StudentSubmitRequest;
import com.company.learningmanagement.dto.assignment.request.SubmissionReviewRequest;
import com.company.learningmanagement.dto.assignment.response.AssignmentStatusResponse;
import com.company.learningmanagement.dto.assignment.response.StudentResponse;
import com.company.learningmanagement.dto.assignment.response.SubmissionResponse;
import com.company.learningmanagement.entity.assignment.Assignment;
import com.company.learningmanagement.entity.assignment.Student;
import com.company.learningmanagement.entity.assignment.Submission;
import com.company.learningmanagement.entity.assignment.Teacher;
import com.company.learningmanagement.enums.SubmissionStatus;
import com.company.learningmanagement.exception.assignment.BadRequestException;
import com.company.learningmanagement.exception.assignment.ResourceNotFoundException;
import com.company.learningmanagement.mapper.assignment.SubmissionMapper;
import com.company.learningmanagement.mapper.assignment.UserMapper;
import com.company.learningmanagement.repository.assignment.AssignmentRepository;
import com.company.learningmanagement.repository.assignment.StudentRepository;
import com.company.learningmanagement.repository.assignment.SubmissionRepository;
import com.company.learningmanagement.repository.assignment.TeacherRepository;
import com.company.learningmanagement.service.assignment.CloudinaryService;
import com.company.learningmanagement.service.assignment.RedisService;
import com.company.learningmanagement.service.assignment.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final CloudinaryService cloudinaryService;
    private final RedisService redisService;
    private final SubmissionMapper submissionMapper;
    private final UserMapper userMapper;
    private final com.company.learningmanagement.repository.assignment.QuestionRepository questionRepository;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;
    private final com.company.learningmanagement.service.assignment.CertificateService certificateService;

    private Student getStudent(String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        if (student.getRole() != com.company.learningmanagement.enums.Role.STUDENT) {
            throw new com.company.learningmanagement.exception.assignment.UnauthorizedException("Access Denied: Only students can perform this action");
        }
        return student;
    }

    private Teacher getTeacher(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));
        if (teacher.getRole() != com.company.learningmanagement.enums.Role.TEACHER) {
            throw new com.company.learningmanagement.exception.assignment.UnauthorizedException("Access Denied: Only teachers can perform this action");
        }
        return teacher;
    }

    private AssignmentStatusResponse rebuildAssignmentStatusCache(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId).orElse(null);
        if (assignment == null) return null;

        if (assignment.getBatch() == null) {
            AssignmentStatusResponse cache = AssignmentStatusResponse.builder()
                    .submittedStudentIds(List.of())
                    .pendingStudentIds(List.of())
                    .submittedCount(0)
                    .pendingCount(0)
                    .completionPercentage(0.0)
                    .build();
            redisService.saveAssignmentStatus(assignmentId, cache);
            return cache;
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
        return cache;
    }

    private boolean checkAnswerCorrectness(com.company.learningmanagement.entity.assignment.Question q, String studentAnswer) {
        if (q == null || studentAnswer == null) {
            return false;
        }
        
        String correctAnswer = q.getCorrectAnswer();
        if (correctAnswer == null) {
            return false;
        }
        
        String cleanCorrect = correctAnswer.trim().toUpperCase();
        String cleanStudent = studentAnswer.trim().toUpperCase();
        
        if (cleanCorrect.equals(cleanStudent)) {
            return true;
        }
        
        // Handle Multiple Select Questions (MSQ) - comma separated
        if ("MSQ".equalsIgnoreCase(q.getQuestionType()) || cleanCorrect.contains(",") || cleanStudent.contains(",")) {
            String[] correctParts = cleanCorrect.split("\\s*,\\s*");
            String[] studentParts = cleanStudent.split("\\s*,\\s*");
            
            if (correctParts.length != studentParts.length) {
                return false;
            }
            
            java.util.Set<String> correctSet = new java.util.HashSet<>(java.util.Arrays.asList(correctParts));
            java.util.Set<String> studentSet = new java.util.HashSet<>(java.util.Arrays.asList(studentParts));
            
            return correctSet.equals(studentSet);
        }
        
        return false;
    }

    @Override
    @Transactional
    public SubmissionResponse submitAssignment(Long assignmentId, StudentSubmitRequest request, String studentEmail) {
        System.out.println("[DEBUG] [submitAssignment] Request received for assignmentId: " + assignmentId + ", studentEmail: " + studentEmail);
        try {
            Student student = getStudent(studentEmail);
            System.out.println("[DEBUG] [submitAssignment] Student ID: " + student.getId());
            
            Assignment assignment = assignmentRepository.findById(assignmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
            System.out.println("[DEBUG] [submitAssignment] Assignment ID: " + assignment.getId() + ", Title: " + assignment.getTitle());
            
            if (assignment.getBatch() == null) {
                System.out.println("[DEBUG] [submitAssignment] Validation failed: Assignment has no batch");
                throw new BadRequestException("This assignment is not assigned to a batch");
            }
            
            if (student.getBatch() == null) {
                System.out.println("[DEBUG] [submitAssignment] Validation failed: Student has no batch");
                throw new BadRequestException("You are not assigned to a batch");
            }
            
            if (!student.getBatch().getId().equals(assignment.getBatch().getId())) {
                System.out.println("[DEBUG] [submitAssignment] Validation failed: Batch mismatch. Student batch: " + student.getBatch().getId() + ", Assignment batch: " + assignment.getBatch().getId());
                throw new BadRequestException("This assignment is not assigned to your batch");
            }
            
            // Validate deadline
            LocalDate today = LocalDate.now();
            LocalTime nowTime = LocalTime.now();
            if (today.isAfter(assignment.getDueDate()) || 
               (today.isEqual(assignment.getDueDate()) && nowTime.isAfter(assignment.getDueTime()))) {
                if (!assignment.getLateSubmissionAllowed()) {
                    System.out.println("[DEBUG] [submitAssignment] Validation failed: Late submission not allowed");
                    throw new BadRequestException("Late submissions are not allowed for this assignment");
                }
            }
            
            System.out.println("[DEBUG] [submitAssignment] Validation result: Success");
            
            // If it's a QUIZ assignment, evaluate it immediately
            if (assignment.getAssignmentType() == com.company.learningmanagement.enums.AssignmentType.QUIZ) {
                System.out.println("[DEBUG] [submitAssignment] Processing QUIZ submission");
                if (request.getQuizAnswersJson() == null || request.getQuizAnswersJson().isBlank()) {
                    System.out.println("[DEBUG] [submitAssignment] Validation failed: Quiz answers are required");
                    throw new BadRequestException("Quiz answers are required");
                }
                
                System.out.println("[DEBUG] [submitAssignment] Querying existing submission for duplicate check");
                Optional<Submission> existingSub = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId());
                if (existingSub.isPresent()) {
                    System.out.println("[DEBUG] [submitAssignment] Existing submission found");
                    int attemptsAllowed = 1;
                    try {
                        String instructions = assignment.getInstructions();
                        if (instructions != null && instructions.trim().startsWith("{")) {
                            com.fasterxml.jackson.databind.JsonNode meta = objectMapper.readTree(instructions);
                            if (meta.has("attemptsAllowed")) {
                                attemptsAllowed = meta.get("attemptsAllowed").asInt();
                            }
                        }
                    } catch (Exception e) {
                        System.out.println("[DEBUG] [submitAssignment] Failed to parse attemptsAllowed from instructions: " + e.getMessage());
                    }
                    if (attemptsAllowed <= 1) {
                        System.out.println("[DEBUG] [submitAssignment] Validation failed: Already submitted and only 1 attempt allowed");
                        throw new BadRequestException("You have already completed this quiz");
                    }
                }
                
                double totalScore = 0.0;
                try {
                    System.out.println("[DEBUG] [submitAssignment] Parsing quiz answers: " + request.getQuizAnswersJson());
                    List<java.util.Map<String, Object>> studentAnswers = objectMapper.readValue(
                            request.getQuizAnswersJson(),
                            new com.fasterxml.jackson.core.type.TypeReference<List<java.util.Map<String, Object>>>() {}
                    );
                    
                    System.out.println("[DEBUG] [submitAssignment] Querying questions for assignment: " + assignmentId);
                    List<com.company.learningmanagement.entity.assignment.Question> questions = questionRepository.findByAssignmentId(assignmentId);
                    java.util.Map<Long, com.company.learningmanagement.entity.assignment.Question> questionMap = new java.util.HashMap<>();
                    for (com.company.learningmanagement.entity.assignment.Question q : questions) {
                        questionMap.put(q.getId(), q);
                    }
                    
                    for (java.util.Map<String, Object> ans : studentAnswers) {
                        Number qIdNum = (Number) ans.get("questionId");
                        if (qIdNum == null) continue;
                        Long qId = qIdNum.longValue();
                        String selectedOption = (String) ans.get("selectedOption");
                        if (selectedOption == null) selectedOption = "";
                        
                        com.company.learningmanagement.entity.assignment.Question q = questionMap.get(qId);
                        if (q != null && checkAnswerCorrectness(q, selectedOption)) {
                            totalScore += q.getMarks();
                        }
                    }
                    System.out.println("[DEBUG] [submitAssignment] Evaluated score: " + totalScore);
                } catch (Exception e) {
                    System.out.println("[DEBUG] [submitAssignment] Quiz evaluation failed");
                    e.printStackTrace();
                    throw new BadRequestException("Failed to evaluate quiz submission: " + e.getMessage());
                }

                Submission submission;
                if (existingSub.isPresent()) {
                    System.out.println("[DEBUG] [submitAssignment] Overwriting existing submission");
                    submission = existingSub.get();
                    submission.setSubmissionUrl("QUIZ_SUBMISSION");
                    submission.setQuizAnswers(request.getQuizAnswersJson());
                    submission.setComment(request.getComment());
                    submission.setSubmittedAt(LocalDateTime.now());
                    submission.setReviewedAt(LocalDateTime.now());
                    submission.setMarks(totalScore);
                    submission.setFeedback("Auto-graded Quiz");
                    submission.setStatus(SubmissionStatus.REVIEWED);
                } else {
                    System.out.println("[DEBUG] [submitAssignment] Creating new submission");
                    submission = Submission.builder()
                            .assignment(assignment)
                            .student(student)
                            .submissionUrl("QUIZ_SUBMISSION")
                            .quizAnswers(request.getQuizAnswersJson())
                            .comment(request.getComment())
                            .submittedAt(LocalDateTime.now())
                            .reviewedAt(LocalDateTime.now())
                            .marks(totalScore)
                            .feedback("Auto-graded Quiz")
                            .status(SubmissionStatus.REVIEWED)
                            .build();
                }
                
                System.out.println("[DEBUG] [submitAssignment] Executing repository save");
                Submission savedSubmission;
                try {
                    savedSubmission = submissionRepository.saveAndFlush(submission);
                } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                    throw new BadRequestException("You have already submitted this assignment.");
                }
                System.out.println("[DEBUG] [submitAssignment] Save operation successful. Saved Submission ID: " + savedSubmission.getId());
                
                System.out.println("[DEBUG] [submitAssignment] Rebuilding assignment status cache in Redis");
                rebuildAssignmentStatusCache(assignmentId);
                
                System.out.println("[DEBUG] [submitAssignment] Attempting certificate generation");
                try {
                    certificateService.generateCertificateForSubmission(savedSubmission.getId());
                } catch (Exception e) {
                    System.err.println("[DEBUG] [submitAssignment] Failed to generate quiz certificate (expected if failed): " + e.getMessage());
                    e.printStackTrace();
                }
                
                SubmissionResponse response = submissionMapper.toResponse(savedSubmission);
                System.out.println("[DEBUG] [submitAssignment] Transaction status: committing. Final response score: " + response.getMarks());
                return response;
            }

            System.out.println("[DEBUG] [submitAssignment] Processing File Upload submission");
            String fileUrl = null;
            if (request.getFile() != null && !request.getFile().isEmpty()) {
                if (request.getFile().getSize() > assignment.getMaxFileSize()) {
                    System.out.println("[DEBUG] [submitAssignment] Validation failed: File size exceeds limit");
                    throw new BadRequestException("File size exceeds maximum allowed size of " + (assignment.getMaxFileSize() / (1024 * 1024)) + " MB");
                }
                System.out.println("[DEBUG] [submitAssignment] Uploading file to Cloudinary");
                fileUrl = cloudinaryService.uploadFile(request.getFile(), "assignment_system/submissions");
                System.out.println("[DEBUG] [submitAssignment] File uploaded successfully. URL: " + fileUrl);
            } else {
                System.out.println("[DEBUG] [submitAssignment] Validation failed: File is required");
                throw new BadRequestException("Submission file is required");
            }

            System.out.println("[DEBUG] [submitAssignment] Querying existing submission for duplicate check");
            Optional<Submission> existingSub = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId());
            Submission submission;
            if (existingSub.isPresent()) {
                System.out.println("[DEBUG] [submitAssignment] Overwriting existing submission");
                submission = existingSub.get();
                submission.setSubmissionUrl(fileUrl);
                submission.setComment(request.getComment());
                submission.setSubmittedAt(LocalDateTime.now());
                submission.setStatus(SubmissionStatus.SUBMITTED);
            } else {
                System.out.println("[DEBUG] [submitAssignment] Creating new submission");
                submission = Submission.builder()
                        .assignment(assignment)
                        .student(student)
                        .submissionUrl(fileUrl)
                        .comment(request.getComment())
                        .submittedAt(LocalDateTime.now())
                        .status(SubmissionStatus.SUBMITTED)
                        .build();
            }

            System.out.println("[DEBUG] [submitAssignment] Executing repository save");
            Submission savedSubmission;
            try {
                savedSubmission = submissionRepository.saveAndFlush(submission);
            } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                throw new BadRequestException("You have already submitted this assignment.");
            }
            System.out.println("[DEBUG] [submitAssignment] Save operation successful. Saved Submission ID: " + savedSubmission.getId());

            System.out.println("[DEBUG] [submitAssignment] Rebuilding assignment status cache in Redis");
            rebuildAssignmentStatusCache(assignmentId);

            System.out.println("[DEBUG] [submitAssignment] Attempting certificate generation");
            try {
                certificateService.generateCertificateForSubmission(savedSubmission.getId());
            } catch (Exception e) {
                System.err.println("[DEBUG] [submitAssignment] Failed to generate assignment certificate (expected if not reviewed): " + e.getMessage());
                e.printStackTrace();
            }

            SubmissionResponse response = submissionMapper.toResponse(savedSubmission);
            System.out.println("[DEBUG] [submitAssignment] Transaction status: committing. Final response status: " + response.getStatus());
            return response;
        } catch (Exception ex) {
            System.out.println("[DEBUG] [submitAssignment] Exception occurred during submission");
            ex.printStackTrace();
            throw ex;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmittedSubmissions(Long assignmentId, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Assignment assignment = assignmentRepository.findByIdAndTeacherId(assignmentId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found or unauthorized"));

        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        return submissionMapper.toResponseList(submissions);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponse> getPendingStudents(Long assignmentId, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Assignment assignment = assignmentRepository.findByIdAndTeacherId(assignmentId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found or unauthorized"));

        if (assignment.getBatch() == null) {
            return List.of();
        }
        List<Student> allStudents = studentRepository.findByBatchId(assignment.getBatch().getId());
        List<Long> submittedStudentIds = submissionRepository.findByAssignmentId(assignmentId).stream()
                .map(sub -> sub.getStudent().getId())
                .toList();

        List<Student> pendingStudents = allStudents.stream()
                .filter(student -> !submittedStudentIds.contains(student.getId()))
                .toList();

        return userMapper.toStudentResponseList(pendingStudents);
    }

    @Override
    @Transactional
    public SubmissionResponse reviewSubmission(Long submissionId, SubmissionReviewRequest request, String teacherEmail) {
        Teacher teacher = getTeacher(teacherEmail);
        Submission submission = submissionRepository.findByIdAndAssignmentTeacherId(submissionId, teacher.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found or unauthorized"));

        if (request.getMarks() > submission.getAssignment().getTotalMarks()) {
            throw new BadRequestException("Assigned marks cannot exceed total assignment marks of " + submission.getAssignment().getTotalMarks());
        }

        submission.setMarks(request.getMarks());
        submission.setFeedback(request.getFeedback());
        submission.setStatus(SubmissionStatus.REVIEWED);
        submission.setReviewedAt(LocalDateTime.now());

        Submission reviewedSubmission = submissionRepository.save(submission);
        try {
            certificateService.generateCertificateForSubmission(reviewedSubmission.getId());
        } catch (Exception e) {
            System.err.println("Failed to generate assignment certificate: " + e.getMessage());
        }
        return submissionMapper.toResponse(reviewedSubmission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionResponse> getStudentSubmissions(String studentEmail, int page, int size) {
        Student student = getStudent(studentEmail);
        Pageable pageable = PageRequest.of(page, size);
        Page<Submission> submissionPage = submissionRepository.findByStudentId(student.getId(), pageable);
        return submissionMapper.toResponseList(submissionPage.getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionResponse getSubmissionById(Long id, String email, String role) {
        Submission submission;
        if ("TEACHER".equals(role)) {
            Teacher teacher = getTeacher(email);
            submission = submissionRepository.findByIdAndAssignmentTeacherId(id, teacher.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Submission not found or unauthorized"));
        } else {
            Student student = getStudent(email);
            submission = submissionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
            if (!submission.getStudent().getId().equals(student.getId())) {
                throw new BadRequestException("Unauthorized to view this submission");
            }
        }
        return submissionMapper.toResponse(submission);
    }
}
