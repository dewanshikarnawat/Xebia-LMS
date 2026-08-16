package com.company.learningmanagement.service.assignment.impl;

import com.company.learningmanagement.dto.assignment.response.StudentDashboardResponse;
import com.company.learningmanagement.dto.assignment.response.TeacherDashboardResponse;
import com.company.learningmanagement.entity.assignment.Assignment;
import com.company.learningmanagement.entity.assignment.Student;
import com.company.learningmanagement.entity.assignment.Submission;
import com.company.learningmanagement.entity.assignment.Teacher;
import com.company.learningmanagement.enums.AssignmentStatus;
import com.company.learningmanagement.exception.assignment.ResourceNotFoundException;
import com.company.learningmanagement.repository.assignment.AssignmentRepository;
import com.company.learningmanagement.repository.assignment.BatchRepository;
import com.company.learningmanagement.repository.assignment.StudentRepository;
import com.company.learningmanagement.repository.assignment.SubmissionRepository;
import com.company.learningmanagement.repository.assignment.TeacherRepository;
import com.company.learningmanagement.service.assignment.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service("amsDashboardService")
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final BatchRepository batchRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;

    @Override
    @Transactional(readOnly = true)
    public TeacherDashboardResponse getTeacherDashboard(String teacherEmail) {
        Teacher teacher = teacherRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));
        if (teacher.getRole() != com.company.learningmanagement.enums.Role.TEACHER) {
            throw new com.company.learningmanagement.exception.assignment.UnauthorizedException("Access Denied: Only teachers can access this dashboard");
        }

        Long teacherId = teacher.getId();

        long totalBatches = batchRepository.countByTeacherId(teacherId);
        long totalStudents = studentRepository.countByTeacherId(teacherId);
        long totalAssignments = assignmentRepository.countByTeacherId(teacherId);
        long activeAssignments = assignmentRepository.countByTeacherIdAndStatus(teacherId, AssignmentStatus.ACTIVE);
        long completedAssignments = assignmentRepository.countByTeacherIdAndStatus(teacherId, AssignmentStatus.COMPLETED);

        List<Assignment> recentList = assignmentRepository.findTop5ByTeacherIdOrderByCreatedAtDesc(teacherId);
        List<TeacherDashboardResponse.RecentAssignment> recentAssignments = recentList.stream()
                .map(a -> TeacherDashboardResponse.RecentAssignment.builder()
                        .id(a.getId())
                        .title(a.getTitle())
                        .batch(a.getBatch() != null ? a.getBatch().getBatchName() : "Draft")
                        .dueDate(a.getDueDate().toString())
                        .build())
                .collect(Collectors.toList());

        List<Assignment> upcomingList = assignmentRepository
                .findByTeacherIdAndDueDateGreaterThanEqualOrderByDueDateAscDueTimeAsc(teacherId, LocalDate.now());
        // Limit to 5
        List<TeacherDashboardResponse.UpcomingDeadline> upcomingDeadlines = upcomingList.stream()
                .limit(5)
                .map(a -> TeacherDashboardResponse.UpcomingDeadline.builder()
                        .assignmentId(a.getId())
                        .title(a.getTitle())
                        .dueDate(a.getDueDate().toString())
                        .build())
                .collect(Collectors.toList());

        return TeacherDashboardResponse.builder()
                .teacherName(teacher.getFullName())
                .totalBatches(totalBatches)
                .totalStudents(totalStudents)
                .totalAssignments(totalAssignments)
                .activeAssignments(activeAssignments)
                .completedAssignments(completedAssignments)
                .recentAssignments(recentAssignments)
                .upcomingDeadlines(upcomingDeadlines)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDashboardResponse getStudentDashboard(String studentEmail) {
        Student student = studentRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        if (student.getRole() != com.company.learningmanagement.enums.Role.STUDENT) {
            throw new com.company.learningmanagement.exception.assignment.UnauthorizedException("Access Denied: Only students can access this dashboard");
        }

        String batchName = student.getBatch() != null ? student.getBatch().getBatchName() : "No Batch Assigned";

        if (student.getBatch() == null) {
            return StudentDashboardResponse.builder()
                    .studentName(student.getFullName())
                    .batch(batchName)
                    .totalAssignments(0)
                    .submittedAssignments(0)
                    .pendingAssignments(0)
                    .recentAssignments(List.of())
                    .recentSubmissions(List.of())
                    .upcomingDeadlines(List.of())
                    .build();
        }

        Long batchId = student.getBatch().getId();
        Long studentId = student.getId();

        long totalAssignments = assignmentRepository.countByBatchIdAndStatus(batchId, AssignmentStatus.ACTIVE);
        long submittedAssignments = submissionRepository.countByStudentId(studentId);
        long pendingAssignments = Math.max(0, totalAssignments - submittedAssignments);

        List<Assignment> recentList = assignmentRepository.findTop5ByBatchIdAndStatusOrderByCreatedAtDesc(batchId, AssignmentStatus.ACTIVE);
        List<StudentDashboardResponse.RecentAssignment> recentAssignments = recentList.stream()
                .map(a -> StudentDashboardResponse.RecentAssignment.builder()
                        .id(a.getId())
                        .title(a.getTitle())
                        .dueDate(a.getDueDate().toString())
                        .build())
                .collect(Collectors.toList());

        List<Submission> recentSubList = submissionRepository.findTop5ByStudentIdOrderBySubmittedAtDesc(studentId);
        List<StudentDashboardResponse.RecentSubmission> recentSubmissions = recentSubList.stream()
                .map(s -> StudentDashboardResponse.RecentSubmission.builder()
                        .assignment(s.getAssignment().getTitle())
                        .status(s.getStatus().name())
                        .marks(s.getMarks())
                        .build())
                .collect(Collectors.toList());

        List<Assignment> upcomingList = assignmentRepository
                .findByBatchIdAndStatusAndDueDateGreaterThanEqualOrderByDueDateAscDueTimeAsc(batchId, AssignmentStatus.ACTIVE, LocalDate.now());
        List<StudentDashboardResponse.UpcomingDeadline> upcomingDeadlines = upcomingList.stream()
                .limit(5)
                .map(a -> StudentDashboardResponse.UpcomingDeadline.builder()
                        .title(a.getTitle())
                        .dueDate(a.getDueDate().toString())
                        .build())
                .collect(Collectors.toList());

        return StudentDashboardResponse.builder()
                .studentName(student.getFullName())
                .batch(batchName)
                .totalAssignments(totalAssignments)
                .submittedAssignments(submittedAssignments)
                .pendingAssignments(pendingAssignments)
                .recentAssignments(recentAssignments)
                .recentSubmissions(recentSubmissions)
                .upcomingDeadlines(upcomingDeadlines)
                .build();
    }
}
