package com.company.learningmanagement.repository.lms.dashboard;

import com.company.learningmanagement.entity.lms.dashboard.AIActivityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIActivityRepository extends JpaRepository<AIActivityEntity, Long>, JpaSpecificationExecutor<AIActivityEntity> {

    @Query("SELECT ai FROM AIActivityEntity ai " +
           "JOIN FETCH ai.employee e " +
           "WHERE (:region IS NULL OR e.region = :region) " +
           "AND (:location IS NULL OR e.location = :location) " +
           "AND (:department IS NULL OR e.department = :department) " +
           "AND (:project IS NULL OR e.project = :project) " +
           "AND (:grade IS NULL OR e.employeeGrade = :grade) " +
           "AND (:employeeId IS NULL OR e.id = :employeeId)")
    List<AIActivityEntity> findFilteredAIActivity(@Param("region") String region,
                                                 @Param("location") String location,
                                                 @Param("department") String department,
                                                 @Param("project") String project,
                                                 @Param("grade") String grade,
                                                 @Param("employeeId") Long employeeId);

    @Query("SELECT COUNT(ai) FROM AIActivityEntity ai " +
           "JOIN ai.employee e " +
           "WHERE (ai.aiTrainingCompleted = true OR ai.aiCertified = true) " +
           "AND (:region IS NULL OR e.region = :region) " +
           "AND (:location IS NULL OR e.location = :location) " +
           "AND (:department IS NULL OR e.department = :department) " +
           "AND (:project IS NULL OR e.project = :project) " +
           "AND (:grade IS NULL OR e.employeeGrade = :grade) " +
           "AND (:employeeId IS NULL OR e.id = :employeeId)")
    long countAITrainedOrCertified(@Param("region") String region,
                                   @Param("location") String location,
                                   @Param("department") String department,
                                   @Param("project") String project,
                                   @Param("grade") String grade,
                                   @Param("employeeId") Long employeeId);

    @Query("SELECT COALESCE(SUM(ai.aiLearningHours), 0L) FROM AIActivityEntity ai " +
           "JOIN ai.employee e " +
           "WHERE (:region IS NULL OR e.region = :region) " +
           "AND (:location IS NULL OR e.location = :location) " +
           "AND (:department IS NULL OR e.department = :department) " +
           "AND (:project IS NULL OR e.project = :project) " +
           "AND (:grade IS NULL OR e.employeeGrade = :grade) " +
           "AND (:employeeId IS NULL OR e.id = :employeeId)")
    long sumAILearningHours(@Param("region") String region,
                            @Param("location") String location,
                            @Param("department") String department,
                            @Param("project") String project,
                            @Param("grade") String grade,
                            @Param("employeeId") Long employeeId);
}
