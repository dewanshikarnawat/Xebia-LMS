package com.company.learningmanagement.entity.assignment;

import com.company.learningmanagement.enums.SubmissionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "submissions",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_submission_assignment_student", columnNames = {"assignment_id", "student_id"})
    },
    indexes = {
        @Index(name = "idx_submission_assignment", columnList = "assignment_id"),
        @Index(name = "idx_submission_student", columnList = "student_id"),
        @Index(name = "idx_submission_status", columnList = "status")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "submission_url")
    private String submissionUrl;

    @Column(name = "comment")
    private String comment;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "marks")
    private Double marks;

    @Column(name = "feedback")
    private String feedback;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private SubmissionStatus status = SubmissionStatus.PENDING;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "quiz_answers", columnDefinition = "TEXT")
    private String quizAnswers;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Submission)) return false;
        Submission that = (Submission) o;
        return id != null && id.equals(that.getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
