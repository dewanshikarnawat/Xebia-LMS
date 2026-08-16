package com.company.learningmanagement.repository.lms;

import com.company.learningmanagement.entity.lms.learning.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventRepository extends JpaRepository<Event, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Event> {
    Page<Event> findByActive(Boolean active, Pageable pageable);
}
