package com.company.learningmanagement.service.assignment;

import com.company.learningmanagement.cache.lms.RedisService;
import com.company.learningmanagement.dto.lms.*;
import com.company.learningmanagement.entity.assignment.Student;
import com.company.learningmanagement.entity.assignment.Teacher;
import com.company.learningmanagement.entity.lms.learning.*;
import com.company.learningmanagement.enums.Role;
import com.company.learningmanagement.exception.assignment.BadRequestException;
import com.company.learningmanagement.exception.assignment.ConflictException;
import com.company.learningmanagement.exception.assignment.ForbiddenException;
import com.company.learningmanagement.repository.assignment.StudentRepository;
import com.company.learningmanagement.repository.assignment.TeacherRepository;
import com.company.learningmanagement.repository.lms.*;
import com.company.learningmanagement.security.CustomUserDetails;
import com.company.learningmanagement.service.lms.impl.*;
import com.company.learningmanagement.util.SecurityUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

public class LmsSecurityAndFeatureTests {

    private CourseEnrollmentRepository courseEnrollmentRepository;
    private CourseRepository courseRepository;
    private StudentRepository studentRepository;
    private TeacherRepository teacherRepository;
    private ModuleRepository moduleRepository;
    private SubmoduleRepository submoduleRepository;
    private ContentRepository contentRepository;
    private EventRepository eventRepository;
    private EventRegistrationRepository eventRegistrationRepository;
    private RedisService redisService;
    private TransactionTemplate transactionTemplate;
    private jakarta.validation.Validator validator;

    private CourseEnrollmentServiceImpl courseEnrollmentService;
    private CourseServiceImpl courseService;
    private ModuleServiceImpl moduleService;
    private SubmoduleServiceImpl submoduleService;
    private ContentServiceImpl contentService;
    private EventServiceImpl eventService;

    private MockedStatic<SecurityUtils> mockedSecurityUtils;

    @BeforeEach
    public void setUp() {
        courseEnrollmentRepository = mock(CourseEnrollmentRepository.class);
        courseRepository = mock(CourseRepository.class);
        studentRepository = mock(StudentRepository.class);
        teacherRepository = mock(TeacherRepository.class);
        moduleRepository = mock(ModuleRepository.class);
        submoduleRepository = mock(SubmoduleRepository.class);
        contentRepository = mock(ContentRepository.class);
        eventRepository = mock(EventRepository.class);
        eventRegistrationRepository = mock(EventRegistrationRepository.class);
        redisService = mock(RedisService.class);
        transactionTemplate = mock(TransactionTemplate.class);
        validator = mock(jakarta.validation.Validator.class);

        courseEnrollmentService = new CourseEnrollmentServiceImpl(
                courseEnrollmentRepository, courseRepository, studentRepository
        );

        courseService = new CourseServiceImpl(
                courseRepository, mock(CategoryRepository.class), redisService, teacherRepository, courseEnrollmentRepository
        );

        moduleService = new ModuleServiceImpl(
                moduleRepository, courseRepository, redisService
        );

        submoduleService = new SubmoduleServiceImpl(
                submoduleRepository, moduleRepository, redisService, courseRepository
        );

        contentService = new ContentServiceImpl(
                contentRepository, submoduleRepository, redisService, courseRepository
        );

        eventService = new EventServiceImpl(
                eventRepository, eventRegistrationRepository, studentRepository, courseEnrollmentRepository
        );

        mockedSecurityUtils = mockStatic(SecurityUtils.class);
    }

    @AfterEach
    public void tearDown() {
        mockedSecurityUtils.close();
    }

    private void mockCurrentUser(String email, Role role) {
        CustomUserDetails userDetails = new CustomUserDetails(email, "password", "Test User", role);
        mockedSecurityUtils.when(SecurityUtils::getCurrentUser).thenReturn(userDetails);
    }

