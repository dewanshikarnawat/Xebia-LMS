package com.company.learningmanagement.service.lms;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

public interface CloudinaryService {
    /**
     * Uploads a file (image, pdf, ppt, etc.) to Cloudinary.
     * 
     * @param file the MultipartFile to upload
     * @return a map containing upload details (secure_url, size, etc.) or null if upload fallback is active
     * @throws IOException if network or file reading fails
     */
    Map<String, Object> uploadFile(MultipartFile file) throws IOException;

    /**
     * Checks if Cloudinary is fully configured and ready to be used.
     * 
     * @return true if cloud name, api key, and api secret are non-empty; false otherwise
     */
    boolean isConfigured();
}
