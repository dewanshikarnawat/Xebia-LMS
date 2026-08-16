package com.company.learningmanagement.repository.lms.dashboard;

import com.company.learningmanagement.entity.lms.dashboard.TrainingSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface TrainingSessionRepository extends JpaRepository<TrainingSessionEntity, Long>, JpaSpecificationExecutor<TrainingSessionEntity> {

    @Query("SELECT COUNT(s) FROM TrainingSessionEntity s " +
           "WHERE (:startDate IS NULL OR s.sessionDate >= :startDate) " +
           "AND (:endDate IS NULL OR s.sessionDate <= :endDate)")
    long countSessions(@Param("startDate") LocalDateTime startDate,
                       @Param("endDate") LocalDateTime endDate);
}
