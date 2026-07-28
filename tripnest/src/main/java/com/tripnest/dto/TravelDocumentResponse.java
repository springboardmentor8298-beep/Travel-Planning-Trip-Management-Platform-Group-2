package com.tripnest.dto;
import java.time.LocalDateTime;
public record TravelDocumentResponse(Long id, Long tripId, String originalFilename, String documentType, String contentType, Long fileSize, String uploadedBy, LocalDateTime uploadedAt) { }
