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
public class ModuleResponseDTO {
    private Long id;
    private String title;
    private String description;
    private Integer moduleOrder;
    private Boolean isActive;
    private String logo;
    private String banner;
    private String backgroundImage;
    private String thumbnail;
    
    private CourseResponseDTO course;
    private List<SubmoduleResponseDTO> submodules;
}
