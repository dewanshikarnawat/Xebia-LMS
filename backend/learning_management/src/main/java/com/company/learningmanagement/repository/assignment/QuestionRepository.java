package com.company.learningmanagement.repository.assignment;

import com.company.learningmanagement.entity.assignment.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByAssignmentId(Long assignmentId);
    void deleteByAssignmentId(Long assignmentId);
}