    @Test
    public void testStudentEnrollmentRequestSuccess() {
        mockCurrentUser("student@example.com", Role.STUDENT);

        Student student = Student.builder().id(1L).email("student@example.com").build();
        CourseEntity course = CourseEntity.builder().id(10L).title("Java Spring Boot").build();

        when(studentRepository.findByEmail("student@example.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));
        when(courseEnrollmentRepository.existsByStudentIdAndCourseId(1L, 10L)).thenReturn(false);
        when(courseEnrollmentRepository.save(any(CourseEnrollment.class))).thenAnswer(inv -> inv.getArgument(0));

        CourseEnrollment enrollment = courseEnrollmentService.requestEnrollment(10L);

        assertNotNull(enrollment);
        assertEquals(student, enrollment.getStudent());
        assertEquals(course, enrollment.getCourse());
        assertEquals(EnrollmentStatus.PENDING, enrollment.getStatus());
        assertNotNull(enrollment.getEnrolledAt());
    }

    @Test
    public void testStudentEnrollmentRequestDuplicate() {
        mockCurrentUser("student@example.com", Role.STUDENT);

        Student student = Student.builder().id(1L).email("student@example.com").build();
        CourseEntity course = CourseEntity.builder().id(10L).title("Java Spring Boot").build();

        when(studentRepository.findByEmail("student@example.com")).thenReturn(Optional.of(student));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));
        when(courseEnrollmentRepository.existsByStudentIdAndCourseId(1L, 10L)).thenReturn(true);

        assertThrows(ConflictException.class, () -> courseEnrollmentService.requestEnrollment(10L));
    }

    @Test
    public void testEnrollmentApprovalSuccess() {
        mockCurrentUser("admin@xebia.com", Role.ADMIN);

        Student student = Student.builder().id(1L).email("student@example.com").build();
        CourseEntity course = CourseEntity.builder().id(10L).title("Java Spring Boot").build();
        CourseEnrollment enrollment = CourseEnrollment.builder()
                .id(100L)
                .student(student)
                .course(course)
                .status(EnrollmentStatus.PENDING)
                .build();

        when(courseEnrollmentRepository.findById(100L)).thenReturn(Optional.of(enrollment));
        when(courseEnrollmentRepository.save(any(CourseEnrollment.class))).thenAnswer(inv -> inv.getArgument(0));

        CourseEnrollment approved = courseEnrollmentService.approveEnrollment(100L, "Approved remarks");

        assertNotNull(approved);
        assertEquals(EnrollmentStatus.APPROVED, approved.getStatus());
        assertEquals("admin@xebia.com", approved.getApprovedBy());
        assertNotNull(approved.getApprovedAt());
        assertEquals("Approved remarks", approved.getRemarks());
    }

    @Test
    public void testContentFilteringForUnapprovedStudents() {
        mockCurrentUser("student@example.com", Role.STUDENT);

        // Course details hierarchy
        ContentEntity content = ContentEntity.builder().id(300L).title("Lesson 1").build();
        List<ContentEntity> contents = new ArrayList<>();
        contents.add(content);

        SubmoduleEntity submodule = SubmoduleEntity.builder().id(200L).title("Sub 1").contents(contents).slug("sub-1").build();
        List<SubmoduleEntity> submodules = new ArrayList<>();
        submodules.add(submodule);

        ModuleEntity module = ModuleEntity.builder().id(100L).title("Mod 1").submodules(submodules).build();
        List<ModuleEntity> modules = new ArrayList<>();
        modules.add(module);

        CourseEntity course = CourseEntity.builder()
                .id(10L)
                .title("Java Spring Boot")
                .slug("java-spring-boot")
                .modules(modules)
                .build();

        when(courseRepository.findByIdWithModules(10L)).thenReturn(Optional.of(course));
        when(courseEnrollmentRepository.existsByStudentEmailAndCourseIdAndStatus(
                "student@example.com", 10L, EnrollmentStatus.APPROVED
        )).thenReturn(false); // Unapproved

        CourseResponseDTO result = courseService.getById(10L);

        assertNotNull(result);
        assertEquals(1, result.getModules().size());
        assertEquals(1, result.getModules().get(0).getSubmodules().size());
        // Verify contents are cleared
        assertTrue(result.getModules().get(0).getSubmodules().get(0).getContents().isEmpty());
    }

