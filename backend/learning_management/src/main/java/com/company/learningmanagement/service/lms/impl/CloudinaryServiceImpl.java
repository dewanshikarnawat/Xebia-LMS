package com.company.learningmanagement.service.lms.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.company.learningmanagement.service.lms.CloudinaryService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service("lmsCloudinaryService")
public class CloudinaryServiceImpl implements CloudinaryService {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    private Cloudinary cloudinary;
    private boolean configured = false;

    @PostConstruct
    public void init() {
        if (cloudName != null && !cloudName.trim().isEmpty() &&
            apiKey != null && !apiKey.trim().isEmpty() &&
            apiSecret != null && !apiSecret.trim().isEmpty()) {
            
            cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName.trim(),
                "api_key", apiKey.trim(),
                "api_secret", apiSecret.trim(),
                "secure", true
            ));
            configured = true;
            System.out.println("[CloudinaryService] Successfully initialized Cloudinary upload client.");
        } else {
            System.out.println("[CloudinaryService] Credentials are not configured. Uploads will fallback to local storage.");
        }
    }

    @Override
    public boolean isConfigured() {
        return configured;
    }

    @Override
    public Map<String, Object> uploadFile(MultipartFile file) throws IOException {
        if (!configured || cloudinary == null) {
            return null;
        }

        // Upload with resource_type auto (handles images, videos, audio, pdf, ppt, raw docs, etc.)
        Map params = ObjectUtils.asMap(
            "resource_type", "auto"
        );

        // Perform the upload
        Map rawResult = cloudinary.uploader().upload(file.getBytes(), params);
        
        // Convert to Map<String, Object> securely
        Map<String, Object> result = new HashMap<>();
        if (rawResult != null) {
            for (Object key : rawResult.keySet()) {
                if (key != null) {
                    result.put(key.toString(), rawResult.get(key));
                }
            }
        }
        return result;
    }
}
