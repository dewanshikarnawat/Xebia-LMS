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
public class DashboardTrendsDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private List<TrendItem> monthly;
    private List<TrendItem> quarterly;
    private List<TrendItem> yearly;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TrendItem implements Serializable {
        private static final long serialVersionUID = 1L;
        private String period;
        private Long count;
    }
}
