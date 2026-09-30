package com.company.learningmanagement.service.assignment.impl;

import com.company.learningmanagement.dto.assignment.QuizImportDTO;
import com.company.learningmanagement.service.assignment.ExcelImportService;
import com.company.learningmanagement.util.ExcelValidator;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExcelImportServiceImpl implements ExcelImportService {

    @Override
    public List<QuizImportDTO> parseExcelFile(MultipartFile file) {
        ExcelValidator.validateFile(file);

        List<QuizImportDTO> list = new ArrayList<>();
        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            int lastRowNum = sheet.getLastRowNum();
            for (int i = 1; i <= lastRowNum; i++) {
                Row row = sheet.getRow(i);
                if (row == null || isRowBlank(row)) {
                    continue;
                }

                String questionText = getCellValue(row.getCell(0));
                String optionA = getCellValue(row.getCell(1));
                String optionB = getCellValue(row.getCell(2));
                String optionC = getCellValue(row.getCell(3));
                String optionD = getCellValue(row.getCell(4));
                String correctAnswer = getCellValue(row.getCell(5));

                Double marks = null;
                Cell marksCell = row.getCell(6);
                if (marksCell != null) {
                    if (marksCell.getCellType() == CellType.NUMERIC) {
                        marks = marksCell.getNumericCellValue();
                    } else {
                        try {
                            marks = Double.parseDouble(getCellValue(marksCell));
                        } catch (NumberFormatException e) {
                            // Leave as null
                        }
                    }
                }

                QuizImportDTO dto = QuizImportDTO.builder()
                        .questionText(questionText)
                        .optionA(optionA)
                        .optionB(optionB)
                        .optionC(optionC)
                        .optionD(optionD)
                        .correctAnswer(correctAnswer)
                        .marks(marks)
                        .build();
                list.add(dto);
            }
        } catch (Exception e) {
            throw new com.company.learningmanagement.exception.assignment.BadRequestException("Failed to read Excel file: " + e.getMessage());
        }

        return list;
    }

    private boolean isRowBlank(Row row) {
        if (row == null) return true;
        for (int cellNum = 0; cellNum < 7; cellNum++) {
            Cell cell = row.getCell(cellNum);
            if (cell != null && cell.getCellType() != CellType.BLANK && !getCellValue(cell).trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }

    private String getCellValue(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                double num = cell.getNumericCellValue();
                if (num == (long) num) {
                    return String.valueOf((long) num);
                }
                return String.valueOf(num);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue().trim();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            default:
                return "";
        }
    }
}
