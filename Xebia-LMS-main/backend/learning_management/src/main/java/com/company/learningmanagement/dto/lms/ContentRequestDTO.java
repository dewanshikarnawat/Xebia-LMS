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
public class ContentRequestDTO {

    @NotBlank(message = "Content type is required")
    @Size(max = 30, message = "Content type must be at most 30 characters")
    private String type;

    private String text;

    private String code;

    @Size(max = 50, message = "Language must be at most 50 characters")
    private String language;

    @Size(max = 500, message = "Video URL must be at most 500 characters")
    private String videoUrl;

    @Size(max = 500, message = "Image URL must be at most 500 characters")
    private String imageUrl;

    @Size(max = 200, message = "Alt text must be at most 200 characters")
    private String alt;

    @Size(max = 300, message = "Caption must be at most 300 characters")
    private String caption;

    @Size(max = 300, message = "Title must be at most 300 characters")
    private String title;

    private Integer headingLevel;

    private Integer contentOrder;

    private Boolean isActive;

    @NotNull(message = "Submodule ID is required")
    private Long submoduleId;
}
