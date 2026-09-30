package com.company.learningmanagement.service.assignment;

import com.company.learningmanagement.dto.assignment.QuizImportDTO;
import com.company.learningmanagement.entity.assignment.*;
import com.company.learningmanagement.enums.AssignmentStatus;
import com.company.learningmanagement.enums.AssignmentType;
import com.company.learningmanagement.enums.Role;
import com.company.learningmanagement.enums.SubmissionStatus;
import com.company.learningmanagement.exception.assignment.BadRequestException;
import com.company.learningmanagement.util.ExcelExportUtil;
import com.company.learningmanagement.util.ExcelValidator;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import com.company.learningmanagement.repository.assignment.*;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class NewFeaturesTest {

    @Test
    public void testPdfGeneration() throws Exception {
        String studentName = "John Doe";
        String title = "Java Programming Test";
        Double marks = 18.5;
        Double maxMarks = 20.0;
        String completionDate = "July 09, 2026";
        String teacherName = "Instructor Smith";
        boolean isQuiz = true;
        String certId = "CERT-123456";
        byte[] qrCodeBytes = new byte[0];
        
        java.io.FileOutputStream fos = new java.io.FileOutputStream("target/test.pdf");
        com.lowagie.text.Document document = new com.lowagie.text.Document(com.lowagie.text.PageSize.A4.rotate());
        com.lowagie.text.pdf.PdfWriter writer = com.lowagie.text.pdf.PdfWriter.getInstance(document, fos);
        document.open();

        com.lowagie.text.pdf.PdfContentByte cb = writer.getDirectContent();
        float width = com.lowagie.text.PageSize.A4.rotate().getWidth();
        float height = com.lowagie.text.PageSize.A4.rotate().getHeight();

        java.awt.Graphics2D g2d = cb.createGraphics(width, height);
        
        g2d.setRenderingHint(java.awt.RenderingHints.KEY_ANTIALIASING, java.awt.RenderingHints.VALUE_ANTIALIAS_ON);
        g2d.setRenderingHint(java.awt.RenderingHints.KEY_TEXT_ANTIALIASING, java.awt.RenderingHints.VALUE_TEXT_ANTIALIAS_ON);

        g2d.setColor(new java.awt.Color(253, 253, 253));
        g2d.fillRect(0, 0, (int) width, (int) height);

        g2d.setColor(new java.awt.Color(108, 29, 95));
        g2d.setFont(new java.awt.Font("Serif", java.awt.Font.BOLD, 36));
        g2d.drawString("Certificate of Achievement", 100, 100);

        g2d.dispose();
        document.close();
        fos.close();
    }

    @Test
    public void testExcelValidator_FileValidation() {
        // Invalid file format
        MultipartFile invalidFormat = new MockMultipartFile("file", "test.txt", "text/plain", "dummy content".getBytes());
        assertThrows(BadRequestException.class, () -> ExcelValidator.validateFile(invalidFormat));

        // Empty file
        MultipartFile emptyFile = new MockMultipartFile("file", "test.xlsx", "application/vnd.ms-excel", new byte[0]);
        assertThrows(BadRequestException.class, () -> ExcelValidator.validateFile(emptyFile));

        // Valid file format
        MultipartFile validFile = new MockMultipartFile("file", "test.xlsx", "application/vnd.ms-excel", "some content".getBytes());
        assertDoesNotThrow(() -> ExcelValidator.validateFile(validFile));
    }

    @Test
    public void testExcelValidator_QuestionValidation() {
        List<QuizImportDTO> list = new ArrayList<>();
        
        // Valid question
        list.add(QuizImportDTO.builder()
                .questionText("What is Java?")
                .optionA("Language")
                .optionB("Database")
                .optionC("Browser")
                .optionD("IDE")
                .correctAnswer("A")
                .marks(2.0)
                .build());
        
        List<String> errors = ExcelValidator.validateQuestions(list);
        assertTrue(errors.isEmpty(), "Valid question should have no errors");

        // Question with missing option C, invalid correct answer, and negative marks
        list.add(QuizImportDTO.builder()
                .questionText("What is Spring Boot?")
                .optionA("Framework")
                .optionB("Browser")
                .optionC("")
                .optionD("IDE")
                .correctAnswer("Z")
                .marks(-1.0)
                .build());

        errors = ExcelValidator.validateQuestions(list);
        assertEquals(3, errors.size(), "Should have exactly three validation errors");
        assertTrue(errors.get(0).contains("Four options required"));
        assertTrue(errors.get(1).contains("Correct answer must be valid"));
        assertTrue(errors.get(2).contains("Marks must be greater than 0"));
    }

    @Test
    public void testExcelExportUtil_WorkbookGeneration() throws Exception {
        Teacher teacher = Teacher.builder()
                .id(1L)
                .fullName("Teacher John")
                .email("john@example.com")
                .role(Role.TEACHER)
                .build();

        Batch batch = Batch.builder()
                .id(1L)
                .batchName("Batch A")
                .teacher(teacher)
                .build();

        Assignment assignment = Assignment.builder()
                .id(1L)
                .title("Java Quiz")
                .totalMarks(20.0)
                .passingMarks(10.0)
                .batch(batch)
                .teacher(teacher)
                .assignmentType(AssignmentType.QUIZ)
                .status(AssignmentStatus.ACTIVE)
                .build();

        Student student1 = Student.builder()
                .id(101L)
                .fullName("Rahul Sharma")
                .email("rahul@gmail.com")
                .batch(batch)
                .build();

        Student student2 = Student.builder()
                .id(102L)
                .fullName("Amit Verma")
                .email("amit@gmail.com")
                .batch(batch)
                .build();

        List<Student> students = List.of(student1, student2);

        Submission sub1 = Submission.builder()
                .id(501L)
                .student(student1)
                .assignment(assignment)
                .marks(18.0)
                .status(SubmissionStatus.SUBMITTED)
                .build();

        List<Submission> submissions = List.of(sub1);

        try (Workbook workbook = ExcelExportUtil.createResultWorkbook(assignment, students, submissions)) {
            assertNotNull(workbook);
            Sheet sheet = workbook.getSheet("Assignment Results");
            assertNotNull(sheet);
            
            // Check that rows were written: 1 header row + 2 student rows = 3 rows
            assertEquals(3, sheet.getPhysicalNumberOfRows());
            
            // Check first student row details (Rahul Sharma)
            // Roll number sorted order (ENR-101 comes before ENR-102)
            assertEquals("Rahul Sharma", sheet.getRow(1).getCell(0).getStringCellValue());
            assertEquals("rahul@gmail.com", sheet.getRow(1).getCell(1).getStringCellValue());
            assertEquals("ENR-101", sheet.getRow(1).getCell(2).getStringCellValue());
            assertEquals(18.0, sheet.getRow(1).getCell(5).getNumericCellValue());
            assertEquals("Submitted", sheet.getRow(1).getCell(8).getStringCellValue());

            // Check second student row details (Amit Verma, not submitted)
            assertEquals("Amit Verma", sheet.getRow(2).getCell(0).getStringCellValue());
            assertEquals("amit@gmail.com", sheet.getRow(2).getCell(1).getStringCellValue());
            assertEquals("ENR-102", sheet.getRow(2).getCell(2).getStringCellValue());
            assertEquals(0.0, sheet.getRow(2).getCell(5).getNumericCellValue());
            assertEquals("Not Submitted", sheet.getRow(2).getCell(8).getStringCellValue());
        }
    }

    @Test
    public void testCreateAssignmentDraftAndPublishValidation() {
        AssignmentRepository assignmentRepository = org.mockito.Mockito.mock(AssignmentRepository.class);
        TeacherRepository teacherRepository = org.mockito.Mockito.mock(TeacherRepository.class);
        BatchRepository batchRepository = org.mockito.Mockito.mock(BatchRepository.class);
        StudentRepository studentRepository = org.mockito.Mockito.mock(StudentRepository.class);
        SubmissionRepository submissionRepository = org.mockito.Mockito.mock(SubmissionRepository.class);
        CloudinaryService cloudinaryService = org.mockito.Mockito.mock(CloudinaryService.class);
        RedisService redisService = org.mockito.Mockito.mock(RedisService.class);
        com.company.learningmanagement.mapper.assignment.AssignmentMapper assignmentMapper = org.mockito.Mockito.mock(com.company.learningmanagement.mapper.assignment.AssignmentMapper.class);
        com.company.learningmanagement.repository.assignment.QuestionRepository questionRepository = org.mockito.Mockito.mock(com.company.learningmanagement.repository.assignment.QuestionRepository.class);
        com.company.learningmanagement.mapper.assignment.QuestionMapper questionMapper = org.mockito.Mockito.mock(com.company.learningmanagement.mapper.assignment.QuestionMapper.class);
        com.fasterxml.jackson.databind.ObjectMapper objectMapper = org.mockito.Mockito.mock(com.fasterxml.jackson.databind.ObjectMapper.class);
        com.company.learningmanagement.service.assignment.ExcelImportService excelImportService = org.mockito.Mockito.mock(com.company.learningmanagement.service.assignment.ExcelImportService.class);
        com.company.learningmanagement.service.assignment.ExcelExportService excelExportService = org.mockito.Mockito.mock(com.company.learningmanagement.service.assignment.ExcelExportService.class);
        com.company.learningmanagement.repository.assignment.CertificateRepository certificateRepository = org.mockito.Mockito.mock(com.company.learningmanagement.repository.assignment.CertificateRepository.class);

        com.company.learningmanagement.service.assignment.impl.AssignmentServiceImpl service = new com.company.learningmanagement.service.assignment.impl.AssignmentServiceImpl(
            assignmentRepository, teacherRepository, batchRepository, studentRepository, submissionRepository,
            cloudinaryService, redisService, assignmentMapper, questionRepository, questionMapper,
            objectMapper, excelImportService, excelExportService, certificateRepository
        );

        String teacherEmail = "teacher@test.com";
        Teacher teacher = Teacher.builder()
                .id(1L)
                .email(teacherEmail)
                .role(Role.TEACHER)
                .build();
        org.mockito.Mockito.when(teacherRepository.findByEmail(teacherEmail)).thenReturn(java.util.Optional.of(teacher));

        // Scenario 1: status = "draft", batchId = null -> should pass
        com.company.learningmanagement.dto.assignment.request.AssignmentRequest draftRequest = com.company.learningmanagement.dto.assignment.request.AssignmentRequest.builder()
                .title("Draft Quiz")
                .assignmentType(AssignmentType.QUIZ)
                .subject("Math")
                .totalMarks(10.0)
                .passingMarks(5.0)
                .dueDate(java.time.LocalDate.now().plusDays(1))
                .dueTime(java.time.LocalTime.NOON)
                .status("draft")
                .batchId(null)
                .build();

        Assignment savedAssignment = Assignment.builder()
                .id(100L)
                .title("Draft Quiz")
                .status(AssignmentStatus.DRAFT)
                .build();
        org.mockito.Mockito.when(assignmentRepository.save(org.mockito.Mockito.any(Assignment.class))).thenReturn(savedAssignment);
        org.mockito.Mockito.when(assignmentRepository.findById(org.mockito.Mockito.anyLong())).thenReturn(java.util.Optional.of(savedAssignment));
        org.mockito.Mockito.when(assignmentMapper.toResponse(org.mockito.Mockito.any(Assignment.class))).thenReturn(com.company.learningmanagement.dto.assignment.response.AssignmentResponse.builder()
                .id(100L)
                .title("Draft Quiz")
                .status(AssignmentStatus.DRAFT)
                .build());

        com.company.learningmanagement.dto.assignment.response.AssignmentResponse draftResponse = service.createAssignment(draftRequest, teacherEmail);
        assertNotNull(draftResponse);
        assertEquals(AssignmentStatus.DRAFT, draftResponse.getStatus());

        // Scenario 2: status = "published", batchId = null -> should throw BadRequestException
        com.company.learningmanagement.dto.assignment.request.AssignmentRequest publishRequest = com.company.learningmanagement.dto.assignment.request.AssignmentRequest.builder()
                .title("Published Quiz")
                .assignmentType(AssignmentType.QUIZ)
                .subject("Math")
                .totalMarks(10.0)
                .passingMarks(5.0)
                .dueDate(java.time.LocalDate.now().plusDays(1))
                .dueTime(java.time.LocalTime.NOON)
                .status("published")
                .batchId(null)
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            service.createAssignment(publishRequest, teacherEmail);
        });
        assertEquals("Target Batch is required for publishing.", ex.getMessage());
    }
}
