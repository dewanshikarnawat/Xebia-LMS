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
public class LearningCoverageDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private List<CoverageItem> regionWiseCoverage;
    private List<CoverageItem> locationWiseCoverage;
    private List<CoverageItem> projectParticipation;
    private List<CoverageItem> businessUnitCoverage;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CoverageItem implements Serializable {
        private static final long serialVersionUID = 1L;
        private String key;
        private Double value;
    }
}
