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
public class LearningPillarsDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private PillarMetrics compliance;
    private PillarMetrics technical;
    private PillarMetrics aiGenAI;
    private PillarMetrics leadership;
    private PillarMetrics upskillingCrossSkilling;
    private PillarMetrics certifications;
    private PillarMetrics flagshipPrograms;
    private List<PillarMetrics> allPillars;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PillarMetrics implements Serializable {
        private static final long serialVersionUID = 1L;
        private String pillarName;
        private Long sessionsConducted;
        private Long employeesTrained;
        private Long learningHours;
        private Double feedbackScore;
    }
}
