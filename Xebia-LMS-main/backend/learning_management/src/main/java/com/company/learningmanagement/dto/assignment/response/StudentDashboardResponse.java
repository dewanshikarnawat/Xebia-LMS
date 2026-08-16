package com.company.learningmanagement.dto.assignment.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentDashboardResponse {

    private String studentName;
    private String batch;
    private long totalAssignments;
    private long submittedAssignments;
    private long pendingAssignments;
    private List<RecentAssignment> recentAssignments;
    private List<RecentSubmission> recentSubmissions;
    private List<UpcomingDeadline> upcomingDeadlines;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentAssignment {
        private Long id;
        private String title;
        private String dueDate; // formatted as YYYY-MM-DD
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentSubmission {
        private String assignment;
        private String status;
        private Double marks;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpcomingDeadline {
        private String title;
        private String dueDate; // formatted as YYYY-MM-DD
    }
}
