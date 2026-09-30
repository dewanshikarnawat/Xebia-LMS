package com.company.learningmanagement.service.assignment;

import com.company.learningmanagement.dto.assignment.request.BatchRequest;
import com.company.learningmanagement.dto.assignment.response.BatchResponse;

import java.util.List;

public interface BatchService {
    BatchResponse createBatch(BatchRequest request, String teacherEmail);
    org.springframework.data.domain.Page<BatchResponse> getAllBatches(String teacherEmail, int page, int size, String search);
    BatchResponse getBatchById(Long id, String teacherEmail);
    BatchResponse updateBatch(Long id, BatchRequest request, String teacherEmail);
    void deleteBatch(Long id, String teacherEmail);
    com.company.learningmanagement.dto.lms.BulkOperationResponse createBatchBulk(List<BatchRequest> requests, String teacherEmail);
}
