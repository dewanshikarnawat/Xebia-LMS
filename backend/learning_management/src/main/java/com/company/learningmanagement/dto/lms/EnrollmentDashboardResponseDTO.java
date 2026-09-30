package com.company.learningmanagement.dto.lms;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentDashboardResponseDTO {
    private Long id;
    private String studentName;
    private String studentEmail;
    private String courseName;
    private LocalDateTime enrollmentDate;
    private String status;
    private String approvedBy;
    private LocalDateTime approvedAt;
    private String remarks;
    private Long courseId;
}
