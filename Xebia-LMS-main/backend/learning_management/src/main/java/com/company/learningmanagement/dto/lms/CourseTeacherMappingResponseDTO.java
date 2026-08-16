package com.company.learningmanagement.dto.lms;

import com.company.learningmanagement.dto.assignment.response.TeacherResponse;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseTeacherMappingResponseDTO {
    private Long courseId;
    private String courseTitle;
    private List<TeacherResponse> assignedTeachers;
}
