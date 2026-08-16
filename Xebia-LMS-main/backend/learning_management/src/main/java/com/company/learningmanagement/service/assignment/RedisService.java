package com.company.learningmanagement.service.assignment;

import com.company.learningmanagement.dto.assignment.response.AssignmentStatusResponse;

public interface RedisService {
    void saveAssignmentStatus(Long assignmentId, AssignmentStatusResponse status);
    AssignmentStatusResponse getAssignmentStatus(Long assignmentId);
    void deleteAssignmentStatus(Long assignmentId);
}
