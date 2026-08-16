package com.company.learningmanagement.service.lms.impl;

import com.company.learningmanagement.dto.lms.EventRegistrationResponseDTO;
import com.company.learningmanagement.dto.lms.EventRequestDTO;
import com.company.learningmanagement.dto.lms.EventResponseDTO;
import com.company.learningmanagement.entity.assignment.Student;
import com.company.learningmanagement.entity.lms.learning.Event;
import com.company.learningmanagement.entity.lms.learning.EventRegistration;
import com.company.learningmanagement.entity.lms.learning.EnrollmentStatus;
import com.company.learningmanagement.exception.assignment.BadRequestException;
import com.company.learningmanagement.exception.assignment.ConflictException;
import com.company.learningmanagement.exception.assignment.ForbiddenException;
import com.company.learningmanagement.exception.lms.ResourceNotFoundException;
import com.company.learningmanagement.repository.assignment.StudentRepository;
import com.company.learningmanagement.repository.lms.CourseEnrollmentRepository;
import com.company.learningmanagement.repository.lms.EventRegistrationRepository;
import com.company.learningmanagement.repository.lms.EventRepository;
import com.company.learningmanagement.repository.lms.EventSpecifications;
import com.company.learningmanagement.service.lms.EventService;
import com.company.learningmanagement.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final StudentRepository studentRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;

    @Override
    public EventResponseDTO createEvent(EventRequestDTO request) {
        var user = SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new ForbiddenException("Access Denied: Only admins can manage events");
        }

        Event event = Event.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .image(request.getImage())
                .registrationDeadline(request.getRegistrationDeadline())
                .eventDate(request.getEventDate())
                .location(request.getLocation())
                .createdBy(user.getUsername())
                .active(request.getActive() != null ? request.getActive() : true)
                .status(request.getStatus() != null ? request.getStatus() : "UPCOMING")
                .build();

        return mapToResponse(eventRepository.save(event));
    }

    @Override
    public EventResponseDTO updateEvent(Long id, EventRequestDTO request) {
        var user = SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new ForbiddenException("Access Denied: Only admins can manage events");
        }

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setImage(request.getImage());
        event.setRegistrationDeadline(request.getRegistrationDeadline());
        event.setEventDate(request.getEventDate());
        event.setLocation(request.getLocation());
        if (request.getActive() != null) {
            event.setActive(request.getActive());
        }
        if (request.getStatus() != null) {
            event.setStatus(request.getStatus());
        }

        return mapToResponse(eventRepository.save(event));
    }

    @Override
    public void deleteEvent(Long id) {
        var user = SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new ForbiddenException("Access Denied: Only admins can manage events");
        }

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        eventRepository.delete(event);
    }

    @Override
    public EventResponseDTO closeRegistration(Long id) {
        var user = SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new ForbiddenException("Access Denied: Only admins can manage events");
        }

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        event.setActive(false);
        event.setStatus("CLOSED");

        return mapToResponse(eventRepository.save(event));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventResponseDTO> getEvents(Boolean active, int page, int size, String sortBy, String sortDir, String search) {
        org.springframework.data.domain.Sort sort = sortDir.equalsIgnoreCase("asc")
                ? org.springframework.data.domain.Sort.by(sortBy).ascending()
                : org.springframework.data.domain.Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        org.springframework.data.jpa.domain.Specification<Event> spec = org.springframework.data.jpa.domain.Specification
                .where(EventSpecifications.hasActive(active));

        if (org.springframework.util.StringUtils.hasText(search)) {
            spec = spec.and(EventSpecifications.searchByText(search));
        }

        Page<Event> events = eventRepository.findAll(spec, pageable);
        return events.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public EventResponseDTO getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        return mapToResponse(event);
    }

    @Override
    public EventRegistrationResponseDTO registerForEvent(Long eventId) {
        var user = SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.STUDENT) {
            throw new ForbiddenException("Access Denied: Only students can register for events");
        }

        Student student = studentRepository.findByEmail(user.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        if (!event.getActive()) {
            throw new BadRequestException("Event is closed/inactive");
        }

        if (LocalDateTime.now().isAfter(event.getRegistrationDeadline())) {
            throw new BadRequestException("Registration deadline has passed");
        }

        if (eventRegistrationRepository.existsByStudentIdAndEventId(student.getId(), event.getId())) {
            throw new ConflictException("Already registered for this event");
        }

        EventRegistration registration = EventRegistration.builder()
                .student(student)
                .event(event)
                .status("REGISTERED")
                .build();

        return mapToRegistrationResponse(eventRegistrationRepository.save(registration));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventRegistrationResponseDTO> getMyRegisteredEvents(int page, int size) {
        var user = SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.STUDENT) {
            throw new ForbiddenException("Access Denied: Only students can view their registered events");
        }

        Pageable pageable = PageRequest.of(page, size);
        return eventRegistrationRepository.findByStudentEmail(user.getUsername(), pageable)
                .map(this::mapToRegistrationResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventRegistrationResponseDTO> getEventRegistrations(Long eventId, int page, int size) {
        var user = SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new ForbiddenException("Access Denied: Only admins can view registrations");
        }

        Pageable pageable = PageRequest.of(page, size);
        return eventRegistrationRepository.findByEventIdWithStudentAndEvent(eventId, pageable)
                .map(this::mapToRegistrationResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EventRegistrationResponseDTO> getAllEventRegistrations(int page, int size) {
        var user = SecurityUtils.getCurrentUser();
        if (user == null || user.getRole() != com.company.learningmanagement.enums.Role.ADMIN) {
            throw new ForbiddenException("Access Denied: Only admins can view registrations");
        }

        Pageable pageable = PageRequest.of(page, size);
        return eventRegistrationRepository.findAllWithStudentAndEvent(pageable)
                .map(this::mapToRegistrationResponse);
    }

    private EventResponseDTO mapToResponse(Event e) {
        int count = eventRegistrationRepository.countByEventId(e.getId());
        return EventResponseDTO.builder()
                .id(e.getId())
                .title(e.getTitle())
                .description(e.getDescription())
                .image(e.getImage())
                .registrationDeadline(e.getRegistrationDeadline())
                .eventDate(e.getEventDate())
                .location(e.getLocation())
                .createdBy(e.getCreatedBy())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .active(e.getActive())
                .status(e.getStatus())
                .registrationCount(count)
                .build();
    }

    private EventRegistrationResponseDTO mapToRegistrationResponse(EventRegistration er) {
        String batchName = (er.getStudent() != null && er.getStudent().getBatch() != null) ? er.getStudent().getBatch().getBatchName() : null;
        String courseList = "";
        if (er.getStudent() != null) {
            courseList = courseEnrollmentRepository.findByStudentEmail(er.getStudent().getEmail()).stream()
                    .filter(enrollment -> enrollment.getStatus() == EnrollmentStatus.APPROVED)
                    .map(enrollment -> enrollment.getCourse().getTitle())
                    .collect(Collectors.joining(", "));
        }

        return EventRegistrationResponseDTO.builder()
                .id(er.getId())
                .eventId(er.getEvent() != null ? er.getEvent().getId() : null)
                .eventTitle(er.getEvent() != null ? er.getEvent().getTitle() : null)
                .studentName(er.getStudent() != null ? er.getStudent().getFullName() : null)
                .studentEmail(er.getStudent() != null ? er.getStudent().getEmail() : null)
                .batchName(batchName)
                .courses(courseList)
                .registrationDate(er.getRegisteredAt())
                .status(er.getStatus())
                .studentId(er.getStudent() != null ? "STU-" + er.getStudent().getId() : null)
                .phone(er.getStudent() != null ? er.getStudent().getPhone() : null)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public int getRegistrationCount(Long eventId) {
        return eventRegistrationRepository.countByEventId(eventId);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<EventRegistrationResponseDTO> getEventRegistrationsList(Long eventId) {
        return eventRegistrationRepository.findByEventIdWithStudentAndEvent(eventId, Pageable.unpaged())
                .getContent()
                .stream()
                .map(this::mapToRegistrationResponse)
                .collect(Collectors.toList());
    }
}
