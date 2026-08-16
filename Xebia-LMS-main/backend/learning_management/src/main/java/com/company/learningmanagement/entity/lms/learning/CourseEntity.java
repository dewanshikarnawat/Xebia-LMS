package com.company.learningmanagement.entity.lms.learning;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.company.learningmanagement.entity.assignment.Teacher;

@Entity
@Table(
        name = "courses",
        indexes = {
                @Index(name = "idx_course_slug", columnList = "slug"),
                @Index(name = "idx_course_primary_keyword", columnList = "primaryKeyword"),
                @Index(name = "idx_course_active", columnList = "isActive"),
                @Index(name = "idx_course_featured", columnList = "isFeatured"),
                @Index(name = "idx_course_level", columnList = "level"),
                @Index(name = "idx_course_title", columnList = "title")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, unique = true, length = 250)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String shortDescription;

    @Column(length = 50)
    private String level;

    @Column(length = 100)
    private String language;

    @Column(length = 100)
    private String duration;

    @Column(length = 1000)
    private String icon;

    @Column(length = 1000)
    private String thumbnail;

    @Column(length = 1000)
    private String bannerImage;

    @Column(length = 1000)
    private String backgroundImage;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isActive = true;

    @Builder.Default
    private Boolean isFeatured = false;

    @Column(length = 70)
    private String metaTitle;

    @Column(length = 320)
    private String metaDescription;

    @Column(columnDefinition = "TEXT")
    private String metaKeywords;

    @Column(length = 1000)
    private String canonicalUrl;

    @Column(length = 300)
    private String primaryKeyword;

    @Column(columnDefinition = "TEXT")
    private String secondaryKeywords;

    @Column(columnDefinition = "TEXT")
    private String focusKeywords;

    @Column(length = 100)
    @Builder.Default
    private String robots = "index, follow";

    @Column(length = 200)
    private String author;

    @Column(length = 200)
    private String seoCategory;

    @Column(columnDefinition = "TEXT")
    private String seoTags;

    @Column(length = 150)
    private String ogTitle;

    @Column(length = 500)
    private String ogDescription;

    @Column(length = 1000)
    private String ogImage;

    @Column(length = 1000)
    private String ogUrl;

    @Builder.Default
    private String ogType = "website";

    @Column(length = 150)
    private String twitterTitle;

    @Column(length = 500)
    private String twitterDescription;

    @Column(length = 1000)
    private String twitterImage;

    @Builder.Default
    private String twitterCard = "summary_large_image";

    @Column(columnDefinition = "TEXT")
    private String schemaMarkup;

    @Column(columnDefinition = "TEXT")
    private String faqSchema;

    @Column(columnDefinition = "TEXT")
    private String breadcrumbSchema;

    @Column(length = 1000)
    private String youtubeVideoUrl;

    @Column(length = 1000)
    private String previewVideoUrl;

    @Column(columnDefinition = "TEXT")
    private String learningOutcomes;

    @Column(columnDefinition = "TEXT")
    private String prerequisites;

    @Column(columnDefinition = "TEXT")
    private String targetAudience;

    @Column(columnDefinition = "TEXT")
    private String courseHighlights;

    @Column(columnDefinition = "TEXT")
    private String careerOpportunities;

    @Column(columnDefinition = "TEXT")
    private String searchIntent;

    @Column(columnDefinition = "TEXT")
    private String semanticKeywords;

    @Column(columnDefinition = "TEXT")
    private String relatedTopics;

    @Column(columnDefinition = "TEXT")
    private String searchSynonyms;

    @Column(columnDefinition = "TEXT")
    private String faqContent;

    @Column(columnDefinition = "TEXT")
    private String customHeadScript;

    @Column(columnDefinition = "TEXT")
    private String customBodyScript;

    @Builder.Default
    private Long totalViews = 0L;

    @Builder.Default
    private Long totalClicks = 0L;

    @Builder.Default
    private Double ctr = 0.0;

    @Builder.Default
    private Integer seoScore = 0;

    @Builder.Default
    private Boolean isPublished = false;

    @Builder.Default
    private Boolean allowIndexing = true;

    @Builder.Default
    private Boolean showInSearch = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @ToString.Exclude
    private CategoryEntity category;

    @OneToMany(
            mappedBy = "course",
            cascade = CascadeType.ALL,
            fetch = FetchType.LAZY
    )
    @Builder.Default
    @ToString.Exclude
    private List<ModuleEntity> modules = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "course_teachers",
        joinColumns = @JoinColumn(name = "course_id"),
        inverseJoinColumns = @JoinColumn(name = "teacher_id")
    )
    @Builder.Default
    @ToString.Exclude
    private List<Teacher> teachers = new ArrayList<>();
}
