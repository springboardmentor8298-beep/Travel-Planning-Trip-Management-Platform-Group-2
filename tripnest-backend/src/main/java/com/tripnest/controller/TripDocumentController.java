package com.tripnest.controller;

import com.tripnest.dto.TripDocumentResponse;
import com.tripnest.entity.DocumentType;
import com.tripnest.entity.TripDocument;
import com.tripnest.security.SecurityUtils;
import com.tripnest.service.TripDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TripDocumentController {

    private final TripDocumentService tripDocumentService;

    @PostMapping(value = "/api/trips/{tripId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<TripDocumentResponse> uploadDocument(@PathVariable Long tripId,
                                                                @RequestParam("file") MultipartFile file,
                                                                @RequestParam("type") DocumentType type) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(tripDocumentService.uploadDocument(email, tripId, file, type));
    }

    @GetMapping("/api/trips/{tripId}/documents")
    public ResponseEntity<List<TripDocumentResponse>> getDocuments(@PathVariable Long tripId) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(tripDocumentService.getDocumentsForTrip(email, tripId));
    }

    @GetMapping("/api/documents/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long documentId) {
        String email = SecurityUtils.getCurrentUserEmail();
        TripDocument document = tripDocumentService.getDocumentEntityForDownload(email, documentId);
        Resource resource = tripDocumentService.loadFileResource(document);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(document.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + document.getOriginalFileName() + "\"")
                .body(resource);
    }
}
