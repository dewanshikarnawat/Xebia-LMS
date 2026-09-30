package com.company.learningmanagement.entity.lms.learning;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "submodules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmoduleEntity {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(nullable = false, length = 200)
    private String title;
 
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 70)
    private String metaTitle;

    @Column(length = 320)
    private String metaDescription;

    @Column(length = 1000)
    private String canonicalUrl;

    @Column(length = 150)
    private String ogTitle;

    @Column(length = 500)
    private String ogDescription;

    @Column(length = 1000)
    private String ogImage;          
 
    @Column(nullable = false)
    @Builder.Default
    private Integer submoduleOrder = 0;
 
    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(length = 1000)
    private String logo;

    @Column(length = 1000)
    private String banner;

    @Column(length = 1000)
    private String backgroundImage;

    @Column(length = 1000)
    private String thumbnail;
 
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
 
    @UpdateTimestamp
    private LocalDateTime updatedAt;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    @ToString.Exclude
    private ModuleEntity module;
 
    @OneToMany(mappedBy = "submodule", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<ContentEntity> contents = new ArrayList<>();

    @Column(nullable = false, unique = true, length = 250)
    private String slug;
}
