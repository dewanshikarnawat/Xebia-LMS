package com.company.learningmanagement.repository.assignment;

import com.company.learningmanagement.entity.assignment.Batch;
import org.springframework.data.jpa.domain.Specification;

public class BatchSpecifications {

    public static Specification<Batch> hasTeacherId(Long teacherId) {
        return (root, query, cb) -> teacherId == null ? null : cb.equal(root.get("teacher").get("id"), teacherId);
    }

    public static Specification<Batch> hasSearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.trim().isEmpty()) {
                return null;
            }
            String likePattern = "%" + search.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("batchName")), likePattern),
                    cb.like(cb.lower(root.get("description")), likePattern)
            );
        };
    }
}
