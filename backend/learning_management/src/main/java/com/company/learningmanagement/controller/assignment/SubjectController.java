package com.company.learningmanagement.controller.assignment;

import com.company.learningmanagement.dto.assignment.response.ApiResponse;
import com.company.learningmanagement.dto.assignment.response.SubjectResponse;
import com.company.learningmanagement.entity.assignment.Teacher;
import com.company.learningmanagement.exception.assignment.ResourceNotFoundException;
import com.company.learningmanagement.mapper.assignment.SubjectMapper;
import com.company.learningmanagement.repository.assignment.SubjectRepository;
import com.company.learningmanagement.repository.assignment.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;
    private final SubjectMapper subjectMapper;

    @GetMapping("/api/teacher/subjects")
    public ResponseEntity<ApiResponse<List<SubjectResponse>>> getTeacherSubjects(
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) String department,
            Principal principal
    ) {
        Teacher teacher = teacherRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));
        
        String sem = (semester == null || semester.isBlank()) ? null : semester;
        String dept = (department == null || department.isBlank()) ? null : department;

        List<com.company.learningmanagement.entity.assignment.Subject> subjects = subjectRepository.findFilteredSubjectsForTeacher(
                teacher.getId(),
                sem,
                dept
        );

        List<SubjectResponse> response = subjectMapper.toResponseList(subjects);
        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved successfully", response));
    }
}
