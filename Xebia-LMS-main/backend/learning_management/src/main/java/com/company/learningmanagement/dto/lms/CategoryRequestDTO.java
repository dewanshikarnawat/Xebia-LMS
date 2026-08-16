package com.company.learningmanagement.dto.lms;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryRequestDTO {

    @NotBlank(message = "Category name is required")
    @Size(max = 100, message = "Category name must be at most 100 characters")
    private String name;

    @Size(max = 1000, message = "Category icon must be at most 1000 characters")
    private String icon;

    private String description;

    @Size(max = 20, message = "Category color must be at most 20 characters")
    private String color;

    private Boolean isActive;

    private String logo;
    private String bannerImage;
    private String backgroundImage;
    private String thumbnail;
}
