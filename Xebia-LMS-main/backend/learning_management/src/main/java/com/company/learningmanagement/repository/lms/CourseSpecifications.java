package com.company.learningmanagement.repository.lms;

import com.company.learningmanagement.entity.lms.learning.CourseEntity;
import org.springframework.data.jpa.domain.Specification;

public class CourseSpecifications {

    public static Specification<CourseEntity> hasCategoryId(Long categoryId) {
        return (root, query, cb) -> categoryId == null ? null : cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<CourseEntity> hasLevel(String level) {
        return (root, query, cb) -> (level == null || level.trim().isEmpty() || "all".equalsIgnoreCase(level)) 
                ? null : cb.equal(cb.lower(root.get("level")), level.trim().toLowerCase());
    }

    public static Specification<CourseEntity> hasIsActive(Boolean isActive) {
        return (root, query, cb) -> isActive == null ? null : cb.equal(root.get("isActive"), isActive);
    }

    public static Specification<CourseEntity> hasIsPublished(Boolean isPublished) {
        return (root, query, cb) -> isPublished == null ? null : cb.equal(root.get("isPublished"), isPublished);
    }

    public static Specification<CourseEntity> hasSearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.trim().isEmpty()) {
                return null;
            }
            String likePattern = "%" + search.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), likePattern),
                    cb.like(cb.lower(root.get("description")), likePattern),
                    cb.like(cb.lower(root.get("slug")), likePattern)
            );
        };
    }
}
