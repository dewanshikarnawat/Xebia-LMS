package com.company.learningmanagement.repository.lms.dashboard;

import com.company.learningmanagement.entity.lms.dashboard.CertificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CertificationRepository extends JpaRepository<CertificationEntity, Long>, JpaSpecificationExecutor<CertificationEntity> {

    @Query("SELECT COUNT(c) FROM CertificationEntity c " +
           "JOIN c.employee e " +
           "WHERE (c.status = 'COMPLETED' OR c.status = 'APPROVED') " +
           "AND (:region IS NULL OR e.region = :region) " +
           "AND (:location IS NULL OR e.location = :location) " +
           "AND (:department IS NULL OR e.department = :department) " +
           "AND (:project IS NULL OR e.project = :project) " +
           "AND (:grade IS NULL OR e.employeeGrade = :grade) " +
           "AND (:employeeId IS NULL OR e.id = :employeeId) " +
           "AND (:startDate IS NULL OR c.completionDate >= :startDate) " +
           "AND (:endDate IS NULL OR c.completionDate <= :endDate)")
    long countCompletedCertifications(@Param("region") String region,
                                      @Param("location") String location,
                                      @Param("department") String department,
                                      @Param("project") String project,
                                      @Param("grade") String grade,
                                      @Param("employeeId") Long employeeId,
                                      @Param("startDate") LocalDateTime startDate,
                                      @Param("endDate") LocalDateTime endDate);

    @Query("SELECT c FROM CertificationEntity c " +
           "JOIN FETCH c.employee e " +
           "WHERE (:region IS NULL OR e.region = :region) " +
           "AND (:location IS NULL OR e.location = :location) " +
           "AND (:department IS NULL OR e.department = :department) " +
           "AND (:project IS NULL OR e.project = :project) " +
           "AND (:grade IS NULL OR e.employeeGrade = :grade) " +
           "AND (:employeeId IS NULL OR e.id = :employeeId) " +
           "AND (:startDate IS NULL OR c.completionDate >= :startDate) " +
           "AND (:endDate IS NULL OR c.completionDate <= :endDate)")
    List<CertificationEntity> findFilteredCertifications(@Param("region") String region,
                                                         @Param("location") String location,
                                                         @Param("department") String department,
                                                         @Param("project") String project,
                                                         @Param("grade") String grade,
                                                         @Param("employeeId") Long employeeId,
                                                         @Param("startDate") LocalDateTime startDate,
                                                         @Param("endDate") LocalDateTime endDate);
}
