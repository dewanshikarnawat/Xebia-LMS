package com.company.learningmanagement.entity.lms.learning;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "contents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContentEntity {
 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @Column(nullable = false, length = 30)
    private String type;
 
    @Column(columnDefinition = "TEXT")
    private String text;
 
    @Column(columnDefinition = "TEXT")
    private String code;
 
    @Column(length = 50)
    private String language;
 
    @Column(length = 500)
    private String videoUrl;
 
    @Column(length = 500)
    private String imageUrl;
 
    @Column(length = 200)
    private String alt;
 
    @Column(length = 300)
    private String caption;
 
    @Column(length = 300)
    private String title;
 
    private Integer headingLevel;
 
    @Column(nullable = false)
    @Builder.Default
    private Integer contentOrder = 0;
 
    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;
 
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
 
    @UpdateTimestamp
    private LocalDateTime updatedAt;
 
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submodule_id", nullable = false)
    @ToString.Exclude
    private SubmoduleEntity submodule;
}
