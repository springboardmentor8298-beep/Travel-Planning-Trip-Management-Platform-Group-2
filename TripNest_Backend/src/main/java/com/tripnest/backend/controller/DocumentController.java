package com.tripnest.backend.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.tripnest.backend.common.ApiResponse;
import com.tripnest.backend.dto.response.DocumentResponse;
import com.tripnest.backend.service.DocumentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/api/trips/{tripId}/documents/upload")
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadDocument(
            @PathVariable Long tripId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) {
        return ResponseEntity.ok(documentService.uploadDocument(tripId, file, type));
    }

    @GetMapping("/api/trips/{tripId}/documents")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getTripDocuments(
            @PathVariable Long tripId) {
        return ResponseEntity.ok(documentService.getTripDocuments(tripId));
    }

    @GetMapping("/api/documents/{documentId}/download")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable Long documentId) {
        byte[] data = documentService.downloadDocument(documentId);
        String contentType = documentService.getDocumentContentType(documentId);
        String name = documentService.getDocumentName(documentId);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + name + "\"")
                .body(data);
    }

    @DeleteMapping("/api/documents/{documentId}")
    public ResponseEntity<ApiResponse<String>> deleteDocument(
            @PathVariable Long documentId) {
        return ResponseEntity.ok(documentService.deleteDocument(documentId));
    }
}
