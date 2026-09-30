package com.company.learningmanagement.service.assignment;

import com.company.learningmanagement.dto.assignment.response.StudentDashboardResponse;
import com.company.learningmanagement.dto.assignment.response.TeacherDashboardResponse;

public interface DashboardService {
    TeacherDashboardResponse getTeacherDashboard(String teacherEmail);
    StudentDashboardResponse getStudentDashboard(String studentEmail);
}
