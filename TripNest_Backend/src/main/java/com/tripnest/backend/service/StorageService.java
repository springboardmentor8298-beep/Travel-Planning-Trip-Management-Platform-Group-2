package com.tripnest.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    String storeFile(MultipartFile file, String subfolder);

    byte[] loadFile(String filePath);

    void deleteFile(String filePath);
}
