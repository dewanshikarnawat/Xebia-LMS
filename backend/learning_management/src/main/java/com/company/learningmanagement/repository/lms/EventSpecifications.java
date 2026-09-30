package com.company.learningmanagement.repository.lms;

import com.company.learningmanagement.entity.lms.learning.Event;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

public class EventSpecifications {

    public static Specification<Event> hasActive(Boolean active) {
        return (root, query, cb) -> active == null ? null : cb.equal(root.get("active"), active);
    }

    public static Specification<Event> searchByText(String text) {
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
