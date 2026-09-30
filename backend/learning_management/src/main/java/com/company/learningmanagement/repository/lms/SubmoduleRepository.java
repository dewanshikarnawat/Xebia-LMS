package com.company.learningmanagement.repository.lms;

import com.company.learningmanagement.entity.lms.learning.SubmoduleEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubmoduleRepository extends JpaRepository<SubmoduleEntity, Long> {
    Optional<SubmoduleEntity> findBySlug(String slug);

    @EntityGraph(attributePaths = {"contents"})
    @Query("SELECT s FROM SubmoduleEntity s WHERE s.id = :id")
    Optional<SubmoduleEntity> findByIdWithContents(@Param("id") Long id);

    @EntityGraph(attributePaths = {"module"})
    @Query("SELECT s FROM SubmoduleEntity s")
    List<SubmoduleEntity> findAllWithModule();
}
