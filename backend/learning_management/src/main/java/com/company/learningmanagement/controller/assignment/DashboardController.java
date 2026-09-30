package com.company.learningmanagement.controller.assignment;

import com.company.learningmanagement.dto.assignment.response.ApiResponse;
import com.company.learningmanagement.dto.assignment.response.StudentDashboardResponse;
import com.company.learningmanagement.dto.assignment.response.TeacherDashboardResponse;
import com.company.learningmanagement.service.assignment.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController("amsDashboardController")
@RequestMapping("/api")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/teacher/dashboard")
    public ResponseEntity<ApiResponse<TeacherDashboardResponse>> getTeacherDashboard(Principal principal) {
        TeacherDashboardResponse response = dashboardService.getTeacherDashboard(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Teacher dashboard retrieved successfully", response));
    }

    @GetMapping("/student/dashboard")
    public ResponseEntity<ApiResponse<StudentDashboardResponse>> getStudentDashboard(Principal principal) {
        StudentDashboardResponse response = dashboardService.getStudentDashboard(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Student dashboard retrieved successfully", response));
    }
}
