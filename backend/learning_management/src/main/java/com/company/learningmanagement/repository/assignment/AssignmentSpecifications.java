package com.company.learningmanagement.repository.assignment;

import com.company.learningmanagement.entity.assignment.Assignment;
import com.company.learningmanagement.enums.AssignmentStatus;
import com.company.learningmanagement.enums.AssignmentType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class AssignmentSpecifications {

    public static Specification<Assignment> hasTeacherId(Long teacherId) {
        return (root, query, cb) -> cb.equal(root.get("teacher").get("id"), teacherId);
    }

    public static Specification<Assignment> hasBatchId(Long batchId) {
        return (root, query, cb) -> cb.equal(root.get("batch").get("id"), batchId);
    }

    public static Specification<Assignment> hasStatus(AssignmentStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Assignment> hasAssignmentType(AssignmentType type) {
        return (root, query, cb) -> cb.equal(root.get("assignmentType"), type);
    }

    public static Specification<Assignment> hasSubject(String subject) {
        return (root, query, cb) -> cb.equal(root.get("subject"), cb.literal(subject));
    }

    public static Specification<Assignment> searchByText(String text) {
        return (root, query, cb) -> {
            if (!StringUtils.hasText(text)) {
                return null;
            }
            String likePattern = "%" + text.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), cb.literal(likePattern)),
                    cb.like(cb.lower(root.get("description")), cb.literal(likePattern))
            );
        };
    }
}
