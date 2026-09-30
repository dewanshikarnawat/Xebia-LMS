package com.company.learningmanagement.service.assignment.impl;

import com.company.learningmanagement.config.JwtService;
import com.company.learningmanagement.dto.assignment.request.LoginRequest;
import com.company.learningmanagement.dto.assignment.request.StudentRegisterRequest;
import com.company.learningmanagement.dto.assignment.request.TeacherRegisterRequest;
import com.company.learningmanagement.dto.assignment.response.AuthResponse;
import com.company.learningmanagement.entity.assignment.Student;
import com.company.learningmanagement.entity.assignment.Teacher;
import com.company.learningmanagement.enums.Role;
import com.company.learningmanagement.exception.assignment.BadRequestException;
import com.company.learningmanagement.repository.assignment.StudentRepository;
import com.company.learningmanagement.repository.assignment.TeacherRepository;
import com.company.learningmanagement.repository.assignment.BatchRepository;
import com.company.learningmanagement.entity.assignment.Batch;
import com.company.learningmanagement.service.assignment.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import com.company.learningmanagement.security.CustomUserDetailsService;
import com.company.learningmanagement.security.CustomUserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.company.learningmanagement.dto.assignment.response.BulkRegistrationResponse;
import com.company.learningmanagement.dto.assignment.response.BulkRegistrationError;
import com.company.learningmanagement.dto.assignment.response.BulkLoginResponse;
import com.company.learningmanagement.dto.assignment.response.BulkLoginResult;
import com.company.learningmanagement.dto.assignment.response.BulkLoginError;
import com.company.learningmanagement.exception.assignment.ConflictException;
import org.springframework.transaction.support.TransactionTemplate;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AuthServiceImpl.class);

    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final com.company.learningmanagement.repository.assignment.AdminRepository adminRepository;
    private final BatchRepository batchRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final TransactionTemplate transactionTemplate;

    private boolean isValidEmail(String email) {
        if (email == null) return false;
        return email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }

    private String getValidationError(TeacherRegisterRequest req) {
        if (req.getFullName() == null || req.getFullName().trim().isEmpty()) {
            return "Full name is required";
        }
        if (req.getFullName().trim().length() < 2 || req.getFullName().trim().length() > 100) {
            return "Full name must be between 2 and 100 characters";
        }
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            return "Email is required";
        }
        if (!isValidEmail(req.getEmail())) {
            return "Invalid email format";
        }
        if (req.getPassword() == null || req.getPassword().isEmpty()) {
            return "Password is required";
        }
        if (req.getPassword().length() < 6) {
            return "Password must be at least 6 characters long";
        }
        return null;
    }

    private String getValidationError(StudentRegisterRequest req) {
        if (req.getFullName() == null || req.getFullName().trim().isEmpty()) {
            return "Full name is required";
        }
        if (req.getFullName().trim().length() < 2 || req.getFullName().trim().length() > 100) {
            return "Full name must be between 2 and 100 characters";
        }
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            return "Email is required";
        }
        if (!isValidEmail(req.getEmail())) {
            return "Invalid email format";
        }
        if (req.getPassword() == null || req.getPassword().isEmpty()) {
            return "Password is required";
        }
        if (req.getPassword().length() < 6) {
            return "Password must be at least 6 characters long";
        }
        return null;
    }

    @Override
    @Transactional
    public AuthResponse registerTeacher(TeacherRegisterRequest request) {
        log.info("Registration started for teacher email: {}", request.getEmail());
        String valErr = getValidationError(request);
        if (valErr != null) {
            log.warn("Validation failure for email: {}. Reason: {}", request.getEmail(), valErr);
            throw new BadRequestException("Validation failed: " + valErr);
        }

        if (teacherRepository.existsByEmail(request.getEmail()) || studentRepository.existsByEmail(request.getEmail())) {
            log.warn("Duplicate email: {}", request.getEmail());
            throw new ConflictException("Email already exists");
        }

        Teacher teacher = Teacher.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.TEACHER)
                .build();

        try {
            teacherRepository.saveAndFlush(teacher);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            log.error("Database constraint violation for email: {}", request.getEmail());
            throw new ConflictException("Email already exists");
        }

        log.info("User registered successfully: {}", teacher.getEmail());
        var userDetails = userDetailsService.loadUserByUsername(teacher.getEmail());
        String token = jwtService.generateToken(userDetails);

        return buildAuthResponse(token, teacher.getEmail(), teacher.getFullName(), Role.TEACHER);
    }

    @Override
    @Transactional
    public AuthResponse registerStudent(StudentRegisterRequest request) {
        log.info("Registration started for student email: {}", request.getEmail());
        String valErr = getValidationError(request);
        if (valErr != null) {
            log.warn("Validation failure for email: {}. Reason: {}", request.getEmail(), valErr);
            throw new BadRequestException("Validation failed: " + valErr);
        }

        if (teacherRepository.existsByEmail(request.getEmail()) || studentRepository.existsByEmail(request.getEmail())) {
            log.warn("Duplicate email: {}", request.getEmail());
            throw new ConflictException("Email already exists");
        }

        Batch batch = null;
        if (request.getBatchId() != null) {
            batch = batchRepository.findById(request.getBatchId()).orElse(null);
        }

        Student student = Student.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .batch(batch)
                .role(Role.STUDENT)
                .build();

        try {
            studentRepository.saveAndFlush(student);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            log.error("Database constraint violation for email: {}", request.getEmail());
            throw new ConflictException("Email already exists");
        }

        log.info("User registered successfully: {}", student.getEmail());
        var userDetails = userDetailsService.loadUserByUsername(student.getEmail());
        String token = jwtService.generateToken(userDetails);

        return buildAuthResponse(token, student.getEmail(), student.getFullName(), Role.STUDENT);
    }

    @Override
    public AuthResponse registerAdmin(com.company.learningmanagement.dto.assignment.request.AdminRegisterRequest request) {
        log.info("Admin registration attempt for email: {}", request.getEmail());
        if (!isValidEmail(request.getEmail())) {
            log.warn("Invalid email format: {}", request.getEmail());
            throw new BadRequestException("Invalid email format");
        }

        if (adminRepository.existsByEmail(request.getEmail()) || 
            teacherRepository.existsByEmail(request.getEmail()) || 
            studentRepository.existsByEmail(request.getEmail())) {
            log.warn("Duplicate email: {}", request.getEmail());
            throw new com.company.learningmanagement.exception.assignment.ConflictException("Email already exists");
        }

        com.company.learningmanagement.entity.assignment.Admin admin = com.company.learningmanagement.entity.assignment.Admin.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.ADMIN)
                .build();

        try {
            adminRepository.saveAndFlush(admin);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            log.error("Database constraint violation for email: {}", request.getEmail());
            throw new com.company.learningmanagement.exception.assignment.ConflictException("Email already exists");
        }

        log.info("Admin registered successfully: {}", admin.getEmail());
        var userDetails = userDetailsService.loadUserByUsername(admin.getEmail());
        String token = jwtService.generateToken(userDetails);

        return buildAuthResponse(token, admin.getEmail(), admin.getFullName(), Role.ADMIN);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt started for user email: {}", request.getEmail());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        var userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtService.generateToken(userDetails);

        String fullName = "";
        Role role = Role.STUDENT;

        if (userDetails instanceof CustomUserDetails) {
            CustomUserDetails cud = (CustomUserDetails) userDetails;
            fullName = cud.getFullName();
            role = cud.getRole();
        }

        log.info("Login successful for user: {}", request.getEmail());
        return buildAuthResponse(token, request.getEmail(), fullName, role);
    }

    @Override
    public java.util.List<com.company.learningmanagement.dto.assignment.response.BatchResponse> getPublicBatches() {
        return batchRepository.findAll().stream()
                .map(b -> com.company.learningmanagement.dto.assignment.response.BatchResponse.builder()
                        .id(b.getId())
                        .batchName(b.getBatchName())
                        .description(b.getDescription())
                        .createdAt(b.getCreatedAt())
                        .updatedAt(b.getUpdatedAt())
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    @Transactional
    public AuthResponse updateProfile(String email, String newName) {
        userDetailsService.evict(email);
        var adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            com.company.learningmanagement.entity.assignment.Admin admin = adminOpt.get();
            admin.setFullName(newName);
            adminRepository.save(admin);
            
            var userDetails = userDetailsService.loadUserByUsername(email);
            String token = jwtService.generateToken(userDetails);
            return buildAuthResponse(token, email, admin.getFullName(), Role.ADMIN);
        }
        var teacherOpt = teacherRepository.findByEmail(email);
        if (teacherOpt.isPresent()) {
            Teacher teacher = teacherOpt.get();
            teacher.setFullName(newName);
            teacherRepository.save(teacher);
            
            var userDetails = userDetailsService.loadUserByUsername(email);
            String token = jwtService.generateToken(userDetails);
            return buildAuthResponse(token, email, teacher.getFullName(), Role.TEACHER);
        } else {
            var studentOpt = studentRepository.findByEmail(email);
            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                student.setFullName(newName);
                studentRepository.save(student);
                
                var userDetails = userDetailsService.loadUserByUsername(email);
                String token = jwtService.generateToken(userDetails);
                return buildAuthResponse(token, email, student.getFullName(), Role.STUDENT);
            }
        }
        throw new com.company.learningmanagement.exception.assignment.ResourceNotFoundException("User profile not found");
    }

    @Override
    public AuthResponse getProfile(String email) {
        var adminOpt = adminRepository.findByEmail(email);
        if (adminOpt.isPresent()) {
            com.company.learningmanagement.entity.assignment.Admin admin = adminOpt.get();
            var userDetails = userDetailsService.loadUserByUsername(email);
            String token = jwtService.generateToken(userDetails);
            return buildAuthResponse(token, email, admin.getFullName(), Role.ADMIN);
        }
        var teacherOpt = teacherRepository.findByEmail(email);
        if (teacherOpt.isPresent()) {
            Teacher teacher = teacherOpt.get();
            var userDetails = userDetailsService.loadUserByUsername(email);
            String token = jwtService.generateToken(userDetails);
            return buildAuthResponse(token, email, teacher.getFullName(), Role.TEACHER);
        } else {
            var studentOpt = studentRepository.findByEmail(email);
            if (studentOpt.isPresent()) {
                Student student = studentOpt.get();
                var userDetails = userDetailsService.loadUserByUsername(email);
                String token = jwtService.generateToken(userDetails);
                return buildAuthResponse(token, email, student.getFullName(), Role.STUDENT);
            }
        }
        throw new com.company.learningmanagement.exception.assignment.ResourceNotFoundException("User profile not found");
    }

    private AuthResponse buildAuthResponse(String token, String email, String fullName, Role role) {
        String lmsRole;
        if (role == Role.ADMIN) {
            lmsRole = "Admin";
        } else if (role == Role.TEACHER) {
            lmsRole = "Teacher";
        } else {
            lmsRole = "Student";
        }
        String avatarSeed = fullName != null ? fullName.replace(" ", "%20") : "";
        String avatarUrl = "https://api.dicebear.com/7.x/initials/svg?seed=" + avatarSeed;

        AuthResponse.LmsUser lmsUser = AuthResponse.LmsUser.builder()
                .email(email)
                .fullName(fullName)
                .role(lmsRole)
                .avatar(avatarUrl)
                .build();

        return AuthResponse.builder()
                .token(token)
                .email(email)
                .fullName(fullName)
                .role(role)
                .accessToken(token)
                .refreshToken("mock-refresh-token-" + email)
                .expiresIn(3600)
                .user(lmsUser)
                .build();
    }

    @Override
    public BulkRegistrationResponse registerTeachersBulk(java.util.List<TeacherRegisterRequest> requests) {
        log.info("Bulk teacher registration started with {} requests", requests.size());
        java.util.List<BulkRegistrationError> errors = new java.util.ArrayList<>();
        int registeredCount = 0;
        int failedCount = 0;
        java.util.Set<String> seenEmails = new java.util.HashSet<>();

        for (TeacherRegisterRequest req : requests) {
            String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : "";
            log.info("Processing teacher registration in bulk for: {}", email);

            // 1. Validation Check
            String valErr = getValidationError(req);
            if (valErr != null) {
                log.warn("Validation failure for email: {}. Reason: {}", email, valErr);
                errors.add(new BulkRegistrationError(email, valErr));
                failedCount++;
                continue;
            }

            // 2. Duplicate Check in Request
            if (seenEmails.contains(email)) {
                log.warn("Duplicate email: {}", email);
                errors.add(new BulkRegistrationError(email, "Duplicate email inside the same bulk request"));
                failedCount++;
                continue;
            }
            seenEmails.add(email);

            // 3. Duplicate Check in DB (Pre-check)
            if (teacherRepository.existsByEmail(req.getEmail()) || studentRepository.existsByEmail(req.getEmail())) {
                log.warn("Duplicate email: {}", email);
                errors.add(new BulkRegistrationError(req.getEmail(), "Email already exists"));
                failedCount++;
                continue;
            }

            // 4. Save User in Transaction
            try {
                transactionTemplate.executeWithoutResult(status -> {
                    Teacher teacher = Teacher.builder()
                            .fullName(req.getFullName())
                            .email(req.getEmail())
                            .password(passwordEncoder.encode(req.getPassword()))
                            .phone(req.getPhone())
                            .role(Role.TEACHER)
                            .build();
                    teacherRepository.saveAndFlush(teacher);
                });
                log.info("User registered successfully: {}", req.getEmail());
                registeredCount++;
            } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                log.error("Database constraint violation for email: {}", req.getEmail());
                errors.add(new BulkRegistrationError(req.getEmail(), "Email already exists"));
                failedCount++;
            } catch (Exception ex) {
                log.error("Unexpected error registering user {} in bulk: {}", req.getEmail(), ex.getMessage());
                errors.add(new BulkRegistrationError(req.getEmail(), ex.getMessage()));
                failedCount++;
            }
        }

        log.info("Bulk registration completed. Total: {}, Registered: {}, Failed: {}", requests.size(), registeredCount, failedCount);
        return BulkRegistrationResponse.builder()
                .success(registeredCount > 0)
                .total(requests.size())
                .registered(registeredCount)
                .failed(failedCount)
                .errors(errors)
                .build();
    }

    @Override
    public BulkRegistrationResponse registerStudentsBulk(java.util.List<StudentRegisterRequest> requests) {
        log.info("Bulk student registration started with {} requests", requests.size());
        java.util.List<BulkRegistrationError> errors = new java.util.ArrayList<>();
        int registeredCount = 0;
        int failedCount = 0;
        java.util.Set<String> seenEmails = new java.util.HashSet<>();

        for (StudentRegisterRequest req : requests) {
            String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : "";
            log.info("Processing student registration in bulk for: {}", email);

            // 1. Validation Check
            String valErr = getValidationError(req);
            if (valErr != null) {
                log.warn("Validation failure for email: {}. Reason: {}", email, valErr);
                errors.add(new BulkRegistrationError(email, valErr));
                failedCount++;
                continue;
            }

            // 2. Duplicate Check in Request
            if (seenEmails.contains(email)) {
                log.warn("Duplicate email: {}", email);
                errors.add(new BulkRegistrationError(email, "Duplicate email inside the same bulk request"));
                failedCount++;
                continue;
            }
            seenEmails.add(email);

            // 3. Duplicate Check in DB (Pre-check)
            if (teacherRepository.existsByEmail(req.getEmail()) || studentRepository.existsByEmail(req.getEmail())) {
                log.warn("Duplicate email: {}", email);
                errors.add(new BulkRegistrationError(req.getEmail(), "Email already exists"));
                failedCount++;
                continue;
            }

            // 4. Save User in Transaction
            try {
                Batch batch = null;
                if (req.getBatchId() != null) {
                    batch = batchRepository.findById(req.getBatchId()).orElse(null);
                }
                final Batch finalBatch = batch;

                transactionTemplate.executeWithoutResult(status -> {
                    Student student = Student.builder()
                            .fullName(req.getFullName())
                            .email(req.getEmail())
                            .password(passwordEncoder.encode(req.getPassword()))
                            .phone(req.getPhone())
                            .batch(finalBatch)
                            .role(Role.STUDENT)
                            .build();
                    studentRepository.saveAndFlush(student);
                });
                log.info("User registered successfully: {}", req.getEmail());
                registeredCount++;
            } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                log.error("Database constraint violation for email: {}", req.getEmail());
                errors.add(new BulkRegistrationError(req.getEmail(), "Email already exists"));
                failedCount++;
            } catch (Exception ex) {
                log.error("Unexpected error registering user {} in bulk: {}", req.getEmail(), ex.getMessage());
                errors.add(new BulkRegistrationError(req.getEmail(), ex.getMessage()));
                failedCount++;
            }
        }

        log.info("Bulk registration completed. Total: {}, Registered: {}, Failed: {}", requests.size(), registeredCount, failedCount);
        return BulkRegistrationResponse.builder()
                .success(registeredCount > 0)
                .total(requests.size())
                .registered(registeredCount)
                .failed(failedCount)
                .errors(errors)
                .build();
    }

    @Override
    public BulkLoginResponse loginBulk(java.util.List<LoginRequest> requests) {
        log.info("Bulk login started with {} requests", requests.size());
        java.util.List<BulkLoginResult> logins = new java.util.ArrayList<>();
        java.util.List<BulkLoginError> errors = new java.util.ArrayList<>();
        int successfulCount = 0;
        int failedCount = 0;

        for (LoginRequest req : requests) {
            String email = req.getEmail() != null ? req.getEmail().trim().toLowerCase() : "";
            log.info("Processing login in bulk for: {}", email);

            if (req.getEmail() == null || req.getEmail().trim().isEmpty() ||
                req.getPassword() == null || req.getPassword().isEmpty()) {
                log.warn("Validation failure for login email: {}", email);
                errors.add(new BulkLoginError(email, "Email and password are required"));
                failedCount++;
                continue;
            }

            try {
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
                );

                var userDetails = userDetailsService.loadUserByUsername(req.getEmail());
                String token = jwtService.generateToken(userDetails);

                String fullName = "";
                Role role = Role.STUDENT;

                if (userDetails instanceof CustomUserDetails) {
                    CustomUserDetails cud = (CustomUserDetails) userDetails;
                    fullName = cud.getFullName();
                    role = cud.getRole();
                }

                log.info("Bulk login successful for user: {}", req.getEmail());
                logins.add(BulkLoginResult.builder()
                        .email(req.getEmail())
                        .token(token)
                        .fullName(fullName)
                        .role(role.name())
                        .build());
                successfulCount++;
            } catch (org.springframework.security.core.AuthenticationException ex) {
                log.warn("Authentication failed in bulk login for {}: {}", req.getEmail(), ex.getMessage());
                errors.add(new BulkLoginError(req.getEmail(), "Invalid credentials"));
                failedCount++;
            } catch (Exception ex) {
                log.error("Unexpected error during bulk login for {}: {}", req.getEmail(), ex.getMessage());
                errors.add(new BulkLoginError(req.getEmail(), ex.getMessage()));
                failedCount++;
            }
        }

        log.info("Bulk login completed. Total: {}, Successful: {}, Failed: {}", requests.size(), successfulCount, failedCount);
        return BulkLoginResponse.builder()
                .success(successfulCount > 0)
                .total(requests.size())
                .successful(successfulCount)
                .failed(failedCount)
                .logins(logins)
                .errors(errors)
                .build();
    }
}
