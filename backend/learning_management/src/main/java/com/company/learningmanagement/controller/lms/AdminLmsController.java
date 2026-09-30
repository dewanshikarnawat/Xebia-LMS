package com.company.learningmanagement.controller.lms;

import com.company.learningmanagement.dto.lms.ApiResponse;
import com.company.learningmanagement.entity.assignment.Teacher;
import com.company.learningmanagement.repository.assignment.TeacherRepository;
import com.company.learningmanagement.repository.assignment.StudentRepository;
import com.company.learningmanagement.repository.assignment.BatchRepository;
import com.company.learningmanagement.repository.lms.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminLmsController {

    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final BatchRepository batchRepository;
    private final CourseRepository courseRepository;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse> getDashboardStats() {
        long totalTeachers = teacherRepository.count();
        long totalStudents = studentRepository.count();
        long totalCourses = courseRepository.count();
        long totalBatches = batchRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalTeachers", totalTeachers);
        stats.put("totalStudents", totalStudents);
        stats.put("totalCourses", totalCourses);
        stats.put("totalBatches", totalBatches);

        ApiResponse response = new ApiResponse("Admin dashboard stats retrieved successfully", stats);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/teachers")
    public ResponseEntity<ApiResponse> getAllTeachers() {
        List<Teacher> teachers = teacherRepository.findAll();
        List<Map<String, Object>> teacherList = teachers.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("fullName", t.getFullName());
            map.put("email", t.getEmail());
            map.put("phone", t.getPhone());
            map.put("department", "Corporate Training");
            map.put("assignedCoursesCount", t.getCourses() != null ? t.getCourses().size() : 0);
            return map;
        }).collect(Collectors.toList());

        ApiResponse response = new ApiResponse("All teachers retrieved successfully", teacherList);
        return ResponseEntity.ok(response);
    }
}
