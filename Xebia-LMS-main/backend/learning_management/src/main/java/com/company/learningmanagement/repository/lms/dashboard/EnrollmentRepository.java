package com.company.learningmanagement.repository.lms.dashboard;

import com.company.learningmanagement.entity.lms.dashboard.EnrollmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<EnrollmentEntity, Long>, JpaSpecificationExecutor<EnrollmentEntity> {

    @Query("SELECT COUNT(DISTINCT en.employee.id) FROM EnrollmentEntity en " +
           "JOIN en.employee e " +
           "JOIN en.trainingSession s " +
           "WHERE (:region IS NULL OR e.region = :region) " +
           "AND (:location IS NULL OR e.location = :location) " +
           "AND (:department IS NULL OR e.department = :department) " +
           "AND (:project IS NULL OR e.project = :project) " +
           "AND (:grade IS NULL OR e.employeeGrade = :grade) " +
           "AND (:employeeId IS NULL OR e.id = :employeeId) " +
           "AND (:startDate IS NULL OR s.sessionDate >= :startDate) " +
           "AND (:endDate IS NULL OR s.sessionDate <= :endDate)")
    long countNominatedEmployees(@Param("region") String region,
                                 @Param("location") String location,
                                 @Param("department") String department,
                                 @Param("project") String project,
                                 @Param("grade") String grade,
                                 @Param("employeeId") Long employeeId,
                                 @Param("startDate") LocalDateTime startDate,
                                 @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(DISTINCT en.employee.id) FROM EnrollmentEntity en " +
           "JOIN en.employee e " +
           "JOIN en.trainingSession s " +
           "WHERE en.status = 'COMPLETED' " +
           "AND (:region IS NULL OR e.region = :region) " +
           "AND (:location IS NULL OR e.location = :location) " +
           "AND (:department IS NULL OR e.department = :department) " +
           "AND (:project IS NULL OR e.project = :project) " +
           "AND (:grade IS NULL OR e.employeeGrade = :grade) " +
           "AND (:employeeId IS NULL OR e.id = :employeeId) " +
           "AND (:startDate IS NULL OR s.sessionDate >= :startDate) " +
           "AND (:endDate IS NULL OR s.sessionDate <= :endDate)")
    long countTrainedEmployees(@Param("region") String region,
                               @Param("location") String location,
                               @Param("department") String department,
                               @Param("project") String project,
                               @Param("grade") String grade,
                               @Param("employeeId") Long employeeId,
                               @Param("startDate") LocalDateTime startDate,
                               @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COALESCE(SUM(s.durationHours), 0) FROM EnrollmentEntity en " +
           "JOIN en.employee e " +
           "JOIN en.trainingSession s " +
           "WHERE en.status = 'COMPLETED' " +
           "AND (:region IS NULL OR e.region = :region) " +
           "AND (:location IS NULL OR e.location = :location) " +
           "AND (:department IS NULL OR e.department = :department) " +
           "AND (:project IS NULL OR e.project = :project) " +
           "AND (:grade IS NULL OR e.employeeGrade = :grade) " +
           "AND (:employeeId IS NULL OR e.id = :employeeId) " +
           "AND (:startDate IS NULL OR s.sessionDate >= :startDate) " +
           "AND (:endDate IS NULL OR s.sessionDate <= :endDate)")
    long sumLearningHours(@Param("region") String region,
                          @Param("location") String location,
                          @Param("department") String department,
                          @Param("project") String project,
                          @Param("grade") String grade,
                          @Param("employeeId") Long employeeId,
                          @Param("startDate") LocalDateTime startDate,
                          @Param("endDate") LocalDateTime endDate);

    @Query("SELECT en FROM EnrollmentEntity en " +
           "JOIN FETCH en.employee e " +
           "JOIN FETCH en.trainingSession s " +
           "WHERE (:region IS NULL OR e.region = :region) " +
           "AND (:location IS NULL OR e.location = :location) " +
           "AND (:department IS NULL OR e.department = :department) " +
           "AND (:project IS NULL OR e.project = :project) " +
           "AND (:grade IS NULL OR e.employeeGrade = :grade) " +
           "AND (:employeeId IS NULL OR e.id = :employeeId) " +
           "AND (:startDate IS NULL OR s.sessionDate >= :startDate) " +
           "AND (:endDate IS NULL OR s.sessionDate <= :endDate)")
    List<EnrollmentEntity> findFilteredEnrollments(@Param("region") String region,
                                                   @Param("location") String location,
                                                   @Param("department") String department,
                                                   @Param("project") String project,
                                                   @Param("grade") String grade,
                                                   @Param("employeeId") Long employeeId,
                                                   @Param("startDate") LocalDateTime startDate,
                                                   @Param("endDate") LocalDateTime endDate);
}
