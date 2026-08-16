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
public class CourseRequestDTO {

    @NotBlank(message = "Course title is required")
    @Size(max = 200, message = "Course title must be at most 200 characters")
    private String title;

    @NotBlank(message = "Course slug is required")
    @Size(max = 250, message = "Course slug must be at most 250 characters")
    private String slug;

    private String description;

    private String shortDescription;

    @Size(max = 50, message = "Course level must be at most 50 characters")
    private String level;

    @Size(max = 100, message = "Course language must be at most 100 characters")
    private String language;

    @Size(max = 100, message = "Course duration must be at most 100 characters")
    private String duration;

    @Size(max = 1000, message = "Course icon must be at most 1000 characters")
    private String icon;

    @Size(max = 1000, message = "Course thumbnail must be at most 1000 characters")
    private String thumbnail;

    @Size(max = 1000, message = "Course banner image must be at most 1000 characters")
    private String bannerImage;

    private String backgroundImage;

    private Boolean isActive;

    private Boolean isFeatured;

    // SEO CORE
    @Size(max = 70, message = "Meta title must be at most 70 characters")
    private String metaTitle;

    @Size(max = 320, message = "Meta description must be at most 320 characters")
    private String metaDescription;

    private String metaKeywords;

    @Size(max = 1000, message = "Canonical URL must be at most 1000 characters")
    private String canonicalUrl;

    // ADVANCED SEO
    @Size(max = 300, message = "Primary keyword must be at most 300 characters")
    private String primaryKeyword;

    private String secondaryKeywords;

    private String focusKeywords;

    @Size(max = 100, message = "Robots must be at most 100 characters")
    private String robots;

    @Size(max = 200, message = "Author must be at most 200 characters")
    private String author;

    @Size(max = 200, message = "SEO category must be at most 200 characters")
    private String seoCategory;

    private String seoTags;

    // OPEN GRAPH SEO
    @Size(max = 150, message = "OG title must be at most 150 characters")
    private String ogTitle;

    @Size(max = 500, message = "OG description must be at most 500 characters")
    private String ogDescription;

    @Size(max = 1000, message = "OG image URL must be at most 1000 characters")
    private String ogImage;

    @Size(max = 1000, message = "OG URL must be at most 1000 characters")
    private String ogUrl;

    private String ogType;

    // TWITTER / X SEO
    @Size(max = 150, message = "Twitter title must be at most 150 characters")
    private String twitterTitle;

    @Size(max = 500, message = "Twitter description must be at most 500 characters")
    private String twitterDescription;

    @Size(max = 1000, message = "Twitter image URL must be at most 1000 characters")
    private String twitterImage;

    private String twitterCard;

    // STRUCTURED DATA
    private String schemaMarkup;

    private String faqSchema;

    private String breadcrumbSchema;

    // COURSE CONTENT SEO
    @Size(max = 1000, message = "YouTube video URL must be at most 1000 characters")
    private String youtubeVideoUrl;

    @Size(max = 1000, message = "Preview video URL must be at most 1000 characters")
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

    // COURSE FLAGS
    private Boolean isPublished;

    private Boolean allowIndexing;

    private Boolean showInSearch;

    // RELATIONSHIP
    @NotNull(message = "Category ID is required")
    private Long categoryId;
}
