package com.company.learningmanagement.repository.lms;

import com.company.learningmanagement.entity.lms.learning.CourseEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<CourseEntity, Long>, JpaSpecificationExecutor<CourseEntity> {
    Optional<CourseEntity> findBySlug(String slug);

    @EntityGraph(attributePaths = {"modules", "modules.submodules", "modules.submodules.contents"})
    @Query("SELECT c FROM CourseEntity c WHERE c.id = :id")
    Optional<CourseEntity> findByIdWithModules(@Param("id") Long id);

    @EntityGraph(attributePaths = {"category"})
    @Query("SELECT c FROM CourseEntity c")
    List<CourseEntity> findAllWithCategory();

    @EntityGraph(attributePaths = {"category"})
    @Query("SELECT c FROM CourseEntity c")
    Page<CourseEntity> findAllWithCategoryPageable(Pageable pageable);

    @Query("SELECT COUNT(c) > 0 FROM CourseEntity c JOIN c.teachers t WHERE c.id = :courseId AND t.email = :email")
    boolean isTeacherAssignedToCourse(@Param("courseId") Long courseId, @Param("email") String email);
}
