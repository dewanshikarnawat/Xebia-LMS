package com.company.learningmanagement.controller.assignment;

import com.company.learningmanagement.dto.assignment.response.ApiResponse;
import com.company.learningmanagement.dto.assignment.response.CertificateResponse;
import com.company.learningmanagement.service.assignment.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class CertificateController {

    private final CertificateService certificateService;

    // --- Student Certificate Endpoints ---

    @GetMapping("/api/student/certificates")
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> getMyCertificates(Principal principal) {
        List<CertificateResponse> response = certificateService.getStudentCertificates(principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Certificates retrieved successfully", response));
    }

    @GetMapping("/api/student/certificates/{id}")
    public ResponseEntity<ApiResponse<CertificateResponse>> getCertificate(
            @PathVariable Long id,
            Principal principal
    ) {
        CertificateResponse response = certificateService.getCertificateById(id, principal.getName(), "STUDENT");
        return ResponseEntity.ok(ApiResponse.success("Certificate retrieved successfully", response));
    }

    @GetMapping("/api/student/certificates/assignment/{assignmentId}")
    public ResponseEntity<ApiResponse<CertificateResponse>> getCertificateByAssignment(
            @PathVariable Long assignmentId,
            Principal principal
    ) {
        CertificateResponse response = certificateService.getCertificateByAssignment(assignmentId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Certificate retrieved successfully", response));
    }

    @GetMapping("/api/student/certificates/quiz/{quizId}")
    public ResponseEntity<ApiResponse<CertificateResponse>> getCertificateByQuiz(
            @PathVariable Long quizId,
            Principal principal
    ) {
        CertificateResponse response = certificateService.getCertificateByQuiz(quizId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Certificate retrieved successfully", response));
    }

    private byte[] downloadFileFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new com.company.learningmanagement.exception.assignment.BadRequestException("File URL is empty");
        }
        try {
            java.net.URL url = new java.net.URL(fileUrl);
            java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(15000);
            
            int responseCode = conn.getResponseCode();
            if (responseCode != java.net.HttpURLConnection.HTTP_OK) {
                throw new com.company.learningmanagement.exception.assignment.CustomException("Server returned HTTP response code: " + responseCode + " for URL: " + fileUrl, responseCode);
            }
            
            java.io.InputStream in = conn.getInputStream();
            java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
            byte[] buffer = new byte[4096];
            int n;
            while ((n = in.read(buffer)) != -1) {
                out.write(buffer, 0, n);
            }
            in.close();
            conn.disconnect();
            return out.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            throw new com.company.learningmanagement.exception.assignment.CustomException("Failed to download PDF content: " + e.getMessage(), 500);
        }
    }

    @GetMapping({"/api/student/certificates/{idOrUuid}/download", "/api/student/certificates/download/{idOrUuid}"})
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable String idOrUuid,
            Principal principal
    ) {
        System.out.println("Download Certificate Request: " + idOrUuid);
        
        byte[] pdfBytes = certificateService.downloadCertificateByUuid(idOrUuid, principal.getName());
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment()
                .filename("certificate-" + idOrUuid + ".pdf")
                .build());
        
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/api/student/certificates/{id}/view")
    public ResponseEntity<byte[]> viewCertificate(
            @PathVariable Long id,
            Principal principal
    ) {
        System.out.println("Certificate ID: " + id);
        CertificateResponse response = certificateService.getCertificateById(id, principal.getName(), "STUDENT");
        System.out.println("PDF URL: " + response.getPdfFileUrl());
        System.out.println("Certificate URL: " + response.getCertificateUrl());

        byte[] pdfBytes = downloadFileFromUrl(response.getPdfFileUrl() != null ? response.getPdfFileUrl() : response.getCertificateUrl());
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.inline().filename("certificate-" + id + ".pdf").build());
        
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    // --- Teacher Certificate Endpoints ---

    @GetMapping("/api/teacher/certificates")
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> searchCertificates(
            @RequestParam(required = false) String studentName,
            @RequestParam(required = false) String type,
            Principal principal
    ) {
        List<CertificateResponse> response = certificateService.searchCertificatesForTeacher(principal.getName(), studentName, type);
        return ResponseEntity.ok(ApiResponse.success("Certificates retrieved successfully", response));
    }

    @GetMapping("/api/teacher/certificates/{id}")
    public ResponseEntity<ApiResponse<CertificateResponse>> getCertificateForTeacher(
            @PathVariable Long id,
            Principal principal
    ) {
        CertificateResponse response = certificateService.getCertificateById(id, principal.getName(), "TEACHER");
        return ResponseEntity.ok(ApiResponse.success("Certificate retrieved successfully", response));
    }

    @GetMapping("/api/teacher/certificates/{id}/download")
    public ResponseEntity<byte[]> downloadCertificateForTeacher(
            @PathVariable Long id,
            Principal principal
    ) {
        System.out.println("Certificate ID: " + id);
        CertificateResponse response = certificateService.getCertificateById(id, principal.getName(), "TEACHER");
        System.out.println("PDF URL: " + response.getPdfFileUrl());
        System.out.println("Certificate URL: " + response.getCertificateUrl());

        byte[] pdfBytes = downloadFileFromUrl(response.getPdfFileUrl() != null ? response.getPdfFileUrl() : response.getCertificateUrl());
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment().filename("certificate-" + id + ".pdf").build());
        
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/api/teacher/certificates/{id}/view")
    public ResponseEntity<byte[]> viewCertificateForTeacher(
            @PathVariable Long id,
            Principal principal
    ) {
        System.out.println("Certificate ID: " + id);
        CertificateResponse response = certificateService.getCertificateById(id, principal.getName(), "TEACHER");
        System.out.println("PDF URL: " + response.getPdfFileUrl());
        System.out.println("Certificate URL: " + response.getCertificateUrl());

        byte[] pdfBytes = downloadFileFromUrl(response.getPdfFileUrl() != null ? response.getPdfFileUrl() : response.getCertificateUrl());
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.inline().filename("certificate-" + id + ".pdf").build());
        
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    // --- Public Verification Endpoint ---

    @GetMapping("/api/certificates/verify/{token}")
    public ResponseEntity<ApiResponse<CertificateResponse>> verifyCertificate(
            @PathVariable String token
    ) {
        CertificateResponse response = certificateService.getCertificateByToken(token);
        return ResponseEntity.ok(ApiResponse.success("Certificate verified successfully", response));
    }

    // --- New Preview & Generate/Download Endpoints ---

    @GetMapping("/api/student/certificates/preview/{assignmentOrQuizId}")
    public ResponseEntity<ApiResponse<CertificateResponse>> getCertificatePreview(
            @PathVariable Long assignmentOrQuizId,
            Principal principal
    ) {
        CertificateResponse response = certificateService.getCertificatePreview(assignmentOrQuizId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Certificate preview generated successfully", response));
    }

    @PostMapping("/api/student/certificates/download/{assignmentOrQuizId}")
    public ResponseEntity<byte[]> downloadOrGenerateCertificate(
            @PathVariable Long assignmentOrQuizId,
            Principal principal
    ) {
        byte[] pdfBytes = certificateService.downloadOrGenerateCertificate(assignmentOrQuizId, principal.getName());
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_PDF);
        headers.setContentDisposition(org.springframework.http.ContentDisposition.attachment()
                .filename("certificate-" + assignmentOrQuizId + ".pdf")
                .build());
        
        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
