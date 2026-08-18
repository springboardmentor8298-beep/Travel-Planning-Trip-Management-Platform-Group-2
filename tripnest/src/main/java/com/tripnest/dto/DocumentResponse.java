package com.tripnest.dto;

import java.time.LocalDateTime;

public class DocumentResponse {

    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private LocalDateTime uploadedAt;
    private Long tripId;

    public DocumentResponse(
            Long id,
            String fileName,
            String fileType,
            Long fileSize,
            LocalDateTime uploadedAt,
            Long tripId
    ) {
        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.uploadedAt = uploadedAt;
        this.tripId = tripId;
    }

    public Long getId() {
        return id;
    }

    public String getFileName() {
        return fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public Long getTripId() {
        return tripId;
    }
}