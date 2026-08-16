package com.company.learningmanagement.dto.lms.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectInvestmentDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private List<ProjectInvestmentItem> projects;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectInvestmentItem implements Serializable {
        private static final long serialVersionUID = 1L;
        private String projectName;
        private Long employeesTrained;
        private Long learningHours;
        private Long certifications;
        private Double aiReadinessScore;
        private Double trainingCoveragePercentage;
    }
}
