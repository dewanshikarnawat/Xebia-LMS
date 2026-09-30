package com.company.learningmanagement.controller.lms;

import com.company.learningmanagement.dto.lms.ApiResponse;
import com.company.learningmanagement.dto.lms.EventRegistrationResponseDTO;
import com.company.learningmanagement.dto.lms.EventRequestDTO;
import com.company.learningmanagement.dto.lms.EventResponseDTO;
import com.company.learningmanagement.service.lms.EventService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.validation.Validator;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.core.MethodParameter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> createEvent(@RequestBody String requestBody) throws Exception {
        String trimmed = requestBody != null ? requestBody.trim() : "";
        
        java.lang.reflect.Method method = EventController.class.getMethod("createEvent", String.class);
        MethodParameter parameter = new MethodParameter(method, 0);

        if (trimmed.startsWith("[")) {
            // Handle array of EventRequestDTO
            List<EventRequestDTO> list = objectMapper.readValue(trimmed, 
                objectMapper.getTypeFactory().constructCollectionType(List.class, EventRequestDTO.class));
            
            if (list == null) {
                list = new ArrayList<>();
            }

            BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(list, "eventList");
            for (int i = 0; i < list.size(); i++) {
                EventRequestDTO dto = list.get(i);
                if (dto == null) {
                    continue;
                }
                BeanPropertyBindingResult itemBindingResult = new BeanPropertyBindingResult(dto, "item");
                validator.validate(dto, itemBindingResult);
                for (org.springframework.validation.FieldError fieldError : itemBindingResult.getFieldErrors()) {
                    bindingResult.addError(new org.springframework.validation.FieldError(
                        "eventList",
                        "[" + i + "]." + fieldError.getField(),
                        fieldError.getRejectedValue(),
                        fieldError.isBindingFailure(),
                        fieldError.getCodes(),
                        fieldError.getArguments(),
                        fieldError.getDefaultMessage()
                    ));
                }
            }

            if (bindingResult.hasErrors()) {
                throw new MethodArgumentNotValidException(parameter, bindingResult);
            }

            List<EventResponseDTO> createdEvents = new ArrayList<>();
            for (EventRequestDTO dto : list) {
                createdEvents.add(eventService.createEvent(dto));
            }
            ApiResponse response = new ApiResponse("Event created successfully", createdEvents);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } else {
            // Handle single EventRequestDTO
            EventRequestDTO dto = objectMapper.readValue(trimmed, EventRequestDTO.class);
            
            BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(dto, "eventRequestDTO");
            if (dto != null) {
                validator.validate(dto, bindingResult);
            } else {
                bindingResult.reject("request.body.empty", "Request body cannot be empty");
            }

            if (bindingResult.hasErrors()) {
                throw new MethodArgumentNotValidException(parameter, bindingResult);
            }

            EventResponseDTO event = eventService.createEvent(dto);
            ApiResponse response = new ApiResponse("Event created successfully", event);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateEvent(@PathVariable Long id, @Valid @RequestBody EventRequestDTO request) {
        EventResponseDTO event = eventService.updateEvent(id, request);
        ApiResponse response = new ApiResponse("Event updated successfully", event);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        ApiResponse response = new ApiResponse("Event deleted successfully", null);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> closeRegistration(@PathVariable Long id) {
        EventResponseDTO event = eventService.closeRegistration(id);
        ApiResponse response = new ApiResponse("Event registration closed successfully", event);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<ApiResponse> getEvents(
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search
    ) {
        Page<EventResponseDTO> events = eventService.getEvents(active, page, size, sortBy, sortDir, search);
        com.company.learningmanagement.dto.assignment.response.CustomPage<EventResponseDTO> customPage = 
                com.company.learningmanagement.dto.assignment.response.CustomPage.of(events);
        ApiResponse response = new ApiResponse("Events retrieved successfully", customPage);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<ApiResponse> getEventById(@PathVariable Long id) {
        EventResponseDTO event = eventService.getEventById(id);
        ApiResponse response = new ApiResponse("Event retrieved successfully", event);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/register")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse> registerForEvent(@PathVariable Long id) {
        EventRegistrationResponseDTO registration = eventService.registerForEvent(id);
        ApiResponse response = new ApiResponse("Registered for event successfully", registration);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/registrations/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse> getMyRegisteredEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<EventRegistrationResponseDTO> registrations = eventService.getMyRegisteredEvents(page, size);
        ApiResponse response = new ApiResponse("Your registered events retrieved successfully", registrations);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/registrations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getEventRegistrations(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<EventRegistrationResponseDTO> registrations = eventService.getEventRegistrations(id, page, size);
        ApiResponse response = new ApiResponse("Event registrations retrieved successfully", registrations);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/registrations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAllEventRegistrations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<EventRegistrationResponseDTO> registrations = eventService.getAllEventRegistrations(page, size);
        ApiResponse response = new ApiResponse("All event registrations retrieved successfully", registrations);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/registration-count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getEventRegistrationCount(@PathVariable Long id) {
        int count = eventService.getRegistrationCount(id);
        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("eventId", id);
        data.put("count", count);
        ApiResponse response = new ApiResponse("Registration count retrieved successfully", data);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/registrations/export")
    @PreAuthorize("hasRole('ADMIN')")
    public void exportEventRegistrations(@PathVariable Long id, jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        EventResponseDTO event = eventService.getEventById(id);
        List<EventRegistrationResponseDTO> registrations = eventService.getEventRegistrationsList(id);
        
        String filename = event.getTitle().replaceAll("[^a-zA-Z0-9]", "_") + "_Registrations.csv";
        
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
        
        java.io.PrintWriter writer = response.getWriter();
        writer.println("Student Name,Student Email,Student ID,Batch,Course,Registration Date,Status");
        
        for (EventRegistrationResponseDTO reg : registrations) {
            String studentName = reg.getStudentName() != null ? reg.getStudentName() : "";
            String studentEmail = reg.getStudentEmail() != null ? reg.getStudentEmail() : "";
            String studentId = reg.getStudentId() != null ? reg.getStudentId() : "";
            String batchName = reg.getBatchName() != null ? reg.getBatchName() : "";
            String courses = reg.getCourses() != null ? reg.getCourses() : "";
            String regDate = reg.getRegistrationDate() != null ? reg.getRegistrationDate().toString() : "";
            String status = reg.getStatus() != null ? reg.getStatus() : "";
            
            writer.println(String.format("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"",
                    studentName.replace("\"", "\"\""),
                    studentEmail.replace("\"", "\"\""),
                    studentId.replace("\"", "\"\""),
                    batchName.replace("\"", "\"\""),
                    courses.replace("\"", "\"\""),
                    regDate.replace("\"", "\"\""),
                    status.replace("\"", "\"\"")
            ));
        }
        writer.flush();
    }
}
