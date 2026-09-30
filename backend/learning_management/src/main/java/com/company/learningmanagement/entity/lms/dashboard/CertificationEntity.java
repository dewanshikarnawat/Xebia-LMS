package com.company.learningmanagement.entity.lms.dashboard;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "certifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @ToString.Exclude
    private EmployeeEntity employee;

    @Column(nullable = false)
    private String certificationName;

    private String technology;

    @Column(nullable = false)
    private String status; // ASSIGNED, ENROLLED, STARTED, COMPLETED, SUBMITTED, APPROVED

    private LocalDateTime completionDate;
}
