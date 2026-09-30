package com.company.learningmanagement.service.assignment;

import com.company.learningmanagement.dto.assignment.request.StudentSubmitRequest;
import com.company.learningmanagement.dto.assignment.request.SubmissionReviewRequest;
import com.company.learningmanagement.dto.assignment.response.StudentResponse;
import com.company.learningmanagement.dto.assignment.response.SubmissionResponse;

import java.util.List;

public interface SubmissionService {
    SubmissionResponse submitAssignment(Long assignmentId, StudentSubmitRequest request, String studentEmail);
    List<SubmissionResponse> getSubmittedSubmissions(Long assignmentId, String teacherEmail);
    List<StudentResponse> getPendingStudents(Long assignmentId, String teacherEmail);
    SubmissionResponse reviewSubmission(Long submissionId, SubmissionReviewRequest request, String teacherEmail);
    List<SubmissionResponse> getStudentSubmissions(String studentEmail, int page, int size);
    SubmissionResponse getSubmissionById(Long id, String email, String role);
}
