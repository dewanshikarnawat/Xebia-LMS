package com.company.learningmanagement.service.lms.dashboard;

import com.company.learningmanagement.dto.lms.dashboard.*;

public interface DashboardService {

    ExecutiveSummaryDTO getExecutiveSummary(DashboardFilterRequestDTO filter);

    LearningCoverageDTO getLearningCoverage(DashboardFilterRequestDTO filter);

    LearningHoursDTO getLearningHours(DashboardFilterRequestDTO filter);

    AIReadinessDTO getAIReadiness(DashboardFilterRequestDTO filter);

    CertificationFunnelDTO getCertificationFunnel(DashboardFilterRequestDTO filter);

    DashboardTrendsDTO getTrends(DashboardFilterRequestDTO filter);

    EffectivenessDTO getEffectiveness(DashboardFilterRequestDTO filter);

    LearningPillarsDTO getLearningPillars(DashboardFilterRequestDTO filter);

    FlagshipProgramsDTO getFlagshipPrograms(DashboardFilterRequestDTO filter);

    LearningChampionsDTO getLearningChampions(DashboardFilterRequestDTO filter);

    ProjectInvestmentDTO getProjectInvestment(DashboardFilterRequestDTO filter);

    FresherJourneyDTO getFresherJourney(DashboardFilterRequestDTO filter);
}
