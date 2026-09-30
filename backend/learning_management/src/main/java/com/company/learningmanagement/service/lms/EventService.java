package com.company.learningmanagement.service.lms;

import com.company.learningmanagement.dto.lms.EventRegistrationResponseDTO;
import com.company.learningmanagement.dto.lms.EventRequestDTO;
import com.company.learningmanagement.dto.lms.EventResponseDTO;
import org.springframework.data.domain.Page;

public interface EventService {
    EventResponseDTO createEvent(EventRequestDTO request);
    EventResponseDTO updateEvent(Long id, EventRequestDTO request);
    void deleteEvent(Long id);
    EventResponseDTO closeRegistration(Long id);
    Page<EventResponseDTO> getEvents(Boolean active, int page, int size, String sortBy, String sortDir, String search);
    EventResponseDTO getEventById(Long id);
    
    EventRegistrationResponseDTO registerForEvent(Long eventId);
    Page<EventRegistrationResponseDTO> getMyRegisteredEvents(int page, int size);
    Page<EventRegistrationResponseDTO> getEventRegistrations(Long eventId, int page, int size);
    Page<EventRegistrationResponseDTO> getAllEventRegistrations(int page, int size);
    int getRegistrationCount(Long eventId);
    java.util.List<EventRegistrationResponseDTO> getEventRegistrationsList(Long eventId);
}
