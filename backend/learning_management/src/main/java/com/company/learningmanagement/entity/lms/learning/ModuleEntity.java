package com.company.learningmanagement.entity.lms.learning;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "modules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuleEntity {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(nullable = false, length = 200)
    private String title;
 
    @Column(columnDefinition = "TEXT")
    private String description;
 
    @Column(nullable = false)
    @Builder.Default
    private Integer moduleOrder = 0;
 
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
    @JoinColumn(name = "course_id", nullable = false)
    @ToString.Exclude
    private CourseEntity course;
 
    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @ToString.Exclude
    private List<SubmoduleEntity> submodules = new ArrayList<>();
}
