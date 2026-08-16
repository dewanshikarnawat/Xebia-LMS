package com.company.learningmanagement.service.assignment;

import com.company.learningmanagement.dto.assignment.request.AddStudentRequest;
import com.company.learningmanagement.dto.assignment.response.StudentResponse;

import java.util.List;

public interface StudentService {
    StudentResponse addStudentToBatch(AddStudentRequest request, String teacherEmail);
    List<StudentResponse> getStudentsByBatch(Long batchId, String teacherEmail);
    void removeStudentFromBatch(Long studentId, String teacherEmail);
    com.company.learningmanagement.dto.lms.BulkOperationResponse addStudentToBatchBulk(List<AddStudentRequest> requests, String teacherEmail);
}
