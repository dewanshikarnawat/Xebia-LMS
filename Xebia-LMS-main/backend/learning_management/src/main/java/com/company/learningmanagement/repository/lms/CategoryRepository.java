package com.company.learningmanagement.repository.lms;

import com.company.learningmanagement.entity.lms.learning.CategoryEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {

    @EntityGraph(attributePaths = {"courses"})
    @Query("SELECT c FROM CategoryEntity c WHERE c.id = :id")
    Optional<CategoryEntity> findByIdWithCourses(@Param("id") Long id);
}
