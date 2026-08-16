package com.company.learningmanagement.dto.assignment.response;

import lombok.*;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentStatusResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    @Builder.Default
    private List<Long> submittedStudentIds = new ArrayList<>();

    @Builder.Default
    private List<Long> pendingStudentIds = new ArrayList<>();

    private int submittedCount;
    private int pendingCount;
    private double completionPercentage;
}
