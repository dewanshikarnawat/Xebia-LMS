package com.company.learningmanagement.controller.lms;

import com.company.learningmanagement.dto.lms.EventRequestDTO;
import com.company.learningmanagement.dto.lms.EventResponseDTO;
import com.company.learningmanagement.service.lms.EventService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

public class EventControllerTest {

    private MockMvc mockMvc;

    @Mock
    private EventService eventService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private EventController eventController;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        
        // Register JavaTimeModule to handle Java 8 Date/Time types correctly
        objectMapper.registerModule(new JavaTimeModule());
        
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();
        
        eventController = new EventController(eventService, objectMapper, validator);
        
        mockMvc = MockMvcBuilders.standaloneSetup(eventController)
                .setControllerAdvice(new com.company.learningmanagement.exception.lms.GlobalExceptionHandler())
                .build();
    }

    @Test
    public void testCreateSingleEvent_Success() throws Exception {
        EventRequestDTO request = EventRequestDTO.builder()
                .title("Hackathon")
                .description("College Event")
                .eventDate(LocalDateTime.now().plusDays(2))
                .registrationDeadline(LocalDateTime.now().plusDays(1))
                .build();

        EventResponseDTO response = EventResponseDTO.builder()
                .id(1L)
                .title("Hackathon")
                .description("College Event")
                .build();

        when(eventService.createEvent(any(EventRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Event created successfully"))
                .andExpect(jsonPath("$.data.title").value("Hackathon"));
    }

    @Test
    public void testCreateSingleEvent_ValidationFailure() throws Exception {
        EventRequestDTO request = EventRequestDTO.builder()
                .title("") // Blank title is invalid
                .description("College Event")
                .eventDate(LocalDateTime.now().plusDays(2))
                .registrationDeadline(LocalDateTime.now().plusDays(1))
                .build();

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.data.title").value("Title is required"));
    }

    @Test
    public void testCreateBulkEvents_Success() throws Exception {
        EventRequestDTO request1 = EventRequestDTO.builder()
                .title("Hackathon 1")
                .description("College Event 1")
                .eventDate(LocalDateTime.now().plusDays(2))
                .registrationDeadline(LocalDateTime.now().plusDays(1))
                .build();

        EventRequestDTO request2 = EventRequestDTO.builder()
                .title("Hackathon 2")
                .description("College Event 2")
                .eventDate(LocalDateTime.now().plusDays(3))
                .registrationDeadline(LocalDateTime.now().plusDays(2))
                .build();

        EventResponseDTO response1 = EventResponseDTO.builder()
                .id(1L)
                .title("Hackathon 1")
                .description("College Event 1")
                .build();

        EventResponseDTO response2 = EventResponseDTO.builder()
                .id(2L)
                .title("Hackathon 2")
                .description("College Event 2")
                .build();

        when(eventService.createEvent(any(EventRequestDTO.class)))
                .thenReturn(response1)
                .thenReturn(response2);

        List<EventRequestDTO> bulkRequest = List.of(request1, request2);

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bulkRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Event created successfully"))
                .andExpect(jsonPath("$.data[0].title").value("Hackathon 1"))
                .andExpect(jsonPath("$.data[1].title").value("Hackathon 2"));
    }

    @Test
    public void testCreateBulkEvents_ValidationFailure() throws Exception {
        EventRequestDTO request1 = EventRequestDTO.builder()
                .title("") // Blank title is invalid
                .description("College Event 1")
                .eventDate(LocalDateTime.now().plusDays(2))
                .registrationDeadline(LocalDateTime.now().plusDays(1))
                .build();

        EventRequestDTO request2 = EventRequestDTO.builder()
                .title("Hackathon 2")
                .description("College Event 2")
                .eventDate(LocalDateTime.now().plusDays(3))
                .registrationDeadline(LocalDateTime.now().plusDays(2))
                .build();

        List<EventRequestDTO> bulkRequest = List.of(request1, request2);

        mockMvc.perform(post("/api/events")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bulkRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.data['[0].title']").value("Title is required"));
    }
}
