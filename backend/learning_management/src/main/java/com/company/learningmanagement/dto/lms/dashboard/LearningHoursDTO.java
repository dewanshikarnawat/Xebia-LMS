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
public class LearningHoursDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long totalHours;
    private Double averageHoursPerEmployee;
    private List<LearnerItem> topLearners;
    private List<ProjectItem> topProjects;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LearnerItem implements Serializable {
        private static final long serialVersionUID = 1L;
        private String employeeCode;
        private String name;
        private Double hours;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectItem implements Serializable {
        private static final long serialVersionUID = 1L;
        private String projectName;
        private Double hours;
    }
}
