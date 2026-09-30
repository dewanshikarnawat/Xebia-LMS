package com.company.learningmanagement.repository.lms;

import com.company.learningmanagement.entity.lms.learning.ModuleEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuleRepository extends JpaRepository<ModuleEntity, Long> {

    @EntityGraph(attributePaths = {"submodules"})
    @Query("SELECT m FROM ModuleEntity m WHERE m.id = :id")
    Optional<ModuleEntity> findByIdWithSubmodules(@Param("id") Long id);

    @EntityGraph(attributePaths = {"course"})
    @Query("SELECT m FROM ModuleEntity m")
    List<ModuleEntity> findAllWithCourse();
}
