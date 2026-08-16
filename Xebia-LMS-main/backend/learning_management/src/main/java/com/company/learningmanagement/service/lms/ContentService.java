package com.company.learningmanagement.service.lms;

import com.company.learningmanagement.dto.lms.ContentRequestDTO;
import com.company.learningmanagement.dto.lms.ContentResponseDTO;

import com.company.learningmanagement.dto.lms.BulkOperationResponse;
import java.util.List;

public interface ContentService {
    ContentResponseDTO create(ContentRequestDTO request);
    List<ContentResponseDTO> getAll();
    ContentResponseDTO getById(Long id);
    ContentResponseDTO update(Long id, ContentRequestDTO request);
    void delete(Long id);
    BulkOperationResponse createBulk(List<ContentRequestDTO> requests);
}

