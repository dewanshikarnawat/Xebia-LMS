package com.company.learningmanagement.dto.assignment.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long assignmentId;
    private String assignmentTitle;
    private Long quizId;
    private String quizTitle;
    private String certificateUrl;
    private String cloudinaryPublicId;
    private Double marks;
    private LocalDateTime generatedAt;
    private String certificateType;

    private String certificateId;
    private Long teacherId;
    private String teacherName;
    private LocalDateTime completionDate;
    private LocalDateTime generatedDate;
    private String pdfFileUrl;
    private String verificationToken;
    private String qrCodeUrl;
    private Double maxMarks;
}
