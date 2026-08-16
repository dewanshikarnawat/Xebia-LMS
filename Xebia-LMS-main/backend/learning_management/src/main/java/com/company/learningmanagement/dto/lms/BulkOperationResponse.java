package com.company.learningmanagement.dto.lms;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkOperationResponse {
    private boolean success;
    private int total;
    private int successful;
    private int failed;
    private List<BulkOperationResultItem> results;
}
