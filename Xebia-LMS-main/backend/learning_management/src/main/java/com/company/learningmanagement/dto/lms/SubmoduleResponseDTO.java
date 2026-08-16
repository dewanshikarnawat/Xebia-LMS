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
public class SubmoduleResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String metaTitle;
    private String metaDescription;
    private String canonicalUrl;
    private String ogTitle;
    private String ogDescription;
    private String ogImage;
    private Integer submoduleOrder;
    private Boolean isActive;
    private String slug;

    private String logo;
    private String banner;
    private String backgroundImage;
    private String thumbnail;

    private ModuleResponseDTO module;
    private List<ContentResponseDTO> contents;
}
