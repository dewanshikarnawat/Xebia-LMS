package com.company.learningmanagement.dto.assignment.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherDashboardResponse {

    private String teacherName;
    private long totalBatches;
    private long totalStudents;
    private long totalAssignments;
    private long activeAssignments;
    private long completedAssignments;
    private List<RecentAssignment> recentAssignments;
    private List<UpcomingDeadline> upcomingDeadlines;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecentAssignment {
        private Long id;
        private String title;
        private String batch;
        private String dueDate; // formatted as YYYY-MM-DD
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpcomingDeadline {
        private Long assignmentId;
        private String title;
        private String dueDate; // formatted as YYYY-MM-DD
    }
}
