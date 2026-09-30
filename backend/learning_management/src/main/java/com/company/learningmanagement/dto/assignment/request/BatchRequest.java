package com.company.learningmanagement.dto.assignment.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BatchRequest {

    @NotBlank(message = "Batch name is required")
    @Size(min = 2, max = 100, message = "Batch name must be between 2 and 100 characters")
    private String batchName;

    private String description;
}
