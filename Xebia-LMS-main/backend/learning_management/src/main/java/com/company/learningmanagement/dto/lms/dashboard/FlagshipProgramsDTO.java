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
public class FlagshipProgramsDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private List<ProgramMetrics> programs;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProgramMetrics implements Serializable {
        private static final long serialVersionUID = 1L;
        private String programName;
        private Long participants;
        private Double completionPercentage;
        private Long learningHours;
        private Double feedbackScore;
        private Long certificationsAchieved;
    }
}
