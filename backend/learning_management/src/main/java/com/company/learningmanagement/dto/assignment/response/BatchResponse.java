package com.company.learningmanagement.dto.assignment.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchResponse {
    private Long id;
    private String batchName;
    private String description;
    private Long teacherId;
    private String teacherName;
    private Integer studentsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
