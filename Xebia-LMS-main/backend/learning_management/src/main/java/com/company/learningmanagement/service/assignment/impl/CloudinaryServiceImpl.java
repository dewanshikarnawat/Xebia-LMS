package com.company.learningmanagement.service.assignment.impl;

import com.company.learningmanagement.exception.assignment.CustomException;
import com.company.learningmanagement.service.assignment.CloudinaryService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service("amsCloudinaryService")
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Override
    public String uploadFile(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        try {
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "auto"
                    )
            );
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new CustomException("Failed to upload file to Cloudinary: " + e.getMessage(), 500);
        }
    }

    @Override
    public String uploadBytes(byte[] bytes, String folder) {
        if (bytes == null || bytes.length == 0) {
            return null;
        }
        try {
            boolean isPdf = bytes.length > 4 && 
                            bytes[0] == 0x25 && // '%'
                            bytes[1] == 0x50 && // 'P'
                            bytes[2] == 0x44 && // 'D'
                            bytes[3] == 0x46;   // 'F'
            
            java.util.Map<String, Object> options = new java.util.HashMap<>();
            options.put("folder", folder);
            if (isPdf) {
                options.put("resource_type", "raw");
            } else {
                options.put("resource_type", "auto");
            }

            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    bytes,
                    options
            );
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new CustomException("Failed to upload bytes to Cloudinary: " + e.getMessage(), 500);
        }
    }
}
