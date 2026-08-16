package com.company.learningmanagement.service.lms;

import com.company.learningmanagement.dto.lms.SubmoduleRequestDTO;
import com.company.learningmanagement.dto.lms.SubmoduleResponseDTO;

import com.company.learningmanagement.dto.lms.BulkOperationResponse;
import java.util.List;

public interface SubmoduleService {
    SubmoduleResponseDTO create(SubmoduleRequestDTO request);
    List<SubmoduleResponseDTO> getAll();
    SubmoduleResponseDTO getById(Long id);
    SubmoduleResponseDTO update(Long id, SubmoduleRequestDTO request);
    void delete(Long id);
    BulkOperationResponse createBulk(List<SubmoduleRequestDTO> requests);
}

