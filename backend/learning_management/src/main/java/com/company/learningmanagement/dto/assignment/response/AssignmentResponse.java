package com.company.learningmanagement.dto.assignment.response;

import com.company.learningmanagement.enums.AssignmentStatus;
import com.company.learningmanagement.enums.AssignmentType;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentResponse {
    private Long id;
    private String title;
    private String description;
    private String instructions;
    private AssignmentType assignmentType;
    private String subject;
    private String topic;
    private Long batchId;
    private String batchName;
    private Long teacherId;
    private String teacherName;
    private String resourceUrl;
    private String externalLink;
    private String submissionType;
    private Double totalMarks;
    private Double passingMarks;
    private LocalDate dueDate;
    private LocalTime dueTime;
    private Boolean lateSubmissionAllowed;
    private Long maxFileSize;
    private AssignmentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private java.util.List<QuestionResponse> questions;
    private Integer totalStudents;
    private Integer submittedCount;
    private Integer pendingCount;
    private Double submissionPercentage;
}
