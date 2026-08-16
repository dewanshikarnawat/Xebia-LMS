package com.company.learningmanagement.repository.assignment;

import com.company.learningmanagement.entity.assignment.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    Optional<Subject> findBySubjectCode(String subjectCode);

    @Query("SELECT s FROM Subject s JOIN s.teachers t WHERE t.id = :teacherId " +
           "AND (:semester IS NULL OR s.semester = :semester) " +
           "AND (:department IS NULL OR s.department = :department)")
    List<Subject> findFilteredSubjectsForTeacher(
            @Param("teacherId") Long teacherId,
            @Param("semester") String semester,
            @Param("department") String department
    );
}
