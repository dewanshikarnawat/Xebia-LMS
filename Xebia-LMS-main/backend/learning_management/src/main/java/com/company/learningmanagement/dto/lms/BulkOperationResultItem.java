package com.company.learningmanagement.dto.lms;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkOperationResultItem {
    private int index;
    private String status;
    private String reason;
}
