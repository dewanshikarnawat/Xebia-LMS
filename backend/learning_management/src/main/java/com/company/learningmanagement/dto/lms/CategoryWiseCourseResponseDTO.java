package com.company.learningmanagement.dto.lms;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryWiseCourseResponseDTO {
    private CategoryResponseDTO category;
    private List<CourseResponseDTO> courses;
}
