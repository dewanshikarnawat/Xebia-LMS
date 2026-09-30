package com.company.learningmanagement.dto.assignment.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectResponse {
    private Long id;
    private String subjectCode;
    private String subjectName;
    private String semester;
    private String department;
}
