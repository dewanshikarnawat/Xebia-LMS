package com.company.learningmanagement.entity.lms.dashboard;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "project_learning")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectLearningEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String projectName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @ToString.Exclude
    private EmployeeEntity employee;

    private Integer learningHours;
    private Integer certifications;
    private Double aiReadinessScore;
    private Double trainingCoverage;
}
