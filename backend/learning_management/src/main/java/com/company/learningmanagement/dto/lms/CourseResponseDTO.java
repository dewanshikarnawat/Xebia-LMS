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
public class CourseResponseDTO {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private String shortDescription;
    private String level;
    private String language;
    private String duration;
    private String icon;
    private String thumbnail;
    private String bannerImage;
    private String backgroundImage;
    private Boolean isActive;
    private Boolean isFeatured;

    // SEO CORE
    private String metaTitle;
    private String metaDescription;
    private String metaKeywords;
    private String canonicalUrl;

    // ADVANCED SEO
    private String primaryKeyword;
    private String secondaryKeywords;
    private String focusKeywords;
    private String robots;
    private String author;
    private String seoCategory;
    private String seoTags;

    // OPEN GRAPH SEO
    private String ogTitle;
    private String ogDescription;
    private String ogImage;
    private String ogUrl;
    private String ogType;

    // TWITTER / X SEO
    private String twitterTitle;
    private String twitterDescription;
    private String twitterImage;
    private String twitterCard;

    // STRUCTURED DATA
    private String schemaMarkup;
    private String faqSchema;
    private String breadcrumbSchema;

    // COURSE CONTENT SEO
    private String youtubeVideoUrl;
    private String previewVideoUrl;
    private String learningOutcomes;
    private String prerequisites;
    private String targetAudience;
    private String courseHighlights;
    private String careerOpportunities;

    // PROGRAMMATIC SEO
    private String searchIntent;
    private String semanticKeywords;
    private String relatedTopics;
    private String searchSynonyms;

    // FAQ CONTENT
    private String faqContent;

    // CUSTOM SEO CONTENT
    private String customHeadScript;
    private String customBodyScript;

    // ANALYTICS
    private Long totalViews;
    private Long totalClicks;
    private Double ctr;
    private Integer seoScore;

    // FLAGS
    private Boolean isPublished;
    private Boolean allowIndexing;
    private Boolean showInSearch;

    // Relationships
    private CategoryResponseDTO category;
    private List<ModuleResponseDTO> modules;
}
