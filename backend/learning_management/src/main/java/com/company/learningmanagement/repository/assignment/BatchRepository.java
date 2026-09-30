package com.company.learningmanagement.repository.assignment;

import com.company.learningmanagement.entity.assignment.Batch;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;
import java.util.Optional;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long>, JpaSpecificationExecutor<Batch> {
    Page<Batch> findByTeacherId(Long teacherId, Pageable pageable);
    List<Batch> findByTeacherId(Long teacherId);
    Optional<Batch> findByIdAndTeacherId(Long id, Long teacherId);
    long countByTeacherId(Long teacherId);
}
