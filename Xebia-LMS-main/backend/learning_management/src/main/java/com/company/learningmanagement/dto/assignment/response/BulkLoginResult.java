package com.company.learningmanagement.dto.assignment.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkLoginResult {
    private String email;
    private String token;
    private String fullName;
    private String role;
}
