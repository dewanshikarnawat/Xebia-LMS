package com.company.learningmanagement.dto.assignment.response;

import com.company.learningmanagement.enums.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private Long batchId;
    private String batchName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
