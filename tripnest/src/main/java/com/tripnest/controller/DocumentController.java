package com.tripnest.controller;

import com.tripnest.dto.DocumentResponse;
import com.tripnest.security.services.UserDetailsImpl;
import com.tripnest.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST controller for travel document upload/download.
 *
 * Routes:
 *   GET    /api/trips/{tripId}/documents              — list documents
 *   POST   /api/trips/{tripId}/documents/upload       — upload file
 *   DELETE /api/trips/{tripId}/documents/{id}         — delete document
 *   GET    /api/trips/{tripId}/documents/{id}/download — download file
 */
@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/trips/{tripId}/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getDocuments(@PathVariable Long tripId) {
        return ResponseEntity.ok(documentService.getDocuments(tripId));
    }

    @PostMapping("/upload")
    public ResponseEntity<DocumentResponse> uploadDocument(
            @PathVariable Long tripId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "docType", defaultValue = "OTHER") String docType,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.uploadDocument(tripId, currentUser.getId(), docType, file));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long tripId,
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        documentService.deleteDocument(tripId, id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Long tripId,
            @PathVariable Long id) {
        Resource resource = documentService.loadFileAsResource(tripId, id);
        String fileName = documentService.getFileName(tripId, id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }
}