    @Test
    public void testContentFilteringForApprovedStudents() {
        mockCurrentUser("student@example.com", Role.STUDENT);

        ContentEntity content = ContentEntity.builder().id(300L).title("Lesson 1").isActive(true).type("TEXT").build();
        List<ContentEntity> contents = new ArrayList<>();
        contents.add(content);

        SubmoduleEntity submodule = SubmoduleEntity.builder().id(200L).title("Sub 1").contents(contents).slug("sub-1").isActive(true).build();
        List<SubmoduleEntity> submodules = new ArrayList<>();
        submodules.add(submodule);

        ModuleEntity module = ModuleEntity.builder().id(100L).title("Mod 1").submodules(submodules).isActive(true).build();
        List<ModuleEntity> modules = new ArrayList<>();
        modules.add(module);

        CourseEntity course = CourseEntity.builder()
                .id(10L)
                .title("Java Spring Boot")
                .slug("java-spring-boot")
                .modules(modules)
                .isActive(true)
                .build();

        when(courseRepository.findByIdWithModules(10L)).thenReturn(Optional.of(course));
        when(courseEnrollmentRepository.existsByStudentEmailAndCourseIdAndStatus(
                "student@example.com", 10L, EnrollmentStatus.APPROVED
        )).thenReturn(true); // Approved

        CourseResponseDTO result = courseService.getById(10L);

        assertNotNull(result);
        assertEquals(1, result.getModules().size());
        assertEquals(1, result.getModules().get(0).getSubmodules().size());
        // Verify contents are NOT cleared
        assertEquals(1, result.getModules().get(0).getSubmodules().get(0).getContents().size());
    }

    @Test
    public void testTeacherCourseAssignmentSecurityUpdateSuccess() {
        mockCurrentUser("teacher@example.com", Role.TEACHER);

        CourseEntity course = CourseEntity.builder().id(10L).title("Java Spring Boot").build();
        ModuleEntity module = ModuleEntity.builder().id(100L).title("Mod 1").course(course).build();

        when(moduleRepository.findById(100L)).thenReturn(Optional.of(module));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));
        when(courseRepository.isTeacherAssignedToCourse(10L, "teacher@example.com")).thenReturn(true); // Assigned
        when(moduleRepository.save(any(ModuleEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        ModuleRequestDTO request = ModuleRequestDTO.builder().title("Updated Title").courseId(10L).build();
        ModuleResponseDTO response = moduleService.update(100L, request);

        assertNotNull(response);
        assertEquals("Updated Title", response.getTitle());
    }

    @Test
    public void testTeacherCourseAssignmentSecurityUpdateDenied() {
        mockCurrentUser("teacher@example.com", Role.TEACHER);

        CourseEntity course = CourseEntity.builder().id(10L).title("Java Spring Boot").build();
        ModuleEntity module = ModuleEntity.builder().id(100L).title("Mod 1").course(course).build();

        when(moduleRepository.findById(100L)).thenReturn(Optional.of(module));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));
        when(courseRepository.isTeacherAssignedToCourse(10L, "teacher@example.com")).thenReturn(false); // NOT Assigned

        ModuleRequestDTO request = ModuleRequestDTO.builder().title("Updated Title").courseId(10L).build();

        assertThrows(ForbiddenException.class, () -> moduleService.update(100L, request));
    }

    @Test
    public void testEventRegistrationDuplicate() {
        mockCurrentUser("student@example.com", Role.STUDENT);

        Student student = Student.builder().id(1L).email("student@example.com").build();
        Event event = Event.builder()
                .id(50L)
                .title("Tech Talk")
                .active(true)
                .registrationDeadline(LocalDateTime.now().plusDays(2))
                .build();

        when(studentRepository.findByEmail("student@example.com")).thenReturn(Optional.of(student));
        when(eventRepository.findById(50L)).thenReturn(Optional.of(event));
        when(eventRegistrationRepository.existsByStudentIdAndEventId(1L, 50L)).thenReturn(true); // Already registered

        assertThrows(ConflictException.class, () -> eventService.registerForEvent(50L));
    }

    @Test
    public void testEventRegistrationAfterDeadline() {
        mockCurrentUser("student@example.com", Role.STUDENT);

        Student student = Student.builder().id(1L).email("student@example.com").build();
        Event event = Event.builder()
                .id(50L)
                .title("Tech Talk")
                .active(true)
                .registrationDeadline(LocalDateTime.now().minusDays(1)) // Deadline in past
                .build();

        when(studentRepository.findByEmail("student@example.com")).thenReturn(Optional.of(student));
        when(eventRepository.findById(50L)).thenReturn(Optional.of(event));

        assertThrows(BadRequestException.class, () -> eventService.registerForEvent(50L));
    }
}
