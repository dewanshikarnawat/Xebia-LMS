package com.company.learningmanagement.repository.lms.dashboard;

import com.company.learningmanagement.entity.lms.dashboard.FeedbackEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<FeedbackEntity, Long>, JpaSpecificationExecutor<FeedbackEntity> {

    @Query("SELECT COALESCE(AVG(f.rating), 0.0) FROM FeedbackEntity f " +
           "JOIN f.employee e " +
           "JOIN f.trainingSession s " +
           "WHERE (:region IS NULL OR e.region = :region) " +
           "AND (:location IS NULL OR e.location = :location) " +
           "AND (:department IS NULL OR e.department = :department) " +
           "AND (:project IS NULL OR e.project = :project) " +
           "AND (:grade IS NULL OR e.employeeGrade = :grade) " +
           "AND (:employeeId IS NULL OR e.id = :employeeId) " +
           "AND (:startDate IS NULL OR s.sessionDate >= :startDate) " +
           "AND (:endDate IS NULL OR s.sessionDate <= :endDate)")
    double getAverageFeedbackRating(@Param("region") String region,
                                    @Param("location") String location,
                                    @Param("department") String department,
                                    @Param("project") String project,
                                    @Param("grade") String grade,
                                    @Param("employeeId") Long employeeId,
                                    @Param("startDate") LocalDateTime startDate,
                                    @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(AVG(f.trainerRating), 0.0) FROM FeedbackEntity f " +
           "JOIN f.employee e " +
           "JOIN f.trainingSession s " +
           "WHERE (:region IS NULL OR e.region = :region) " +
           "AND (:location IS NULL OR e.location = :location) " +
           "AND (:department IS NULL OR e.department = :department) " +
           "AND (:project IS NULL OR e.project = :project) " +
           "AND (:grade IS NULL OR e.employeeGrade = :grade) " +
           "AND (:employeeId IS NULL OR e.id = :employeeId) " +
           "AND (:startDate IS NULL OR s.sessionDate >= :startDate) " +
           "AND (:endDate IS NULL OR s.sessionDate <= :endDate)")
    double getAverageTrainerRating(@Param("region") String region,
                                  @Param("location") String location,
                                  @Param("department") String department,
                                  @Param("project") String project,
                                  @Param("grade") String grade,
                                  @Param("employeeId") Long employeeId,
                                  @Param("startDate") LocalDateTime startDate,
                                  @Param("endDate") LocalDateTime endDate);

    @Query("SELECT f FROM FeedbackEntity f " +
           "JOIN FETCH f.employee e " +
           "JOIN FETCH f.trainingSession s " +
           "WHERE (:region IS NULL OR e.region = :region) " +
           "AND (:location IS NULL OR e.location = :location) " +
           "AND (:department IS NULL OR e.department = :department) " +
           "AND (:project IS NULL OR e.project = :project) " +
           "AND (:grade IS NULL OR e.employeeGrade = :grade) " +
           "AND (:employeeId IS NULL OR e.id = :employeeId) " +
           "AND (:startDate IS NULL OR s.sessionDate >= :startDate) " +
           "AND (:endDate IS NULL OR s.sessionDate <= :endDate)")
    List<FeedbackEntity> findFilteredFeedback(@Param("region") String region,
                                              @Param("location") String location,
                                              @Param("department") String department,
                                              @Param("project") String project,
                                              @Param("grade") String grade,
                                              @Param("employeeId") Long employeeId,
                                              @Param("startDate") LocalDateTime startDate,
                                              @Param("endDate") LocalDateTime endDate);
}
