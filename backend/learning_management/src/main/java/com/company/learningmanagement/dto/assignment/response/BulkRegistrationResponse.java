package com.company.learningmanagement.dto.assignment.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkRegistrationResponse {
    private boolean success;
    private int total;
    private int registered;
    private int failed;
    private List<BulkRegistrationError> errors;
}
