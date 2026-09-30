package com.company.learningmanagement.dto.lms;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleRequestDTO {

    @NotBlank(message = "Module title is required")
    @Size(max = 200, message = "Module title must be at most 200 characters")
    private String title;

    private String description;

    private Integer moduleOrder;

    private Boolean isActive;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    private String logo;
    private String banner;
    private String backgroundImage;
    private String thumbnail;
}
