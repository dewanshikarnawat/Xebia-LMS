package com.company.learningmanagement.dto.lms.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificationFunnelDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long assigned;
    private Long enrolled;
    private Long started;
    private Long completed;
    private Long submitted;
    private Long approved;
    private List<TechCountItem> technologyWise;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TechCountItem implements Serializable {
        private static final long serialVersionUID = 1L;
        private String name;
        private Long count;
    }
}
