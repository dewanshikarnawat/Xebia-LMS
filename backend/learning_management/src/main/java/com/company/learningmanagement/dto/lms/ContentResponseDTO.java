package com.company.learningmanagement.dto.lms;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContentResponseDTO {
    private Long id;
    private String type;
    private String text;
    private String code;
    private String language;
    private String videoUrl;
    private String imageUrl;
    private String alt;
    private String caption;
    private String title;
    private Integer headingLevel;
    private Integer contentOrder;
    private Boolean isActive;

    private SubmoduleResponseDTO submodule;
}
