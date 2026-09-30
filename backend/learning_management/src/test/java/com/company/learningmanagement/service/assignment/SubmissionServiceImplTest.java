package com.company.learningmanagement.service.assignment;

import com.company.learningmanagement.dto.assignment.request.StudentSubmitRequest;
import com.company.learningmanagement.entity.assignment.Assignment;
import com.company.learningmanagement.entity.assignment.Batch;
import com.company.learningmanagement.entity.assignment.Student;
import com.company.learningmanagement.entity.assignment.Teacher;
import com.company.learningmanagement.enums.AssignmentType;
import com.company.learningmanagement.enums.Role;
import com.company.learningmanagement.exception.assignment.BadRequestException;
import com.company.learningmanagement.mapper.assignment.SubmissionMapper;
import com.company.learningmanagement.mapper.assignment.UserMapper;
import com.company.learningmanagement.repository.assignment.AssignmentRepository;
import com.company.learningmanagement.repository.assignment.QuestionRepository;
import com.company.learningmanagement.repository.assignment.StudentRepository;
import com.company.learningmanagement.repository.assignment.SubmissionRepository;
import com.company.learningmanagement.repository.assignment.TeacherRepository;
import com.company.learningmanagement.service.assignment.impl.SubmissionServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceImplTest {

    @Mock
    private SubmissionRepository submissionRepository;
    @Mock
    private AssignmentRepository assignmentRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private TeacherRepository teacherRepository;
    @Mock
    private CloudinaryService cloudinaryService;
    @Mock
    private RedisService redisService;
    @Mock
    private SubmissionMapper submissionMapper;
    @Mock
    private UserMapper userMapper;
    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private ObjectMapper objectMapper;
    @Mock
    private CertificateService certificateService;

    @InjectMocks
    private SubmissionServiceImpl submissionService;

    @Test
    void submitAssignment_shouldThrowBadRequestWhenAssignmentHasNoBatch() throws Exception {
        Student student = Student.builder()
                .id(1L)
                .email("student@test.com")
                .role(Role.STUDENT)
                .batch(Batch.builder().id(10L).build())
                .build();

        Assignment assignment = Assignment.builder()
                .id(2L)
                .assignmentType(AssignmentType.QUIZ)
                .dueDate(LocalDate.now().plusDays(1))
                .dueTime(LocalTime.NOON)
                .lateSubmissionAllowed(false)
                .build();

        when(studentRepository.findByEmail("student@test.com")).thenReturn(Optional.of(student));
        when(assignmentRepository.findById(2L)).thenReturn(Optional.of(assignment));

        StudentSubmitRequest request = StudentSubmitRequest.builder()
                .quizAnswersJson("[{\"questionId\":1,\"selectedOption\":\"A\"}]")
                .build();

        BadRequestException exception = assertThrows(BadRequestException.class,
                () -> submissionService.submitAssignment(2L, request, "student@test.com"));

        assertEquals("This assignment is not assigned to a batch", exception.getMessage());
    }
}
