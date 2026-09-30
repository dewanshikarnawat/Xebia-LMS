package com.company.learningmanagement.dto.assignment.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionReviewRequest {

    @NotNull(message = "Marks are required")
    @PositiveOrZero(message = "Marks must be zero or positive")
    private Double marks;

    @NotBlank(message = "Feedback is required")
    private String feedback;
}
