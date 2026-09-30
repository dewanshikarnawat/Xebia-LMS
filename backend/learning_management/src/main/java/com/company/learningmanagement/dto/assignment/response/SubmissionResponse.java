package com.company.learningmanagement.dto.assignment.response;

import com.company.learningmanagement.enums.SubmissionStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionResponse {
    private Long id;
    private Long assignmentId;
    private String assignmentTitle;
    private Long studentId;
    private String studentName;
    private String submissionUrl;
    private String comment;
    private LocalDateTime submittedAt;
    private Double marks;
    private String feedback;
    private SubmissionStatus status;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String quizAnswers;
    private String studentEmail;
    private String studentEnrollment;
    private String studentBatchName;
}
