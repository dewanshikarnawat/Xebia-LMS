package com.company.learningmanagement.controller.assignment;

import com.company.learningmanagement.dto.assignment.request.LoginRequest;
import com.company.learningmanagement.dto.assignment.request.StudentRegisterRequest;
import com.company.learningmanagement.dto.assignment.request.TeacherRegisterRequest;
import com.company.learningmanagement.dto.assignment.response.ApiResponse;
import com.company.learningmanagement.dto.assignment.response.AuthResponse;
import com.company.learningmanagement.service.assignment.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    private void setJwtCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("JWT_TOKEN", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // In production, set to true to enforce HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60); // 24 hours
        response.addCookie(cookie);
    }

    @PostMapping("/register/teacher")
    public ResponseEntity<ApiResponse<Object>> registerTeacher(
            @RequestBody String requestBody,
            HttpServletResponse servletResponse
    ) throws Exception {
        String trimmed = requestBody.trim();
        if (trimmed.startsWith("[")) {
            java.util.List<TeacherRegisterRequest> requests = objectMapper.readValue(
                    trimmed,
                    new com.fasterxml.jackson.core.type.TypeReference<java.util.List<TeacherRegisterRequest>>() {}
            );
            com.company.learningmanagement.dto.assignment.response.BulkRegistrationResponse response = authService.registerTeachersBulk(requests);
            return ResponseEntity.status(response.isSuccess() ? 201 : 200)
                    .body(ApiResponse.success("Bulk teacher registration completed", response));
        } else {
            TeacherRegisterRequest request = objectMapper.readValue(trimmed, TeacherRegisterRequest.class);
            AuthResponse response = authService.registerTeacher(request);
            setJwtCookie(servletResponse, response.getToken());
            return ResponseEntity.status(201)
                    .body(ApiResponse.success("Teacher registered successfully", response));
        }
    }

    @PostMapping("/register/admin")
    public ResponseEntity<ApiResponse<Object>> registerAdmin(
            @RequestBody String requestBody,
            HttpServletResponse servletResponse
    ) throws Exception {
        String trimmed = requestBody.trim();
        com.company.learningmanagement.dto.assignment.request.AdminRegisterRequest request = objectMapper.readValue(trimmed, com.company.learningmanagement.dto.assignment.request.AdminRegisterRequest.class);
        AuthResponse response = authService.registerAdmin(request);
        setJwtCookie(servletResponse, response.getToken());
        return ResponseEntity.status(201)
                .body(ApiResponse.success("Admin registered successfully", response));
    }

    @PostMapping("/register/student")
    public ResponseEntity<ApiResponse<Object>> registerStudent(
            @RequestBody String requestBody,
            HttpServletResponse servletResponse
    ) throws Exception {
        String trimmed = requestBody.trim();
        if (trimmed.startsWith("[")) {
            java.util.List<StudentRegisterRequest> requests = objectMapper.readValue(
                    trimmed,
                    new com.fasterxml.jackson.core.type.TypeReference<java.util.List<StudentRegisterRequest>>() {}
            );
            com.company.learningmanagement.dto.assignment.response.BulkRegistrationResponse response = authService.registerStudentsBulk(requests);
            return ResponseEntity.status(response.isSuccess() ? 201 : 200)
                    .body(ApiResponse.success("Bulk student registration completed", response));
        } else {
            StudentRegisterRequest request = objectMapper.readValue(trimmed, StudentRegisterRequest.class);
            AuthResponse response = authService.registerStudent(request);
            setJwtCookie(servletResponse, response.getToken());
            return ResponseEntity.status(201)
                    .body(ApiResponse.success("Student registered successfully", response));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Object>> login(
            @RequestBody String requestBody,
            HttpServletResponse servletResponse
    ) throws Exception {
        String trimmed = requestBody.trim();
        if (trimmed.startsWith("[")) {
            java.util.List<LoginRequest> requests = objectMapper.readValue(
                    trimmed,
                    new com.fasterxml.jackson.core.type.TypeReference<java.util.List<LoginRequest>>() {}
            );
            com.company.learningmanagement.dto.assignment.response.BulkLoginResponse response = authService.loginBulk(requests);
            return ResponseEntity.ok(ApiResponse.success("Bulk login completed", response));
        } else {
            LoginRequest request = objectMapper.readValue(trimmed, LoginRequest.class);
            AuthResponse response = authService.login(request);
            setJwtCookie(servletResponse, response.getToken());
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse servletResponse) {
        Cookie cookie = new Cookie("JWT_TOKEN", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        servletResponse.addCookie(cookie);
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }

    @GetMapping("/batches")
    public ResponseEntity<ApiResponse<java.util.List<com.company.learningmanagement.dto.assignment.response.BatchResponse>>> getPublicBatches() {
        java.util.List<com.company.learningmanagement.dto.assignment.response.BatchResponse> response = authService.getPublicBatches();
        return ResponseEntity.ok(ApiResponse.success("Batches retrieved successfully", response));
    }

    @PutMapping("/profile/update")
    public ResponseEntity<ApiResponse<AuthResponse>> updateProfile(
            @RequestParam("name") String name,
            java.security.Principal principal
    ) {
        if (principal == null) {
            throw new com.company.learningmanagement.exception.assignment.UnauthorizedException("Access Denied: You must be logged in to update your profile");
        }
        AuthResponse response = authService.updateProfile(principal.getName(), name);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<AuthResponse>> getProfile(java.security.Principal principal) {
        if (principal == null) {
            throw new com.company.learningmanagement.exception.assignment.UnauthorizedException("Access Denied: You must be logged in to view your profile");
        }
        AuthResponse response = authService.getProfile(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }

    public static class RefreshRequest {
        private String refreshToken;
        public String getRefreshToken() { return refreshToken; }
        public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@RequestBody RefreshRequest request) {
        if (request.getRefreshToken() == null || !request.getRefreshToken().startsWith("mock-refresh-token-")) {
            throw new com.company.learningmanagement.exception.assignment.UnauthorizedException("Invalid refresh token");
        }
        String email = request.getRefreshToken().substring("mock-refresh-token-".length());
        AuthResponse response = authService.getProfile(email);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }
}
