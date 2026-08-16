package com.tripnest.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Stores uploaded files on local disk under the configured upload directory.
 * Simple and dependency-free for now; swap for AWS S3 / Cloudinary later
 * without changing the DocumentController or TripDocumentService contract.
 */
@Service
public class FileStorageService {

    private final Path rootLocation;

    public FileStorageService(@Value("${app.file.upload-dir:./uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload directory: " + uploadDir, e);
        }
    }

    /**
     * Saves the file under a per-trip subfolder with a UUID-prefixed name to
     * avoid filename collisions, and returns the path stored relative to the
     * upload root (this is what gets saved in TripDocument.storedFilePath).
     */
    public String store(Long tripId, MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file");
        }

        String originalName = StringUtils.cleanPath(file.getOriginalFilename() != null
                ? file.getOriginalFilename() : "file");
        String safeName = UUID.randomUUID() + "_" + originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        String relativePath = tripId + "/" + safeName;

        try {
            Path targetDir = this.rootLocation.resolve(String.valueOf(tripId));
            Files.createDirectories(targetDir);

            Path targetFile = this.rootLocation.resolve(relativePath).normalize();
            if (!targetFile.getParent().startsWith(this.rootLocation)) {
                throw new IllegalArgumentException("Cannot store file outside upload directory");
            }

            Files.copy(file.getInputStream(), targetFile);
            return relativePath;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + originalName, e);
        }
    }

    public Resource loadAsResource(String relativePath) {
        try {
            Path file = this.rootLocation.resolve(relativePath).normalize();
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new IllegalArgumentException("Could not read file: " + relativePath);
            }
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("Could not read file: " + relativePath, e);
        }
    }
}
