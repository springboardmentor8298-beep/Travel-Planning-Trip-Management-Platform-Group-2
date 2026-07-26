package com.tripnest.controller;

import com.tripnest.dto.TravelDocumentRequest;
import com.tripnest.entity.TravelDocument;
import com.tripnest.service.TravelDocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class TravelDocumentController {

    private final TravelDocumentService documentService;

    @PostMapping
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<TravelDocument> createDocument(
            Authentication authentication,
            @RequestParam Long tripId,
            @Valid @RequestBody TravelDocumentRequest request) {
        Long userId = Long.parseLong(authentication.getName());
        TravelDocument document = documentService.createDocument(tripId, userId, request);
        return ResponseEntity.ok(document);
    }

    @PutMapping("/{documentId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<TravelDocument> updateDocument(
            @PathVariable Long documentId,
            @Valid @RequestBody TravelDocumentRequest request) {
        TravelDocument document = documentService.updateDocument(documentId, request);
        return ResponseEntity.ok(document);
    }

    @DeleteMapping("/{documentId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteDocument(@PathVariable Long documentId) {
        documentService.deleteDocument(documentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{documentId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<TravelDocument> getDocument(@PathVariable Long documentId) {
        TravelDocument document = documentService.getDocument(documentId);
        return ResponseEntity.ok(document);
    }

    @GetMapping("/trip/{tripId}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<TravelDocument>> getTripDocuments(@PathVariable Long tripId) {
        List<TravelDocument> documents = documentService.getTripDocuments(tripId);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/trip/{tripId}/type/{documentType}")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<TravelDocument>> getTripDocumentsByType(
            @PathVariable Long tripId,
            @PathVariable String documentType) {
        List<TravelDocument> documents = documentService.getTripDocumentsByType(tripId, documentType);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/user")
    @PreAuthorize("hasRole('TRAVELER') or hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<List<TravelDocument>> getUserDocuments(Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        List<TravelDocument> documents = documentService.getUserDocuments(userId);
        return ResponseEntity.ok(documents);
    }
}
