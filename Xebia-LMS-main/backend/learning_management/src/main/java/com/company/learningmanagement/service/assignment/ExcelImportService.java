package com.company.learningmanagement.service.assignment;

import com.company.learningmanagement.dto.assignment.QuizImportDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ExcelImportService {
    List<QuizImportDTO> parseExcelFile(MultipartFile file);
}
