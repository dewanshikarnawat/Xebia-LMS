package com.company.learningmanagement.service.assignment.impl;

import com.company.learningmanagement.entity.assignment.Assignment;
import com.company.learningmanagement.entity.assignment.Student;
import com.company.learningmanagement.entity.assignment.Submission;
import com.company.learningmanagement.service.assignment.ExcelExportService;
import com.company.learningmanagement.util.ExcelExportUtil;
import org.apache.poi.ss.usermodel.Workbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ExcelExportServiceImpl implements ExcelExportService {

    @Override
    public byte[] generateAssignmentResultExcel(Assignment assignment, List<Student> students, List<Submission> submissions) {
        try (Workbook workbook = ExcelExportUtil.createResultWorkbook(assignment, students, submissions);
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            workbook.write(bos);
            return bos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel report: " + e.getMessage(), e);
        }
    }
}
