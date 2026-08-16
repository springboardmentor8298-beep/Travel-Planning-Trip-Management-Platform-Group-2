package com.tripnest.dto;

import com.tripnest.entity.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TripDocumentResponse {
    private Long id;
    private Long tripId;
    private String originalFileName;
    private String contentType;
    private DocumentType documentType;
    private String uploadedByEmail;
    private LocalDateTime uploadedAt;
}
