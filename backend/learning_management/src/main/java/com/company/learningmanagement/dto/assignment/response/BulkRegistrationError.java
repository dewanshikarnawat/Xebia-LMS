package com.company.learningmanagement.dto.assignment.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkRegistrationError {
    private String email;
    private String reason;
}
