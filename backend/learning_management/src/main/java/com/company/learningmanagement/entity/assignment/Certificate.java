package com.company.learningmanagement.entity.assignment;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "certificates",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_cert_student_assignment", columnNames = {"student_id", "assignment_id"}),
        @UniqueConstraint(name = "uq_cert_student_quiz", columnNames = {"student_id", "quiz_id"})
    },
    indexes = {
        @Index(name = "idx_cert_student", columnList = "student_id"),
        @Index(name = "idx_cert_assignment", columnList = "assignment_id"),
        @Index(name = "idx_cert_quiz", columnList = "quiz_id"),
        @Index(name = "idx_cert_uuid", columnList = "certificate_uuid"),
        @Index(name = "idx_cert_token", columnList = "verification_token")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id")
    private Assignment quiz;

    @Column(name = "certificate_url", nullable = false, length = 1000)
    private String certificateUrl;

    @Column(name = "cloudinary_public_id", length = 255)
    private String cloudinaryPublicId;

    @Column(name = "marks", nullable = false)
    private Double marks;

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt;

    @Column(name = "certificate_type", nullable = false)
    private String certificateType; // "ASSIGNMENT" or "QUIZ"

    @Column(name = "certificate_uuid", nullable = false, unique = true)
    private String certificateId;

    @Column(name = "student_name")
    private String studentName;

    @Column(name = "assignment_name")
    private String assignmentName;

    @Column(name = "teacher_id")
    private Long teacherId;

    @Column(name = "teacher_name")
    private String teacherName;

    @Column(name = "completion_date")
    private LocalDateTime completionDate;

    @Column(name = "generated_date")
    private LocalDateTime generatedDate;

    @Column(name = "pdf_file_url", length = 1000)
    private String pdfFileUrl;

    @Column(name = "verification_token", unique = true)
    private String verificationToken;

    @Column(name = "qr_code_url", length = 1000)
    private String qrCodeUrl;

    @Column(name = "pdf_data", columnDefinition = "bytea")
    private byte[] pdfData;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "content_type")
    private String contentType;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
