package com.company.learningmanagement.repository.lms.dashboard;

import com.company.learningmanagement.entity.lms.dashboard.EmployeeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<EmployeeEntity, Long>, JpaSpecificationExecutor<EmployeeEntity> {

    @Query("SELECT COUNT(e) FROM EmployeeEntity e WHERE e.active = true " +
           "AND (:region IS NULL OR e.region = :region) " +
           "AND (:location IS NULL OR e.location = :location) " +
           "AND (:department IS NULL OR e.department = :department) " +
           "AND (:project IS NULL OR e.project = :project) " +
           "AND (:grade IS NULL OR e.employeeGrade = :grade) " +
           "AND (:employeeId IS NULL OR e.id = :employeeId)")
    long countActiveEmployees(@Param("region") String region,
                              @Param("location") String location,
                              @Param("department") String department,
                              @Param("project") String project,
                              @Param("grade") String grade,
                              @Param("employeeId") Long employeeId);

    @Query("SELECT DISTINCT e.region FROM EmployeeEntity e WHERE e.region IS NOT NULL")
    List<String> findDistinctRegions();

    @Query("SELECT DISTINCT e.location FROM EmployeeEntity e WHERE e.location IS NOT NULL")
    List<String> findDistinctLocations();

    @Query("SELECT DISTINCT e.businessUnit FROM EmployeeEntity e WHERE e.businessUnit IS NOT NULL")
    List<String> findDistinctBusinessUnits();
}
