package com.company.learningmanagement.service.assignment;

import com.company.learningmanagement.dto.assignment.request.LoginRequest;
import com.company.learningmanagement.dto.assignment.request.StudentRegisterRequest;
import com.company.learningmanagement.dto.assignment.request.TeacherRegisterRequest;
import com.company.learningmanagement.dto.assignment.response.AuthResponse;
import com.company.learningmanagement.dto.assignment.response.BulkRegistrationResponse;
import com.company.learningmanagement.dto.assignment.response.BulkLoginResponse;

public interface AuthService {
    AuthResponse registerTeacher(TeacherRegisterRequest request);
    AuthResponse registerStudent(StudentRegisterRequest request);
    AuthResponse registerAdmin(com.company.learningmanagement.dto.assignment.request.AdminRegisterRequest request);
    AuthResponse login(LoginRequest request);
    java.util.List<com.company.learningmanagement.dto.assignment.response.BatchResponse> getPublicBatches();
    AuthResponse updateProfile(String email, String newName);
    AuthResponse getProfile(String email);
    BulkRegistrationResponse registerTeachersBulk(java.util.List<TeacherRegisterRequest> requests);
    BulkRegistrationResponse registerStudentsBulk(java.util.List<StudentRegisterRequest> requests);
    BulkLoginResponse loginBulk(java.util.List<LoginRequest> requests);
}
