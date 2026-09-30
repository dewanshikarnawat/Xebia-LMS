package com.company.learningmanagement.dto.assignment.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkLoginResponse {
    private boolean success;
    private int total;
    private int successful;
    private int failed;
    private List<BulkLoginResult> logins;
    private List<BulkLoginError> errors;
}
