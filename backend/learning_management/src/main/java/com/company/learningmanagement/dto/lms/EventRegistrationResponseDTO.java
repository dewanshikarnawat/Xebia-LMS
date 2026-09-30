package com.company.learningmanagement.dto.lms;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventRegistrationResponseDTO {
    private Long id;
    private Long eventId;
    private String eventTitle;
    private String studentName;
    private String studentEmail;
    private String batchName;
    private String courses;
    private LocalDateTime registrationDate;
    private String status;
    private String studentId;
    private String phone;
}
