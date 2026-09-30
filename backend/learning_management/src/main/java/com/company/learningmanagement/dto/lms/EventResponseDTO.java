package com.company.learningmanagement.dto.lms;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String image;
    private LocalDateTime registrationDeadline;
    private LocalDateTime eventDate;
    private String location;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean active;
    private String status;
    private Integer registrationCount;
}
