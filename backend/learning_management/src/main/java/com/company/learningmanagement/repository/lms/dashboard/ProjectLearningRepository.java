package com.company.learningmanagement.repository.lms.dashboard;

import com.company.learningmanagement.entity.lms.dashboard.ProjectLearningEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectLearningRepository extends JpaRepository<ProjectLearningEntity, Long>, JpaSpecificationExecutor<ProjectLearningEntity> {

    @Query("SELECT pl FROM ProjectLearningEntity pl " +
           "JOIN FETCH pl.employee e " +
           "WHERE (:region IS NULL OR e.region = :region) " +
           "AND (:location IS NULL OR e.location = :location) " +
           "AND (:department IS NULL OR e.department = :department) " +
           "AND (:project IS NULL OR e.project = :project) " +
           "AND (:grade IS NULL OR e.employeeGrade = :grade) " +
           "AND (:employeeId IS NULL OR e.id = :employeeId)")
    List<ProjectLearningEntity> findFilteredProjectLearning(@Param("region") String region,
                                                           @Param("location") String location,
                                                           @Param("department") String department,
                                                           @Param("project") String project,
                                                           @Param("grade") String grade,
                                                           @Param("employeeId") Long employeeId);
}
