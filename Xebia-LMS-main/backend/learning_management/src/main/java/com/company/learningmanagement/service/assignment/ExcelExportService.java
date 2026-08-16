package com.company.learningmanagement.service.assignment;

import com.company.learningmanagement.entity.assignment.Assignment;
import com.company.learningmanagement.entity.assignment.Student;
import com.company.learningmanagement.entity.assignment.Submission;

import java.util.List;

public interface ExcelExportService {
    byte[] generateAssignmentResultExcel(Assignment assignment, List<Student> students, List<Submission> submissions);
}
