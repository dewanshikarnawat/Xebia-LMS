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
public class AIReadinessDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long aiTrainedEmployees;
    private Long aiCertifiedEmployees;
    private Long aiLearningHours;
    private Long copilotUsers;
    private Long kiroUsers;
    private Long claudeUsers;
    private Double aiMaturityScore;
}
