package com.company.learningmanagement.dto.assignment.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddStudentRequest {

    @NotNull(message = "Batch ID is required")
    private Long batchId;

    // To add an existing student
    private Long studentId;
    private String studentEmail;

    // To create and add a new student in one go
    private String fullName;
    private String email;
    private String password;
    private String phone;
}
