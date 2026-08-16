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
public class FresherJourneyDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long freshersHired;
    private Double trainingCompletionPercentage;
    private Double certificationCompletionPercentage;
    private Double deploymentPercentage;
    private Double averageTimeToDeploymentDays;

    // Funnel Steps
    private Long campusHiringCount;
    private Long trainingEnrollmentCount;
    private Long trainingCompletionCount;
    private Long certificationCompletionCount;
    private Long projectAllocationCount;
    private Long billableDeploymentCount;
}
