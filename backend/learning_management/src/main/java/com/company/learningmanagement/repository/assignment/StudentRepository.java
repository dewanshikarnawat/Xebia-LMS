package com.company.learningmanagement.repository.assignment;

import com.company.learningmanagement.entity.assignment.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Student> findByBatchId(Long batchId);

    @Query("SELECT COUNT(s) FROM Student s WHERE s.batch.teacher.id = :teacherId")
    long countByTeacherId(@Param("teacherId") Long teacherId);
}
