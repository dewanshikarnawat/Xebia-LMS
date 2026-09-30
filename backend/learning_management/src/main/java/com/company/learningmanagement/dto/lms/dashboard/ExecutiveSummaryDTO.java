package com.company.learningmanagement.dto.lms.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutiveSummaryDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long totalEmployees;
    private Long employeesNominated;
    private Long employeesTrained;
    private Double learningCoverage;
    private Long totalSessions;
    private Long totalLearningHours;
    private Long certificationsCompleted;
    private Long aiEmployees;
    private Long aiLearningHours;
    private Double feedbackRating;
}
