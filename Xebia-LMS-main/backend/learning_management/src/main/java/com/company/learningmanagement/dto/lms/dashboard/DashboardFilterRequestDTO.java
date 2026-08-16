package com.company.learningmanagement.dto.lms.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.Serializable;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardFilterRequestDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    // Time Filters
    private Integer year;
    private String quarter;       // Q1, Q2, Q3, Q4
    private String halfYearly;     // H1, H2
    private String monthly;        // 01 to 12

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;

    // Organizational Filters
    private String region;
    private String location;
    private String businessUnit;
    private String department;
    private String project;
    private String practice;
    private String employeeGrade;
    private Long employeeId;
    private String individualEmployee; // Search by name or code

    public String getCacheKeySuffix() {
        StringBuilder sb = new StringBuilder();
        if (year != null) sb.append("_yr").append(year);
        if (quarter != null) sb.append("_qt").append(quarter);
        if (halfYearly != null) sb.append("_hy").append(halfYearly);
        if (monthly != null) sb.append("_mo").append(monthly);
        if (startDate != null) sb.append("_sd").append(startDate);
        if (endDate != null) sb.append("_ed").append(endDate);
        if (region != null) sb.append("_re").append(region.replaceAll("\\s+", ""));
        if (location != null) sb.append("_lo").append(location.replaceAll("\\s+", ""));
        if (businessUnit != null) sb.append("_bu").append(businessUnit.replaceAll("\\s+", ""));
        if (department != null) sb.append("_de").append(department.replaceAll("\\s+", ""));
        if (project != null) sb.append("_pr").append(project.replaceAll("\\s+", ""));
        if (practice != null) sb.append("_pa").append(practice.replaceAll("\\s+", ""));
        if (employeeGrade != null) sb.append("_eg").append(employeeGrade.replaceAll("\\s+", ""));
        if (employeeId != null) sb.append("_em").append(employeeId);
        if (individualEmployee != null) sb.append("_ie").append(individualEmployee.replaceAll("\\s+", ""));
        return sb.length() == 0 ? "_default" : sb.toString();
    }
}
