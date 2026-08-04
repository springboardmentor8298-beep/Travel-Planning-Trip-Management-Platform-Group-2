package com.tripnest.dto;

import com.tripnest.entity.DocumentType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DocumentResponse {
    private Long id;
    private Long tripId;
    private Long userId;
    private String uploaderUsername;
    private DocumentType docType;
    private String fileName;
    private String downloadUrl;
    private LocalDateTime uploadedAt;
}
