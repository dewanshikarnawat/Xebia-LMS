package com.company.learningmanagement.entity.lms.dashboard;

import com.company.learningmanagement.entity.lms.learning.CourseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "training_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainingSessionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String sessionName;

    private String trainer;
    private String learningPillar;
    private Integer durationHours;
    private LocalDateTime sessionDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    @ToString.Exclude
    private CourseEntity course;
}
