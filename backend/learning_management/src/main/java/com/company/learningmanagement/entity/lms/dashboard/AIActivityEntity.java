package com.company.learningmanagement.entity.lms.dashboard;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ai_activity")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIActivityEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @ToString.Exclude
    private EmployeeEntity employee;

    private Boolean aiTrainingCompleted;
    private Boolean aiCertified;
    private Integer aiLearningHours;
    private Boolean copilotUser;
    private Boolean kiroUser;
    private Boolean claudeUser;
    private Boolean aiPowerUser;
    private Boolean aiMentor;
    private Boolean aiAmbassador;
}
