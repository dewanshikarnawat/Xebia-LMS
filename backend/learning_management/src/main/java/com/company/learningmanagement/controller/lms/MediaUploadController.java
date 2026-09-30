package com.company.learningmanagement.controller.lms;

import com.company.learningmanagement.dto.lms.ApiResponse;
import com.company.learningmanagement.service.lms.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/media")
public class MediaUploadController {

    private static final String UPLOAD_DIR = "uploads";

    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return new ResponseEntity<>(new ApiResponse("File is empty", null), HttpStatus.BAD_REQUEST);
        }

        try {
            System.out.println("[MediaUploadController] Received file upload request: " + file.getOriginalFilename() + " (size: " + file.getSize() + ")");
            // Check if Cloudinary is configured
            boolean isCloudinaryConfigured = cloudinaryService != null && cloudinaryService.isConfigured();
            System.out.println("[MediaUploadController] Cloudinary configured status: " + isCloudinaryConfigured);
            
            if (isCloudinaryConfigured) {
                try {
                    Map<String, Object> uploadResult = cloudinaryService.uploadFile(file);
                    System.out.println("[MediaUploadController] Cloudinary raw upload result: " + uploadResult);
                    
                    if (uploadResult != null && uploadResult.containsKey("secure_url")) {
                        Map<String, Object> data = new HashMap<>();
                        String secureUrl = (String) uploadResult.get("secure_url");
                        System.out.println("[MediaUploadController] Cloudinary secure_url: " + secureUrl);
                        
                        // Keep the full Cloudinary secureUrl so that it can be resolved correctly on frontend
                        data.put("url", secureUrl);
                        data.put("name", file.getOriginalFilename());
                        Object bytesObj = uploadResult.get("bytes");
                        long size = file.getSize();
                        if (bytesObj instanceof Number) {
                            size = ((Number) bytesObj).longValue();
                        }
                        data.put("size", size);
                        
                        System.out.println("[MediaUploadController] Successfully uploaded to Cloudinary. Path: " + secureUrl);
                        return new ResponseEntity<>(new ApiResponse("Upload successful (Cloudinary)", data), HttpStatus.OK);
                    } else {
                        System.out.println("[MediaUploadController] Cloudinary uploadResult was null or missing secure_url!");
                    }
                } catch (Exception ex) {
                    System.err.println("[MediaUploadController] Cloudinary upload method threw an exception:");
                    ex.printStackTrace();
                }
            }

            // Fallback to local storage if Cloudinary is not configured or fails
            System.out.println("[MediaUploadController] Falling back to local disk storage upload.");
            // Ensure uploads directory exists
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Create a unique filename
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            
            String uniqueFileName = UUID.randomUUID().toString() + fileExtension;
            Path filePath = Paths.get(UPLOAD_DIR, uniqueFileName);

            // Copy file content
            Files.copy(file.getInputStream(), filePath);

            // Prepare response data
            Map<String, Object> data = new HashMap<>();
            data.put("url", "/uploads/" + uniqueFileName);
            data.put("name", originalFileName);
            data.put("size", file.getSize());

            return new ResponseEntity<>(new ApiResponse("Upload successful (Local Fallback)", data), HttpStatus.OK);

        } catch (IOException e) {
            return new ResponseEntity<>(new ApiResponse("Failed to save file: " + e.getMessage(), null), 
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
