package com.company.learningmanagement.service.assignment;

import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {
    String uploadFile(MultipartFile file, String folder);
    String uploadBytes(byte[] bytes, String folder);
}
