package com.company.learningmanagement.dto.assignment.response;

import com.company.learningmanagement.enums.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String email;
    private String fullName;
    private Role role;

    // LMS specific fields
    private String accessToken;
    private String refreshToken;
    private Integer expiresIn;
    private LmsUser user;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LmsUser {
        private String email;
        private String fullName;
        private String role;
        private String avatar;
    }
}
