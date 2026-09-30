package com.company.learningmanagement.service.assignment.impl;

import com.company.learningmanagement.dto.assignment.request.QuestionRequest;
import org.apache.poi.ss.usermodel.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

public class ExcelParserHelper {

    public static List<QuestionRequest> parseExcel(MultipartFile file) throws Exception {
        List<QuestionRequest> list = new ArrayList<>();
        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);

            // Assuming header is on row 0, read rows from 1 onwards
            int lastRowNum = sheet.getLastRowNum();
            for (int i = 1; i <= lastRowNum; i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                // Validate cells
                String questionText = getCellValue(row.getCell(0));
                if (questionText.isBlank()) continue;

                String optionA = getCellValue(row.getCell(1));
                String optionB = getCellValue(row.getCell(2));
                String optionC = getCellValue(row.getCell(3));
                String optionD = getCellValue(row.getCell(4));
                String correctAnswer = getCellValue(row.getCell(5));

                double marks = 1.0;
                Cell marksCell = row.getCell(6);
                if (marksCell != null) {
                    if (marksCell.getCellType() == CellType.NUMERIC) {
                        marks = marksCell.getNumericCellValue();
                    } else {
                        try {
                            marks = Double.parseDouble(getCellValue(marksCell));
                        } catch (Exception e) {
                            // Default fallback
                        }
                    }
                }

                String difficulty = getCellValue(row.getCell(7));
                if (difficulty.isBlank()) difficulty = "Medium";

                // Basic Question Type detection
                String questionType = "MCQ";
                if (optionA.equalsIgnoreCase("true") && optionB.equalsIgnoreCase("false") && optionC.isBlank()) {
                    questionType = "TRUE_FALSE";
                } else if (optionA.isBlank() && optionB.isBlank()) {
                    questionType = "SHORT_ANSWER";
                }

                QuestionRequest qr = QuestionRequest.builder()
                        .questionText(questionText)
                        .optionA(optionA)
                        .optionB(optionB)
                        .optionC(optionC)
                        .optionD(optionD)
                        .correctAnswer(correctAnswer)
                        .marks(marks)
                        .difficulty(difficulty)
                        .questionType(questionType)
                        .build();
                list.add(qr);
            }
        }
        return list;
    }

    private static String getCellValue(Cell cell) {
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
