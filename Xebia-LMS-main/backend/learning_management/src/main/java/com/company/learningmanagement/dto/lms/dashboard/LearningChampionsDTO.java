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
public class LearningChampionsDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private ChampionItem topLearnerOfQuarter;
    private ChampionItem topAILearner;
    private ChampionItem topCertifiedEmployee;
    private ChampionItem overallLearningChampion;
    private List<ChampionItem> topLearnersList;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChampionItem implements Serializable {
        private static final long serialVersionUID = 1L;
        private String employeeCode;
        private String name;
        private String department;
        private String project;
        private Double learningHours;
        private Long certificationsCount;
        private Double aiLearningHours;
        private String recognitionCategory;
    }
}
