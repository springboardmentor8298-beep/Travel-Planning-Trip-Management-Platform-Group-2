package com.tripnest.backend.service.impl;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.tripnest.backend.exception.BadRequestException;
import com.tripnest.backend.service.StorageService;

@Service
public class LocalStorageService implements StorageService {

    private final String uploadDir = "uploads";

    public LocalStorageService() {
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    @Override
    public String storeFile(MultipartFile file, String subfolder) {
        try {
            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String uniqueName = UUID.randomUUID().toString() + extension;

            Path targetPath = Paths.get(uploadDir, subfolder);
            File targetFolder = targetPath.toFile();
            if (!targetFolder.exists()) {
                targetFolder.mkdirs();
            }

            Path filePath = targetPath.resolve(uniqueName);
            Files.write(filePath, file.getBytes());

            return filePath.toString();
        } catch (IOException e) {
            throw new BadRequestException("Failed to store file: " + e.getMessage());
        }
    }

    @Override
    public byte[] loadFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (!Files.exists(path)) {
                throw new BadRequestException("File does not exist: " + filePath);
            }
            return Files.readAllBytes(path);
        } catch (IOException e) {
            throw new BadRequestException("Failed to read file: " + e.getMessage());
        }
    }

    @Override
    public void deleteFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            // Log it but do not throw, so db transaction can finish
            System.err.println("Failed to delete physical file: " + e.getMessage());
        }
    }
}
