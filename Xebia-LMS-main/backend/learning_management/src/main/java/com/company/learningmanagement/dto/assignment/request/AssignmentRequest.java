package com.company.learningmanagement.dto.assignment.request;

import com.company.learningmanagement.enums.AssignmentType;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    
    private String instructions;

    @NotNull(message = "Assignment type is required")
    private AssignmentType assignmentType;

    @NotBlank(message = "Subject is required")
    private String subject;

    private String topic;

    private Long batchId;

    private MultipartFile resourceFile;

    private String externalLink;

    private String submissionType;

    @NotNull(message = "Total marks is required")
    @Positive(message = "Total marks must be positive")
    private Double totalMarks;

    @NotNull(message = "Passing marks is required")
    @Positive(message = "Passing marks must be positive")
    private Double passingMarks;

    @NotNull(message = "Due date is required")
    @FutureOrPresent(message = "Due date cannot be in the past")
    private LocalDate dueDate;

    // Time is received as a string, e.g., "23:59:00" or bound as LocalTime
    @NotNull(message = "Due time is required")
    private LocalTime dueTime;

    @Builder.Default
    private Boolean lateSubmissionAllowed = false;

    @Builder.Default
    private Long maxFileSize = 10485760L; // Default 10MB in bytes

    private String status;

    private String questionsJson;
}
