package com.company.learningmanagement.util;

import com.company.learningmanagement.dto.assignment.QuizImportDTO;
import com.company.learningmanagement.exception.assignment.BadRequestException;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

public class ExcelValidator {

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    public static void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty or not provided");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
            throw new BadRequestException("Only .xlsx or .xls file formats are supported");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds the maximum limit of 10 MB");
        }
    }

    public static List<String> validateQuestions(List<QuizImportDTO> questions) {
        List<String> errors = new ArrayList<>();
        for (int i = 0; i < questions.size(); i++) {
            QuizImportDTO question = questions.get(i);
            int rowNum = i + 2; // Assuming row 1 is header, so index 0 is row 2

            if (question.getQuestionText() == null || question.getQuestionText().trim().isEmpty()) {
                errors.add("Row " + rowNum + ": Question cannot be empty");
                continue; // Skip further checks for this row if the question is empty
            }

            // Check if options are missing
            boolean optionAMissing = question.getOptionA() == null || question.getOptionA().trim().isEmpty();
            boolean optionBMissing = question.getOptionB() == null || question.getOptionB().trim().isEmpty();
            boolean optionCMissing = question.getOptionC() == null || question.getOptionC().trim().isEmpty();
            boolean optionDMissing = question.getOptionD() == null || question.getOptionD().trim().isEmpty();

            if (optionAMissing || optionBMissing || optionCMissing || optionDMissing) {
                errors.add("Row " + rowNum + ": Four options required");
            }

            // Correct answer validation
            String correctAns = question.getCorrectAnswer();
            if (correctAns == null || correctAns.trim().isEmpty()) {
                errors.add("Row " + rowNum + ": Correct answer must be specified");
            } else {
                String cleanAns = correctAns.trim().toUpperCase();
                if (!cleanAns.equals("A") && !cleanAns.equals("B") && !cleanAns.equals("C") && !cleanAns.equals("D")) {
                    errors.add("Row " + rowNum + ": Correct answer must be valid (A, B, C, or D)");
                }
            }

            // Marks validation
            Double marks = question.getMarks();
            if (marks == null) {
                errors.add("Row " + rowNum + ": Marks must be a numeric value");
            } else if (marks <= 0) {
                errors.add("Row " + rowNum + ": Marks must be greater than 0");
            }
        }
        return errors;
    }
}
