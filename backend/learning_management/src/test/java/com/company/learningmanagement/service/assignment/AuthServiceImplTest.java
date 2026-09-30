package com.company.learningmanagement.service.assignment;

import com.company.learningmanagement.config.JwtService;
import com.company.learningmanagement.dto.assignment.request.LoginRequest;
import com.company.learningmanagement.dto.assignment.request.StudentRegisterRequest;
import com.company.learningmanagement.dto.assignment.request.TeacherRegisterRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import com.company.learningmanagement.dto.assignment.response.AuthResponse;
import com.company.learningmanagement.dto.assignment.response.BulkRegistrationResponse;
import com.company.learningmanagement.entity.assignment.Batch;
import com.company.learningmanagement.entity.assignment.Student;
import com.company.learningmanagement.entity.assignment.Teacher;
import com.company.learningmanagement.enums.Role;
import com.company.learningmanagement.exception.assignment.BadRequestException;
import com.company.learningmanagement.exception.assignment.ConflictException;
import com.company.learningmanagement.repository.assignment.BatchRepository;
import com.company.learningmanagement.repository.assignment.StudentRepository;
import com.company.learningmanagement.repository.assignment.TeacherRepository;
import com.company.learningmanagement.security.CustomUserDetailsService;
import com.company.learningmanagement.service.assignment.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.support.TransactionTemplate;

import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceImplTest {

    @Mock
    private TeacherRepository teacherRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private BatchRepository batchRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private CustomUserDetailsService userDetailsService;
    @Mock
    private TransactionTemplate transactionTemplate;

    @InjectMocks
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        // Setup default behavior for TransactionTemplate execution simulating synchronous transaction commit
        lenient().doAnswer(invocation -> {
            java.util.function.Consumer<org.springframework.transaction.TransactionStatus> consumer = invocation.getArgument(0);
            consumer.accept(null);
            return null;
        }).when(transactionTemplate).executeWithoutResult(any());
    }

    @Test
    public void testRegisterTeacher_Success() {
        TeacherRegisterRequest request = TeacherRegisterRequest.builder()
                .fullName("John Teacher")
                .email("teacher@test.com")
                .password("Password123")
                .phone("1234567890")
                .build();

        when(teacherRepository.existsByEmail("teacher@test.com")).thenReturn(false);
        when(studentRepository.existsByEmail("teacher@test.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123")).thenReturn("encoded_pass");

        User userDetails = new User("teacher@test.com", "encoded_pass", Collections.emptyList());
        when(userDetailsService.loadUserByUsername("teacher@test.com")).thenReturn(userDetails);
        when(jwtService.generateToken(userDetails)).thenReturn("jwt_token_teacher");

        AuthResponse response = authService.registerTeacher(request);

        assertNotNull(response);
        assertEquals("teacher@test.com", response.getEmail());
        assertEquals("jwt_token_teacher", response.getToken());
        verify(teacherRepository, times(1)).saveAndFlush(any(Teacher.class));
    }

    @Test
    public void testRegisterTeacher_DuplicateEmail() {
        TeacherRegisterRequest request = TeacherRegisterRequest.builder()
                .fullName("John Teacher")
                .email("teacher@test.com")
                .password("Password123")
                .build();

        when(teacherRepository.existsByEmail("teacher@test.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.registerTeacher(request));
        verify(teacherRepository, never()).saveAndFlush(any());
    }

    @Test
    public void testRegisterTeacher_InvalidPassword() {
        TeacherRegisterRequest request = TeacherRegisterRequest.builder()
                .fullName("John Teacher")
                .email("teacher@test.com")
                .password("short")
                .build();

        assertThrows(BadRequestException.class, () -> authService.registerTeacher(request));
        verify(teacherRepository, never()).saveAndFlush(any());
    }

    @Test
    public void testRegisterTeachersBulk_SuccessAndErrors() {
        TeacherRegisterRequest req1 = TeacherRegisterRequest.builder()
                .fullName("Valid Teacher")
                .email("valid@test.com")
                .password("password")
                .build();

        TeacherRegisterRequest req2 = TeacherRegisterRequest.builder()
                .fullName("Duplicate In Req")
                .email("valid@test.com")
                .password("password")
                .build();

        TeacherRegisterRequest req3 = TeacherRegisterRequest.builder()
                .fullName("Invalid Email")
                .email("invalid_email")
                .password("password")
                .build();

        when(teacherRepository.existsByEmail("valid@test.com")).thenReturn(false);
        when(studentRepository.existsByEmail("valid@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encoded");

        BulkRegistrationResponse response = authService.registerTeachersBulk(Arrays.asList(req1, req2, req3));

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(3, response.getTotal());
        assertEquals(1, response.getRegistered());
        assertEquals(2, response.getFailed());
        assertEquals(2, response.getErrors().size());

        assertEquals("Duplicate email inside the same bulk request", response.getErrors().get(0).getReason());
        assertEquals("Invalid email format", response.getErrors().get(1).getReason());

        verify(teacherRepository, times(1)).saveAndFlush(any(Teacher.class));
    }

    @Test
    public void testLoginBulk_SuccessAndErrors() {
        LoginRequest req1 = new LoginRequest("user1@test.com", "password");
        LoginRequest req2 = new LoginRequest("invalid_user@test.com", "wrong_password");

        doAnswer(invocation -> {
            UsernamePasswordAuthenticationToken token = invocation.getArgument(0);
            if ("invalid_user@test.com".equals(token.getPrincipal())) {
                throw new org.springframework.security.authentication.BadCredentialsException("Invalid credentials");
            }
            return null;
        }).when(authenticationManager).authenticate(any());

        com.company.learningmanagement.security.CustomUserDetails userDetails = 
                new com.company.learningmanagement.security.CustomUserDetails("user1@test.com", "encoded", "User One", Role.STUDENT);

        when(userDetailsService.loadUserByUsername("user1@test.com")).thenReturn(userDetails);
        when(jwtService.generateToken(userDetails)).thenReturn("jwt_token_user1");

        com.company.learningmanagement.dto.assignment.response.BulkLoginResponse response = authService.loginBulk(Arrays.asList(req1, req2));

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals(2, response.getTotal());
        assertEquals(1, response.getSuccessful());
        assertEquals(1, response.getFailed());

        assertEquals("user1@test.com", response.getLogins().get(0).getEmail());
        assertEquals("jwt_token_user1", response.getLogins().get(0).getToken());
        assertEquals("User One", response.getLogins().get(0).getFullName());
        assertEquals("STUDENT", response.getLogins().get(0).getRole());

        assertEquals("invalid_user@test.com", response.getErrors().get(0).getEmail());
        assertEquals("Invalid credentials", response.getErrors().get(0).getReason());
    }
}
