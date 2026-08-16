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
public class SubmoduleRequestDTO {

    @NotBlank(message = "Submodule title is required")
    @Size(max = 200, message = "Submodule title must be at most 200 characters")
    private String title;

    private String description;

    @Size(max = 70, message = "Meta title must be at most 70 characters")
    private String metaTitle;

    @Size(max = 320, message = "Meta description must be at most 320 characters")
    private String metaDescription;

    @Size(max = 1000, message = "Canonical URL must be at most 1000 characters")
    private String canonicalUrl;

    @Size(max = 150, message = "OG title must be at most 150 characters")
    private String ogTitle;

    @Size(max = 500, message = "OG description must be at most 500 characters")
    private String ogDescription;

    @Size(max = 1000, message = "OG image URL must be at most 1000 characters")
    private String ogImage;

    private Integer submoduleOrder;

    private Boolean isActive;

    @NotNull(message = "Module ID is required")
    private Long moduleId;

    private String logo;
    private String banner;
    private String backgroundImage;
    private String thumbnail;

    @NotBlank(message = "Submodule slug is required")
    @Size(max = 250, message = "Submodule slug must be at most 250 characters")
    private String slug;
}
