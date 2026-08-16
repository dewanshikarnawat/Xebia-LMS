package com.company.learningmanagement.service.lms;

import com.company.learningmanagement.dto.lms.ModuleRequestDTO;
import com.company.learningmanagement.dto.lms.ModuleResponseDTO;

import com.company.learningmanagement.dto.lms.BulkOperationResponse;
import java.util.List;

public interface ModuleService {
    ModuleResponseDTO create(ModuleRequestDTO request);
    List<ModuleResponseDTO> getAll();
    ModuleResponseDTO getById(Long id);
    ModuleResponseDTO update(Long id, ModuleRequestDTO request);
    void delete(Long id);
    BulkOperationResponse createBulk(List<ModuleRequestDTO> requests);
}

