package com.company.learningmanagement.util;

import com.company.learningmanagement.entity.assignment.Assignment;
import com.company.learningmanagement.entity.assignment.Student;
import com.company.learningmanagement.entity.assignment.Submission;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ExcelExportUtil {

    private static final String[] HEADERS = {
        "Student Name",
        "Student Email",
        "Roll Number",
        "Batch Name",
        "Assignment Name",
        "Obtained Marks",
        "Total Marks",
        "Percentage",
        "Submission Status",
        "Submission Time"
    };

    public static Workbook createResultWorkbook(Assignment assignment, List<Student> students, List<Submission> submissions) {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Assignment Results");

        // Bold style for Header
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);

        // Header Row
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < HEADERS.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(HEADERS[i]);
            cell.setCellStyle(headerStyle);
        }

        // Freeze header row (freeze first row)
        sheet.createFreezePane(0, 1);

        // Group submissions by student ID (keeping only the latest submission)
        Map<Long, Submission> latestSubmissionByStudent = submissions.stream()
                .filter(s -> s.getStudent() != null)
                .collect(Collectors.toMap(
                        s -> s.getStudent().getId(),
                        s -> s,
                        (s1, s2) -> {
                            LocalDateTime t1 = s1.getSubmittedAt() != null ? s1.getSubmittedAt() : s1.getCreatedAt();
                            LocalDateTime t2 = s2.getSubmittedAt() != null ? s2.getSubmittedAt() : s2.getCreatedAt();
                            if (t1 == null) return s2;
                            if (t2 == null) return s1;
                            return t1.isAfter(t2) ? s1 : s2;
                        }
                ));

        // Sort students by Roll Number (i.e. alphabetical order of "ENR-" + student.getId())
        List<Student> sortedStudents = students.stream()
                .sorted((s1, s2) -> {
                    String r1 = "ENR-" + s1.getId();
                    String r2 = "ENR-" + s2.getId();
                    return r1.compareTo(r2);
                })
                .collect(Collectors.toList());

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        int rowNum = 1;
        for (Student student : sortedStudents) {
            Row row = sheet.createRow(rowNum++);
            Submission submission = latestSubmissionByStudent.get(student.getId());

            double obtainedMarks = 0.0;
            String status = "Not Submitted";
            String submittedAtStr = "";

            if (submission != null) {
                obtainedMarks = submission.getMarks() != null ? submission.getMarks() : 0.0;
                if (submission.getStatus() != null) {
                    String name = submission.getStatus().name();
                    status = name.substring(0, 1).toUpperCase() + name.substring(1).toLowerCase();
                }
                if (submission.getSubmittedAt() != null) {
                    submittedAtStr = submission.getSubmittedAt().format(dateFormatter);
                } else if (submission.getCreatedAt() != null) {
                    submittedAtStr = submission.getCreatedAt().format(dateFormatter);
                }
            }

            double totalMarks = assignment.getTotalMarks() != null ? assignment.getTotalMarks() : 0.0;
            double percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100.0 : 0.0;

            row.createCell(0).setCellValue(student.getFullName());
            row.createCell(1).setCellValue(student.getEmail());
            row.createCell(2).setCellValue("ENR-" + student.getId());
            row.createCell(3).setCellValue(student.getBatch() != null ? student.getBatch().getBatchName() : "");
            row.createCell(4).setCellValue(assignment.getTitle());
            row.createCell(5).setCellValue(obtainedMarks);
            row.createCell(6).setCellValue(totalMarks);
            row.createCell(7).setCellValue(Math.round(percentage) + "%");
            row.createCell(8).setCellValue(status);
            row.createCell(9).setCellValue(submittedAtStr);
        }

        // Auto-size columns
        for (int i = 0; i < HEADERS.length; i++) {
            sheet.autoSizeColumn(i);
        }

        return workbook;
    }
}
