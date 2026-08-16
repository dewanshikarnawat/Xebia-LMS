package com.company.learningmanagement.repository.lms;

import com.company.learningmanagement.entity.lms.learning.EventRegistration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {

    boolean existsByStudentIdAndEventId(Long studentId, Long eventId);
    
    Page<EventRegistration> findByEventId(Long eventId, Pageable pageable);
    
    Page<EventRegistration> findByStudentEmail(String email, Pageable pageable);

    int countByEventId(Long eventId);

    @Query("SELECT er FROM EventRegistration er JOIN FETCH er.student s JOIN FETCH er.event e")
    Page<EventRegistration> findAllWithStudentAndEvent(Pageable pageable);

    @Query("SELECT er FROM EventRegistration er JOIN FETCH er.student s JOIN FETCH er.event e WHERE er.event.id = :eventId")
    Page<EventRegistration> findByEventIdWithStudentAndEvent(@Param("eventId") Long eventId, Pageable pageable);
}
