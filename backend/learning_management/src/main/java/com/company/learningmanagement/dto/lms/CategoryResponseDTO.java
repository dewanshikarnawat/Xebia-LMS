package com.company.learningmanagement.dto.lms;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryResponseDTO {
    private Long id;
    private String name;
    private String icon;
    private String description;
    private String color;
    private Boolean isActive;
    private String logo;
    private String bannerImage;
    private String backgroundImage;
    private String thumbnail;
    private List<CourseResponseDTO> courses;
}
