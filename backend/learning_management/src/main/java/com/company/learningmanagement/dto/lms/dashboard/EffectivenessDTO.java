package com.company.learningmanagement.dto.lms.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EffectivenessDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Double feedbackScore;
    private Double trainerRating;
    private Double completionPercentage;
}
